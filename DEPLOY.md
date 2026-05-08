# Deploy (živi sajt)

Monorepo ima **dva dela**: Next.js frontend (`web/`) i FastAPI RAG backend (`api/`). Najčistije je hostovati ih odvojeno.

## 1. Frontend — Vercel (preporuka za Next.js)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import `Newbluewood/MyPortfolio`.
2. **Root Directory = `web`** (Settings → General). Bez toga Vercel hvata Python iz `api/` ili traži `.next` na pogrešnom mestu. **Build/Install** najbolje ostavi na default (koristi se **`web/vercel.json`**). Nemoj ručno `--prefix web` ako je Root već `web`.  
3. **Next.js:** u projektu je pin na **15.x** (npr. `15.5.18`) jer **Next 16.2.x + Vercel Git deploy** ima [poznat bug](https://community.vercel.com/t/git-integration-fails-after-build-looking-for-routes-manifest-in-repo-root/40519) na finalizaciji (`routes-manifest-deterministic.json` ENOENT). Kad Vercel to ispravi, možeš ponovo podići major.  
4. **`prebuild`** kopira monorepo `content/` u `web/_content`; uključi na Vercelu **Include files outside the root directory in the Build Step** da `../content` postoji pri buildu.  
5. **Node:** preporuka **20.x** (pogledaj `web/.nvmrc`).
6. **Environment Variables** (Production — vrednosti iz svog `.env`, bez komitovanja tajni):

| Variable | Napomena |
|----------|----------|
| `NEXT_PUBLIC_DISPLAY_NAME` | npr. `NBW` |
| `NEXT_PUBLIC_GITHUB_URL` | npr. `https://github.com/Newbluewood` |
| `GITHUB_USERNAME` | isto kao lokalno |
| `GITHUB_TOKEN` | opciono; preporuka na produkciji (rate limit, privatni repoi) |
| `PORTFOLIO_API_URL` | Javni Railway URL, npr. `https://….up.railway.app` — **bez** `/` na kraju. **Obavezno uključi za Production *i* Preview** (Vercel → Variables → ta varijabla → *All Environments* ili obe kvačice), inače chat radi samo na jednom tipu deploya. |
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
