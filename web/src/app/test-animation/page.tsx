import Link from "next/link";

import { AangAttribution } from "@/components/aang-attribution";
import { AangRitualScene } from "@/components/aang-ritual-scene";
import { fetchUserRepos } from "@/lib/github";
import { fetchNetlifyDeployIndex } from "@/lib/netlify";
import { resolveRepoLiveUrl } from "@/lib/repo-live-url";

export const metadata = {
  title: "Staff ritual",
  description: "Lottie or PNG fallback — Aang ritual, repo clouds",
};

export default async function TestAnimationPage() {
  let repos: { name: string; html_url: string }[] = [];
  let demoRepos = false;
  try {
    const [allRepos, netlifyIndex] = await Promise.all([
      fetchUserRepos(),
      fetchNetlifyDeployIndex(),
    ]);
    repos = allRepos
      .map((repo) => {
        const deploy = resolveRepoLiveUrl(repo, netlifyIndex);
        return deploy ? { name: repo.name, html_url: deploy } : null;
      })
      .filter((x): x is { name: string; html_url: string } => x != null);
    demoRepos = false;
  } catch {
    demoRepos = true;
    repos = [];
  }

  return (
    <main className="mx-auto max-w-5xl">
      <AangRitualScene repos={repos} demoRepos={demoRepos} />
      <AangAttribution />
      <div className="relative z-[30] flex justify-center pb-10 pt-2">
        <Link
          href="/projects"
          className="text-sm text-cyan-400/90 underline-offset-4 hover:underline"
        >
          ← Nazad na projekte
        </Link>
      </div>
    </main>
  );
}
