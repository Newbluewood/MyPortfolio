"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { clientEnv } from "@/lib/env/client";
import { useLang } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

type Source = { text?: string; file?: string };

const URL_IN_TEXT =
  /\bhttps?:\/\/[^\s<>"{}|\\^\[\]`]+/gi;

const MQ_MOBILE = "(max-width: 767px)";

function stripTrailingUrlJunk(url: string): string {
  let u = url;
  while (u.length > 0 && /[.,;:!?)}\]'»”]+$/.test(u.slice(-1))) {
    u = u.slice(0, -1);
  }
  return u;
}

function linkifyPlainText(text: string): ReactNode {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(URL_IN_TEXT.source, URL_IN_TEXT.flags);
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    const raw = m[0];
    const href = stripTrailingUrlJunk(raw);
    const suffix = raw.slice(href.length);
    nodes.push(
      <a
        key={k++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-cyan-400 underline decoration-cyan-500/50 underline-offset-2 hover:text-cyan-300"
      >
        {href}
      </a>,
    );
    if (suffix) nodes.push(suffix);
    last = re.lastIndex;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes.length ? <Fragment>{nodes}</Fragment> : text;
}

function parseSseLines(buffer: string): {
  events: Array<{ event: string; data: string }>;
  rest: string;
} {
  const events: Array<{ event: string; data: string }> = [];
  let rest = buffer;
  const parts = buffer.split("\n\n");
  rest = parts.pop() ?? "";
  for (const block of parts) {
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length) {
      events.push({ event, data: dataLines.join("\n") });
    }
  }
  return { events, rest };
}

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; sources?: Source[] }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vvRect, setVvRect] = useState({ top: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const assistantIdxRef = useRef(-1);
  const pendingRef = useRef("");
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { lang, T } = useLang();
  const langRef = useRef(lang);
  langRef.current = lang;

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  const flushPending = useCallback(() => {
    if (!pendingRef.current) return;
    stopTyping();
    const remaining = pendingRef.current;
    pendingRef.current = "";
    const i = assistantIdxRef.current;
    setMessages((m) => {
      const copy = [...m];
      const last = copy[i];
      if (last?.role === "assistant") {
        copy[i] = { ...last, content: last.content + remaining };
      }
      return copy;
    });
  }, [stopTyping]);

  const startTyping = useCallback(() => {
    if (typingTimerRef.current) return;
    typingTimerRef.current = setInterval(() => {
      if (!pendingRef.current) {
        stopTyping();
        return;
      }
      const char = pendingRef.current[0];
      pendingRef.current = pendingRef.current.slice(1);
      const i = assistantIdxRef.current;
      setMessages((m) => {
        const copy = [...m];
        const last = copy[i];
        if (last?.role === "assistant") {
          copy[i] = { ...last, content: last.content + char };
        }
        return copy;
      });
    }, 18);
  }, [stopTyping]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MQ_MOBILE);
    const syncMobile = () => setIsMobile(mq.matches);
    syncMobile();
    mq.addEventListener("change", syncMobile);
    return () => mq.removeEventListener("change", syncMobile);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setVvRect({ top: 0, height: 0 });
      return;
    }
    if (typeof window === "undefined" || !window.matchMedia(MQ_MOBILE).matches) {
      return;
    }
    const vv = window.visualViewport;
    const sync = () => {
      if (vv) {
        setVvRect({ top: vv.offsetTop, height: vv.height });
      } else {
        setVvRect({ top: 0, height: window.innerHeight });
      }
    };
    sync();
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useLayoutEffect(() => {
    if (!open || typeof window === "undefined" || !window.matchMedia(MQ_MOBILE).matches) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || busy) return;
    stopTyping();
    pendingRef.current = "";
    setInput("");
    setError(null);
    setMessages((m) => {
      const next = [
        ...m,
        { role: "user" as const, content: q },
        { role: "assistant" as const, content: "" },
      ];
      assistantIdxRef.current = next.length - 1;
      return next;
    });
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        let msg = t || `HTTP ${res.status}`;
        try {
          const j = JSON.parse(t) as { detail?: string | string[]; error?: string };
          if (typeof j.detail === "string") msg = j.detail;
          else if (Array.isArray(j.detail)) msg = j.detail.map(String).join(", ");
          else if (j.error) msg = j.error;
        } catch {
          /* use plain text */
        }
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      const applyDelta = (text: string) => {
        pendingRef.current += text;
        startTyping();
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const { events, rest } = parseSseLines(buf);
        buf = rest;
        for (const ev of events) {
          if (ev.event === "delta") {
            try {
              const j = JSON.parse(ev.data) as { text?: string };
              if (j.text) applyDelta(j.text);
            } catch {
              /* ignore */
            }
          }
          if (ev.event === "sources") {
            try {
              const j = JSON.parse(ev.data) as { sources?: Source[] };
              if (j.sources?.length) {
                const i = assistantIdxRef.current;
                setMessages((m) => {
                  const copy = [...m];
                  const last = copy[i];
                  if (last?.role === "assistant") {
                    copy[i] = { ...last, sources: j.sources };
                  }
                  return copy;
                });
              }
            } catch {
              /* ignore */
            }
          }
          if (ev.event === "error") {
            try {
              const j = JSON.parse(ev.data) as { message?: string };
              setError(j.message ?? ev.data);
            } catch {
              setError(ev.data);
            }
          }
        }
      }
    } catch (e) {
      flushPending();
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(msg);
      const i = assistantIdxRef.current;
      const errorFallback = t[langRef.current].chat.error;
      setMessages((m) => {
        const copy = [...m];
        const last = copy[i];
        if (last?.role === "assistant" && !last.content) {
          copy[i] = {
            ...last,
            content: errorFallback,
          };
        }
        return copy;
      });
    } finally {
      flushPending();
      setBusy(false);
    }
  }, [busy, input, stopTyping, startTyping, flushPending]);

  const mobileVvStyle: CSSProperties | undefined = !isMobile
    ? undefined
    : open && vvRect.height > 0
      ? {
          top: vvRect.top,
          height: vvRect.height,
          maxHeight: vvRect.height,
        }
      : open
        ? {
            top: 0,
            height: "100dvh",
            maxHeight: "100dvh",
          }
        : undefined;

  const cornerFabStyle: CSSProperties = {
    right: "max(1rem, env(safe-area-inset-right, 0px))",
    bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
  };

  return (
    <div
      className="fixed z-50 flex max-w-[calc(100%-1.5rem)] flex-col items-end gap-2 print:hidden"
      style={cornerFabStyle}
    >
      {open ? (
        <div
          role="dialog"
          aria-label={T.chat.ariaLabel}
          className="flex min-h-0 w-full max-w-[min(24rem,calc(100%-2rem))] flex-col overflow-hidden border border-white/15 bg-[#111820] shadow-2xl shadow-black/50 max-md:fixed max-md:left-0 max-md:right-0 max-md:top-0 max-md:z-[220] max-md:w-full max-md:max-w-none max-md:rounded-none max-md:border-x-0 max-md:border-b-0 max-md:border-t md:h-[min(32rem,calc(100dvh-5.5rem-1.5rem))] md:max-h-[min(32rem,calc(100dvh-5.5rem-1.5rem))] md:rounded-2xl"
          style={mobileVvStyle}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">{T.chat.title}</p>
              <p className="text-xs text-zinc-500">
                RAG · {clientEnv.NEXT_PUBLIC_DISPLAY_NAME}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              aria-label={T.chat.closeChat}
            >
              ×
            </button>
          </div>
          <div className="chat-dock-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 pr-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-zinc-500">
                {T.chat.empty}
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-2xl bg-cyan-500/15 px-3 py-2 text-cyan-100"
                    : "mr-4 rounded-2xl bg-white/5 px-3 py-2 text-zinc-200"
                }
              >
                <p className="whitespace-pre-wrap break-words">
                  {m.role === "assistant"
                    ? linkifyPlainText(m.content)
                    : m.content}
                </p>
                {m.role === "assistant" && m.sources?.length ? (
                  <details className="mt-2 border-t border-white/10 pt-2 text-xs text-zinc-500 open:[&_summary]:mb-1">
                    <summary className="cursor-pointer select-none text-zinc-400 hover:text-zinc-300">
                      {T.chat.sources} ({m.sources.length})
                    </summary>
                    <ul className="mt-1 space-y-1.5 pl-1">
                      {m.sources.map((s, si) => (
                        <li key={si}>
                          {s.file ? (
                            <span className="font-mono text-[11px] text-zinc-400">
                              {s.file}
                            </span>
                          ) : null}
                          {s.text ? (
                            <span className="line-clamp-2 block text-[11px] leading-snug text-zinc-500">
                              {s.text}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          {error ? (
            <p className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
          <form
            className="flex shrink-0 gap-2 border-t border-white/10 bg-[#111820] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              {T.chat.inputLabel}
            </label>
            <input
              id="chat-input"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-base text-white placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 md:text-sm"
              placeholder={T.chat.placeholder}
              enterKeyHint="send"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
              disabled={busy || !input.trim()}
            >
              {T.chat.send}
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 text-sm font-medium text-zinc-950 shadow-lg shadow-cyan-500/20 ${open ? "hidden" : ""}`}
      >
        {open ? T.chat.close : T.chat.fab}
      </button>
    </div>
  );
}
