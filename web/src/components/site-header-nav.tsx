"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
  { href: "/test-animation", label: "Lab" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-5 text-sm text-zinc-400 md:flex md:gap-6"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="transition-colors hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex md:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:border-white/25 hover:bg-white/10"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      <div
        id={menuId}
        role="navigation"
        aria-label="Mobile primary"
        hidden={!open}
        className={
          open
            ? "absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-[#0b0f14]/95 shadow-lg shadow-black/40 backdrop-blur-md md:hidden"
            : "hidden"
        }
      >
        <ul className="mx-auto flex max-w-5xl flex-col px-4 py-3 sm:px-6">
          {links.map((l) => (
            <li key={l.href} className="border-b border-white/5 last:border-0">
              <Link
                href={l.href}
                className="block py-3.5 text-base text-zinc-300 transition-colors hover:text-white"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
