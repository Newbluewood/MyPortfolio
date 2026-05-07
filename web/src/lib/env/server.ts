import "server-only";

import path from "path";
import { loadEnvConfig } from "@next/env";
import { z } from "zod";

const trimOrUndef = (v: unknown): string | undefined => {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

/**
 * Učitaj `.env` / `.env.local` i iz korena monorepa i iz `web/` da
 * `GITHUB_USERNAME` u root `.env` radi i kad postoji prazan `web/.env`.
 */
let _monorepoEnvLoaded = false;

function ensureMonorepoEnvInProcess(): void {
  if (_monorepoEnvLoaded) return;
  const cwd = path.resolve(process.cwd());
  const isWebPkg = path.basename(cwd) === "web";
  const monorepoRoot = isWebPkg ? path.resolve(cwd, "..") : cwd;

  const dirs: string[] = [monorepoRoot];
  if (isWebPkg) dirs.push(cwd);

  const seen = new Set<string>();
  for (const dir of dirs) {
    const abs = path.resolve(dir);
    if (seen.has(abs)) continue;
    seen.add(abs);
    loadEnvConfig(abs);
  }
  _monorepoEnvLoaded = true;
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
    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_REPOS_INCLUDE_FORKS: process.env.GITHUB_REPOS_INCLUDE_FORKS,
    GITHUB_REPOS_INCLUDE_ARCHIVED: process.env.GITHUB_REPOS_INCLUDE_ARCHIVED,
    PORTFOLIO_API_URL: process.env.PORTFOLIO_API_URL,
    NETLIFY_ACCESS_TOKEN: process.env.NETLIFY_ACCESS_TOKEN,
    NETLIFY_AUTH_TOKEN: process.env.NETLIFY_AUTH_TOKEN,
  });
}
