import "server-only";

import { serverEnv, type ServerEnv } from "@/lib/env/server";

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  /** "Website" URL from repo About (often Netlify/Vercel). */
  homepage: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  /** Private repos se ne prikazuju na Projects strani. */
  private: boolean;
  topics: string[];
  language: string | null;
  /** ISO 8601 — datum kreiranja repozitorijuma (hronologija na /projects). */
  created_at: string;
  pushed_at: string;
};

/**
 * Kratki opis na portfoliju kad je GitHub "About" prazan.
 * (Ne utiče na privatne repo — oni se ionako ne listaju.)
 */
const REPO_DESCRIPTION_FALLBACK: Partial<Record<string, string>> = {
  MemoGemo:
    "Igra memorije u HTML/CSS/JS-u; playable sadržaj u folderu „Igra Memorije - BlackEdition“.",
  HangMan: "Igra vešala (vanilla JS) — `index.html` i logika u `src/`.",
  Kuvar:
    "CookBook na MarsEngine hostingu: Vue 3 klijent (dashboard i ceo tok), sa hostovanim JS backendom i MySQL bazom — ne „čist“ CSR bez servera.",
  "nastavna-baza-goc":
    "Nastavna platforma (monorepo) razvijana u duhu vibe codinga i AI integracije: Vue 3 + Vite, Express backend (MySQL, Qdrant, OpenAI, JWT) — asistent i RAG tok u učionici.",
  CookBook2025:
    "Frontend rešenje za isti cookbook / kuvar projekat; rad na prvoj praksi ITAcademy u EnonSolutions (dva tima od po četiri osobe).",
  online_sales_analysis:
    "Python: OOP (klase), analiza online prodaje (skripte / materijal sa kursa).",
  "CCD_Test_PracticeCenter---JSFD-NebojsaSimovic":
    "Ulazni test / provera pre prakse u EnonSolutions (vezano za materijal sa kursa).",
  Korpa2:
    "Korpa — vežba klasa u JavaScriptu i Observer obrasca (E‑commerce koncept, vidi strukturu u repou).",
  "Proba-GH": "Kratka proba rada sa GitHub tokom.",
  "Jest-Test-Inter":
    "Prvi rad sa Jest testovima (TypeScript), u kontekstu zadatka za internship (CB).",
  Korpa1:
    "Korpa — vežba klasa u JavaScriptu i Observer obrasca (ranija varijanta / demo).",
  "To-Do": "JavaScript Advanced — to‑do aplikacija.",
  Quizi:
    "Prvi veći projekat i završni rad ITAcademy (Frontend Development): Vue 3, Vue Router, Pinia — bez baze; podaci hardkodirani ili u memoriji pregledača. Rezime savladanog gradiva.",
  "Weather-OM":
    "Zadatak kompanije za kvalifikaciju na internship (oglas): potrošnja API endpointa i izrada frontenda.",
  openmeteo:
    "Rad sa API-jem (open meteo sličan zadatak): Nunjucks templating, jQuery, Bulma CSS preko CDN-a.",
  "pevac-irdin": "Projekat vezan za pevača / sadržaj (vidi README u repou).",
  CB_Internship:
    "Zadatak za internship prijavu u Node.js okruženju (node_modules pristup): simulacija košarkaškog turnira na OI od grupne faze do finala; statistika i matematika.",
  "my-first-repo": "Prvi repo / uvod u Git.",
  "netlify-feature-tour": "Start deploy primer sa Netlify (probe, tutorial materijal).",
};

function normalizeGithubDescription(raw: string | null | undefined): string {
  if (raw == null) return "";
  return String(raw)
    .replace(/\u200B/g, "")
    .trim();
}

function repoDescriptionFallback(repoName: string): string | undefined {
  const key = repoName.trim();
  if (!key) return undefined;
  const direct = REPO_DESCRIPTION_FALLBACK[key];
  if (direct !== undefined) return direct;
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(REPO_DESCRIPTION_FALLBACK)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

function githubLoginFromProfileUrl(url: string | undefined): string {
  if (!url?.trim()) return "";
  try {
    const u = new URL(url.trim());
    if (!u.hostname.endsWith("github.com")) return "";
    const seg = u.pathname.split("/").filter(Boolean);
    return seg[0] ? decodeURIComponent(seg[0]) : "";
  } catch {
    return "";
  }
}

/** Identitet za listanje repoa (token, javni /users/:login, ili oba). */
export function resolveGithubListingIdentity(s: ServerEnv): {
  effectiveUsername: string;
  useTokenList: boolean;
} | null {
  const token = (s.GITHUB_TOKEN ?? "").trim();
  const explicit = (s.GITHUB_USERNAME ?? "").trim();
  const fromUrl = githubLoginFromProfileUrl(s.NEXT_PUBLIC_GITHUB_URL);
  const username = explicit || fromUrl;
  if (token) return { effectiveUsername: username, useTokenList: true };
  if (username) return { effectiveUsername: username, useTokenList: false };
  return null;
}

export function hasGithubListingIdentity(): boolean {
  return resolveGithubListingIdentity(serverEnv()) !== null;
}

/** Na Vercelu uvek zahtevamo konfiguraciju; lokalno bez .env ne obara build. */
function githubListingStrict(): boolean {
  return Boolean(process.env.VERCEL);
}

export async function fetchUserRepos(): Promise<GitHubRepo[]> {
  const s = serverEnv();
  const id = resolveGithubListingIdentity(s);
  if (!id) {
    if (!githubListingStrict()) {
      console.warn(
        "[portfolio] GitHub listing skipped — set GITHUB_USERNAME or NEXT_PUBLIC_GITHUB_URL or GITHUB_TOKEN (see .env.example).",
      );
      return [];
    }
    throw new Error(
      "GitHub projects need a username or token. Set GITHUB_USERNAME in the monorepo root `.env` or `web/.env.local`, or set NEXT_PUBLIC_GITHUB_URL to your profile (e.g. https://github.com/YourLogin), or set GITHUB_TOKEN for authenticated listing.",
    );
  }

  const username = id.effectiveUsername;
  const {
    GITHUB_TOKEN,
    GITHUB_REPOS_INCLUDE_FORKS,
    GITHUB_REPOS_INCLUDE_ARCHIVED,
  } = s;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (id.useTokenList && GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN.trim()}`;
  }

  const all: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;
  let useAuthedList = id.useTokenList;

  while (true) {
    const url = useAuthedList
      ? new URL("https://api.github.com/user/repos")
      : new URL(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos`,
        );
    url.searchParams.set("sort", "updated");
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    url.searchParams.set("type", "owner");

    const res = await fetch(url, {
      headers,
      next: { revalidate: 300 },
    });

    if (res.status === 401 && useAuthedList) {
      if (!username) {
        throw new Error(
          "GITHUB_TOKEN was rejected; set a valid token or set GITHUB_USERNAME / NEXT_PUBLIC_GITHUB_URL for public repo listing.",
        );
      }
      useAuthedList = false;
      page = 1;
      delete headers.Authorization;
      all.length = 0;
      continue;
    }

    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
    }

    const batch = (await res.json()) as GitHubRepo[];
    // /user/repos?type=owner već vraća samo repoe vlasnika tokena — ne filtriraj
    // po GITHUB_USERNAME (pogrešan username u .env je inače pravio praznu listu).
    all.push(...batch);

    if (batch.length < perPage) break;
    page += 1;
  }

  return all
    .filter(
      (r) =>
        r.private !== true &&
        (GITHUB_REPOS_INCLUDE_ARCHIVED || !r.archived) &&
        (GITHUB_REPOS_INCLUDE_FORKS || !r.fork),
    )
    .map((r) => {
      const topics = Array.isArray(r.topics) ? r.topics : [];
      const base = {
        ...r,
        topics,
        homepage:
          r.homepage && String(r.homepage).trim()
            ? String(r.homepage).trim()
            : null,
      };
      const trimmed = normalizeGithubDescription(base.description);
      if (trimmed) {
        return { ...base, description: trimmed };
      }
      const fb = repoDescriptionFallback(base.name);
      return {
        ...base,
        description: fb ?? null,
      };
    });
}
