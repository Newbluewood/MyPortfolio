import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

const repoRoot = path.resolve(__dirname, "..");
loadEnvConfig(repoRoot);
loadEnvConfig(path.resolve(__dirname));

const nextConfig: NextConfig = {
  // Allow dev HMR when opening the app via LAN IP (e.g. phone / another PC).
  allowedDevOrigins: ["192.168.1.11"],

  // Monorepo: trace od korena repoa da serverless na Vercelu uključi ispravne fajlove.
  // Inače `/` može vratiti Vercel 404 NOT_FOUND. Teški folderi isključeni ispod.
  outputFileTracingRoot: path.join(__dirname, ".."),
  outputFileTracingExcludes: {
    "*": [
      "**/venv/**",
      "**/api/**",
      "**/data/**",
      "**/.git/**",
    ],
  },

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
};

export default nextConfig;
