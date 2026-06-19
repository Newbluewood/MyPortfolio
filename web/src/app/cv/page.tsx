import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CvAvatar } from "@/components/cv-avatar";
import {
  CvApplyingForHeadline,
  CvApplyingForProvider,
} from "@/components/cv-applying-for";
import { CvPrintButton } from "@/components/cv-print-button";
import { T } from "@/components/translated-text";
import { getCvData } from "@/lib/cv-load";
import { liveSiteDisplayLabel } from "@/lib/repo-live-url";
import { siteOrigin } from "@/lib/site-url";
import {
  cvSkillBadgeClass,
  cvSkillCategory,
} from "@/lib/cv-skill-category";

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
    <TagEl className="mb-3 w-full border-b border-white/15 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400/90 print:mb-2 print:border-cyan-800/25 print:pb-1.5 print:text-[11px] print:tracking-[0.15em] print:text-cyan-800">
      {children}
    </TagEl>
  );
}

function CvSkillsSection({ skills }: { skills: string[] }) {
  return (
    <div className="cv-print-section">
      <SectionTitle as="h2">
        <T en="Skills" sr="Veštine" />
      </SectionTitle>
      <div className="flex flex-wrap gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 print:gap-1.5 print:border-0 print:bg-transparent print:p-0 print:pt-0.5">
        {skills.map((s) => (
          <span key={s} className={cvSkillBadgeClass(cvSkillCategory(s))}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function CvPage() {
  const cvData = await getCvData();
  const origin = siteOrigin();
  const { photo, name, contact, languages, experience, education, skills, selectedProjects } =
    cvData;

  return (
    <CvApplyingForProvider defaultHeadline={cvData.headlineApplyingFor}>
      <div className="cv-print-root mx-auto min-w-0 max-w-5xl px-4 py-12 sm:px-6 sm:py-16 print:max-w-none print:bg-white print:px-0 print:py-0 print:text-black">
        <CvPrintButton />

      <article className="break-words overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
        <div className="cv-print-grid grid min-w-0 md:grid-cols-[minmax(0,260px)_1fr] print:grid-cols-[minmax(0,36%)_1fr]">
          {/* Left column */}
          <aside className="cv-print-sidebar min-w-0 space-y-6 border-b border-white/10 bg-zinc-900/80 p-6 md:border-b-0 md:border-r md:border-white/10 print:space-y-0 print:border-b-0 print:border-r print:border-zinc-300 print:bg-zinc-100 print:p-5">
            <div className="cv-print-photo w-full">
              <CvAvatar name={name} photo={photo} />
            </div>

            <div className="cv-print-section">
              <SectionTitle as="h2"><T en="About me" sr="O meni" /></SectionTitle>
              <p className="text-sm leading-[1.79] text-zinc-300 print:text-zinc-800 print:text-xs print:leading-relaxed">
                <T en={cvData.about} sr={cvData.aboutSr ?? cvData.about} />
              </p>
              <p className="mt-3 print:hidden">
                <a
                  href={`${origin}/`}
                  className="text-sm font-medium text-cyan-400 no-underline hover:text-cyan-300 print:text-[11px] print:font-semibold print:text-cyan-800"
                >
                  <T en="My Portfolio" sr="Moj portfolio" />
                </a>
              </p>
            </div>

            <div className="cv-print-section">
              <SectionTitle as="h2"><T en="Languages" sr="Jezici" /></SectionTitle>
              <ul className="space-y-1 text-sm text-zinc-300 print:text-zinc-800 print:text-xs print:space-y-1">
                {languages.map((l) => (
                  <li key={l.label}>
                    {l.label} – {l.level}
                  </li>
                ))}
              </ul>
            </div>

            <div className="cv-print-section">
              <SectionTitle as="h2"><T en="Contact" sr="Kontakt" /></SectionTitle>
              <div className="space-y-2 text-sm text-zinc-300 print:text-zinc-800 print:text-xs print:space-y-1.5 print:leading-relaxed">
                {contact.location ? (
                  <div>
                    <T en="Location" sr="Lokacija" />:{" "}
                    <T
                      en={contact.location}
                      sr={contact.locationSr ?? contact.location}
                    />
                  </div>
                ) : null}
                <div>
                  Email:{" "}
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-cyan-400 no-underline hover:text-cyan-300 print:text-cyan-800"
                  >
                    {contact.email}
                  </a>
                </div>
                <div>
                  LinkedIn:{" "}
                  <a
                    href={contact.linkedIn.href}
                    className="text-cyan-400 no-underline hover:text-cyan-300 print:text-cyan-800"
                  >
                    {contact.linkedIn.label}
                  </a>
                </div>
                <div>
                  GitHub:{" "}
                  <a
                    href={contact.github.href}
                    className="text-cyan-400 no-underline hover:text-cyan-300 print:text-cyan-800"
                  >
                    {contact.github.label}
                  </a>
                </div>
              </div>
            </div>

            <CvSkillsSection skills={skills} />
          </aside>

          {/* Right column */}
          <div className="cv-print-main min-w-0 space-y-8 p-6 md:p-8 print:space-y-3 print:p-4">
            <header className="cv-print-section space-y-2 border-b border-white/10 pb-6 print:border-zinc-300 print:pb-2 print:space-y-0.5">
              <h1 className="text-3xl font-bold tracking-tight text-white print:text-black print:text-[22px] sm:text-4xl">
                {name}
              </h1>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="shrink-0 text-sm text-zinc-500 print:text-zinc-600">
                  <T en="Applying for:" sr="Pozicija:" />
                </span>
                <CvApplyingForHeadline />
              </div>
            </header>

            <section className="cv-print-section">
              <SectionTitle><T en="Experience" sr="Iskustvo" /></SectionTitle>
              <div className="space-y-6 print:space-y-2">
                {experience.map((job) => (
                  <div
                    key={`${job.company}-${job.period ?? ""}`}
                    className="grid gap-3 border-b border-white/5 pb-6 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,40%)_1fr] print:gap-1.5 print:border-zinc-200 print:pb-2 last:print:pb-0"
                  >
                    <div className="space-y-1 border-white/10 pr-0 sm:border-r sm:pr-4 print:border-black/15">
                      <h4 className="font-semibold text-white print:text-black print:text-[12px]">
                        {job.company}
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

            {selectedProjects.length > 0 ? (
              <section className="cv-print-section">
                <SectionTitle>
                  <T en="Selected Projects" sr="Istaknuti projekti" />
                </SectionTitle>
                <div className="space-y-6 print:space-y-2">
                  {selectedProjects.map((project) => (
                    <div
                      key={`${project.name}-${project.period ?? ""}`}
                      className="grid gap-3 border-b border-white/5 pb-6 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,40%)_1fr] print:gap-1.5 print:border-zinc-200 print:pb-2 last:print:pb-0"
                    >
                      <div className="space-y-1 border-white/10 pr-0 sm:border-r sm:pr-4 print:border-black/15">
                        <h4 className="font-semibold text-white print:text-black print:text-[12px]">
                          {project.name}
                        </h4>
                        {project.period ? (
                          <p className="text-center text-xs text-zinc-500 sm:text-left print:text-zinc-600">
                            {project.period}
                          </p>
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        {project.roleTitle ? (
                          <h5 className="mb-1 text-[13px] font-medium italic text-zinc-400 print:text-zinc-700">
                            <T
                              en={project.roleTitle}
                              sr={project.roleTitleSr ?? project.roleTitle}
                            />
                          </h5>
                        ) : null}
                        {project.liveUrl ? (
                          <p className="mb-1.5 text-xs print:mb-1">
                            <a
                              href={project.liveUrl}
                              className="text-cyan-400 no-underline hover:text-cyan-300 print:text-cyan-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {liveSiteDisplayLabel(project.liveUrl)}
                            </a>
                          </p>
                        ) : null}
                        <ul className="list-inside list-disc space-y-0.5 text-[13px] text-zinc-400 print:text-zinc-800 print:leading-tight print:text-[11px]">
                          {project.bullets.map((b, i) => (
                            <li key={b}>
                              <T en={b} sr={project.bulletsSr?.[i] ?? b} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-zinc-500 print:hidden">
                  <T en="More projects at" sr="Više projekata na" />{" "}
                  <a
                    href={`${origin}/projects`}
                    className="text-cyan-400/90 no-underline hover:text-cyan-300 print:text-cyan-800"
                  >
                    /projects
                  </a>
                  .
                </p>
              </section>
            ) : null}

            <section className="cv-print-section">
              <SectionTitle><T en="Education &amp; Courses" sr="Obrazovanje i kursevi" /></SectionTitle>
              <div className="space-y-6 print:space-y-2">
                {education.map((ed) => (
                  <div
                    key={ed.institution}
                    className="grid gap-3 border-b border-white/5 pb-6 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,40%)_1fr] print:gap-1.5 print:border-zinc-200 print:pb-2 last:print:pb-0"
                  >
                    <div className="space-y-1 border-white/10 pr-0 sm:border-r sm:pr-4 print:border-black/15">
                      <h4 className="font-semibold text-white print:text-black print:text-[12px]">
                        {ed.institution}
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
          </div>
        </div>
      </article>
      </div>
    </CvApplyingForProvider>
  );
}
