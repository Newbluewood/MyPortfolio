"use client";

import Link from "next/link";

import { useLang } from "@/lib/i18n/context";

export function SiteFooter() {
  const { lang, T } = useLang();

  return (
    <footer className="mt-auto overflow-x-hidden border-t border-white/10 bg-[#0b0f14] print:hidden">
      <div className="mx-auto max-w-5xl min-w-0 space-y-4 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{T.footer.built}</p>
          <p className="text-zinc-600">© {new Date().getFullYear()}</p>
        </div>
        <p className="break-words border-t border-white/5 pt-4 text-xs leading-relaxed text-zinc-600">
          {lang === "sr" ? (
            <>
              Lab scena koristi stilizovanu referencu na lik{" "}
              <span lang="en">Aang</span> iz{" "}
              <cite className="not-italic text-zinc-500">Avatar: The Last Airbender</cite>{" "}
              (vlasništvo{" "}
              <span lang="en">Nickelodeon</span> / <span lang="en">Paramount</span>). Više:{" "}
              <Link
                href="/lab#aang-attribution"
                className="text-cyan-500/90 underline-offset-2 hover:text-cyan-400 hover:underline"
              >
                {T.footer.labNoteLink}
              </Link>
              .
            </>
          ) : (
            <>
              The Lab scene uses a stylized reference to the character{" "}
              <span lang="sr">Aang</span> from{" "}
              <cite className="not-italic text-zinc-500">Avatar: The Last Airbender</cite>{" "}
              (property of Nickelodeon / Paramount). More:{" "}
              <Link
                href="/lab#aang-attribution"
                className="text-cyan-500/90 underline-offset-2 hover:text-cyan-400 hover:underline"
              >
                {T.footer.labNoteLink}
              </Link>
              .
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
