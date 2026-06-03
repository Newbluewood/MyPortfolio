import type { ReactNode } from "react";

export function Section({
  id,
  title,
  eyebrow,
  children,
  wide,
  compact,
}: {
  id?: string;
  title: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  /** Use full content width (e.g. horizontal credential row). */
  wide?: boolean;
  /** Tighter vertical rhythm (e.g. stacked home sections). */
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className={
        compact
          ? "mx-auto min-w-0 max-w-5xl px-4 py-10 sm:px-6 sm:py-12"
          : "mx-auto min-w-0 max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
      }
    >
      <div className={compact ? "mb-6 max-w-2xl" : "mb-8 max-w-2xl"}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/90">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
      </div>
      <div
        className={
          wide
            ? "min-w-0"
            : "max-w-3xl space-y-4 break-words text-base leading-relaxed text-zinc-400 [&_a]:text-cyan-400/90 [&_a]:underline-offset-4 hover:[&_a]:text-cyan-300 hover:[&_a]:underline [&_a_strong]:font-semibold [&_a_strong]:text-cyan-300 [&_a_code]:bg-transparent [&_a_code]:text-cyan-300/90 [&_blockquote]:border-white/20 [&_code]:break-words [&_h1]:text-white [&_h2]:text-white [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_strong]:text-zinc-200 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
        }
      >
        {children}
      </div>
    </section>
  );
}
