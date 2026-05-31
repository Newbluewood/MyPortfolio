"use client";

export function CvPrintButton() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
      <button
        onClick={() => {
          const prev = document.title;
          document.title = "Nebojsa-Simovic-CV";
          window.print();
          document.title = prev;
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200 active:scale-95"
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
        Export PDF
      </button>
      <span className="text-xs text-zinc-500">
        In the print dialog: Margins → None, uncheck Headers and footers.
      </span>
    </div>
  );
}
