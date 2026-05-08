import type { GitHubRepo } from "@/lib/github";

/** Demo / tutorial repoi (Netlify feature tour, itd.) — ne prikazuj na /projects. */
const EXCLUDED_REPO_NAMES_LOWER = new Set([
  "netlify-feature-tour",
  "netlify-cypress-test",
]);

export function isExcludedFromPortfolioListing(repo: Pick<GitHubRepo, "name">): boolean {
  return EXCLUDED_REPO_NAMES_LOWER.has(repo.name.trim().toLowerCase());
}
