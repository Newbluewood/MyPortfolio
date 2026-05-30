import Link from "next/link";

import { Section } from "@/components/section";
import { T } from "@/components/translated-text";
import { fetchUserRepos, hasGithubListingIdentity, type GitHubRepo } from "@/lib/github";
import { fetchNetlifyDeployIndex, type NetlifyDeployIndex } from "@/lib/netlify";
import {
  GITHUB_REPO_LIVE_URL_OVERRIDES,
  MANUAL_PROJECTS,
  PROJECT_GROUP_CHIP_LABEL,
  PROJECT_GROUP_META,
  PROJECT_GROUP_ORDER,
  projectGroupIdsForRepo,
  type ManualProject,
  type ProjectGroupId,
} from "@/lib/project-groups";
import { liveSiteDisplayLabel, portfolioRepoLiveUrl } from "@/lib/repo-live-url";
import { serverEnv } from "@/lib/env/server";
import { fetchReadmeLiveUrlLookup } from "@/lib/readme-live-url";

/** Stranica se osvežava nakon 300s; GitHub/Netlify fetch imaju isti revalidate gde je primenjivo. */
export const revalidate = 300;

export const metadata = {
  title: "Projects",
  description:
    "Projekti sa više kategorija: rani radovi, Node.js, Python, CSR, full stack, AI i WordPress — narandžasti čipovi na svakoj kartici.",
};

function GroupChips({ groupIds }: { groupIds: ProjectGroupId[] }) {
  if (groupIds.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Categories">
      {groupIds.map((id) => (
        <li key={id}>
          <span
            title={PROJECT_GROUP_META[id].intro.en}
            className="inline-block rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200/95"
          >
            <T en={PROJECT_GROUP_CHIP_LABEL[id].en} sr={PROJECT_GROUP_CHIP_LABEL[id].sr} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function formatProjectMonthYear(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(ms))
    .replace(/\.$/, "");
}

function ProjectCardStartedAt({ iso }: { iso: string | undefined | null }) {
  const raw = iso?.trim();
  if (!raw) return null;
  const label = formatProjectMonthYear(raw);
  if (!label) return null;
  return (
    <footer className="mt-auto flex justify-end pt-3">
      <time dateTime={raw} className="text-[11px] tabular-nums text-zinc-500">
        {label}
      </time>
    </footer>
  );
}

function GitHubRepoCard({
  repo,
  netlifyIndex,
  readmeLiveByFullName,
  groupIds,
}: {
  repo: GitHubRepo;
  netlifyIndex: NetlifyDeployIndex;
  readmeLiveByFullName: ReadonlyMap<string, string>;
  groupIds: ProjectGroupId[];
}) {
  const liveUrl = portfolioRepoLiveUrl(
    repo,
    netlifyIndex,
    readmeLiveByFullName,
    GITHUB_REPO_LIVE_URL_OVERRIDES,
  );
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-500/30 hover:bg-white/[0.06]">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Link
          href={repo.html_url}
          className="min-w-0 break-words text-lg font-medium text-white hover:text-cyan-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          {repo.name}
        </Link>
        {repo.language ? (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-400">
            {repo.language}
          </span>
        ) : null}
        <span className="text-xs text-zinc-500">★ {repo.stargazers_count}</span>
      </div>
      <GroupChips groupIds={groupIds} />
      {repo.description ? (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
          {repo.description}
        </p>
      ) : (
        <p className="mt-2 flex-1 text-sm italic text-zinc-600"><T en="No description" sr="Bez opisa" /></p>
      )}
      {liveUrl ? (
        <p className="mt-2">
          <Link
            href={liveUrl}
            title={liveUrl}
            className="group inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-amber-400/95 underline decoration-amber-500/35 underline-offset-[3px] transition hover:text-amber-300 hover:decoration-amber-400/60"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="truncate">{liveSiteDisplayLabel(liveUrl)}</span>
            <span
              className="shrink-0 opacity-80 transition group-hover:translate-x-[1px] group-hover:opacity-100"
              aria-hidden
            >
              →
            </span>
          </Link>
        </p>
      ) : null}
      {repo.topics.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {repo.topics.map((t) => (
            <li
              key={t}
              className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-zinc-500"
            >
              {t}
            </li>
          ))}
        </ul>
      ) : null}
      <ProjectCardStartedAt iso={repo.created_at || repo.pushed_at} />
    </article>
  );
}

function ManualProjectCard({ project }: { project: ManualProject }) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-500/30 hover:bg-white/[0.06]">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="min-w-0 break-words text-lg font-medium text-white">{project.name}</span>
        {project.language ? (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-400">
            {project.language}
          </span>
        ) : null}
      </div>
      <GroupChips groupIds={project.groupIds} />
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
        {project.description}
      </p>
      <p className="mt-2">
        <Link
          href={project.liveUrl}
          title={project.liveUrl}
          className="group inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-amber-400/95 underline decoration-amber-500/35 underline-offset-[3px] transition hover:text-amber-300 hover:decoration-amber-400/60"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="truncate">{liveSiteDisplayLabel(project.liveUrl)}</span>
          <span
            className="shrink-0 opacity-80 transition group-hover:translate-x-[1px] group-hover:opacity-100"
            aria-hidden
          >
            →
          </span>
        </Link>
      </p>
      {project.sourceUrl ? (
        <p className="mt-2 text-xs text-zinc-500">
          <Link
            href={project.sourceUrl}
            className="text-cyan-400/90 underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <T en="Additional link →" sr="Dodatni link →" />
          </Link>
        </p>
      ) : null}
      <ProjectCardStartedAt iso={project.listedAt} />
    </article>
  );
}

export default async function ProjectsPage() {
  type GhOk = { ok: true; r: Awaited<ReturnType<typeof fetchUserRepos>> };
  type GhErr = { ok: false; message: string };

  const [ghOutcome, netlifyIndex] = await Promise.all([
    fetchUserRepos().then(
      (r): GhOk => ({ ok: true, r }),
      (e): GhErr => ({
        ok: false,
        message: e instanceof Error ? e.message : "Could not load GitHub data.",
      }),
    ),
    fetchNetlifyDeployIndex(),
  ]);

  const repos = ghOutcome.ok ? ghOutcome.r : [];
  const error = ghOutcome.ok ? null : ghOutcome.message;
  const readmeLiveByFullName = ghOutcome.ok
    ? await fetchReadmeLiveUrlLookup(repos, netlifyIndex, serverEnv().GITHUB_TOKEN)
    : new Map<string, string>();

  type ProjectListRow =
    | { kind: "manual"; project: ManualProject }
    | { kind: "github"; repo: GitHubRepo };

  function projectRowSortKey(row: ProjectListRow): string {
    if (row.kind === "manual") return row.project.listedAt;
    return row.repo.created_at || row.repo.pushed_at || "1970-01-01T00:00:00Z";
  }

  const projectRows: ProjectListRow[] = [
    ...MANUAL_PROJECTS.map((project) => ({ kind: "manual" as const, project })),
    ...repos.map((repo) => ({ kind: "github" as const, repo })),
  ].sort((a, b) => projectRowSortKey(b).localeCompare(projectRowSortKey(a)));

  return (
    <Section eyebrow="Portfolio" title={<T en="Projects" sr="Projekti" />}>
      {!process.env.VERCEL && !hasGithubListingIdentity() ? (
        <p className="mb-6 rounded-lg border border-cyan-500/25 bg-cyan-500/[0.08] px-4 py-3 text-sm leading-relaxed text-cyan-100/95">
          <strong className="text-cyan-200">Lokalno:</strong> GitHub listing nije
          podešen — repoi sa GitHub-a se neće učitati dok u root{" "}
          <code className="rounded bg-black/30 px-1 font-mono text-xs">.env</code> ne
          dodaš{" "}
          <code className="rounded bg-black/30 px-1 font-mono text-xs">
            GITHUB_USERNAME
          </code>
          ,{" "}
          <code className="rounded bg-black/30 px-1 font-mono text-xs">
            NEXT_PUBLIC_GITHUB_URL
          </code>{" "}
          na profil, ili{" "}
          <code className="rounded bg-black/30 px-1 font-mono text-xs">
            GITHUB_TOKEN
          </code>
          . Ručno dodati projekti ispod i dalje rade. Više u{" "}
          <code className="font-mono text-xs">.env.example</code>.
        </p>
      ) : null}

      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-zinc-500">
        <T
          en="Each project can have multiple categories — shown as orange chips (tooltip on the chip gives a longer description). Below is a legend; cards are sorted chronologically by creation — newest first (GitHub: repository creation date)."
          sr="Svaki projekat može imati više kategorija — prikazane su kao narandžasti čipovi (tooltip na čipu daje duži opis). Ispod je legenda; kartice su hronološki poredane po nastanku — najnoviji projekat je prvi (GitHub: datum kreiranja repozitorijuma)."
        />
      </p>

      {error ? (
        <p className="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}. Set <code className="font-mono text-red-100">GITHUB_USERNAME</code> in
          the monorepo root <code className="font-mono text-red-100">.env</code> (or{" "}
          <code className="font-mono text-red-100">web/.env.local</code>) and optionally{" "}
          <code className="font-mono text-red-100">GITHUB_TOKEN</code> for higher rate
          limits.
        </p>
      ) : null}

      <div
        className="mb-10 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-label="Category legend"
      >
        {PROJECT_GROUP_ORDER.map((id) => {
          const meta = PROJECT_GROUP_META[id];
          const chip = PROJECT_GROUP_CHIP_LABEL[id];
          return (
            <div
              key={id}
              className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3"
            >
              <h3 className="text-xs font-semibold tracking-wide text-amber-200/95">
                <T en={chip.en} sr={chip.sr} />
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                <T en={meta.intro.en} sr={meta.intro.sr} />
              </p>
            </div>
          );
        })}
      </div>

      <ul className="grid min-w-0 gap-4 sm:grid-cols-2">
        {projectRows.map((row) =>
          row.kind === "manual" ? (
            <li key={row.project.id} className="h-full min-h-0 min-w-0">
              <ManualProjectCard project={row.project} />
            </li>
          ) : (
            <li key={row.repo.id} className="h-full min-h-0 min-w-0">
              <GitHubRepoCard
                repo={row.repo}
                netlifyIndex={netlifyIndex}
                readmeLiveByFullName={readmeLiveByFullName}
                groupIds={projectGroupIdsForRepo(row.repo)}
              />
            </li>
          ),
        )}
      </ul>
    </Section>
  );
}
