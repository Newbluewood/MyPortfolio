import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0b0f14]">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Built with Next.js and a RAG-powered assistant.</p>
          <p className="text-zinc-600">© {new Date().getFullYear()}</p>
        </div>
        <p className="border-t border-white/5 pt-4 text-xs leading-relaxed text-zinc-600">
          Lab scena koristi stilizovanu referencu na lik{" "}
          <span lang="en">Aang</span> iz{" "}
          <cite className="not-italic text-zinc-500">Avatar: The Last Airbender</cite>{" "}
          (vlasništvo{" "}
          <span lang="en">Nickelodeon</span> / <span lang="en">Paramount</span>). Više:{" "}
          <Link
            href="/test-animation#aang-attribution"
            className="text-cyan-500/90 underline-offset-2 hover:text-cyan-400 hover:underline"
          >
            Zašto Aang
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
