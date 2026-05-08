/**
 * Pokreće se kao treći "tab" uz concurrently posle `dev:full`.
 * Čeka da API i web ustaju, pa jednom pokreće portfolio-doctor (ne blokira api/web).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const delayMs = Number(process.env.POST_DEV_DOCTOR_DELAY_MS || 14_000);

await new Promise((r) => setTimeout(r, delayMs));

console.log("\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  Post-start check (full dev) — portfolio-doctor");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const doctor = path.join(repoRoot, "scripts", "portfolio-doctor.mjs");
const r = spawnSync(process.execPath, [doctor], {
  cwd: repoRoot,
  stdio: "inherit",
  env: { ...process.env },
});

if (r.status !== 0) {
  console.log(
    "\n[post-dev-doctor] Doctor prijavio grešku — api i web i dalje rade; proveri izlaz iznad.\n",
  );
} else {
  console.log("\n[post-dev-doctor] Provera završena (exit 0). Full dev aktivan.\n");
}

process.exit(0);
