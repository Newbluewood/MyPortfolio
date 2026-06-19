"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { useLang } from "@/lib/i18n/context";

export function SiteHeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const { T } = useLang();

  const links = [
    { href: "/", label: T.nav.home },
    { href: "/projects", label: T.nav.projects },
    { href: "/cv", label: T.nav.cv },
    { href: "/lab", label: T.nav.lab },
    { href: "/contact", label: T.nav.contact },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
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
          aria-label={open ? T.nav.closeMenu : T.nav.openMenu}
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

      {open
        ? createPortal(
            <div
              id={menuId}
              role="navigation"
              aria-label="Mobile primary"
              className="fixed left-0 right-0 top-[calc(env(safe-area-inset-top,0px)+4.5rem)] z-[200] max-h-[calc(100dvh-env(safe-area-inset-top,0px)-4.5rem)] overflow-y-auto overscroll-contain border-b border-white/10 bg-[#0b0f14] shadow-xl shadow-black/30 md:hidden"
            >
              <ul className="mx-auto flex max-w-5xl flex-col px-4 py-3 sm:px-6">
                {links.map((l) => (
                  <li
                    key={l.href}
                    className="border-b border-white/5 last:border-0"
                  >
                    <Link
                      href={l.href}
                      className="block py-3.5 text-base text-zinc-200 transition-colors hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
