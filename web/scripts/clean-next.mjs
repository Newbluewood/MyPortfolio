import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".next", path.join("node_modules", ".cache")]) {
  const p = path.join(root, name);
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("removed", p);
  } catch (e) {
    if (e && e.code !== "ENOENT") console.warn(e);
  }
}
