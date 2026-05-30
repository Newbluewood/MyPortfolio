import Link from "next/link";

import { SiteHeaderNav } from "@/components/site-header-nav";
import { LangToggle } from "@/components/lang-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f14]/80 backdrop-blur-md print:hidden">
      <div className="relative mx-auto flex min-w-0 max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold tracking-tight text-white hover:text-cyan-300/90"
        >
          Portfolio
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <LangToggle />
          <SiteHeaderNav />
        </div>
      </div>
    </header>
  );
}
