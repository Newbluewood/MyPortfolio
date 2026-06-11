"use client";

import { useLang } from "@/lib/i18n/context";

export function CvPrintButton() {
  const { T } = useLang();

  return (
    <div className="mb-6 flex flex-col gap-2 print:hidden sm:flex-row sm:flex-wrap sm:items-start sm:gap-3">
      <button
        type="button"
        onClick={() => {
          const prev = document.title;
          document.title = "Nebojsa-Simovic-CV";
          window.print();
          document.title = prev;
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {T.cv.exportPdf}
      </button>
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        {T.cv.printHint}
      </p>
    </div>
  );
}
