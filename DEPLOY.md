# Deploy (živi sajt)

Monorepo ima **dva dela**: Next.js frontend (`web/`) i FastAPI RAG backend (`api/`). Najčistije je hostovati ih odvojeno.

## 1. Frontend — Vercel (preporuka za Next.js)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import `Newbluewood/MyPortfolio`.
2. **Root Directory:** `web`
3. Framework: Next (auto). Build: `npm run build`, Output: default.
4. **Environment Variables** (Production — vrednosti iz svog `.env`, bez komitovanja tajni):

| Variable | Napomena |
|----------|----------|
| `NEXT_PUBLIC_DISPLAY_NAME` | npr. `NBW` |
| `NEXT_PUBLIC_GITHUB_URL` | npr. `https://github.com/Newbluewood` |
| `GITHUB_USERNAME` | isto kao lokalno |
| `GITHUB_TOKEN` | opciono; preporuka na produkciji (rate limit, privatni repoi) |
| `PORTFOLIO_API_URL` | **puna URL** tvog API-ja, npr. `https://portfolio-api-production.up.railway.app` — **bez** završnog `/` |
| `NETLIFY_ACCESS_TOKEN` ili `NETLIFY_AUTH_TOKEN` | opciono, kao lokalno |

5. **Deploy**. Dodeli domen (Settings → Domains).

Chat na sajtu radi tek kad je **`PORTFOLIO_API_URL`** javno dostupan API (korak 2).

## 2. Backend — Docker (Railway, Render, Fly, …)

Slika se gradi iz **korena repozitorijuma**:

```bash
docker build -f api/Dockerfile -t portfolio-api .
```

Na platformi podesi:

| Variable | Obavezno | Napomena |
|----------|----------|----------|
| `GOOGLE_API_KEY` | da | ili `GEMINI_API_KEY` |
| `GITHUB_USERNAME` | da | za ingest README-ova pri prvom startu |
| `GITHUB_TOKEN` | preporuka | kao lokalno |
| `CORS_ORIGINS` | da | npr. `https://tvoj-projekat.vercel.app` — zarez za više URL-ova (bez razmaka oko zareza) |
| `PORT` | obično auto | Railway/Render postavljaju sami |
| `CHROMA_PATH` | opciono | podrazumevano `/data/chroma` u kontejneru |

**Perzistencija vektora:** dodaj volume (disk) montiran na **`/data/chroma`**. Bez toga, posle restarta će se ponovo pokrenuti ingest na „praznom” disku (sporije, više poziva ka Gemini).

**Proveri zdravlje:** `GET https://tvoj-api/health` (ako postoji) ili `GET /docs` za Swagger.

### Railway (kratko)

1. New project → **Deploy from GitHub** → isti repo.
2. **Settings**: Dockerfile path `api/Dockerfile`, context **repository root** (`.`).
3. Dodaj volume na mount path **`/data/chroma`**.
4. Unesi env varijable iz tabele, posebno **`CORS_ORIGINS`** sa tačnim Vercel URL-om.
5. Posle deploya kopiraj **public URL** API-ja u Vercel → `PORTFOLIO_API_URL`, pa **Redeploy** frontend.

### Ponovni ingest posle izmene `content/`

Obriši marker fajl u volume-u (**`/data/chroma/.portfolio_ingested`**) i restartuj servis, *ili* pokreni jednokratno u kontejneru: `portfolio-ingest` (i restart API ako kešira indeks).

## 3. Chat bez API-ja (privremeno)

Na Vercelu **moraš** postaviti **`PORTFOLIO_API_URL`** na stvarnu bazu API-ja — inače proxy ka lokalnom `127.0.0.1` neće raditi. Dok ne podigneš API, chat će javljati grešku pri slanju poruke; ostale stranice (početna, projekti, CV) i dalje rade ako su `GITHUB_*` podešeni.

## GitHub „About” repozitorijuma

Kratki opis (primer):  
`Portfolio — Next.js, GitHub projects, CV, RAG assistant (FastAPI + LlamaIndex + Chroma).`

Website: tvoj **Vercel** URL kad ga imaš.
