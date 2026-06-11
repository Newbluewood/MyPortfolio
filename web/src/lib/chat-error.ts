import { t, type Lang } from "@/lib/i18n/translations";

/** Turn raw API / network errors into short, localized UI copy. */
export function formatChatError(raw: string, lang: Lang): string {
  const low = raw.toLowerCase();
  const c = t[lang].chat;

  if (
    low.includes("503") ||
    low.includes("unavailable") ||
    low.includes("high demand") ||
    low.includes("overloaded") ||
    low.includes("busy right now")
  ) {
    return c.errorBusy;
  }

  if (
    low.includes("429") ||
    low.includes("rate limit") ||
    low.includes("rate_limit") ||
    low.includes("quota") ||
    low.includes("too many requests")
  ) {
    return c.errorRateLimit;
  }

  if (
    low.includes("misconfigured") ||
    low.includes("portfolio_api_url") ||
    (low.includes("localhost") && low.includes("vercel"))
  ) {
    return c.errorApiMisconfigured;
  }

  if (
    low.includes("could not reach") ||
    low.includes("502") ||
    low.includes("fetch failed") ||
    low.includes("failed to fetch") ||
    low.includes("network")
  ) {
    return c.errorApiUnreachable;
  }

  // Already a short human message from the API (no JSON dump).
  if (!raw.includes("{") && !raw.includes("error\":") && raw.length <= 160) {
    return raw;
  }

  return c.errorGeneric;
}
