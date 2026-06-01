"use client";

/**
 * Objašnjenje zašto je Aang na Lab sceni + poštovanje autorskih prava na seriju/lik.
 */
import { useLang } from "@/lib/i18n/context";

export function AangAttribution() {
  const { T } = useLang();
  return (
    <section
      id="aang-attribution"
      aria-labelledby="aang-attribution-heading"
      className="relative z-[30] mx-auto max-w-2xl px-4 pb-2 pt-4 sm:px-6"
    >
      <h2
        id="aang-attribution-heading"
        className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        {T.lab.aang.heading}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
        <p>{T.lab.aang.body}</p>
        <p className="text-xs leading-relaxed text-zinc-500">
          {T.lab.aang.rights}
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href="https://en.wikipedia.org/wiki/Aang"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            {T.lab.aang.wikiAang}
          </a>
          <a
            href="https://en.wikipedia.org/wiki/Avatar:_The_Last_Airbender"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            {T.lab.aang.wikiSeries}
          </a>
        </p>
      </div>
    </section>
  );
}
