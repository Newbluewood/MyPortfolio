/**
 * URL-ovi koji nisu tvoj hostovani sajt (dokumentacija, marketing, starter demoi).
 * Koristi se da GitHub „Website” / README fallback ne pokaže npr. Vite docs umesto Netlify deploya.
 */
export function isJunkOrDocsDeployUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const h = u.hostname.toLowerCase();
    const junkHosts = new Set([
      "vite.dev",
      "www.vite.dev",
      "vitejs.dev",
      "www.vitejs.dev",
      "react.dev",
      "nextjs.org",
      "vuejs.org",
      "angular.io",
      "svelte.dev",
      "webpack.js.org",
      "rollupjs.org",
      "turbo.build",
      "nodejs.org",
      "npmjs.com",
      "www.npmjs.com",
      "stackblitz.com",
      "codesandbox.io",
      "netlify.com",
      "www.netlify.com",
      "vercel.com",
      "www.vercel.com",
      "docs.github.com",
      "opensource.guide",
      "developer.mozilla.org",
      "mdn.dev",
      "web.dev",
      "aistudio.google.com",
      "makersuite.google.com",
      "ai.google.dev",
      "console.cloud.google.com",
      "cloud.google.com",
      "huggingface.co",
      "openai.com",
      "platform.openai.com",
    ]);
    if (junkHosts.has(h)) return true;
    if (h === "github.com" || h === "www.github.com") return true;
    return false;
  } catch {
    return true;
  }
}
