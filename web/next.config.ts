import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

const repoRoot = path.resolve(__dirname, "..");
loadEnvConfig(repoRoot);
loadEnvConfig(path.resolve(__dirname));

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  async redirects() {
    return [
      {
        source: "/credentials/ukisai-bootcamp.pdf",
        destination: "/credentials/ukisai-bootcamp.jpg",
        permanent: true,
      },
    ];
  },

  // Allow dev HMR when opening the app via LAN IP (e.g. phone / another PC).
  allowedDevOrigins: ["192.168.1.11"],

  // Dva package-lock.json (koren + web) inače pogađaju pogrešan „workspace root“ za file tracing.
  outputFileTracingRoot: __dirname,

  // Markdown za build: `web/scripts/sync-content.mjs` (prebuild) kopira ../content u web/_content.

  // Dev: Next 15 koristi podrazumevani bundler; `next dev --webpack` je uklonjen (nije opcija na v15).
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
