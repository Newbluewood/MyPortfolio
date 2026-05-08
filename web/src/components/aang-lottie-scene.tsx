"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useCallback, useRef, useState } from "react";

import {
  type LabGithubHint,
  LabGithubHintBanner,
} from "@/components/lab-github-hint-banner";
import {
  RepoRitualClouds,
  type RitualRepoLink,
} from "@/components/repo-ritual-clouds";

type Props = {
  animationData: object;
  repos: RitualRepoLink[];
  labGithubHint?: LabGithubHint;
};

export function AangLottieScene({
  animationData,
  repos,
  labGithubHint = "none",
}: Props) {
  const [finished, setFinished] = useState(false);
  const [replayId, setReplayId] = useState(0);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const replay = useCallback(() => {
    setFinished(false);
    setReplayId((k) => k + 1);
    requestAnimationFrame(() => {
      lottieRef.current?.goToAndPlay(0, true);
    });
  }, []);

  return (
    <div className="relative flex min-h-[calc(100vh-5.5rem)] flex-col items-center justify-center overflow-x-hidden px-4 py-10 pb-16">
      <LabGithubHintBanner hint={labGithubHint} />
      <p className="absolute left-4 top-4 z-[40] max-w-xs text-xs text-zinc-500">
        Lab · Lottie sekvenca (bez klika tokom animacije) · oblaci nakon kraja
      </p>
      <button
        type="button"
        onClick={replay}
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
        {finished ? (
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
          show={finished}
          animKey={replayId}
        />

        <div className="pointer-events-none relative z-[3] flex h-full min-h-[280px] items-center justify-center">
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            className="max-h-[min(72vh,520px)] w-full max-w-[440px]"
            aria-hidden
            onComplete={() => setFinished(true)}
          />
        </div>
      </div>

      <p className="relative z-[30] mt-10 max-w-lg text-center text-sm text-zinc-500">
        Stavi izvoz iz After Effects (Bodymovin / LottieFiles) u fajl{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-400">
          web/public/lottie/aang-ritual.json
        </code>
        . Oblaci sa imenima repoa pojavljuju se kada Lottie jednom završi (
        <code className="font-mono text-xs text-zinc-400">onComplete</code>
        ).
      </p>
    </div>
  );
}
