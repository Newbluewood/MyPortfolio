/** Tab-scoped chat history. Cleared when the tab closes. */
export const CHAT_SESSION_KEY = "nbw-chat-session";

const MAX_STORED = 24;

export type ChatSessionMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ text?: string; file?: string }>;
};

function isRole(v: unknown): v is ChatSessionMessage["role"] {
  return v === "user" || v === "assistant";
}

export function loadChatSession(): ChatSessionMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: ChatSessionMessage[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      if (!isRole(rec.role) || typeof rec.content !== "string") continue;
      const content = rec.content.trim();
      if (!content) continue;
      const sources = Array.isArray(rec.sources)
        ? rec.sources.filter(
            (s): s is { text?: string; file?: string } =>
              !!s && typeof s === "object",
          )
        : undefined;
      out.push({
        role: rec.role,
        content: rec.content,
        ...(sources?.length ? { sources } : {}),
      });
    }
    return out.slice(-MAX_STORED);
  } catch {
    return [];
  }
}

export function saveChatSession(messages: ChatSessionMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const compact = messages
      .filter((m) => m.content.trim())
      .slice(-MAX_STORED)
      .map(({ role, content, sources }) => ({
        role,
        content,
        ...(sources?.length ? { sources } : {}),
      }));
    sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(compact));
  } catch {
    /* quota / private mode */
  }
}

/** Last N completed messages for the RAG API (pairs of user/assistant). */
export function chatHistoryForApi(
  messages: ChatSessionMessage[],
  maxMessages = 8,
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((m) => m.content.trim())
    .map(({ role, content }) => ({ role, content }))
    .slice(-maxMessages);
}
