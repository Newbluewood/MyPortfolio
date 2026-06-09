"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useLang } from "@/lib/i18n/context";

/** Session-only override for print prep; cleared when the tab closes. */
const STORAGE_KEY = "cv-headline-applying-for";

type ApplyingForCtx = {
  headline: string;
  defaultHeadline: string;
  applyValue: (value: string) => void;
};

const ApplyingForContext = createContext<ApplyingForCtx | null>(null);

function useApplyingFor() {
  const ctx = useContext(ApplyingForContext);
  if (!ctx) {
    throw new Error("CvApplyingFor components must be used within CvApplyingForProvider");
  }
  return ctx;
}

export function CvApplyingForProvider({
  defaultHeadline,
  children,
}: {
  defaultHeadline: string;
  children: ReactNode;
}) {
  const [headline, setHeadline] = useState(defaultHeadline);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)?.trim();
      if (saved && saved !== defaultHeadline) {
        setHeadline(saved);
      }
    } catch {
      /* ignore */
    }
  }, [defaultHeadline]);

  const applyValue = useCallback(
    (value: string) => {
      const next = value.trim() || defaultHeadline;
      setHeadline(next);
      try {
        if (next === defaultHeadline) {
          sessionStorage.removeItem(STORAGE_KEY);
        } else {
          sessionStorage.setItem(STORAGE_KEY, next);
        }
      } catch {
        /* ignore */
      }
    },
    [defaultHeadline],
  );

  return (
    <ApplyingForContext.Provider
      value={{ headline, defaultHeadline, applyValue }}
    >
      {children}
    </ApplyingForContext.Provider>
  );
}

export function CvApplyingForHeadline() {
  const { headline, defaultHeadline, applyValue } = useApplyingFor();
  const { T } = useLang();
  const [editing, setEditing] = useState(false);
  const [inlineDraft, setInlineDraft] = useState(headline);

  const headlineClass =
    "text-lg font-medium italic text-amber-400/95 print:text-amber-900 print:text-base";

  const startEditing = () => {
    setInlineDraft(headline);
    setEditing(true);
  };

  const commitInline = () => {
    applyValue(inlineDraft);
    setEditing(false);
  };

  const cancelInline = () => {
    setInlineDraft(headline);
    setEditing(false);
  };

  return (
    <div className="min-w-0 flex-1">
      {editing ? (
        <input
          type="text"
          autoFocus
          value={inlineDraft}
          onChange={(e) => setInlineDraft(e.target.value)}
          onBlur={commitInline}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitInline();
            if (e.key === "Escape") cancelInline();
          }}
          placeholder={defaultHeadline}
          aria-label={T.cv.applyingForInputLabel}
          className={`${headlineClass} w-full rounded border border-amber-400/30 bg-zinc-900/60 px-2 py-0.5 print:hidden focus:border-amber-400/50 focus:outline-none`}
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          title={T.cv.applyingForClickToEdit}
          className={`${headlineClass} w-full cursor-text text-left underline decoration-dotted decoration-amber-400/40 underline-offset-4 transition hover:decoration-amber-400/70 print:hidden print:cursor-default print:no-underline`}
        >
          {headline}
        </button>
      )}
      <p className={`${headlineClass} hidden print:block`}>{headline}</p>
    </div>
  );
}
