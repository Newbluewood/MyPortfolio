"use client";

import { useLang } from "@/lib/i18n/context";

/** Inline translated text — renders EN or SR based on current language. */
export function T({ en, sr }: { en: string; sr: string }) {
  const { lang } = useLang();
  return <>{lang === "sr" ? sr : en}</>;
}
