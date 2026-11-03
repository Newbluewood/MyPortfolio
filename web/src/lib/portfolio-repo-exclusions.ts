import type { GitHubRepo } from "@/lib/github";

/**
 * Demo / tutorial repoi (Netlify feature tour, itd.) — ne prikazuj na /projects.
 * Novi-Stolar-v1 / Novi_Stolar_v2 su privatni i već su ručne kartice u MANUAL_PROJECTS.
 */
const EXCLUDED_REPO_NAMES_LOWER = new Set([
  "netlify-feature-tour",
  "netlify-cypress-test",
  "novi-stolar-v1",
  "novi_stolar_v2",
]);

export function isExcludedFromPortfolioListing(repo: Pick<GitHubRepo, "name">): boolean {
  return EXCLUDED_REPO_NAMES_LOWER.has(repo.name.trim().toLowerCase());
}
