"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { CvCredentials } from "@/components/cv-credentials";
import { Section } from "@/components/section";
import { useLang } from "@/lib/i18n/context";
import { clientEnv } from "@/lib/env/client";
import type { CvCredential } from "@/lib/cv-schema";

type Props = {
  aboutEn: string | null;
  aboutSr: string | null;
  skillsEn: string | null;
  skillsSr: string | null;
  credentials: CvCredential[];
};

export function HomeContent({
  aboutEn,
  aboutSr,
  skillsEn,
  skillsSr,
  credentials,
}: Props) {
  const { lang, T } = useLang();
  const { NEXT_PUBLIC_DISPLAY_NAME, NEXT_PUBLIC_GITHUB_URL } = clientEnv;

  const about = lang === "sr" ? (aboutSr ?? aboutEn) : aboutEn;
  const skills = lang === "sr" ? (skillsSr ?? skillsEn) : skillsEn;

  return (
    <>
      <section className="relative min-w-0 overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        >
          <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-cyan-400/90">
            {T.home.eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-tight">
            {T.home.greeting}{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {NEXT_PUBLIC_DISPLAY_NAME}
            </span>
            .
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            {lang === "sr" ? (
              <>
                Istraži projekte sinhronizovane sa GitHub-a, pročitaj moj{" "}
                <Link
                  href="/cv"
                  className="text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline"
                >
                  CV
                </Link>{" "}
                i postavi pitanja asistentu — odgovara iz odabranog znanja (RAG), ne pogađa.
              </>
            ) : (
              <>
                Explore projects synced from GitHub, read my{" "}
                <Link
                  href="/cv"
                  className="text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline"
                >
                  CV
                </Link>
                , and ask the on-site assistant questions — it answers from curated
                knowledge (RAG), not guesses.
              </>
            )}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              {T.home.viewProjects}
            </Link>
            <Link
              href="/cv"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
            >
              {T.home.cvResume}
            </Link>
            {NEXT_PUBLIC_GITHUB_URL ? (
              <Link
                href={NEXT_PUBLIC_GITHUB_URL}
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
                target="_blank"
                rel="noopener noreferrer"
              >
                {T.home.githubProfile}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {about ? (
        <Section id="about" eyebrow={T.home.aboutEyebrow} title={T.home.aboutTitle}>
          <ReactMarkdown>{about}</ReactMarkdown>
        </Section>
      ) : null}

      {skills ? (
        <Section eyebrow={T.home.skillsEyebrow} title={T.home.skillsTitle} id="skills">
          <ReactMarkdown>{skills}</ReactMarkdown>
        </Section>
      ) : null}

      {credentials.length > 0 ? (
        <Section
          id="credentials"
          eyebrow={T.home.credentialsEyebrow}
          title={T.home.credentialsTitle}
          wide
        >
          <p className="mb-4 max-w-2xl text-sm text-zinc-500">
            {T.home.credentialsHint}
          </p>
          <CvCredentials items={credentials} />
        </Section>
      ) : null}
    </>
  );
}
