import type { GitHubRepo } from "@/lib/github";

/**
 * Demo / tutorial repoi (Netlify feature tour, itd.) — ne prikazuj na /projects.
 * Privatni repoi sa ručnim karticama u MANUAL_PROJECTS (izbegava duplikat ako ikad
 * ponovo postanu public ili ako token vrati private).
 */
const EXCLUDED_REPO_NAMES_LOWER = new Set([
  "netlify-feature-tour",
  "netlify-cypress-test",
  "novi-stolar-v1",
  "novi_stolar_v2",
  "nastavna-baza-goc",
  "myportfolio",
]);

export function isExcludedFromPortfolioListing(repo: Pick<GitHubRepo, "name">): boolean {
  return EXCLUDED_REPO_NAMES_LOWER.has(repo.name.trim().toLowerCase());
}
