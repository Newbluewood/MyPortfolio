# Agent instructions (Cursor & co.)

**Primary context:** read and follow **[`CLAUDE.md`](./CLAUDE.md)** — especially **„Zavisnosti i tok“** when changing how pages, `lib/`, or the Python API connect. It defines a **presentation portfolio** (no billing), **concrete use case**, **free/low-cost hosting bias**, domain best practices (perf, a11y, content), and **owner-driven design** — do not replace the site’s visual/functionality choices with a generic template unless the user asks.

**Quick constraints**

- **Vercel** project **Root Directory = `web`**. Chat needs **`PORTFOLIO_API_URL`** for both **Production and Preview** if you use preview URLs.
- **Next.js** is pinned to **15.x** (see `DEPLOY.md` before upgrading to 16+).
- **Secrets** only in `.env` (gitignored); never inline keys in code.
- **LlamaIndex / RAG / agent changes:** follow [`.cursor/rules/llamaindex.mdc`](./.cursor/rules/llamaindex.mdc) and [`LLAMAINDEX_GUIDE.md`](./LLAMAINDEX_GUIDE.md).
- **„Šta je novo“ / najnoviji alati:** model knowledge may lag reality — **say so**, point to official docs / changelog / web search, and treat **`package.json`**, **`DEPLOY.md`**, and this repo as ground truth for what we actually ship.
- **Quality bar in `web/`:** run **`npm run lint`** and **`npm run typecheck`** before merge when you touch TS/React (ESLint skips `.next/` and synced `_content/`).
- **Cold start / stuck dev:** **`npm run workflow:minimal`** (Windows, iz korena) ili **`workflow:reset`** ako treba i `clean:web`; vidi `README.md`. Ručno: `kill:dev` + `clean:web` + `doctor --fix` + `dev`.
- **Kad nešto „ne učitava“:** prvo **`npm run doctor`** (iz korena) — štampa šta fali i šta uraditi; opciono `npm run doctor -- --fix` za sync sadržaja.

The Next.js-only stub in `web/AGENTS.md` is **not** the canonical guide for this monorepo.
