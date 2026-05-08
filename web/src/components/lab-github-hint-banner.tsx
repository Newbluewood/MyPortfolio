/** Lab /test-animation: zašto su oblaci prazni ili nisu učitani. */
export type LabGithubHint = "none" | "missing_identity" | "fetch_failed";

export function LabGithubHintBanner({ hint }: { hint: LabGithubHint }) {
  if (hint === "none") return null;

  const box =
    "absolute left-4 right-4 top-12 z-[40] rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100/95 sm:left-auto sm:right-auto sm:max-w-lg";

  if (hint === "missing_identity") {
    return (
      <p className={box}>
        Nisu učitani repo oblaci — u <strong className="font-medium">root</strong>{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">.env</code>{" "}
        dodaj bar jedno:{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
          NEXT_PUBLIC_GITHUB_URL
        </code>{" "}
        (URL profila),{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
          GITHUB_USERNAME
        </code>{" "}
        ili{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
          GITHUB_TOKEN
        </code>
        , pa restartuj <code className="font-mono text-[10px]">next dev</code>. Oblaci
        su samo projekti sa deploy linkom (GitHub Website ili Netlify).
      </p>
    );
  }

  return (
    <p className={box}>
      GitHub / Netlify podaci nisu učitani (izuzetak na serveru — npr. mreža, rate
      limit, pogrešan token). Proveri terminal za{" "}
      <code className="font-mono text-[10px]">next dev</code> i pokreni{" "}
      <code className="font-mono text-[10px]">npm run doctor</code>. Ako je{" "}
      <code className="font-mono text-[10px]">NEXT_PUBLIC_GITHUB_URL</code> tek
      dodat, obavezno restartuj dev server. Oblaci i dalje: samo projekti sa deploy
      linkom.
    </p>
  );
}
