"use client";

import { useEffect, useMemo, useState } from "react";

export type RitualRepoLink = {
  name: string;
  html_url: string;
};

type Props = {
  repos: RitualRepoLink[];
  show: boolean;
  /** Menja se pri replay-u da bi se ponovo pokrenuo stagger. */
  animKey: number | string;
  /** Osnovni poluprečnik kruga u %; skalira se nagomilavanjem repoa. */
  radiusPct?: number;
  /** Iza lika dok su u klasteru (npr. ispod z-[3]). */
  zClusterClass?: string;
  /** Preko lika kad se rastrkaju. */
  zSpreadClass?: string;
  clusterX?: number;
  clusterY?: number;
  spreadCenterX?: number;
  spreadCenterY?: number;
};

export function RepoRitualClouds({
  repos,
  show,
  animKey,
  radiusPct: radiusProp,
  zClusterClass = "z-[2]",
  zSpreadClass = "z-20",
  clusterX = 36,
  clusterY = 91,
  spreadCenterX = 50,
  spreadCenterY = 48,
}: Props) {
  const [spread, setSpread] = useState(false);

  useEffect(() => {
    if (!show) {
      queueMicrotask(() => setSpread(false));
      return;
    }
    queueMicrotask(() => setSpread(false));
    const t = window.setTimeout(() => setSpread(true), 480);
    return () => window.clearTimeout(t);
  }, [show, animKey]);

  const list = useMemo(() => (repos ?? []).slice(0, 14), [repos]);
  const n = Math.max(list.length, 1);

  const radiusPct = useMemo(() => {
    if (radiusProp != null) return radiusProp;
    if (n >= 12) return 54;
    if (n >= 8) return 50;
    if (n >= 5) return 46;
    return 43;
  }, [radiusProp, n]);

  if (!show) return null;

  return (
    <>
      {list.map((repo, i) => {
        // Pun krug: ravnomerno 0 … 2π (ne polukrug / podkova)
        const arcAngle =
          n <= 1 ? -Math.PI / 2 : (i / n) * 2 * Math.PI - Math.PI / 2;
        const x =
          spreadCenterX + Math.cos(arcAngle) * radiusPct;
        const y =
          spreadCenterY + Math.sin(arcAngle) * radiusPct;
        const jitter = (idx: number) => ((idx * 7) % 5) - 2;
        const cx = clusterX + jitter(i) * 0.85;
        const cy = clusterY + (i % 3) * 1.4;

        return (
          <a
            key={`${repo.name}-${i}-${animKey}`}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${repo.name} — otvori deploy`}
            className={`pointer-events-auto absolute ${spread ? zSpreadClass : zClusterClass} -translate-x-1/2 -translate-y-1/2 outline-none transition-[left,top,box-shadow] duration-[880ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[left,top] focus-visible:ring-2 focus-visible:ring-cyan-400/60`}
            style={{
              left: `${spread ? x : cx}%`,
              top: `${spread ? y : cy}%`,
            }}
          >
            <span
              className="staff-ritual-cloud-face block max-w-[9.5rem] cursor-pointer truncate rounded-[1.35rem_1rem_1.6rem_0.9rem] border border-cyan-500/25 bg-gradient-to-br from-white/[0.09] to-cyan-500/[0.06] px-3 py-2 text-center font-mono text-[11px] font-medium text-cyan-100/95 shadow-lg shadow-cyan-500/5 backdrop-blur-sm hover:border-cyan-400/45 hover:bg-white/[0.12] hover:shadow-cyan-500/20"
              style={{
                animationDelay: `${i * 0.05}s, ${0.55 + i * 0.04}s`,
              }}
            >
              {repo.name}
            </span>
          </a>
        );
      })}
    </>
  );
}
