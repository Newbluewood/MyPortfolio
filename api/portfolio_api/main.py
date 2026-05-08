from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env before importing anything from portfolio_api (uvicorn import order).
_pkg = Path(__file__).resolve().parent
_api = _pkg.parent
_repo = _api.parent
for _path, _override in (
    (_api / ".env", False),
    (_repo / ".env", True),
):
    if _path.is_file():
        load_dotenv(_path, override=_override, encoding="utf-8-sig")
_gk = (os.environ.get("GOOGLE_API_KEY") or "").strip()
_mk = (os.environ.get("GEMINI_API_KEY") or "").strip()
if _mk and not _gk:
    os.environ["GOOGLE_API_KEY"] = _mk

import json
import re
from typing import Any, AsyncIterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from portfolio_api.rag import get_index, get_rag_stack, invalidate_rag_cache
from portfolio_api.rate_limit import SimpleRateLimiter
from portfolio_api.settings import get_settings

_settings = get_settings()
_origins = [o.strip() for o in _settings.cors_origins.split(",") if o.strip()]

app = FastAPI(title="Portfolio RAG API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = SimpleRateLimiter(max_requests=24, window_seconds=60)


class ChatBody(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _sse(event: str, payload: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


_SKIP_UI_SOURCES_RE = re.compile(
    r"(?is)"
    r"\b(zdravo|ćao|cao|hello|hej|hey|hola|ahoj)\b|"
    r"\bhi\b|"
    r"ko\s+si|ko\s+ste|"
    r"who\s+are\s+you|"
    r"predstavi|ukratko|"
    r"šta\s+si|sta\s+si|"
    r"good\s+morning|dobar\s+dan"
)


def _skip_ui_sources(message: str) -> bool:
    t = message.strip()
    if len(t) > 140:
        return False
    return bool(_SKIP_UI_SOURCES_RE.search(t))


_SNIPPET_LEN = 90


def _collapse_snippet(text: str, max_len: int = _SNIPPET_LEN) -> str:
    one = " ".join((text or "").split())
    if len(one) <= max_len:
        return one
    return one[: max_len - 1] + "…"


@app.get("/")
def root() -> dict[str, str]:
    """API has no HTML UI; use /docs or the Next.js app for the site."""
    return {
        "service": "portfolio-api",
        "health": "/health",
        "health_ready": "/health/ready",
        "docs": "/docs",
        "chat": "POST /chat",
    }


@app.get("/health", response_model=None)
def health() -> dict[str, str]:
    """Liveness for PaaS (e.g. Railway). Always 200 when the process is up."""
    return {"status": "ok", "service": "portfolio-api"}


@app.get("/health/ready", response_model=None)
def health_ready() -> dict[str, str] | JSONResponse:
    """Readiness: API key + non-empty Chroma index (fails until portfolio-ingest finishes)."""
    s = get_settings()
    key = (
        (s.google_api_key or "").strip()
        or os.getenv("GOOGLE_API_KEY", "").strip()
        or os.getenv("GEMINI_API_KEY", "").strip()
    )
    if not key:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "detail": "missing GOOGLE_API_KEY (set in repo root .env, restart uvicorn)",
            },
        )
    try:
        index = get_index()
        _ = index
        return {"status": "ok", "ready": True}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "ready": False,
                "detail": str(e)[:500],
            },
        )


def _is_localhost(request: Request) -> bool:
    c = request.client
    if not c:
        return False
    return c.host in ("127.0.0.1", "::1", "localhost")


@app.post("/admin/invalidate-rag", response_model=None)
def admin_invalidate_rag(request: Request) -> dict[str, str]:
    """Drop cached VectorStoreIndex (e.g. after `portfolio-ingest`). Localhost only."""
    if not _is_localhost(request):
        raise HTTPException(status_code=403, detail="local only")
    invalidate_rag_cache()
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: Request, body: ChatBody) -> StreamingResponse:
    if not limiter.allow(_client_key(request)):
        raise HTTPException(status_code=429, detail="Too many requests")

    try:
        index, chat_engine = get_rag_stack()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    retriever = index.as_retriever(similarity_top_k=4)
    source_payload: list[dict[str, str]] = []
    if not _skip_ui_sources(body.message):
        try:
            nodes = await retriever.aretrieve(body.message)
            for n in nodes[:4]:
                raw = n.get_content() or ""
                text = _collapse_snippet(raw)
                meta = n.node.metadata or {}
                file_name = str(meta.get("file_name") or meta.get("file_path") or "")[:120]
                if text or file_name:
                    source_payload.append(
                        {
                            "text": text,
                            "file": file_name,
                        }
                    )
        except Exception:
            pass

    async def event_stream() -> AsyncIterator[str]:
        if source_payload:
            yield _sse("sources", {"sources": source_payload})
        sent_delta = False
        try:
            stream = await chat_engine.astream_chat(body.message)
            achat = stream.achat_stream
            if achat is None:
                raise RuntimeError("Chat engine did not return an async stream")
            async for chunk in achat:
                d = chunk.delta or ""
                if d:
                    sent_delta = True
                    yield _sse("delta", {"text": d})
        except Exception as exc:  # noqa: BLE001
            yield _sse("error", {"message": str(exc)})
            sent_delta = True
        if not sent_delta:
            yield _sse(
                "error",
                {
                    "message": (
                        "Assistant returned no text. Common causes: Gemini API quota or "
                        "rate limit (429 — wait or check https://ai.google.dev/gemini-api/docs/rate-limits), "
                        "or an invalid API key."
                    ),
                },
            )
        yield _sse("done", {})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
