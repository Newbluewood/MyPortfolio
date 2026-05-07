import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "..", "content");

export async function readMarkdownFile(name: string): Promise<string | null> {
  try {
    const file = path.join(CONTENT_DIR, name);
    return await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
}
