from __future__ import annotations

import os
from pathlib import Path

import chromadb
from chromadb.errors import NotFoundError
from llama_index.core import Settings, StorageContext, VectorStoreIndex
from llama_index.core.chat_engine.types import BaseChatEngine, ChatMode
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.vector_stores.chroma import ChromaVectorStore

from portfolio_api.settings import Settings as AppSettings, get_settings

_api_dir = Path(__file__).resolve().parent.parent


def _google_key(s: AppSettings) -> str:
    return (
        (s.google_api_key or "").strip()
        or os.getenv("GOOGLE_API_KEY", "").strip()
        or os.getenv("GEMINI_API_KEY", "").strip()
    )


def resolve_chroma_path(s: AppSettings) -> str:
    p = Path(s.chroma_path)
    if not p.is_absolute():
        p = (_api_dir / p).resolve()
    p.mkdir(parents=True, exist_ok=True)
    return str(p)


def build_llm_embed(s: AppSettings) -> tuple[GoogleGenAI, GoogleGenAIEmbedding]:
    key = _google_key(s) or None
    llm = GoogleGenAI(model=s.gemini_model, api_key=key)
    embed = GoogleGenAIEmbedding(model_name=s.gemini_embed_model, api_key=key)
    Settings.llm = llm
    Settings.embed_model = embed
    return llm, embed


def load_index(s: AppSettings) -> VectorStoreIndex:
    if not _google_key(s):
        raise RuntimeError("GOOGLE_API_KEY (or GEMINI_API_KEY) is not set.")

    llm, embed = build_llm_embed(s)
    store_path = resolve_chroma_path(s)
    client = chromadb.PersistentClient(path=store_path)
    try:
        col = client.get_collection(s.chroma_collection)
    except NotFoundError as e:
        raise RuntimeError(
            "Vector index not found. Run: portfolio-ingest (from the api folder)."
        ) from e

    if col.count() == 0:
        raise RuntimeError(
            "Vector collection is empty. Run: portfolio-ingest (from the api folder)."
        )

    vector_store = ChromaVectorStore(chroma_collection=col)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    return VectorStoreIndex.from_vector_store(
        vector_store,
        embed_model=embed,
        storage_context=storage_context,
    )


def build_chat_engine(index: VectorStoreIndex, s: AppSettings) -> BaseChatEngine:
    """Retrieve + condense + one synthesis pass — streams only the final answer (no ReAct/tool dumps)."""
    llm, _ = build_llm_embed(s)
    system_prompt = (
        "You are Nebojša Simović — a developer and the owner of this portfolio site. "
        "Always speak in the first person ('I', 'my', 'I worked on…'). "
        "Never refer to yourself as 'the assistant', 'an AI', 'a chatbot', or 'the developer' in third person. "
        "You have access to context about your own projects, education, diplomas, certificates, and site — use it. "
        "Be direct and precise: answer only what was asked, in as few sentences as possible. "
        "No filler, no preamble, no repeating the question back. "
        "Do not paste raw document text, README blocks, or file names; summarize in normal sentences. "
        "When context includes deployed apps, demo links, or live URLs, include the full https:// URL. "
        "For greetings, one line only — no self-introduction. "
        "If asked what you are or how this works, one short sentence, then move on."
    )
    return index.as_chat_engine(
        chat_mode=ChatMode.CONDENSE_PLUS_CONTEXT,
        llm=llm,
        similarity_top_k=6,
        system_prompt=system_prompt,
    )


_index: VectorStoreIndex | None = None


def invalidate_rag_cache() -> None:
    """Drop the in-memory index (e.g. after re-ingest). Next request reloads from Chroma."""
    global _index
    _index = None


def get_index() -> VectorStoreIndex:
    global _index
    s = get_settings()
    if _index is None:
        _index = load_index(s)
    return _index


def get_rag_stack() -> tuple[VectorStoreIndex, BaseChatEngine]:
    """One shared index; fresh chat engine per call so chat memory is not leaked across users."""
    s = get_settings()
    index = get_index()
    return index, build_chat_engine(index, s)
