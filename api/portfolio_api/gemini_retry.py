from __future__ import annotations


def is_gemini_retryable(exc: BaseException) -> bool:
    """True when switching to a fallback Gemini model may succeed."""
    raw = str(exc).lower()
    markers = (
        "503",
        "429",
        "unavailable",
        "high demand",
        "rate limit",
        "rate_limit",
        "resource_exhausted",
        "resource exhausted",
        "overloaded",
        "quota",
        "too many requests",
    )
    return any(m in raw for m in markers)


def friendly_gemini_error(exc: BaseException) -> str:
    """Short user-facing message instead of raw API JSON."""
    raw = str(exc).lower()
    if any(m in raw for m in ("503", "unavailable", "high demand", "overloaded")):
        return (
            "The AI model is busy right now. Please wait a moment and try again."
        )
    if any(m in raw for m in ("429", "rate limit", "rate_limit", "quota", "too many")):
        return (
            "Request limit reached. Please wait a minute and try again."
        )
    return "Something went wrong while generating a reply. Please try again."
