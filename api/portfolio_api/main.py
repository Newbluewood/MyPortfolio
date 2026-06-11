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

import asyncio
import hashlib
import hmac
import json
import re
import subprocess
import sys
from typing import Any, AsyncIterator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from llama_index.core.chat_engine.types import BaseChatEngine
from llama_index.core.llms import ChatMessage, MessageRole

from portfolio_api.gemini_retry import friendly_gemini_error, is_gemini_retryable
from portfolio_api.rag import build_chat_engine, get_index, get_rag_stack, invalidate_rag_cache
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


class HistoryMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatBody(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[HistoryMessage] = Field(default_factory=list, max_length=40)


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


async def _stream_chat_deltas(
    chat_engine: BaseChatEngine,
    message: str,
    chat_history: list[ChatMessage],
) -> AsyncIterator[str]:
    stream = await chat_engine.astream_chat(message, chat_history=chat_history)
    achat = stream.achat_stream
    if achat is None:
        raise RuntimeError("Chat engine did not return an async stream")
    async for chunk in achat:
        d = chunk.delta or ""
        if d:
            yield d


def _chat_models_to_try() -> list[str]:
    s = get_settings()
    models: list[str] = [s.gemini_model]
    fallback = (s.gemini_model_fallback or "").strip()
    if fallback and fallback not in models:
        models.append(fallback)
    return models


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
        "ingest": "POST /admin/ingest (Bearer INGEST_SECRET)",
        "webhook": "POST /webhook/github (GitHub HMAC webhook)",
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


async def _run_ingest() -> tuple[int, str]:
    """Run portfolio-ingest subprocess and return (returncode, output)."""
    proc = await asyncio.create_subprocess_exec(
        sys.executable, "-m", "portfolio_api.ingest",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=300)
    output = stdout.decode(errors="replace") if stdout else ""
    return proc.returncode or 0, output


@app.post("/admin/ingest", response_model=None)
async def admin_ingest(request: Request) -> JSONResponse:
    """Run portfolio-ingest then reload the RAG index.

    Auth (checked in order):
    - If INGEST_SECRET is set: require header ``Authorization: Bearer <secret>``.
    - Otherwise: localhost only.
    """
    s = get_settings()
    secret = (s.ingest_secret or "").strip()

    if secret:
        auth = request.headers.get("authorization", "")
        provided = auth.removeprefix("Bearer ").strip()
        if not provided or provided != secret:
            raise HTTPException(status_code=401, detail="invalid or missing Bearer token")
    elif not _is_localhost(request):
        raise HTTPException(status_code=403, detail="set INGEST_SECRET to allow remote ingest")

    try:
        returncode, output = await _run_ingest()
        if returncode != 0:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "returncode": returncode, "output": output[-2000:]},
            )
    except asyncio.TimeoutError:
        return JSONResponse(status_code=504, content={"status": "timeout", "detail": "ingest exceeded 300s"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})

    invalidate_rag_cache()
    return JSONResponse(content={"status": "ok", "detail": "ingest complete, RAG cache cleared"})


@app.post("/webhook/github", response_model=None)
async def webhook_github(request: Request) -> JSONResponse:
    """GitHub webhook — triggers portfolio-ingest on push events.

    Setup: GitHub repo → Settings → Webhooks → Add webhook:
      Payload URL : https://<your-railway-url>/webhook/github
      Content type: application/json
      Secret      : value of GITHUB_WEBHOOK_SECRET env var
      Events      : Just the push event
    """
    s = get_settings()
    webhook_secret = (s.github_webhook_secret or "").strip()
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="GITHUB_WEBHOOK_SECRET not configured")

    # Verify HMAC-SHA256 signature sent by GitHub.
    sig_header = request.headers.get("x-hub-signature-256", "")
    if not sig_header.startswith("sha256="):
        raise HTTPException(status_code=400, detail="missing x-hub-signature-256")
    body = await request.body()
    expected = "sha256=" + hmac.new(
        webhook_secret.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(sig_header, expected):
        raise HTTPException(status_code=401, detail="invalid webhook signature")

    # Only act on push events.
    event = request.headers.get("x-github-event", "")
    if event == "ping":
        return JSONResponse(content={"status": "ok", "detail": "pong"})
    if event != "push":
        return JSONResponse(content={"status": "ignored", "detail": f"event '{event}' skipped"})

    # Respond immediately — GitHub expects < 10s. Ingest runs in background.
    async def _bg() -> None:
        try:
            returncode, output = await _run_ingest()
            if returncode == 0:
                invalidate_rag_cache()
                print("[webhook] ingest complete, RAG cache cleared")
            else:
                print(f"[webhook] ingest failed (rc={returncode}):\n{output[-1000:]}")
        except Exception as exc:
            print(f"[webhook] ingest error: {exc}")

    asyncio.create_task(_bg())
    return JSONResponse(status_code=202, content={"status": "accepted", "detail": "ingest queued"})


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

    s = get_settings()
    models_to_try = _chat_models_to_try()

    async def event_stream() -> AsyncIterator[str]:
        if source_payload:
            yield _sse("sources", {"sources": source_payload})

        chat_history: list[ChatMessage] = []
        for m in body.history:
            role = MessageRole.USER if m.role == "user" else MessageRole.ASSISTANT
            chat_history.append(ChatMessage(role=role, content=m.content))

        sent_delta = False
        last_exc: BaseException | None = None

        for attempt, model in enumerate(models_to_try):
            engine = (
                chat_engine
                if attempt == 0
                else build_chat_engine(index, s, chat_model=model)
            )
            try:
                async for delta in _stream_chat_deltas(engine, body.message, chat_history):
                    sent_delta = True
                    yield _sse("delta", {"text": delta})
                last_exc = None
                break
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                has_fallback = attempt < len(models_to_try) - 1
                if has_fallback and is_gemini_retryable(exc):
                    print(
                        f"[chat] {model} failed ({str(exc)[:200]}), "
                        f"retrying with {models_to_try[attempt + 1]}",
                        flush=True,
                    )
                    continue
                yield _sse("error", {"message": friendly_gemini_error(exc)})
                sent_delta = True
                break

        if not sent_delta:
            msg = (
                friendly_gemini_error(last_exc)
                if last_exc is not None
                else (
                    "Assistant returned no text. Common causes: Gemini API quota or "
                    "rate limit (429 — wait or check https://ai.google.dev/gemini-api/docs/rate-limits), "
                    "or an invalid API key."
                )
            )
            yield _sse("error", {"message": msg})
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
