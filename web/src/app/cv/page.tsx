import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { CvAvatar } from "@/components/cv-avatar";
import { CvPrintButton } from "@/components/cv-print-button";
import { T } from "@/components/translated-text";
import { getCvData } from "@/lib/cv-load";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCvData();
  return {
    title: "CV",
    description: `Resume — ${cv.name}. ${cv.headlineApplyingFor}`,
  };
}

function SectionTitle({
  children,
  as: Tag = "h3",
}: {
  children: ReactNode;
  as?: "h2" | "h3";
}) {
  const TagEl = Tag;
  return (
    <TagEl className="mb-3 w-full border-b border-white/15 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400/90 print:border-black/20 print:mb-1 print:text-[11px] print:tracking-[0.15em] print:text-cyan-800">
      {children}
    </TagEl>
  );
}

export default async function CvPage() {
  const cvData = await getCvData();
  const { photo, name, contact, languages, experience, education, skills } =
    cvData;

  return (
    <div className="mx-auto min-w-0 max-w-5xl px-4 py-12 sm:px-6 sm:py-16 print:max-w-none print:bg-white print:py-4 print:text-black">
      <p className="mb-3 text-center text-xs text-zinc-500 print:hidden sm:text-left">
        <T
          en='Edit CV content in content/cv.json; override "Applying for" with CV_HEADLINE_APPLYING_FOR in .env.'
          sr={"Sadržaj CV-ja menjaš u content/cv.json; polje \u201eApplying for\u201c možeš prepisati i preko CV_HEADLINE_APPLYING_FOR u .env."}
        />
      </p>
      <CvPrintButton />

      <article className="break-words overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20 print:rounded-none print:border-0 print:bg-white print:shadow-none">
        <div className="grid min-w-0 md:grid-cols-[minmax(0,260px)_1fr] print:grid-cols-[210px_1fr]">
          {/* Left column */}
          <aside className="min-w-0 space-y-6 border-b border-white/10 bg-zinc-900/80 p-6 md:border-b-0 md:border-r md:border-white/10 print:border-black/15 print:bg-zinc-100 print:p-3 print:space-y-3">
            <div className="flex justify-center md:justify-start print:justify-start">
              <CvAvatar name={name} photo={photo} />
            </div>

            <div>
              <SectionTitle as="h2"><T en="About me" sr="O meni" /></SectionTitle>
              <p className="text-sm leading-relaxed text-zinc-300 print:text-zinc-800 print:text-xs print:leading-snug">
                <T en={cvData.about} sr={cvData.aboutSr ?? cvData.about} />
              </p>
            </div>

            <div>
              <SectionTitle as="h2"><T en="Languages" sr="Jezici" /></SectionTitle>
              <ul className="space-y-1 text-sm text-zinc-300 print:text-zinc-800 print:text-xs print:space-y-0">
                {languages.map((l) => (
                  <li key={l.label}>
                    {l.label} – {l.level}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionTitle as="h2"><T en="Contact" sr="Kontakt" /></SectionTitle>
              <div className="space-y-2 text-sm text-zinc-300 print:text-zinc-800 print:text-xs print:space-y-0.5">
                <div>
                  Email:{" "}
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-cyan-400 underline-offset-2 hover:underline print:text-cyan-800"
                  >
                    {contact.email}
                  </a>
                </div>
                <div>
                  LinkedIn:{" "}
                  <a
                    href={contact.linkedIn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline-offset-2 hover:underline print:text-cyan-800"
                  >
                    {contact.linkedIn.label}
                  </a>
                </div>
                <div>
                  GitHub:{" "}
                  <a
                    href={contact.github.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline-offset-2 hover:underline print:text-cyan-800"
                  >
                    {contact.github.label}
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right column */}
          <div className="min-w-0 space-y-8 p-6 md:p-8 print:p-3 print:space-y-3">
            <header className="space-y-2 border-b border-white/10 pb-6 print:border-black/15 print:pb-2 print:space-y-0.5">
              <h1 className="text-3xl font-bold tracking-tight text-white print:text-black print:text-[22px] sm:text-4xl">
                {name}
              </h1>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="shrink-0 text-sm text-zinc-500 print:text-zinc-600">
                  <T en="Applying for:" sr="Pozicija:" />
                </span>
                <p className="text-lg font-medium italic text-amber-400/95 print:text-amber-900 print:text-base">
                  {cvData.headlineApplyingFor}
                </p>
              </div>
            </header>

            <section>
              <SectionTitle><T en="Experience" sr="Iskustvo" /></SectionTitle>
              <div className="space-y-6 print:space-y-2">
                {experience.map((job) => (
                  <div
                    key={job.company}
                    className="grid gap-3 border-b border-white/5 pb-6 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,40%)_1fr] print:border-black/10 print:pb-1.5 print:gap-1"
                  >
                    <div className="space-y-1 border-white/10 pr-0 sm:border-r sm:pr-4 print:border-black/15">
                      <h4 className="font-semibold text-white print:text-black print:text-[12px]">
                      </h4>
                      {job.period ? (
                        <p className="text-center text-xs text-zinc-500 sm:text-left print:text-zinc-600">
                          {job.period}
                        </p>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      {job.roleTitle ? (
                        <h5 className="mb-1 text-[13px] font-medium italic text-zinc-400 print:text-zinc-700">
                          <T en={job.roleTitle} sr={job.roleTitleSr ?? job.roleTitle} />
                        </h5>
                      ) : null}
                      <ul className="list-inside list-disc space-y-0.5 text-[13px] text-zinc-400 print:text-zinc-800 print:leading-tight print:text-[11px]">
                        {job.bullets.map((b, i) => (
                          <li key={b}><T en={b} sr={job.bulletsSr?.[i] ?? b} /></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle><T en="Education &amp; Courses" sr="Obrazovanje i kursevi" /></SectionTitle>
              <div className="space-y-6 print:space-y-2">
                {education.map((ed) => (
                  <div
                    key={ed.institution}
                    className="grid gap-3 border-b border-white/5 pb-6 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,40%)_1fr] print:border-black/10 print:pb-1.5 print:gap-1"
                  >
                    <div className="space-y-1 border-white/10 pr-0 sm:border-r sm:pr-4 print:border-black/15">
                      <h4 className="font-semibold text-white print:text-black print:text-[12px]">
                      </h4>
                      {ed.period ? (
                        <p className="text-center text-xs text-zinc-500 sm:text-left print:text-zinc-600">
                          {ed.period}
                        </p>
                      ) : null}
                    </div>
                    <ul className="list-inside list-disc text-[13px] text-zinc-400 print:text-zinc-800 print:leading-tight print:text-[11px]">
                      {ed.bullets.map((b, i) => (
                        <li key={b}><T en={b} sr={ed.bulletsSr?.[i] ?? b} /></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle><T en="Skills" sr="Veštine" /></SectionTitle>
              <div className="flex flex-wrap gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 print:border-black/10 print:bg-zinc-50 print:gap-1 print:p-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-white/10 bg-zinc-900/50 px-2 py-1 text-xs text-zinc-200 print:border-black/15 print:bg-white print:text-black print:px-1.5 print:py-0"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle><T en="Portfolio" sr="Portfolio" /></SectionTitle>
              <ul className="flex flex-col gap-2 text-sm print:gap-0.5 print:text-xs">
                {cvData.portfolioLinks.map((p) => (
                  <li key={p.href}>
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline-offset-2 hover:underline print:text-cyan-800"
                    >
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-zinc-500 print:text-zinc-600 print:mt-1">
                <T en="More projects at" sr="Više projekata na" />{" "}
                <Link
                  href="/projects"
                  className="text-cyan-400/90 underline-offset-2 hover:underline print:text-cyan-800"
                >
                  /projects
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
