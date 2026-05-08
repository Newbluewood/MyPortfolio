import Link from "next/link";

import { AangAttribution } from "@/components/aang-attribution";
import { AangRitualScene } from "@/components/aang-ritual-scene";
import { fetchUserRepos, hasGithubListingIdentity } from "@/lib/github";
import { fetchNetlifyDeployIndex } from "@/lib/netlify";
import { fetchReadmeLiveUrlLookup } from "@/lib/readme-live-url";
import { resolveRepoLiveUrl } from "@/lib/repo-live-url";
import { serverEnv } from "@/lib/env/server";

export const metadata = {
  title: "Staff ritual",
  description: "Lottie or PNG fallback — Aang ritual, repo clouds",
};

export default async function TestAnimationPage() {
  let repos: { name: string; html_url: string }[] = [];
  const missingIdentity = !hasGithubListingIdentity();
  let fetchFailed = false;
  try {
    if (missingIdentity) {
      repos = [];
    } else {
      const [allRepos, netlifyIndex] = await Promise.all([
        fetchUserRepos(),
        fetchNetlifyDeployIndex(),
      ]);
      const readmeLiveByFullName = await fetchReadmeLiveUrlLookup(
        allRepos,
        netlifyIndex,
        serverEnv().GITHUB_TOKEN,
      );
      repos = allRepos
        .map((repo) => {
          const deploy =
            resolveRepoLiveUrl(repo, netlifyIndex) ??
            readmeLiveByFullName.get(repo.full_name) ??
            null;
          return deploy ? { name: repo.name, html_url: deploy } : null;
        })
        .filter((x): x is { name: string; html_url: string } => x != null);
    }
  } catch {
    fetchFailed = true;
    repos = [];
  }

  const labGithubHint = missingIdentity
    ? ("missing_identity" as const)
    : fetchFailed
      ? ("fetch_failed" as const)
      : ("none" as const);

  return (
    <div className="mx-auto min-w-0 max-w-5xl">
      <AangRitualScene repos={repos} labGithubHint={labGithubHint} />
      <AangAttribution />
      <div className="relative z-[30] flex justify-center pb-10 pt-2">
        <Link
          href="/projects"
          className="text-sm text-cyan-400/90 underline-offset-4 hover:underline"
        >
          ← Nazad na projekte
        </Link>
      </div>
    </div>
  );
}
