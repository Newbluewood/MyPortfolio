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
        className="flex h-44 w-44 items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-zinc-800/80 text-3xl font-semibold text-zinc-400 print:border-black/25 print:bg-zinc-200 print:text-zinc-600"
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
      height={176}
      onError={onError}
      className="h-44 w-44 rounded-xl border-2 border-white/10 object-cover object-top shadow-lg print:h-40 print:w-40 print:border-black/20"
    />
  );
}
