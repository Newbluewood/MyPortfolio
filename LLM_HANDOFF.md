# LLM Handoff - Portfolio App (NBW)

Ovaj dokument je operativni sazetak za drugi LLM: sta je ovaj projekat, kako se pokrece, kako su slojevi povezani, sta je menjano, i gde su tipicne zamke.

## 1) Sta je projekat

Monorepo za licni portfolio:
- Frontend: Next.js App Router sa stranicama Home, Projects, CV, Contact, Lab
- Backend: FastAPI + LlamaIndex + Chroma (RAG asistent)
- Sadrzaj: content/*.md i content/cv.json
- Hosting model: web i api su odvojeni deploy target-i (Vercel + Docker host/Railway stil)

Kljuco pravilo: nije e-commerce niti SaaS platforma, nego prezentacioni portfolio sa fokusom na stabilnost, brzinu i jasan sadrzaj.

## 2) Monorepo mapa

- web/: Next.js aplikacija
- api/: FastAPI aplikacija + ingest + RAG
- content/: markdown i CV JSON izvor istine
- web/_content/: sync kopija content/ za web build/runtime
- data/chroma/: lokalni vektor store (gitignored)

Bitni dokumenti:
- CLAUDE.md (kanonski kontekst i pravila)
- AGENTS.md (kratki indeks)
- README.md (setup i dijagnostika)
- DEPLOY.md (deploy spec)
- LLAMAINDEX_GUIDE.md (RAG/LlamaIndex detalji)

## 3) Stack i verzije (prakticno)

- Next.js 15.5.x (namerno pinovano)
- React 19
- Tailwind v4
- FastAPI + LlamaIndex + Chroma
- Gemini (Google GenAI) za chat/embeddings
- Zod za env/shemu

## 4) Runtime tok (najvaznije)

1. Browser -> web (Next.js)
2. Chat iz browsera ide na Next BFF: POST /api/chat
3. BFF prosledjuje na Python API: PORTFOLIO_API_URL + /chat
4. API koristi RAG (Chroma + Gemini)

Projects tok:
- web/src/lib/github.ts poziva GitHub API
- filtrira private/fork/archived prema pravilima
- dodaje manual projects i opcione live URL izvore

CV tok:
- izvor: content/cv.json
- fallback: web/src/lib/cv-fallback.ts
- sync: content -> web/_content preko script-e

## 5) Komande koje rade u ovom repou (Windows)

Iz root-a:
- npm run dev           (pali API + web)
- npm run workflow:minimal  (kill + doctor --fix + dev)
- npm run dev:full      (clean + doctor + dev + post-doctor)
- npm run doctor        (dijagnostika env/content/API/GitHub)
- npm run doctor -- --fix   (i sync content -> web/_content)

API health:
- GET http://127.0.0.1:8020/health
- GET http://127.0.0.1:8020/health/ready

## 6) Env pravila i zamke

Kljucevi idu u root .env (gitignored). Ne hardcode-ovati u kod.

Kriticne promenljive:
- PORTFOLIO_API_URL (lokalno preporuceno: http://127.0.0.1:8020)
- GITHUB_USERNAME i/ili NEXT_PUBLIC_GITHUB_URL i/ili GITHUB_TOKEN
- GEMINI_API_KEY ili GOOGLE_API_KEY

Bitna zamka koja je pogodila ovaj repo:
- Prazne shell env varijable (npr. GITHUB_TOKEN="") mogu pregaziti ocekivano ucitavanje iz .env i izazvati da /projects izgleda kao da nema GitHub identitet.

## 7) Sta je menjano u ovoj sesiji

A) Stabilnost GitHub listing-a
- Datoteka: web/src/lib/env/server.ts
- Dodato fallback ucitavanje env vrednosti direktno iz .env/.env.local (root + web), ako je process env prazan.
- Rezultat: /projects vise ne ostaje bez GitHub repoa zbog praznih shell override varijabli.

B) CV sadrzaj i gustina prikaza
- content/cv.json
- web/_content/cv.json
- web/src/lib/cv-fallback.ts
- web/src/app/cv/page.tsx

Uradeno:
- headlineApplyingFor ostavljen kao: Developer Next Generation
- Dodato u Experience: ZenHire AI Coding Hackathon (Startit x CDT Hub), 48h
- Dodato u Education: UKISAI Academy - AI Bootcamp + sertifikat
- Promenjen period: Nov 2024 - Jun 2026 (umesto Present)
- U skills AI tools dodat: Loveable
- Blago smanjen font u Experience/Education listama radi bolje gustine bez loma dizajna

Napomena:
- web/src/components/chat-dock.tsx je trenutno izmenjen u working tree (nije deo gore navedenih CV promena).

## 8) Trenutno ocekivano stanje

- /projects prikazuje GitHub repoe + manual projekte
- /cv prikazuje novi Experience/Education sadrzaj i azurirane skill tagove
- API health i ready endpointi vracaju OK u lokalnom radu

## 9) Ako sledeci LLM nastavlja rad

Pre bilo kojih vecih izmena uradi:
1. npm run workflow:minimal
2. proveri /projects i /cv
3. ako dira web TS/React: npm run lint i npm run typecheck (iz web/)

Kad menjas CV, drzi konzistentnost na 3 mesta:
1. content/cv.json
2. web/_content/cv.json
3. web/src/lib/cv-fallback.ts

Ako treba jedan izvor istine bez dupliranja, sledeci korak moze biti mali refactor da fallback ne duplira ceo CV payload.

## 10) Bezbednosna napomena

Ako su tokeni/kljucevi ikad iscurili kroz log, chat, ili commit, rotirati ih odmah:
- GitHub token
- Gemini/Google key
- Tavily key
- Netlify token
