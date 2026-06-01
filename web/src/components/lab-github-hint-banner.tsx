"use client";

import { useLang } from "@/lib/i18n/context";

/** Lab /test-animation: zašto su oblaci prazni ili nisu učitani. */
export type LabGithubHint = "none" | "missing_identity" | "fetch_failed";

export function LabGithubHintBanner({ hint }: { hint: LabGithubHint }) {
  const { T } = useLang();
  if (hint === "none") return null;

  const box =
    "absolute left-4 right-4 top-12 z-[40] rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100/95 sm:left-auto sm:right-auto sm:max-w-lg";

  if (hint === "missing_identity") {
    return (
      <p className={box}>
        {T.lab.hint.missingIdentity.intro}{" "}
        <strong className="font-medium">root</strong>{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">.env</code>{" "}
        {T.lab.hint.missingIdentity.addAtLeastOne}{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
          NEXT_PUBLIC_GITHUB_URL
        </code>{" "}
        {T.lab.hint.missingIdentity.profileUrl},{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
          GITHUB_USERNAME
        </code>{" "}
        {T.lab.hint.missingIdentity.or}{" "}
        <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
          GITHUB_TOKEN
        </code>
        , {T.lab.hint.missingIdentity.restart}{" "}
        <code className="font-mono text-[10px]">next dev</code>.{" "}
        {T.lab.hint.missingIdentity.note}
      </p>
    );
  }

  return (
    <p className={box}>
      {T.lab.hint.fetchFailed.intro} {T.lab.hint.fetchFailed.checkTerminal}{" "}
      <code className="font-mono text-[10px]">next dev</code>{" "}
      {T.lab.hint.fetchFailed.andRun}{" "}
      <code className="font-mono text-[10px]">npm run doctor</code>.{" "}
      {T.lab.hint.fetchFailed.restartIfAdded}{" "}
      <code className="font-mono text-[10px]">NEXT_PUBLIC_GITHUB_URL</code>,{" "}
      {T.lab.hint.fetchFailed.restartDev} {T.lab.hint.fetchFailed.note}
    </p>
  );
}
