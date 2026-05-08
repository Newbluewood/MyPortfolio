/**
 * Vercel Git deploy (Next 16.2+)sometimes looks for routes-manifest-deterministic.json;
 * stock `next build` only emits routes-manifest.json. Copy if missing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nextDir = path.join(__dirname, "..", ".next");
const src = path.join(nextDir, "routes-manifest.json");
const dest = path.join(nextDir, "routes-manifest-deterministic.json");

if (!fs.existsSync(src)) {
  console.warn("ensure-vercel-routes-manifest: skip (no routes-manifest.json yet)");
  process.exit(0);
}
if (!fs.existsSync(dest)) {
  fs.copyFileSync(src, dest);
  console.log("ensure-vercel-routes-manifest: wrote routes-manifest-deterministic.json");
}
