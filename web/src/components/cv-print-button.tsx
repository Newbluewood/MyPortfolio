"use client";

import { useCallback, useState } from "react";

import { useLang } from "@/lib/i18n/context";

export function CvPrintButton() {
  const { T } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cv/pdf");
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? T.cv.pdfDownloadFailed);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Nebojsa-Simovic-CV.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : T.cv.pdfDownloadFailed);
    } finally {
      setBusy(false);
    }
  }, [T.cv.pdfDownloadFailed]);

  const printManually = useCallback(() => {
    const prev = document.title;
    document.title = "Nebojsa-Simovic-CV";
    window.print();
    document.title = prev;
  }, []);

  return (
    <div className="mb-6 flex flex-col gap-2 print:hidden sm:flex-row sm:flex-wrap sm:items-start sm:gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200 active:scale-95 disabled:cursor-wait disabled:opacity-60"
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
          {busy ? T.cv.exportPdfBusy : T.cv.exportPdf}
        </button>
        <button
          type="button"
          onClick={printManually}
          className="inline-flex shrink-0 items-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:bg-white/5"
        >
          {T.cv.printManually}
        </button>
      </div>
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        {T.cv.printHint}
      </p>
      {error ? (
        <p className="w-full text-xs text-amber-400/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
