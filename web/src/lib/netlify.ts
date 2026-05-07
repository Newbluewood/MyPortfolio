import "server-only";

import { serverEnv } from "@/lib/env/server";

type NetlifySite = {
  id?: string;
  name?: string;
  ssl_url?: string | null;
  url?: string | null;
  custom_domain?: string | null;
  published_deploy?: {
    commit_url?: string | null;
    ssl_url?: string | null;
    deploy_ssl_url?: string | null;
  } | null;
  build_settings?: {
    repo_url?: string | null;
    /** Često samo `owner/repo` bez domena — list endpoint ga ima i kad je `repo_url` prazan. */
    repo_path?: string | null;
  } | null;
};

function githubFullNameFromRepoUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  // git@github.com:owner/repo.git
  const ssh = /^git@github\.com:([^/]+)\/(.+?)(\.git)?$/i.exec(s);
  if (ssh) {
    return `${ssh[1].toLowerCase()}/${ssh[2].replace(/\.git$/i, "").toLowerCase()}`;
  }
  try {
    const u = new URL(s.includes("://") ? s : `https://${s}`);
    const host = u.hostname.toLowerCase();
    if (host !== "github.com" && !host.endsWith(".github.com")) return null;
    const parts = u.pathname.replace(/\.git$/i, "").split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0].toLowerCase()}/${parts[1].toLowerCase()}`;
  } catch {
    return null;
  }
}

function repoFullNameFromBuildSettings(
  bs: NetlifySite["build_settings"],
): string | null {
  if (!bs) return null;
  const fromUrl = githubFullNameFromRepoUrl(bs.repo_url ?? null);
  if (fromUrl) return fromUrl;
  const rp = bs.repo_path?.trim();
  if (!rp) return null;
  // Ponekad je ceo URL u repo_path
  if (rp.includes("github.com") || rp.startsWith("git@")) {
    return githubFullNameFromRepoUrl(rp);
  }
  const parts = rp.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  return `${parts[0].toLowerCase()}/${parts[1].toLowerCase()}`;
}

/** Repo iz build settings ili iz poslednjeg publish deploya (list često skrati build_settings). */
function repoFullNameFromSite(site: NetlifySite): string | null {
  const fromBs = repoFullNameFromBuildSettings(site.build_settings);
  if (fromBs) return fromBs;
  const cu = site.published_deploy?.commit_url?.trim();
  if (cu) return githubFullNameFromRepoUrl(cu);
  return null;
}

function pickHttpsLiveUrl(site: NetlifySite): string | null {
  const pd = site.published_deploy;
  const domain = site.custom_domain?.trim();
  const cand =
    (domain && `https://${domain}`) ||
    (site.ssl_url && String(site.ssl_url).trim()) ||
    (pd?.deploy_ssl_url && String(pd.deploy_ssl_url).trim()) ||
    (pd?.ssl_url && String(pd.ssl_url).trim()) ||
    (site.url && String(site.url).trim()) ||
    "";
  if (!cand) return null;
  try {
    const u = new URL(cand.startsWith("http") ? cand : `https://${cand}`);
    if (u.protocol === "http:") u.protocol = "https:";
    return u.toString().replace(/\/$/, "") || null;
  } catch {
    return null;
  }
}

async function fetchNetlifySiteDetail(
  siteId: string,
  token: string,
): Promise<NetlifySite | null> {
  try {
    const res = await fetch(
      `https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as NetlifySite;
  } catch {
    return null;
  }
}

export type NetlifyDeployIndex = {
  byRepoFullName: ReadonlyMap<string, string>;
  /** Netlify „site name” (subdomen) + live URL — fallback kad se repo string razlikuje od GitHub imena. */
  sites: ReadonlyArray<{ name: string; live: string }>;
};

function repoHyphenFold(segment: string): string {
  return segment.toLowerCase().replace(/[-_]/g, "");
}

/**
 * Pronalazi deploy URL za GitHub `full_name` i kratko ime repoa (`name`).
 * 1) tačan owner/repo
 * 2) isti owner, ime repoa jednako ako se ignorišu `-` i `_` (npr. nastavnabazagoc vs nastavna-baza-goc)
 * 3) poklapanje Netlify site name ↔ GitHub repo name (npr. e-korpa2 vs Korpa2)
 */
export function resolveNetlifyDeployUrl(
  fullName: string,
  repoName: string,
  index: NetlifyDeployIndex,
): string | null {
  const lower = fullName.toLowerCase().trim();
  const hitExact = index.byRepoFullName.get(lower);
  if (hitExact) return hitExact;

  const slash = lower.indexOf("/");
  if (slash !== -1) {
    const owner = lower.slice(0, slash);
    const repo = lower.slice(slash + 1);
    if (owner && repo) {
      const foldRepo = repoHyphenFold(repo);
      for (const [k, url] of index.byRepoFullName) {
        const i = k.indexOf("/");
        if (i === -1) continue;
        const ko = k.slice(0, i);
        const kr = k.slice(i + 1);
        if (ko !== owner) continue;
        if (repoHyphenFold(kr) === foldRepo) return url;
      }
    }
  }

  const rn = repoHyphenFold(repoName);
  if (rn.length >= 2) {
    for (const s of index.sites) {
      const sn = repoHyphenFold(s.name);
      if (sn.length < 2) continue;
      if (sn === rn) return s.live;
      if (
        rn.length >= 4 &&
        sn.length >= 4 &&
        (sn.endsWith(rn) || rn.endsWith(sn))
      ) {
        return s.live;
      }
    }
  }

  return null;
}

/**
 * Indeks Netlify sajtova za /projects: mapa repoa + lista imena sajtova (fallback).
 */
export async function fetchNetlifyDeployIndex(): Promise<NetlifyDeployIndex> {
  const empty: NetlifyDeployIndex = {
    byRepoFullName: new Map(),
    sites: [],
  };

  const env = serverEnv();
  const token =
    env.NETLIFY_ACCESS_TOKEN?.trim() || env.NETLIFY_AUTH_TOKEN?.trim();
  if (!token) return empty;

  const map = new Map<string, string>();
  const sites: { name: string; live: string }[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const url = new URL("https://api.netlify.com/api/v1/sites");
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        console.warn(`Netlify API error ${res.status}: ${res.statusText}`);
        return { byRepoFullName: map, sites };
      }

      const batch = (await res.json()) as NetlifySite[];
      if (!Array.isArray(batch) || batch.length === 0) break;

      const needDetail = batch.filter(
        (s) => !repoFullNameFromSite(s) && Boolean(s.id),
      );
      const detailById = new Map<string, NetlifySite>();
      await Promise.all(
        needDetail.map(async (s) => {
          const d = await fetchNetlifySiteDetail(s.id!, token);
          if (d?.id) detailById.set(d.id, d);
        }),
      );

      for (const site of batch) {
        const effective =
          site.id && detailById.has(site.id)
            ? detailById.get(site.id)!
            : site;
        const key = repoFullNameFromSite(effective);
        const live = pickHttpsLiveUrl(effective);
        if (!live) continue;

        const siteName = (site.name ?? effective.name ?? "").trim();
        if (siteName) sites.push({ name: siteName, live });

        if (key && !map.has(key)) map.set(key, live);
      }

      if (batch.length < perPage) break;
      page += 1;
    }
  } catch (e) {
    console.warn("Netlify sites fetch failed:", e);
  }

  return { byRepoFullName: map, sites };
}
