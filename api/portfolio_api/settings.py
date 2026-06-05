from functools import lru_cache
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env regardless of cwd when starting uvicorn (api/ vs repo root).
_pkg_dir = Path(__file__).resolve().parent
_api_dir = _pkg_dir.parent
_repo_root = _api_dir.parent

# Load into os.environ first (reliable with pydantic-settings). Root .env wins over api/.env.
if (_api_dir / ".env").is_file():
    load_dotenv(_api_dir / ".env", override=False, encoding="utf-8-sig")
if (_repo_root / ".env").is_file():
    load_dotenv(_repo_root / ".env", override=True, encoding="utf-8-sig")

_g = (os.environ.get("GOOGLE_API_KEY") or "").strip()
_m = (os.environ.get("GEMINI_API_KEY") or "").strip()
if _m and not _g:
    os.environ["GOOGLE_API_KEY"] = _m

_env_candidates = (_api_dir / ".env", _repo_root / ".env")
_env_files = tuple(str(p) for p in _env_candidates if p.is_file())

_config_kwargs: dict = {
    "env_file_encoding": "utf-8",
    "extra": "ignore",
}
if _env_files:
    _config_kwargs["env_file"] = _env_files


class Settings(BaseSettings):
    model_config = SettingsConfigDict(**_config_kwargs)

    # pydantic-settings reads GOOGLE_API_KEY from the environment for this field name.
    google_api_key: str = Field(default="")

    @field_validator("google_api_key", mode="before")
    @classmethod
    def strip_google_key(cls, v: object) -> str:
        if v is None:
            return ""
        s = str(v).strip()
        if len(s) >= 2 and s[0] == s[-1] and s[0] in "'\"":
            s = s[1:-1]
        return s

    # Chat / completion (generateContent). Free tier: 2.0-flash quotas often fill first;
    # 2.5-flash-lite is geared for lower cost / separate limits. Override with GEMINI_MODEL.
    gemini_model: str = "models/gemini-2.5-flash-lite"
    # embedContent (Gemini API): use stable text embedding IDs from
    # https://ai.google.dev/gemini-api/docs/embeddings — e.g. gemini-embedding-001
    # (text + task_type) or newer gemini-embedding-2 (multimodal; different batch semantics).
    # Do not use legacy names like text-embedding-004 with the current google-genai client.
    gemini_embed_model: str = "gemini-embedding-001"

    chroma_path: str = Field(
        default="../data/chroma",
        validation_alias=AliasChoices("CHROMA_PATH", "chroma_path"),
    )
    chroma_collection: str = Field(
        default="portfolio_kb",
        validation_alias=AliasChoices("CHROMA_COLLECTION", "chroma_collection"),
    )

    tavily_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("TAVILY_API_KEY", "tavily_api_key"),
    )

    github_username: str = Field(default="octocat", validation_alias="GITHUB_USERNAME")
    github_token: str | None = Field(default=None, validation_alias="GITHUB_TOKEN")
    github_repos_include_forks: bool = Field(
        default=False,
        validation_alias=AliasChoices("GITHUB_REPOS_INCLUDE_FORKS", "github_repos_include_forks"),
    )
    github_repos_include_archived: bool = Field(
        default=False,
        validation_alias=AliasChoices(
            "GITHUB_REPOS_INCLUDE_ARCHIVED",
            "github_repos_include_archived",
        ),
    )
    # README fetch + ingest: max repos after fork/archived filters (most recently updated first).
    github_ingest_max_repos: int = Field(
        default=50,
        ge=1,
        le=100,
        validation_alias=AliasChoices("GITHUB_INGEST_MAX_REPOS", "github_ingest_max_repos"),
    )

    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias=AliasChoices("CORS_ORIGINS", "cors_origins"),
    )

    # Optional secret for POST /admin/ingest (set INGEST_SECRET in env to enable remote ingest).
    # If empty, the endpoint is localhost-only.
    ingest_secret: str = Field(
        default="",
        validation_alias=AliasChoices("INGEST_SECRET", "ingest_secret"),
    )

    @field_validator("github_repos_include_forks", "github_repos_include_archived", mode="before")
    @classmethod
    def _github_env_bool(cls, v: object) -> bool:
        if v is True or v is False:
            return bool(v)
        if v is None:
            return False
        s = str(v).strip().lower()
        return s in ("1", "true", "yes", "on")


@lru_cache
def get_settings() -> Settings:
    base = Settings()
    merged = (
        (base.google_api_key or "").strip()
        or os.getenv("GOOGLE_API_KEY", "").strip()
        or os.getenv("GEMINI_API_KEY", "").strip()
    )
    if merged and merged != base.google_api_key:
        return base.model_copy(update={"google_api_key": merged})
    return base
