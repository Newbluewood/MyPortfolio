"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { clientEnv } from "@/lib/env/client";

type Source = { text?: string; file?: string };

const URL_IN_TEXT =
  /\bhttps?:\/\/[^\s<>"{}|\\^\[\]`]+/gi;

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
  const endRef = useRef<HTMLDivElement>(null);
  const assistantIdxRef = useRef(-1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || busy) return;
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
        const i = assistantIdxRef.current;
        setMessages((m) => {
          const copy = [...m];
          const last = copy[i];
          if (last?.role === "assistant") {
            copy[i] = { ...last, content: last.content + text };
          }
          return copy;
        });
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
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(msg);
      const i = assistantIdxRef.current;
      setMessages((m) => {
        const copy = [...m];
        const last = copy[i];
        if (last?.role === "assistant" && !last.content) {
          copy[i] = {
            ...last,
            content: "Sorry — something went wrong. Is the API running?",
          };
        }
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }, [busy, input]);

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-2"
      style={{
        right: "max(1rem, env(safe-area-inset-right, 0px))",
        bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      {open ? (
        <div
          className="flex h-[min(32rem,calc(100vh-6rem))] w-[min(100vw-2rem,24rem)] flex-col rounded-2xl border border-white/15 bg-[#111820] shadow-2xl shadow-black/50"
          role="dialog"
          aria-label="Site assistant"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Assistant</p>
              <p className="text-xs text-zinc-500">RAG · {clientEnv.NEXT_PUBLIC_DISPLAY_NAME}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="chat-dock-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 pr-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-zinc-500">
                Ask about skills, projects, or background. Answers use retrieved
                sources when available.
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
                      Sources ({m.sources.length})
                    </summary>
                    <ul className="mt-1 space-y-1.5 pl-1">
                      {m.sources.map((s, si) => (
                        <li key={si}>
                          {s.file ? (
                            <span className="font-mono text-[11px] text-zinc-400">{s.file}</span>
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
            <p className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <input
              id="chat-input"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
              disabled={busy || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 text-sm font-medium text-zinc-950 shadow-lg shadow-cyan-500/20"
      >
        {open ? "Close" : "Ask assistant"}
      </button>
    </div>
  );
}
