"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  RepoRitualClouds,
  type RitualRepoLink,
} from "@/components/repo-ritual-clouds";

type Phase = "sit" | "summon";

type Props = {
  repos: RitualRepoLink[];
  demoRepos?: boolean;
};

export function StaffRitualScene({ repos, demoRepos = false }: Props) {
  const [runId, setRunId] = useState(0);
  const [phase, setPhase] = useState<Phase>("sit");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setPhase("sit");
      setShake(false);
    });
    const t = window.setTimeout(() => {
      setShake(true);
      setPhase("summon");
    }, 1900);
    return () => {
      window.clearTimeout(t);
    };
  }, [runId]);

  return (
    <div className="relative flex min-h-[calc(100vh-5.5rem)] flex-col items-center justify-center overflow-x-hidden px-4 py-10 pb-16">
      {demoRepos ? (
        <p className="absolute left-4 right-4 top-12 z-[40] rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-100/95 sm:left-auto sm:right-auto sm:max-w-lg">
          Nisu učitani repo oblaci. Proveri{" "}
          <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
            GITHUB_USERNAME
          </code>{" "}
          /{" "}
          <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
            GITHUB_TOKEN
          </code>
          , pa restartuj dev server. Oblaci prikazuju samo projekte sa deploy linkom
          (GitHub Website ili Netlify).
        </p>
      ) : null}
      <p className="absolute left-4 top-4 z-[40] max-w-xs text-xs text-zinc-500">
        Lab · Aang — oblaci su samo projekti sa deploy linkom (otvaraju live sajt)
      </p>
      <button
        type="button"
        onClick={() => setRunId((n) => n + 1)}
        className="absolute right-4 top-4 z-[40] rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-cyan-500/40 hover:bg-white/10 hover:text-white"
      >
        Ponovi animaciju
      </button>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgb(6 182 212 / 0.3), transparent 55%), radial-gradient(circle at 78% 72%, rgb(139 92 246 / 0.18), transparent 45%)",
        }}
      />

      <div className="relative aspect-square w-full max-w-[min(100%,440px)]">
        {/* centar (1 bljesak) + široki echo */}
        {phase === "summon" ? (
          <>
            <div
              className="pointer-events-none absolute left-1/2 top-[78%] z-[1] -translate-x-1/2 -translate-y-1/2"
              aria-hidden
            >
              <div className="staff-ritual-impact-ring h-32 w-32 rounded-full border border-cyan-300/70 shadow-[0_0_16px_3px_rgba(34,211,238,0.42)]" />
            </div>
            <div
              className="pointer-events-none absolute left-1/2 top-[78%] z-[1] -translate-x-1/2 -translate-y-1/2"
              aria-hidden
            >
              <div className="staff-ritual-impact-ring-echo h-32 w-32 rounded-full border border-cyan-100/40 shadow-[0_0_44px_18px_rgba(34,211,238,0.26)]" />
            </div>
          </>
        ) : null}

        <RepoRitualClouds
          repos={repos}
          show={phase === "summon"}
          animKey={runId}
        />

        {/* Klaster iza Aanga; posle rasteka oblaci ispred (veći z-index u RepoRitualClouds) */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[3] w-[92%] max-w-[400px] -translate-x-1/2 -translate-y-[48%]">
          <div className={shake ? "staff-ritual-shake" : undefined}>
            <div key={runId} className="staff-ritual-aang-fade-in">
              <div className="staff-ritual-aang-sit">
                <Image
                  src="/aang-ritual.png"
                  alt="Aang — The Last Airbender (fan art), borbeni stav sa štapom"
                  width={800}
                  height={900}
                  priority
                  className="h-auto w-full select-none object-contain drop-shadow-2xl"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-[30] mt-10 max-w-md text-center text-sm text-zinc-500">
        Slika je u{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-400">
          web/public/aang-ritual.png
        </code>
        . Imena repozitorijuma sa GitHub liste (inače rezervna imena).
      </p>
    </div>
  );
}
