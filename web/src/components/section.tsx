import type { ReactNode } from "react";

export function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mb-8 max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/90">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="max-w-3xl space-y-4 text-base leading-relaxed text-zinc-400 [&_a]:text-cyan-400 [&_a]:underline-offset-4 hover:[&_a]:underline [&_h1]:text-white [&_h2]:text-white [&_strong]:text-zinc-200">
        {children}
      </div>
    </section>
  );
}
