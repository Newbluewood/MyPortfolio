import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

/** Copied under `web/` at build (`prebuild`) so Vercel ne zavisi od monorepo tracing-a. */
const WEB_SYNCED = path.join(process.cwd(), "_content");
const REPO_CONTENT = path.join(process.cwd(), "..", "content");

export async function readMarkdownFile(name: string): Promise<string | null> {
  for (const dir of [WEB_SYNCED, REPO_CONTENT]) {
    try {
      return await fs.readFile(path.join(dir, name), "utf-8");
    } catch {
      /* try next */
    }
  }
  return null;
}
