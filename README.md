# Portfolio (Next.js + FastAPI + LlamaIndex)

**Live:** [NBW — Portfolio](https://my-portfolio-newbluewoods-projects.vercel.app/)

**NBW / New Blue Wood** — personal portfolio monorepo: marketing site with GitHub-backed project list, **CV** route, optional Netlify enrichment, and a **RAG** on-site assistant (Gemini + Chroma + optional Tavily).

**AI / agent context (stack, layout, deploy pitfalls):** see **[`CLAUDE.md`](CLAUDE.md)** (and [`AGENTS.md`](AGENTS.md) for a short Cursor-oriented index).

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

3. **Run the API** (from `api/`) — ili iz korena `npm run dev:api` (port **8020**):

   ```bash
   ..\venv\Scripts\uvicorn portfolio_api.main:app --reload --host 127.0.0.1 --port 8020
   ```

4. **Run the site** (from `web/`):

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Chat proksi koristi **`PORTFOLIO_API_URL`** iz root `.env` (preporuka lokalno: `http://127.0.0.1:8020`).

   Quick checks: `npm run lint` and `npm run typecheck` (both from `web/`).

5. **Brza dijagnostika (preporuka pre `dev`):** iz korena repozitorijuma pokreni `npm run doctor` — proverava env, sadržaj, sync `content/` → `web/_content`, dostupnost API-ja (`/health`, `/health/ready`) i daje **konkretne korake** za svaki problem. Sa `npm run doctor -- --fix` automatski radi samo sync fajlova. Sa `--strict` svako upozorenje daje exit code 1 (npr. za CI).

## Dijagnostika u detalju (`portfolio-doctor`)

| Komanda | Šta radi |
|--------|----------|
| `npm run doctor` | Čita root `.env`, validira URL-e, proverava `content/*`, upoređuje `cv.json` sa `web/_content/`, zove lokalni API ako je `PORTFOLIO_API_URL` validan; opciono GitHub `/user` ili javni profil. |
| `npm run doctor -- --fix` | Isto + pokreće `web/scripts/sync-content.mjs` na početku provera. |
| `npm run doctor -- --strict` | Izlaz 1 i na WARN (pogodno za automatizaciju). |

Skripta: [`scripts/portfolio-doctor.mjs`](scripts/portfolio-doctor.mjs) (Node 18+; koristi ugrađeni `fetch`). Ako hoćeš istu proveru **pre** svakog punog `npm run dev`: `npm run dev:with-doctor` (staje na prvoj ERROR stavci doktor-a).

## Minimalni stabilni workflow (fallback kad nešto puca)

Cilj: **jedna komanda** koja najčešće vraća predvidljivo stanje bez ručnog nagađanja.

| Nivo | Komanda (iz korena, **Windows**) | Kada |
|------|-----------------------------------|------|
| **Minimalni** | `npm run workflow:minimal` | „Nešto čudno“, sumnja na zaglavljen port ili desinhronizovan `content/`; **ne** briše `.next`. Redosled: `kill:dev` → doktor sa `--fix` (sync `content/` → `web/_content`) → `dev`. Ako doktor nađe **ERROR**, `dev` se ne pokreće dok ne središ korake koje ispiše. |
| **Puni režim + debug u pozadini** | `npm run dev:full` ili **`npm run workflow:reset`** (iste stvari) | **`clean:web`** → doktor **`--fix`** → paralelno **API (8020)** + **Next (3000)** → nakon ~14 s (**`POST_DEV_DOCTOR_DELAY_MS`**) još jedan doktor u **trećoj** concurrently traci (`doc`) da proveri `/health` i `/health/ready` dok su serveri već podignuti. Za samo paralelni dev bez čišćenja koristi `npm run dev`. |
| **Unix** | Nema PowerShell `kill:dev` — ručno zaustavi **3000** i **8020**, zatim `cd web && npm run clean` po potrebi, `npm run doctor -- --fix`, pa pokreni API i `web` odvojeno (ili paralelno) kao u [Setup](#setup). |

**Stabilnost:** root **`.env`** mora imati **`PORTFOLIO_API_URL`** na istom portu kao lokalni API (preporuka **8020**, kao u root `package.json`).

## Čisti start (eksplicitno — kad „štašta škripi“)

Cilj je **istu proceduru** svaki put: nema nagađanja koji je zaglavljen `next` ili stari `.next`.

### Windows (iz korena repozitorijuma)

1. **Zaustavi dev servere** (oslobađa portove 3000, 8000, 8001, 8020):

   ```bash
   npm run kill:dev
   ```

2. **Obriši Next keš** (`.next` + `node_modules/.cache` u `web/`):

   ```bash
   npm run clean:web
   ```

3. **Ponovo pokreni** (oba servisa) ili samo jedan:

   ```bash
   npm run dev
   ```

   Ili odvojeno: `npm run dev:web` / `npm run dev:api`.

4. **Sinhronizuj sadržaj u `web/_content`** bez punog build-a (ako si menjao `content/*.md` ili `cv.json`):

   ```bash
   cd web && node scripts/sync-content.mjs && cd ..
   ```

   (`npm run build` u `web/` ionako pokreće `prebuild` → sync.)

### macOS / Linux

Nema `kill-dev-ports.ps1` — ručno zaustavi procese na **3000** i **8020** (npr. `lsof -i :3000` pa `kill`). Zatim:

```bash
cd web && npm run clean && npm run dev
```

API: aktiviraj `venv`, pokreni `uvicorn` na istom portu kao **`PORTFOLIO_API_URL`** u root `.env` (preporuka lokalno: `http://127.0.0.1:8020` kao u root `package.json`).

### Retko: reset vektora (RAG)

Ako sumnjaš na pokvaren Chroma indeks lokalno: zaustavi API, obriši folder **`data/chroma/`** (gitignored), pa ponovo `portfolio-ingest` iz `api/` kao u setupu. **Ne** komituj `data/`.

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

**Deploy online:** see **[`DEPLOY.md`](DEPLOY.md)** (Vercel + Docker API).

## Security

Rotate any API keys that were ever committed. Keep secrets in root `.env` (gitignored).

## LlamaIndex

When extending AI behavior, follow the project guide in [`LLAMAINDEX_GUIDE.md`](LLAMAINDEX_GUIDE.md).
