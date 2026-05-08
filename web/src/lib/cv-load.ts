import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { cvDataFallback } from "@/lib/cv-fallback";
import type { CvData } from "@/lib/cv-schema";
import { cvDataSchema } from "@/lib/cv-schema";
import { serverEnv } from "@/lib/env/server";

async function readCvJsonRaw(): Promise<string | null> {
  const webSynced = path.join(process.cwd(), "_content", "cv.json");
  const repoContent = path.join(process.cwd(), "..", "content", "cv.json");
  for (const p of [webSynced, repoContent]) {
    try {
      return await fs.readFile(p, "utf-8");
    } catch {
      /* try next */
    }
  }
  return null;
}

/**
 * CV sa `/cv` — izvor: `content/cv.json` (sinhronizuje se u `web/_content` pri buildu).
 * Opciono: `CV_HEADLINE_APPLYING_FOR` u env prepisuje samo polje „Applying for“ (brza prijava).
 */
export async function getCvData(): Promise<CvData> {
  const raw = await readCvJsonRaw();
  let data: CvData = cvDataFallback;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      data = cvDataSchema.parse(parsed);
    } catch (e) {
      console.warn(
        "[cv] content/cv.json invalid or unreadable — using built-in fallback.",
        e,
      );
    }
  }

  const headline = serverEnv().CV_HEADLINE_APPLYING_FOR?.trim();
  if (headline) {
    return { ...data, headlineApplyingFor: headline };
  }
  return data;
}
