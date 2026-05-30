import "server-only";

import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { z } from "zod";

type EnvDirs = { monorepoRoot: string; webPackageRoot: string };

const trimOrUndef = (v: unknown): string | undefined => {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

/**
 * Učitaj `.env` / `.env.local` iz korena monorepa i iz `web/`.
 *
 * `import.meta.url` u server bundle-u pokazuje na `.next/server/chunks/…`, pa putanje
 * iz izvornog fajla ne valjaju. `process.cwd()` u Next dev obično bude `web/`, ali ne
 * uvek — zato tražimo koren tako što šetamo nagore dok ne nađemo raspored repoa.
 */
let _monorepoEnvLoaded = false;

function dotenvInDir(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, ".env")) ||
    fs.existsSync(path.join(dir, ".env.local"))
  );
}

function resolveMonorepoEnvDirs(): { monorepoRoot: string; webPackageRoot: string } {
  let dir = path.resolve(process.cwd());
  for (let i = 0; i < 12; i++) {
    const webDir = path.join(dir, "web");
    const nextInWeb = path.join(webDir, "next.config.ts");
    if (dotenvInDir(dir) && fs.existsSync(nextInWeb)) {
      return { monorepoRoot: dir, webPackageRoot: webDir };
    }

    const nextHere = path.join(dir, "next.config.ts");
    const parent = path.resolve(dir, "..");
    if (fs.existsSync(nextHere) && dotenvInDir(parent)) {
      return { monorepoRoot: parent, webPackageRoot: dir };
    }

    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }

  const webRoot = path.resolve(process.cwd());
  return {
    monorepoRoot: path.resolve(webRoot, ".."),
    webPackageRoot: webRoot,
  };
}

function ensureMonorepoEnvInProcess(): void {
  if (_monorepoEnvLoaded) return;
  const { monorepoRoot, webPackageRoot } = resolveMonorepoEnvDirs();
  const dirs = [monorepoRoot, webPackageRoot];
  const seen = new Set<string>();
  for (const d of dirs) {
    const abs = path.resolve(d);
    if (seen.has(abs)) continue;
    seen.add(abs);
    loadEnvConfig(abs);
  }
  _monorepoEnvLoaded = true;
}

let _fallbackEnvCache: Map<string, string> | null = null;

function parseDotenvFile(filePath: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(filePath)) return map;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

function fallbackEnvMap(): Map<string, string> {
  if (_fallbackEnvCache) return _fallbackEnvCache;
  const dirs: EnvDirs = resolveMonorepoEnvDirs();
  const merged = new Map<string, string>();
  const files = [
    path.join(dirs.monorepoRoot, ".env"),
    path.join(dirs.monorepoRoot, ".env.local"),
    path.join(dirs.webPackageRoot, ".env"),
    path.join(dirs.webPackageRoot, ".env.local"),
  ];
  for (const f of files) {
    for (const [k, v] of parseDotenvFile(f)) {
      merged.set(k, v);
    }
  }
  _fallbackEnvCache = merged;
  return merged;
}

function envOrFallback(name: string): string | undefined {
  const direct = trimOrUndef(process.env[name]);
  if (direct !== undefined) return direct;
  return trimOrUndef(fallbackEnvMap().get(name));
}

const envFlag = (v: unknown): boolean => {
  if (v === true) return true;
  if (v === false || v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
};

const serverSchema = z.object({
  /** Opciono ako imaš samo GITHUB_TOKEN (javni repoi i dalje koriste username u URL-u bez tokena). */
  GITHUB_USERNAME: z.preprocess(trimOrUndef, z.string().optional()),
  GITHUB_TOKEN: z.preprocess(trimOrUndef, z.string().optional()),
  /** Isti kao u klijentskom env-u; server koristi za inferenciju login-a ako nije setovan GITHUB_USERNAME. */
  NEXT_PUBLIC_GITHUB_URL: z.preprocess(trimOrUndef, z.string().url().optional()),
  /** Prepisuje samo „Applying for“ na /cv (brza prilagodba prijavi bez menjanja cv.json). */
  CV_HEADLINE_APPLYING_FOR: z.preprocess(trimOrUndef, z.string().optional()),
  /** Include fork repos on the Projects page (default: hide). */
  GITHUB_REPOS_INCLUDE_FORKS: z.preprocess(envFlag, z.boolean()).default(false),
  /** Include archived repos (default: hide). */
  GITHUB_REPOS_INCLUDE_ARCHIVED: z.preprocess(envFlag, z.boolean()).default(false),
  // Default 8020: avoids stale :8001 listeners on some Windows setups; sync with PORTFOLIO_API_URL in root .env.
  PORTFOLIO_API_URL: z
    .preprocess(trimOrUndef, z.string().min(1))
    .default("http://127.0.0.1:8020"),
  /** Netlify personal access token (ili `NETLIFY_AUTH_TOKEN` kao kod Netlify CLI). */
  NETLIFY_ACCESS_TOKEN: z.preprocess(trimOrUndef, z.string().optional()),
  /** Ime koje Netlify CLI koristi u `.env` — isti PAT kao gore. */
  NETLIFY_AUTH_TOKEN: z.preprocess(trimOrUndef, z.string().optional()),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function serverEnv(): ServerEnv {
  ensureMonorepoEnvInProcess();
  return serverSchema.parse({
    GITHUB_USERNAME: envOrFallback("GITHUB_USERNAME"),
    GITHUB_TOKEN: envOrFallback("GITHUB_TOKEN"),
    NEXT_PUBLIC_GITHUB_URL: envOrFallback("NEXT_PUBLIC_GITHUB_URL"),
    CV_HEADLINE_APPLYING_FOR: envOrFallback("CV_HEADLINE_APPLYING_FOR"),
    GITHUB_REPOS_INCLUDE_FORKS: envOrFallback("GITHUB_REPOS_INCLUDE_FORKS"),
    GITHUB_REPOS_INCLUDE_ARCHIVED: envOrFallback("GITHUB_REPOS_INCLUDE_ARCHIVED"),
    PORTFOLIO_API_URL: envOrFallback("PORTFOLIO_API_URL"),
    NETLIFY_ACCESS_TOKEN: envOrFallback("NETLIFY_ACCESS_TOKEN"),
    NETLIFY_AUTH_TOKEN: envOrFallback("NETLIFY_AUTH_TOKEN"),
  });
}
