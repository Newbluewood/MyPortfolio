# Deploy (živi sajt)

Monorepo ima **dva dela**: Next.js frontend (`web/`) i FastAPI RAG backend (`api/`). Najčistije je hostovati ih odvojeno.

## 1. Frontend — Vercel (preporuka za Next.js)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import `Newbluewood/MyPortfolio`.
2. **Root Directory i `routes-manifest` ENOENT (monorepo)**  
   - Na nekim nalogima Vercel posle `next build` i dalje traži **`.next`** u **korenu checkouta**, iako je aplikacija u **`web/`** → greška `routes-manifest-deterministic.json` ENOENT.  
   - **Rešenje u repou:** (1) posle `next build`, skripta **`web/scripts/ensure-vercel-routes-manifest.mjs`** (npm **`postbuild`**) kopira `routes-manifest.json` → **`routes-manifest-deterministic.json`** — to Vercel ponekad traži a stock Next ne pravi. (2) u korenu je **`vercel.json`**: `install` u `web`, **`npm run build`** u `web`, zatim **`cp -r web/.next .next`** jer finalizacija i dalje gleda `.next` u korenu checkouta.  
   - **Na Vercelu:** za taj projekat postavi **Root Directory na PRAZNO** (ceo repo), Framework **Next.js**, i **nemoj** ručno overridovati Install/Build (mora da važi root `vercel.json`). Inače se root config ne koristi.  
   - Ako ikad budeš bez ovog fajla i Vercel ispravi bug: možeš probati samo **Root Directory = `web`** i uklonjen root `vercel.json`.
3. **`prebuild`** u `web/` kopira `content/` u `web/_content` — pri Root = prazno ceo repo je u checkoutu, pa `../content` i dalje radi.
4. **Node:** u `web/` je `.nvmrc` (`20`); u Project Settings možeš fiksirati **20.x**.
5. Framework: Next. Build/Install: iz root **`vercel.json`** (ne `--prefix web` u dashboardu).
6. **Environment Variables** (Production — vrednosti iz svog `.env`, bez komitovanja tajni):

| Variable | Napomena |
|----------|----------|
| `NEXT_PUBLIC_DISPLAY_NAME` | npr. `NBW` |
| `NEXT_PUBLIC_GITHUB_URL` | npr. `https://github.com/Newbluewood` |
| `GITHUB_USERNAME` | isto kao lokalno |
| `GITHUB_TOKEN` | opciono; preporuka na produkciji (rate limit, privatni repoi) |
| `PORTFOLIO_API_URL` | **puna URL** tvog API-ja, npr. `https://portfolio-api-production.up.railway.app` — **bez** završnog `/` |
| `NETLIFY_ACCESS_TOKEN` ili `NETLIFY_AUTH_TOKEN` | opciono, kao lokalno |

7. **Deploy**. Dodeli domen (Settings → Domains).

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

### Railway (noviji UI + monorepo)

**Šta gde:** **Project** = celokupna „radna površina”. **Service** (kartica / stavka u listi) = jedan pokrenut servis (tvoj API). Klik na servis otvara detalje (deployments, logovi, varijable).

**Docker bez traženja po Settings:** u korenu repozitorijuma je fajl **`railway.json`**. On govori Railway-u: builder = Dockerfile, putanja = `api/Dockerfile`, kontekst = **ceo repo** (kao `docker build -f api/Dockerfile .`). Posle što uradiš **commit + push** tog fajlja, u Railway-u uradi **Redeploy** (ili novi deploy da povuče najnoviji kod).

1. **New project** → **Deploy from GitHub** → izaberi **`MyPortfolio`**.
2. Ako Railway napravi servis automatski i krene **Railpack** (Node/Python detekcija), to je u redu: posle prvog pusha **`railway.json`** iz repoa, sledeći build treba da pređe na **Dockerfile** (proveri u **Deployment → Build logs** da piše Docker).
3. **Variables** (ili **Project Variables** / **Service → Variables**): dodaj bar:
   - `GOOGLE_API_KEY` (ili `GEMINI_API_KEY`)
   - `GITHUB_USERNAME`
   - `GITHUB_TOKEN` (preporuka)
   - `CORS_ORIGINS` = npr. `https://tvoj-projekat.vercel.app` (tačno kako ti se otvara sajt)
4. **Volume:** **New** → **Volume** → mount path **`/data/chroma`** → pripoj istom servisu koji pokreće API (da Chroma ostane posle restarta).
5. **Networking / Public networking:** uključi **Generate domain** (javni HTTPS URL). Test: `https://…/health` i `https://…/docs`.
6. Taj URL (bez `/` na kraju) unesi na Vercelu u **`PORTFOLIO_API_URL`**, pa redeploy fronta.

**Ako i dalje ne koristi Dockerfile:** u **Variables** tog servisa dodaj ručno: **`RAILWAY_DOCKERFILE_PATH`** = `api/Dockerfile`, pa redeploy (Railway dokumentacija dozvoljava i ovaj način).

### Ponovni ingest posle izmene `content/`

Obriši marker fajl u volume-u (**`/data/chroma/.portfolio_ingested`**) i restartuj servis, *ili* pokreni jednokratno u kontejneru: `portfolio-ingest` (i restart API ako kešira indeks).

## 3. Chat bez API-ja (privremeno)

Na Vercelu **moraš** postaviti **`PORTFOLIO_API_URL`** na stvarnu bazu API-ja — inače proxy ka lokalnom `127.0.0.1` neće raditi. Dok ne podigneš API, chat će javljati grešku pri slanju poruke; ostale stranice (početna, projekti, CV) i dalje rade ako su `GITHUB_*` podešeni.

## GitHub „About” repozitorijuma

Kratki opis (primer):  
`Portfolio — Next.js, GitHub projects, CV, RAG assistant (FastAPI + LlamaIndex + Chroma).`

Website: tvoj **Vercel** URL kad ga imaš.
