"use client";

import { useCallback, useState } from "react";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Portrait frame ~520×598 — full photo visible, no square crop. */
const frameClass =
  "w-44 max-h-[13.5rem] overflow-hidden rounded-xl border-2 border-white/10 bg-zinc-900/40 shadow-lg print:w-[9.25rem] print:max-h-[10.5rem] print:border-black/20 print:bg-zinc-100";

export function CvAvatar({
  name,
  photo,
}: {
  name: string;
  photo: { src: string; alt: string };
}) {
  const [failed, setFailed] = useState(false);

  const onError = useCallback(() => {
    setFailed(true);
  }, []);

  if (failed) {
    return (
      <div
        className={`${frameClass} flex aspect-[520/598] items-center justify-center border-dashed bg-zinc-800/80 text-3xl font-semibold text-zinc-400 print:bg-zinc-200 print:text-zinc-600`}
        aria-hidden
      >
        {initials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local public/ asset; onError fallback
    <img
      src={photo.src}
      alt={photo.alt}
      width={176}
      height={202}
      onError={onError}
      className={`${frameClass} h-auto object-contain object-center`}
    />
  );
}
