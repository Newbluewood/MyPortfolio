import "server-only";

import type { GitHubRepo } from "@/lib/github";
import type { NetlifyDeployIndex } from "@/lib/netlify";
import { resolveNetlifyDeployUrl } from "@/lib/netlify";

function deployHref(homepage: string | null): string | null {
  if (!homepage?.trim()) return null;
  const t = homepage.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

/** owner/repo sa github.com URL-a, ili null ako nije GitHub repo link. */
function githubOwnerRepoFromUrl(raw: string): `${string}/${string}` | null {
  try {
    const u = new URL(raw);
    const h = u.hostname.toLowerCase();
    if (h !== "github.com" && h !== "www.github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0].toLowerCase()}/${parts[1].toLowerCase()}`;
  } catch {
    return null;
  }
}

/** github.com/username (profil ili org bez /repo) — nije „live” sajt. */
function isGithubProfileOrOrgOnlyUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    const h = u.hostname.toLowerCase();
    if (h !== "github.com" && h !== "www.github.com") return false;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length < 2;
  } catch {
    return false;
  }
}

function liveDeployHref(
  homepage: string | null,
  repoHtmlUrl: string,
): string | null {
  const href = deployHref(homepage);
  if (!href) return null;
  if (isGithubProfileOrOrgOnlyUrl(href)) return null;
  const homeKey = githubOwnerRepoFromUrl(href);
  const repoKey = githubOwnerRepoFromUrl(repoHtmlUrl);
  if (homeKey && repoKey && homeKey === repoKey) return null;
  return href;
}

/**
 * Jedan rezultat: GitHub „Website” (ako je smislen) ili Netlify deploy URL.
 */
export function resolveRepoLiveUrl(
  r: GitHubRepo,
  netlifyIndex: NetlifyDeployIndex,
): string | null {
  const fromGh = liveDeployHref(r.homepage, r.html_url);
  const fromNf =
    resolveNetlifyDeployUrl(r.full_name, r.name, netlifyIndex) ?? null;
  return fromGh ?? fromNf ?? null;
}

/** Kratki „naziv” live URL-a za prikaz (hostname [+ kratka putanja]). */
export function liveSiteDisplayLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const path =
      u.pathname && u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "";
    return path ? `${host}${path}` : host;
  } catch {
    return "Sajt";
  }
}
