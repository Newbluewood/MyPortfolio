# Portfolio (Next.js + FastAPI + LlamaIndex)

**NBW / New Blue Wood** — personal portfolio monorepo: marketing site with GitHub-backed project list, **CV** route, optional Netlify enrichment, and a **RAG** on-site assistant (Gemini + Chroma + optional Tavily).

> **GitHub “About” suggestion (short):**  
> `Portfolio — Next.js, GitHub projects, CV, RAG assistant (FastAPI + LlamaIndex + Chroma).`

## Prerequisites

- Node 20+ and npm
- Python 3.11+ (virtualenv recommended — repo may already include `venv/`)
- [Google AI Studio](https://aistudio.google.com/) API key for Gemini

## Setup

1. Copy [`.env.example`](.env.example) to `.env` at the **repository root** and fill in at least `GOOGLE_API_KEY`, `GITHUB_USERNAME`, and `NEXT_PUBLIC_DISPLAY_NAME`. [`web/next.config.ts`](web/next.config.ts) loads that file via `@next/env` so Next.js sees the same variables.

2. **Index knowledge** (content markdown + GitHub READMEs):

   ```bash
   cd api
   ..\venv\Scripts\pip install -e .
   ..\venv\Scripts\portfolio-ingest
   ```

   On Unix: `source ../venv/bin/activate` then `portfolio-ingest`.

3. **Run the API** (from `api/`):

   ```bash
   ..\venv\Scripts\uvicorn portfolio_api.main:app --reload --host 127.0.0.1 --port 8000
   ```

4. **Run the site** (from `web/`):

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The chat widget proxies to `PORTFOLIO_API_URL` (default `http://127.0.0.1:8000`).

## Layout

| Path | Role |
|------|------|
| [`web/`](web/) | Next.js App Router frontend |
| [`api/portfolio_api/`](api/portfolio_api/) | FastAPI app, RAG, ReAct agent |
| [`content/`](content/) | Markdown indexed into Chroma (`about.md`, `skills.md`, …) |
| `data/chroma/` | Persistent Chroma store (gitignored) |
| `data/raw/` | Cached README files from ingest (gitignored) |

## Optional: Qdrant later

For production you can swap Chroma for Qdrant; [`docker-compose.yml`](docker-compose.yml) starts Qdrant locally for experiments — the default stack uses **Chroma** only.

## Security

Rotate any API keys that were ever committed. Keep secrets in root `.env` (gitignored).

## LlamaIndex

When extending AI behavior, follow the project guide in [`LLAMAINDEX_GUIDE.md`](LLAMAINDEX_GUIDE.md).
