import "server-only";

import type { GitHubRepo } from "@/lib/github";
import type { NetlifyDeployIndex } from "@/lib/netlify";
import {
  GITHUB_REPO_LIVE_URL_OVERRIDES,
  MANUAL_PROJECTS,
} from "@/lib/project-groups";
import { portfolioRepoLiveUrl } from "@/lib/repo-live-url";

export type LabDeployLink = {
  name: string;
  html_url: string;
};

export function manualLabDeployLinks(): LabDeployLink[] {
  return MANUAL_PROJECTS.map((project) => ({
    name: project.name,
    html_url: project.liveUrl,
  }));
}

export function githubLabDeployLinks(
  allRepos: GitHubRepo[],
  netlifyIndex: NetlifyDeployIndex,
  readmeLiveByFullName: ReadonlyMap<string, string>,
): LabDeployLink[] {
  return allRepos
    .map((repo) => {
      const deploy = portfolioRepoLiveUrl(
        repo,
        netlifyIndex,
        readmeLiveByFullName,
        GITHUB_REPO_LIVE_URL_OVERRIDES,
      );
      return deploy ? { name: repo.name, html_url: deploy } : null;
    })
    .filter((x): x is LabDeployLink => x != null);
}

/** GitHub deploy links first, then manual projects; dedupe by URL. */
export function mergeLabDeployLinks(...groups: LabDeployLink[][]): LabDeployLink[] {
  const seen = new Set<string>();
  const out: LabDeployLink[] = [];
  for (const group of groups) {
    for (const link of group) {
      const key = link.html_url.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(link);
    }
  }
  return out;
}
