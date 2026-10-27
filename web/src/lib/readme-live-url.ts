import "server-only";

import { isJunkOrDocsDeployUrl } from "@/lib/deploy-url-quality";
import type { GitHubRepo } from "@/lib/github";
import type { NetlifyDeployIndex } from "@/lib/netlify";
import { resolveRepoLiveUrl } from "@/lib/repo-live-url";

/** Max repoa po buildu za GET /readme (manje = brži Vercel build). */
function readmeLiveMax(): number {
  const n = Number.parseInt(process.env.README_LIVE_URL_MAX ?? "24", 10);
  if (!Number.isFinite(n) || n < 0) return 24;
  return Math.min(n, 80);
}

/** Paralelni README zahtevi (4 podrazumevano — manje trza GitHub pri buildu). */
function readmeLiveConcurrency(): number {
  const n = Number.parseInt(process.env.README_LIVE_URL_CONCURRENCY ?? "4", 10);
  if (!Number.isFinite(n) || n < 1) return 4;
  return Math.min(n, 8);
}

const NOISE_RE =
  /(shields\.io|codecov|coveralls|sonarcloud|github\.com\/badges|dependabot|snyk\.io|opengraph\.githubassets|camo\.githubusercontent)/i;

function normalizeUrl(raw: string): string | null {
  const s = raw
    .trim()
    .replace(/^<|>$/g, "")
    .replace(/[),.;]+$/g, "");
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.protocol === "http:") u.protocol = "https:";
    const out = u.toString().replace(/\/$/, "");
    return out || null;
  } catch {
    return null;
  }
}

function isSameGithubRepo(url: string, fullName: string): boolean {
  const [owner, name] = fullName.toLowerCase().split("/");
  if (!owner || !name) return false;
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h !== "github.com" && h !== "www.github.com") return false;
    const p = u.pathname
      .split("/")
      .filter(Boolean)
      .map((x) => x.replace(/\.git$/i, ""));
    return p[0] === owner && p[1] === name;
  } catch {
    return false;
  }
}

function scoreUrl(u: string): number {
  if (NOISE_RE.test(u)) return -1;
  if (isJunkOrDocsDeployUrl(u)) return -1;
  try {
    const x = new URL(u);
    const h = x.hostname.toLowerCase();
    if (h.endsWith(".netlify.app")) return 100;
    if (h.endsWith(".vercel.app")) return 100;
    if (h.endsWith(".railway.app")) return 95;
    if (h.endsWith(".pages.dev")) return 92;
    if (h.endsWith(".github.io")) return 90;
    if (h.endsWith(".web.app")) return 88;
    if (h.endsWith(".azurewebsites.net")) return 75;
    if (h === "github.com" || h === "www.github.com") return 15;
    return 50;
  } catch {
    return -1;
  }
}

/** Izvuci potencijalne live URL-ove iz README (GitHub API homepage polje ne čita README). */
export function extractDeployUrlFromReadme(
  markdown: string,
  repoFullName: string,
): string | null {
  if (!markdown?.trim()) return null;

  type Cand = { url: string; score: number; order: number };
  const cands: Cand[] = [];
  let order = 0;
  const add = (raw: string) => {
    const u = normalizeUrl(raw);
    if (!u || isSameGithubRepo(u, repoFullName)) return;
    const score = scoreUrl(u);
    if (score < 0) return;
    cands.push({ url: u, score, order: order++ });
  };

  const linkRe = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(markdown)) !== null) add(m[1]);

  const bareRe = /\bhttps?:\/\/[^\s\])>'"<]+/gi;
  while ((m = bareRe.exec(markdown)) !== null) {
    add(m[0]);
  }

  const lineHintRe =
    /(?:^|\n)\s*(?:live|demo|deployed|deployment|website|url|prod|production|sajt)\s*[:\s]+<?(https?:\/\/[^\s>]+)/gim;
  while ((m = lineHintRe.exec(markdown)) !== null) add(m[1]);

  if (!cands.length) return null;
  cands.sort((a, b) => b.score - a.score || a.order - b.order);
  for (const c of cands) {
    if (c.score < 0) break;
    if (!isJunkOrDocsDeployUrl(c.url)) return c.url;
  }
  return null;
}

async function fetchRepoReadmeRaw(
  fullName: string,
  token: string | undefined,
): Promise<string | null> {
  const [owner, repo] = fullName.split("/");
  if (!owner?.trim() || !repo?.trim()) return null;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const t = token?.trim();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
    { headers, next: { revalidate: 300 } },
  );
  if (res.status === 404 || !res.ok) return null;
  return res.text();
}

/** * Izvuci prvu smislenu rečenicu / paragraf iz README markdown-a za upotrebu kao opis kartice.
 * Preskače headinge, badge linije, prazne linije i code blokove.
 */
export function extractDescriptionFromReadme(markdown: string): string | null {
  if (!markdown?.trim()) return null;

  const lines = markdown.split("\n");
  const buf: string[] = [];
  let inCode = false;

  for (const raw of lines) {
    const line = raw.trim();

    if (line.startsWith("```") || line.startsWith("~~~")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (line.startsWith("#")) continue;
    // Badge / image linije
    if (/^(?:\[!\[|!\[)/.test(line)) continue;
    // HTML tagovi
    if (/^<[a-zA-Z/]/.test(line)) continue;
    // Horizontalne linije
    if (/^[-*_]{3,}$/.test(line)) continue;

    if (!line) {
      if (buf.length > 0) break; // kraj prvog paragrafa
      continue;
    }

    buf.push(line);
  }

  // Ukloni markdown inline formatiranje (*bold*, _italic_, [text](url), `code`)
  const text = buf
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 20) return null;

  const MAX = 180;
  if (text.length <= MAX) return text;
  const cut = text.lastIndexOf(" ", MAX);
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, MAX)) + "…";
}

/**
 * Za repoe bez GitHub opisa, povlači README i izvlači opis iz prvog paragrafa.
 */
export async function fetchReadmeDescriptionLookup(
  repos: GitHubRepo[],
  token: string | undefined,
): Promise<ReadonlyMap<string, string>> {
  const map = new Map<string, string>();
  const need = repos
    .filter((r) => !r.description)
    .sort((a, b) => (b.pushed_at || "").localeCompare(a.pushed_at || ""));
  const batch = readmeLiveConcurrency();

  for (let i = 0; i < need.length; i += batch) {
    const slice = need.slice(i, i + batch);
    await Promise.all(
      slice.map(async (r) => {
        const md = await fetchRepoReadmeRaw(r.full_name, token);
        if (!md) return;
        const desc = extractDescriptionFromReadme(md);
        if (desc) map.set(r.full_name, desc);
      }),
    );
  }
  return map;
}

/** * Za repoe bez GitHub „Website” i bez Netlify mapiranja, povlači README i traži deploy link.
 */
export async function fetchReadmeLiveUrlLookup(
  repos: GitHubRepo[],
  netlifyIndex: NetlifyDeployIndex,
  token: string | undefined,
): Promise<ReadonlyMap<string, string>> {
  const map = new Map<string, string>();
  const need = repos
    .filter((r) => !resolveRepoLiveUrl(r, netlifyIndex))
    .sort((a, b) => (b.pushed_at || "").localeCompare(a.pushed_at || ""));
  const capped = need.slice(0, readmeLiveMax());
  const batch = readmeLiveConcurrency();

  for (let i = 0; i < capped.length; i += batch) {
    const slice = capped.slice(i, i + batch);
    await Promise.all(
      slice.map(async (r) => {
        const md = await fetchRepoReadmeRaw(r.full_name, token);
        if (!md) return;
        const u = extractDeployUrlFromReadme(md, r.full_name);
        if (u) map.set(r.full_name, u);
      }),
    );
  }
  return map;
}
