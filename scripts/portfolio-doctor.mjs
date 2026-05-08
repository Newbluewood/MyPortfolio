/**
 * Portfolio monorepo — dijagnostika pre/posle developera bez ručnog pretakanja.
 * Pokretanje iz korena repozitorijuma: node scripts/portfolio-doctor.mjs
 *
 * Opcije:
 *   --fix     pokreni sync content → web/_content ako nestaje
 *   --strict  exit 1 i na WARN (za CI)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const wantFix = args.includes("--fix");
const strict = args.includes("--strict");

/** @type {{ level: 'ok' | 'warn' | 'error', title: string, detail?: string, fix: string[] }[]} */
const lines = [];

function add(level, title, detail, fix = []) {
  lines.push({ level, title, detail, fix });
}

function loadDotEnv(filePath) {
  /** @type {Record<string, string>} */
  const out = {};
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
  } catch {
    /* no file */
  }
  return out;
}

function mergeEnv() {
  const fromFile = loadDotEnv(path.join(repoRoot, ".env"));
  return { ...fromFile, ...process.env };
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchJson(url, ms = 6000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal });
    const text = await r.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { ok: r.ok, status: r.status, body };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      body: null,
      err: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(t);
  }
}

const env = mergeEnv();

// --- .env ---
if (!exists(path.join(repoRoot, ".env"))) {
  add(
    "error",
    "Nema root `.env` fajla",
    "Next i API očekuju promenljive iz korena repozitorijuma.",
    [
      "Kopiraj `.env.example` → `.env` i popuni bar NEXT_PUBLIC_DISPLAY_NAME, GITHUB_* ili NEXT_PUBLIC_GITHUB_URL, GOOGLE_API_KEY, PORTFOLIO_API_URL.",
    ],
  );
} else {
  add("ok", "Root `.env` postoji");
}

// --- Next public ---
if (!(env.NEXT_PUBLIC_DISPLAY_NAME || "").trim()) {
  add("warn", "NEXT_PUBLIC_DISPLAY_NAME je prazan", undefined, [
    "U `.env` postavi NEXT_PUBLIC_DISPLAY_NAME (npr. ime koje se vidi u hero sekciji).",
  ]);
}

// --- GitHub identity (Next server) ---
const ghUser = (env.GITHUB_USERNAME || "").trim();
const ghTok = (env.GITHUB_TOKEN || "").trim();
const ghUrl = (env.NEXT_PUBLIC_GITHUB_URL || "").trim();
if (!ghTok && !ghUser && !ghUrl) {
  add(
    "warn",
    "GitHub listing: nema GITHUB_USERNAME, NEXT_PUBLIC_GITHUB_URL ni GITHUB_TOKEN",
    "Lokalno Projects neće povući repoe (plava info traka); na Vercelu bi bilo ERROR.",
    [
      "Dodaj jedno od toga u `.env` — najbrže: NEXT_PUBLIC_GITHUB_URL=https://github.com/TvojLogin",
      "Ili GITHUB_USERNAME=tvojlogin",
    ],
  );
} else {
  add("ok", "GitHub identitet za Projects je podesen (bar jedna opcija)");
}

// --- PORTFOLIO_API_URL ---
const portfolioBase = (env.PORTFOLIO_API_URL || "").trim().replace(/\/$/, "");
let portfolioUrlValid = false;
if (!portfolioBase) {
  add("warn", "PORTFOLIO_API_URL nije setovan", "Koristi se default u kodu samo ako parse prođe; bolje eksplicitno.", [
    "U `.env`: PORTFOLIO_API_URL=http://127.0.0.1:8020 (ili Railway URL na produkciji).",
  ]);
} else {
  try {
    const u = new URL(portfolioBase);
    if (!u.protocol.startsWith("http")) throw new Error("scheme");
    portfolioUrlValid = true;
    add("ok", `PORTFOLIO_API_URL parsira se kao URL (${u.origin})`);
  } catch {
    add("error", "PORTFOLIO_API_URL nije validan URL", portfolioBase, [
      "Mora biti pun URL sa https:// ili http://, bez razmaka; npr. http://127.0.0.1:8020",
    ]);
  }
}

// --- Gemini (API) ---
const gem = ((env.GOOGLE_API_KEY || env.GEMINI_API_KEY || "").trim());
if (!gem) {
  add(
    "warn",
    "GOOGLE_API_KEY / GEMINI_API_KEY nisu u .env (API chat / ingest)",
    "API može da startuje /health ali /health/ready i chat će pući bez ključa.",
    [
      "Dodaj GOOGLE_API_KEY=... iz Google AI Studio u root `.env`.",
      "Zatim iz `api/` pokreni portfolio-ingest ako treba RAG.",
    ],
  );
} else {
  add("ok", "Gemini / Google API ključ je prisutan u env-u");
}

// --- Content files ---
const contentDir = path.join(repoRoot, "content");
const needMd = ["about.md", "skills.md"];
for (const f of needMd) {
  const p = path.join(contentDir, f);
  if (!exists(p)) {
    add("warn", `Nedostaje content/${f}`, undefined, [
      `Kreiraj ${f} u folderu content/ ili ukloni očekivanje sa početne strane.`,
    ]);
  }
}
const cvPath = path.join(contentDir, "cv.json");
if (!exists(cvPath)) {
  add("error", "Nedostaje content/cv.json", undefined, [
    "Kopiraj strukturu iz `web/src/lib/cv-fallback.ts` u JSON ili vrati fajl.",
  ]);
} else {
  add("ok", "content/cv.json postoji");
}

// --- optional --fix: sync content (pre provere _content) ---
if (wantFix) {
  const syncScript = path.join(repoRoot, "web", "scripts", "sync-content.mjs");
  if (exists(syncScript)) {
    const r = spawnSync(process.execPath, [syncScript], {
      cwd: path.join(repoRoot, "web"),
      stdio: "inherit",
    });
    if (r.status === 0) {
      add("ok", "Sync: content → web/_content (--fix)");
    } else {
      add("error", "Sync content skripta je vratila grešku", String(r.status), [
        "Proveri da content/ postoji i da ima .md / cv.json.",
      ]);
    }
  }
}

// --- _content sync hint ---
const webContent = path.join(repoRoot, "web", "_content");
if (exists(webContent) && exists(cvPath)) {
  try {
    const src = fs.statSync(cvPath).mtimeMs;
    const dest = path.join(webContent, "cv.json");
    if (exists(dest)) {
      const dst = fs.statSync(dest).mtimeMs;
      if (src > dst + 1000) {
        add("warn", "content/cv.json noviji od web/_content/cv.json", undefined, [
          "Pokreni: cd web && node scripts/sync-content.mjs",
          "Ili: npm run doctor -- --fix",
        ]);
      }
    } else {
      add("warn", "web/_content/cv.json nedostaje", undefined, [
        "npm run doctor -- --fix  ili  cd web && node scripts/sync-content.mjs",
      ]);
    }
  } catch {
    /* ignore */
  }
} else if (!exists(webContent) && exists(contentDir)) {
  add("warn", "Nema web/_content/ — build prebuild će ga napraviti", undefined, [
    "Za dev odmah: npm run doctor -- --fix",
  ]);
}

// --- HTTP: API health ---
if (portfolioUrlValid) {
  const healthUrl = `${portfolioBase}/health`;
  const readyUrl = `${portfolioBase}/health/ready`;
  const h = await fetchJson(healthUrl);
  if (h.err || h.status === 0) {
    add(
      "error",
      `API nedostupan na ${healthUrl}`,
      h.err || "connection failed",
      [
        "Pokreni API: iz korena `npm run dev:api` ili `npm run dev` (oba servisa).",
        "Proveri PORTFOLIO_API_URL da odgovara portu (lokalno često 8020).",
        "Windows: npm run kill:dev pa ponovo start ako port zaglavi.",
      ],
    );
  } else if (!h.ok) {
    add("warn", `GET /health vratio ${h.status}`, JSON.stringify(h.body).slice(0, 200), [
      "Proveri logove uvicorna; CORS ne utiče na GET health iz Node fetch.",
    ]);
  } else {
    add("ok", `API živ: GET /health → ${h.status}`);
  }

  const r = await fetchJson(readyUrl);
  if (!h.err && h.ok) {
    if (r.err || r.status === 0) {
      add("warn", "GET /health/ready nije dostupan (mreža?)", r.err, []);
    } else if (r.status === 503 || r.status === 502) {
      add(
        "warn",
        "RAG /ready nije spreman (često prazan indeks ili nema ključa)",
        typeof r.body === "string" ? r.body.slice(0, 300) : JSON.stringify(r.body),
        [
          "Proveri GOOGLE_API_KEY u `.env`; iz api/ pokreni: portfolio-ingest",
          "Lokalni Chroma: folder data/chroma mora biti popunjen posle ingest-a.",
        ],
      );
    } else if (r.ok) {
      add("ok", `RAG spreman: GET /health/ready → ${r.status}`);
    } else {
      add("warn", `/health/ready status ${r.status}`, undefined, [
        "Otvori u browseru isti URL radi detalja.",
      ]);
    }
  }
}

// --- GitHub API reachability (optional) ---
if (ghTok) {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 8000);
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${ghTok}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: ac.signal,
    });
    clearTimeout(t);
    if (res.ok) add("ok", "GITHUB_TOKEN prihvaćen (GET /user)");
    else if (res.status === 401) {
      add("warn", "GITHUB_TOKEN odbijen (401)", undefined, [
        "Napravi novi classic PAT sa scope repo (ako treba privatni repoi).",
      ]);
    } else {
      add("warn", `GitHub API /user odgovor ${res.status}`, undefined, []);
    }
  } catch (e) {
    add("warn", "GitHub /user fetch nije uspeo", String(e), []);
  }
} else if (ghUser) {
  const u = await fetchJson(`https://api.github.com/users/${encodeURIComponent(ghUser)}`, 8000);
  if (u.ok && u.status === 200) {
    add("ok", `Javni GitHub profil postoji: ${ghUser}`);
  } else if (u.status === 404) {
    add("error", `GITHUB_USERNAME izgleda nepostojeći (404): ${ghUser}`, undefined, [
      "Ispravi GITHUB_USERNAME ili koristi NEXT_PUBLIC_GITHUB_URL na profil.",
    ]);
  }
}

// --- Output ---
const sym = { ok: "✓", warn: "⚠", error: "✗" };
let exit = 0;
console.log("\n━━ Portfolio doctor ━━\n");
for (const row of lines) {
  console.log(`${sym[row.level]} [${row.level.toUpperCase()}] ${row.title}`);
  if (row.detail) console.log(`   ${row.detail}`);
  if (row.fix.length) {
    console.log("   → Šta uraditi:");
    for (const f of row.fix) console.log(`      • ${f}`);
  }
  console.log("");
  if (row.level === "error") exit = 1;
  if (row.level === "warn" && strict) exit = 1;
}

const okC = lines.filter((l) => l.level === "ok").length;
const warnC = lines.filter((l) => l.level === "warn").length;
const errC = lines.filter((l) => l.level === "error").length;
console.log(`Rezime: ${okC} OK, ${warnC} upozorenja, ${errC} grešaka.\n`);

process.exit(exit);
