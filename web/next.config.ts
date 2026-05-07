import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

const repoRoot = path.resolve(__dirname, "..");
loadEnvConfig(repoRoot);
loadEnvConfig(path.resolve(__dirname));

const nextConfig: NextConfig = {
  // Allow dev HMR when opening the app via LAN IP (e.g. phone / another PC).
  allowedDevOrigins: ["192.168.1.11"],

  // Dev runs with `next dev --webpack` (see package.json). Turbopack default on Next 16
  // often pegs CPU on Windows in monorepos; webpack is steadier here.
  webpack: (config, { dev }) => {
    if (dev) {
      const root = repoRoot.replace(/\\/g, "/");
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          `${root}/venv/**`,
          `${root}/data/**`,
          `${root}/api/**`,
          "**/node_modules/**",
        ],
      };
    }
    return config;
  },

  // Monorepo: root + web both have package-lock.json — pin tracing root to `web/`.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
