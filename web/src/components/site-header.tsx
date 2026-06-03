import Link from "next/link";

import { SiteHeaderNav } from "@/components/site-header-nav";
import { LangToggle } from "@/components/lang-toggle";
import { clientEnv } from "@/lib/env/client";

export function SiteHeader() {
  const brand = clientEnv.NEXT_PUBLIC_DISPLAY_NAME;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f14]/80 backdrop-blur-md print:hidden">
      <div className="relative mx-auto flex min-w-0 max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="group inline-flex min-h-11 shrink-0 items-baseline gap-0.5 text-base font-semibold tracking-tight transition-opacity hover:opacity-90 sm:text-lg"
          aria-label={`${brand} Portfolio`}
        >
          <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
            {brand}
          </span>
          <span className="text-white">Portfolio</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <LangToggle />
          <SiteHeaderNav />
        </div>
      </div>
    </header>
  );
}
