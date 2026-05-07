import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { Section } from "@/components/section";
import { readMarkdownFile } from "@/lib/content";
import { clientEnv } from "@/lib/env/client";

export default async function HomePage() {
  const [about, skills] = await Promise.all([
    readMarkdownFile("about.md"),
    readMarkdownFile("skills.md"),
  ]);
  const { NEXT_PUBLIC_DISPLAY_NAME, NEXT_PUBLIC_GITHUB_URL } = clientEnv;

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        >
          <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-cyan-400/90">
            Portfolio
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-tight">
            Hi, I&apos;m{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {NEXT_PUBLIC_DISPLAY_NAME}
            </span>
            .
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Explore projects synced from GitHub, read my{" "}
            <Link
              href="/cv"
              className="text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline"
            >
              CV
            </Link>
            , and ask the on-site assistant questions — it answers from curated
            knowledge (RAG), not guesses.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              View projects
            </Link>
            <Link
              href="/cv"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
            >
              CV / Resume
            </Link>
            {NEXT_PUBLIC_GITHUB_URL ? (
              <Link
                href={NEXT_PUBLIC_GITHUB_URL}
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub profile
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {about ? (
        <Section id="about" eyebrow="About" title="What I do">
          <ReactMarkdown>{about}</ReactMarkdown>
        </Section>
      ) : null}

      {skills ? (
        <Section
          eyebrow="Stack"
          title="Skills"
          id="skills"
        >
          <ReactMarkdown>{skills}</ReactMarkdown>
        </Section>
      ) : null}
    </>
  );
}
