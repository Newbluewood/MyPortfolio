import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");
const srcDir = path.join(repoRoot, "content");
const destDir = path.join(webRoot, "_content");

async function main() {
  await fs.mkdir(destDir, { recursive: true });
  let entries;
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch (e) {
    console.warn("sync-content: no repo content/ folder at", srcDir, e);
    return;
  }
  let n = 0;
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (e.name === "cv.json") {
      await fs.copyFile(path.join(srcDir, e.name), path.join(destDir, e.name));
      n += 1;
      continue;
    }
    if (e.name.endsWith(".md")) {
      await fs.copyFile(path.join(srcDir, e.name), path.join(destDir, e.name));
      n += 1;
    }
  }
if (n) console.log(`sync-content: ${n} content file(s) -> ${destDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
