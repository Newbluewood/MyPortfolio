# Refactoring plan — Portfolio App

> Analiza stanja: maj 2026.  
> Ovo nije imperativ — to je prioritizovana lista za slobodan termin ili kad neka oblast postane bolna. Svaka stavka je nezavisna.

---

## 0. Kontekst: šta je dobro (ne dirati)

- **Slojevi su jasni:** `web/` ↔ `api/` ↔ `content/` su odvojeni i poštovani.  
- **Env podela** (`clientEnv`/`serverEnv`/Python settings) radi ispravno.  
- **BFF proxy** (`/api/chat`) — pravilno skriva API ključ, ne menjati.  
- **Tailwind v4 + App Router** — moderan stack koji odgovara use case-u.  
- **`portfolio-doctor.mjs`** — vredan alat, ostavi ga.

---

## 1. Visoki prioritet — jasna, lokalizovana dobit

### 1.1 `readme-live-url.ts` — jedan fajl radi dve nezavisne stvari

**Problem:** `extractDeployUrlFromReadme` i `extractDescriptionFromReadme` žive u istom fajlu sa `fetchReadmeLiveUrlLookup` i `fetchReadmeDescriptionLookup`. Logika URL-scoring-a (badges, noise, junk) nema veze sa izvlačenjem opisa.

**Predlog:**
```
lib/
  readme-fetch.ts          ← fetchRepoReadmeRaw, readmeLiveConcurrency, readmeLiveMax
  readme-description.ts    ← extractDescriptionFromReadme, fetchReadmeDescriptionLookup
  readme-live-url.ts       ← extractDeployUrlFromReadme, fetchReadmeLiveUrlLookup (koristi readme-fetch)
```

**Dobit:** svaki fajl ima jednu svrhu; lakše testiranje `extractDescriptionFromReadme` izolovano.

---

### 1.2 `github.ts` — `REPO_DESCRIPTION_FALLBACK` je zastareo

**Problem:** `REPO_DESCRIPTION_FALLBACK` je ~20 ručnih unosa koji su workaround za repoe bez GitHub opisa. Sa `fetchReadmeDescriptionLookup` koji sada radi automatski, ovaj rečnik je nepotreban za sve nove repoe i može da zbunjuje (ručni opis vs. README opis — koji "pobedi"?).

**Predlog:**
1. `repoDescriptionFallback` neka bude poslednji fallback (posle README-a), ili potpuno ukloni tokom sledećeg čišćenja.
2. Dodaj kratki komentar u `fetchUserRepos` koji opisuje redosled: `GitHub About → FALLBACK_MAP → (README u page.tsx)`.

**Napomena:** trenutno `FALLBACK_MAP` se primenjuje u `fetchUserRepos` (na `repo.description`), a README opisi se primenjuju u `page.tsx` komponentnom sloju. To znači redosled nije vidljiv na jednom mestu.

---

### 1.3 `projects/page.tsx` — `GitHubRepoCard` i `ManualProjectCard` dele ~80% markup-a

**Problem:** Dve `<article>` kartice imaju identičan container, chip, live-link i datum, ali su odvojene komponente. Svaka promena u stilu (border, hover, padding) mora ići na dva mesta.

**Predlog:** Zajednička `<ProjectCard>` baza komponenta:
```tsx
// components/project-card.tsx
export function ProjectCard({ title, titleHref, language, stars, groupIds, description, liveUrl, sourceUrl, date }) { ... }
```
`GitHubRepoCard` i `ManualProjectCard` postaju tanki adaptori koji mapiraju props.

**Dobit:** Jedna izmena stila = jedan fajl. Kartica za manual projekte automatski dobija buduće funkcije (npr. topics) ako ih dodaš.

---

### 1.4 `projects/page.tsx` — paralelni README fetches nisu pravi `Promise.all`

**Problem:**
```ts
const [readmeLiveByFullName, readmeDescByFullName] = ghOutcome.ok
  ? await Promise.all([fetchReadmeLiveUrlLookup(...), fetchReadmeDescriptionLookup(...)])
  : ...
```
Oba fetchera iteriraju repoe serijalno u batchevima od 4, i **oba povlače isti README** za isti repo (jedan za live URL, drugi za opis). Svaki repo bez opisa i bez homepage-a → 2× GET na GitHub `/readme`.

**Predlog:** Spojiti u jedan prolaz:
```ts
// lib/readme-enrichment.ts
export async function enrichReposFromReadme(repos, netlifyIndex, token)
  : Promise<{ liveUrls: Map<string, string>; descriptions: Map<string, string> }>
```
Jedan fetch README-a → izvuci i URL i opis odjednom.

**Dobit:** 2× manje GitHub API zahteva pri buildu; brži Vercel cold start.

---

## 2. Srednji prioritet — čistiji API sloj

### 2.1 `main.py` — `_skip_ui_sources` regex u API fajlu

**Problem:** Regex koji odlučuje da li da prikaže UI izvore (`_SKIP_UI_SOURCES_RE`) živi u `main.py` ali je logika koja pripada `rag.py` ili zasebnom `chat_utils.py`.

**Predlog:** Premesti u `rag.py` ili novi `chat_utils.py` modul.

---

### 2.2 `main.py` — `_client_key` za rate limiting je trivijalan ali mešan sa routama

**Problem:** `_client_key`, `limiter`, `_sse` helper su utility funkcije definisane između middleware i ruta, što otežava čitanje.

**Predlog:** Grupisati utilities na vrhu ili izdvojiti u `http_utils.py`.

---

### 2.3 `netlify.ts` — `githubFullNameFromRepoUrl` postoji i u `repo-live-url.ts`

**Problem:** `githubOwnerRepoFromUrl` (u `repo-live-url.ts`) i `githubFullNameFromRepoUrl` (u `netlify.ts`) rade istu stvar — parsiraju GitHub URL u `owner/repo`. Dupliran kod, dve implementacije koje mogu da divergiraju.

**Predlog:** Izvuci u `lib/github-url.ts` kao jednu funkciju koju oba uvezu.

---

## 3. Niski prioritet — nice-to-have

### 3.1 `project-groups.ts` — `repoNameToGroups` mapa je lisnata ali duga

Nema strukturalnog problema — ali kad lista repoa poraste, razmotri prebacivanje u `content/project-groups.json` kako bi se editovalo bez TypeScript konteksta. Nije hitno dok ima < 50 unosa.

---

### 3.2 `deploy-url-quality.ts` — `junkHosts` je `new Set(...)` pri svakom pozivu

```ts
const junkHosts = new Set([...]); // kreira se unutar funkcije
```
Treba biti `const` van funkcije (jednom pri modulu load-u). Nije merljivo za ovaj broj repoa, ali je losa navika.

---

### 3.3 Testovi su prazan prostor

Nema ni jednog Jest/Vitest testa u `web/`. Funkcije kao `extractDescriptionFromReadme`, `extractDeployUrlFromReadme`, `isJunkOrDocsDeployUrl`, `liveSiteDisplayLabel` su **čiste funkcije** — idealni kandidati za unit testove koji se pokreću za < 1s.

**Predlog:** `web/src/lib/__tests__/readme-description.test.ts` kao polazna tačka.

---

## Redosled ako kreneš

| Br. | Stavka | Napor | Dobit |
|-----|--------|-------|-------|
| 1 | **1.4** Spojeni README fetch (jedan prolaz) | ~2h | Manje API poziva, brži build |
| 2 | **1.3** Zajednička `ProjectCard` komponenta | ~1h | Jedno mesto za stil kartica |
| 3 | **2.3** Dedupliciraj `githubOwnerRepoFromUrl` | ~30min | Uklanja divergenciju |
| 4 | **3.2** `junkHosts` van funkcije | ~5min | Čišći kod |
| 5 | **1.1** Podeli `readme-live-url.ts` | ~45min | Bolji SRP |
| 6 | **1.2** Razjasni ili ukloni `REPO_DESCRIPTION_FALLBACK` | ~30min | Manji dug |
| 7 | **3.3** Unit testovi za čiste funkcije | ~2h | Sigurnosna mreža |
| 8 | **2.1/2.2** Python utils reorganizacija | ~30min | Čitljiviji `main.py` |

---

## Šta se NE refaktoriše

- **ISR / `revalidate = 300`** — radi dobro, ne menjati bez razloga.
- **`GITHUB_REPO_LIVE_URL_OVERRIDES`** — malo ručnih unosa, dobro vidljivo.
- **`portfolio-doctor.mjs`** — funkcionalan i koristan, ne dirati strukturu.
- **Vercel/Railway deployment config** — stabilan, ne menjati bez testa u `DEPLOY.md`.
- **Chat/RAG tok** — funkcionalan, svaka promena zahteva čitanje `LLAMAINDEX_GUIDE.md`.
