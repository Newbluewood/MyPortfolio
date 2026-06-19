import { AangAttribution } from "@/components/aang-attribution";
import { LabBackLink } from "@/components/lab-back-link";
import { AangRitualScene } from "@/components/aang-ritual-scene";
import { fetchUserRepos, hasGithubListingIdentity } from "@/lib/github";
import {
  githubLabDeployLinks,
  manualLabDeployLinks,
  mergeLabDeployLinks,
} from "@/lib/lab-deploy-links";
import { fetchNetlifyDeployIndex } from "@/lib/netlify";
import { fetchReadmeLiveUrlLookup } from "@/lib/readme-live-url";
import { serverEnv } from "@/lib/env/server";

export const metadata = {
  title: "Lab",
  description: "Deploy clouds — GitHub live sites and featured manual projects",
};

export default async function LabPage() {
  let githubLinks: ReturnType<typeof githubLabDeployLinks> = [];
  const missingIdentity = !hasGithubListingIdentity();
  let fetchFailed = false;

  try {
    if (!missingIdentity) {
      const [allRepos, netlifyIndex] = await Promise.all([
        fetchUserRepos(),
        fetchNetlifyDeployIndex(),
      ]);
      const readmeLiveByFullName = await fetchReadmeLiveUrlLookup(
        allRepos,
        netlifyIndex,
        serverEnv().GITHUB_TOKEN,
      );
      githubLinks = githubLabDeployLinks(
        allRepos,
        netlifyIndex,
        readmeLiveByFullName,
      );
    }
  } catch {
    fetchFailed = true;
    githubLinks = [];
  }

  const repos = mergeLabDeployLinks(githubLinks, manualLabDeployLinks());

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
        <LabBackLink />
      </div>
    </div>
  );
}
