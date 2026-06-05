from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import chromadb
import httpx
from chromadb.errors import NotFoundError
from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex
from llama_index.vector_stores.chroma import ChromaVectorStore

from portfolio_api.rag import build_llm_embed, resolve_chroma_path
from portfolio_api.settings import Settings, get_settings


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent


_URL_RE = re.compile(r"https?://[^\s\)\]<>\"']+")


def _extract_urls(text: str, limit: int = 16) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for m in _URL_RE.finditer(text or ""):
        u = m.group(0).rstrip(".,;):\"'")
        if u not in seen:
            seen.add(u)
            out.append(u)
        if len(out) >= limit:
            break
    return out


def _normalize_homepage(url: str | None) -> str:
    if not url or not str(url).strip():
        return ""
    t = str(url).strip()
    if t.startswith("http://") or t.startswith("https://"):
        return t
    return f"https://{t}"


def _fmt_date(iso: str | None) -> str:
    """Return a readable date string from ISO 8601 (e.g. '2023-04-15') or empty string."""
    if not iso:
        return "n/a"
    # GitHub returns e.g. "2023-04-15T10:22:33Z" — keep only the date part.
    return iso[:10]


def _build_repo_markdown(repo: dict, readme_body: str | None) -> str:
    name = repo["name"]
    html_url = repo.get("html_url") or ""
    desc = (repo.get("description") or "").strip()
    homepage = _normalize_homepage(repo.get("homepage"))
    topics = repo.get("topics") if isinstance(repo.get("topics"), list) else []
    language = (repo.get("language") or "").strip()
    created_at = _fmt_date(repo.get("created_at"))
    pushed_at = _fmt_date(repo.get("pushed_at"))
    updated_at = _fmt_date(repo.get("updated_at"))

    topic_line = ", ".join(str(t) for t in topics) if topics else "(nema topics na GitHubu)"

    parts = [
        f"# {name}",
        "",
        f"**GitHub repo:** {html_url}",
        f"**GitHub opis (kratko polje):** {desc if desc else '(prazno — dodaj u About na GitHubu ili u content/github-repos-notes.md)'}",
        f"**Prevashodni jezik (GitHub):** {language or 'n/a'}",
        f"**Topics:** {topic_line}",
        f"**Datum kreiranja:** {created_at}",
        f"**Poslednji push:** {pushed_at}",
        f"**Poslednje ažuriranje:** {updated_at}",
    ]
    if homepage:
        parts.append(f"**Live sajt / deploy URL (GitHub homepage):** {homepage}")
    else:
        parts.append(
            "**Live sajt / deploy URL:** (nije podešeno — na GitHubu: repo → About → Website; "
            "često Netlify / Vercel URL ili stavi link u README ili u content/github-repos-notes.md)"
        )

    readme_clean = (readme_body or "").strip()
    if readme_clean:
        parts.extend(["", "## README", "", readme_clean])
        urls = _extract_urls(readme_clean)
        extra = [u for u in urls if homepage and u != homepage] or urls
        if extra:
            parts.extend(["", "## Linkovi iz README-a (demo, dokumentacija, …)", ""])
            parts.extend(f"- {u}" for u in extra)
    else:
        parts.extend(
            [
                "",
                "## README",
                "",
                "_Repozitorijum nema README ili je prazan._ RAG će ipak znati gornje GitHub "
                "podatke; za više detalja dodaj README na GitHub ili blok u `content/github-repos-notes.md` "
                f"pod `## {name}` (pa `portfolio-ingest`).",
            ]
        )

    return "\n".join(parts) + "\n"


def _fetch_github_readmes(raw_dir: Path, s: Settings) -> None:
    raw_dir.mkdir(parents=True, exist_ok=True)
    for p in raw_dir.glob("*.md"):
        try:
            p.unlink()
        except OSError:
            pass

    username = (s.github_username or "").strip()
    token = s.github_token.strip() if s.github_token else None
    include_forks = s.github_repos_include_forks
    include_archived = s.github_repos_include_archived
    max_repos = s.github_ingest_max_repos

    def _list_repos_headers(send_token: bool) -> dict[str, str]:
        h: dict[str, str] = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if send_token and token:
            h["Authorization"] = f"Bearer {token}"
        return h

    repos: list[dict] = []
    page = 1
    use_authed_list = bool(token)
    u_lower = username.lower()

    with httpx.Client(timeout=30) as client:
        while True:
            api_url = (
                "https://api.github.com/user/repos"
                if use_authed_list
                else f"https://api.github.com/users/{username}/repos"
            )
            params = {
                "type": "owner",
                "sort": "updated",
                "per_page": 100,
                "page": page,
            }
            r = client.get(
                api_url,
                params=params,
                headers=_list_repos_headers(use_authed_list),
            )
            if r.status_code == 401 and use_authed_list:
                print(
                    "GitHub returned 401 with GITHUB_TOKEN — listing public repos only "
                    "(fix token or remove it).",
                    file=sys.stderr,
                )
                use_authed_list = False
                page = 1
                repos.clear()
                continue
            r.raise_for_status()
            batch = r.json()
            if not isinstance(batch, list):
                break
            if use_authed_list:
                for item in batch:
                    owner = item.get("owner") or {}
                    login = str(owner.get("login", "")).lower()
                    if login == u_lower:
                        repos.append(item)
            else:
                repos.extend(batch)
            if len(batch) < 100:
                break
            page += 1

    safe: list[dict] = []
    for x in repos:
        if not include_archived and x.get("archived"):
            continue
        if not include_forks and x.get("fork"):
            continue
        safe.append(x)
    safe = safe[:max_repos]

    with httpx.Client(timeout=30) as client:
        for repo in safe:
            name = repo["name"]
            full = repo["full_name"]
            branch = repo.get("default_branch") or "main"
            url = f"https://raw.githubusercontent.com/{full}/{branch}/README.md"
            readme_body: str | None = None
            try:
                rr = client.get(url)
                if rr.status_code == 200 and rr.text.strip():
                    readme_body = rr.text
            except OSError:
                pass

            doc = _build_repo_markdown(repo, readme_body)
            path = raw_dir / f"{name}__README.md"
            try:
                path.write_text(doc, encoding="utf-8")
            except OSError:
                continue


def _write_cv_credentials_doc(content_dir: Path, raw_dir: Path) -> None:
    """Mirror content/cv.json credentials into Markdown for RAG (JSON is not ingested)."""
    cv_path = content_dir / "cv.json"
    if not cv_path.is_file():
        return
    try:
        data = json.loads(cv_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"cv.json credentials export skipped: {e}", file=sys.stderr)
        return

    creds = data.get("credentials")
    if not isinstance(creds, list) or not creds:
        return

    name = (data.get("name") or "Nebojša Simović").strip()
    lines = [
        "# Diplomas and certificates (portfolio)",
        "",
        f"**{name}** — scanned diplomas, certificates, and letters on the portfolio "
        "site at the bottom of the [home page](/) (**Diplomas & certificates**). "
        "[/cv](/cv) is text-only for printing. Files live under `/credentials/`.",
        "",
        "The assistant should answer questions about diplome, sertifikati, degrees, "
        "ITAcademy, UKISAI bootcamp, ENON practice, ZenHire hackathon, Atrijum, and "
        "Faculty of Forestry (Šumarski fakultet) using the entries below.",
        "",
    ]
    for item in creds:
        if not isinstance(item, dict):
            continue
        title = (item.get("title") or "").strip()
        file_path = (item.get("file") or "").strip()
        if not title or not file_path:
            continue
        kind = (item.get("kind") or "other").strip()
        title_sr = (item.get("titleSr") or title).strip()
        period = (item.get("period") or "").strip()
        lines.append(f"## {title}")
        lines.append(f"- **Type:** {kind}")
        lines.append(f"- **Serbian title:** {title_sr}")
        if period:
            lines.append(f"- **Period:** {period}")
        lines.append(f"- **Scan / file:** {file_path}")
        lines.append("")

    raw_dir.mkdir(parents=True, exist_ok=True)
    out = raw_dir / "cv__credentials.md"
    try:
        out.write_text("\n".join(lines), encoding="utf-8")
        print(f"Wrote {out.name} ({len(creds)} credential(s)) for RAG.")
    except OSError as e:
        print(f"cv credentials export failed: {e}", file=sys.stderr)


def main() -> None:
    s = get_settings()
    if not s.google_api_key:
        print("Set GOOGLE_API_KEY or GEMINI_API_KEY before ingest.", file=sys.stderr)
        sys.exit(1)

    repo = _repo_root()
    content_dir = repo / "content"
    raw_dir = repo / "data" / "raw"
    if not content_dir.is_dir():
        print(f"Missing {content_dir}", file=sys.stderr)
        sys.exit(1)

    print("Fetching GitHub repo metadata + README files…")
    try:
        _fetch_github_readmes(raw_dir, s)
    except Exception as e:  # noqa: BLE001
        print(f"GitHub README fetch skipped: {e}", file=sys.stderr)

    _write_cv_credentials_doc(content_dir, raw_dir)

    llm, embed = build_llm_embed(s)
    _ = llm

    store_path = resolve_chroma_path(s)
    chroma = chromadb.PersistentClient(path=store_path)
    try:
        chroma.delete_collection(s.chroma_collection)
    except NotFoundError:
        pass
    collection = chroma.create_collection(s.chroma_collection)
    vector_store = ChromaVectorStore(chroma_collection=collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    print("Loading documents…")
    reader = SimpleDirectoryReader(
        input_dir=str(content_dir),
        recursive=True,
        filename_as_id=True,
    )
    docs = reader.load_data()
    raw_files = list(raw_dir.rglob("*")) if raw_dir.is_dir() else []
    raw_files = [p for p in raw_files if p.is_file()]
    if raw_files:
        reader_raw = SimpleDirectoryReader(
            input_dir=str(raw_dir),
            recursive=True,
            filename_as_id=True,
        )
        docs.extend(reader_raw.load_data())

    if not docs:
        print("No documents to index.", file=sys.stderr)
        sys.exit(1)

    print(f"Indexing {len(docs)} documents…")
    VectorStoreIndex.from_documents(
        documents=docs,
        storage_context=storage_context,
        embed_model=embed,
        show_progress=True,
    )
    print(
        "Done. Restart the API (or POST /admin/invalidate-rag) if it was already running.",
    )


if __name__ == "__main__":
    main()
