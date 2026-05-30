"use client";

import { useLang } from "@/lib/i18n/context";

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      className="flex items-center rounded-lg border border-white/15 bg-white/5 p-0.5 text-xs font-medium"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`min-h-7 rounded-md px-2 py-1 transition ${
          lang === "en"
            ? "bg-white/15 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("sr")}
        className={`min-h-7 rounded-md px-2 py-1 transition ${
          lang === "sr"
            ? "bg-white/15 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
        aria-pressed={lang === "sr"}
      >
        SR
      </button>
    </div>
  );
}
