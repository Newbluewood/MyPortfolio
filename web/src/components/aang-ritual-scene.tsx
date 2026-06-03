"use client";

import { useEffect, useState } from "react";

import { AangLottieScene } from "@/components/aang-lottie-scene";
import {
  type LabGithubHint,
} from "@/components/lab-github-hint-banner";
import { StaffRitualScene } from "@/components/staff-ritual-scene";
import type { RitualRepoLink } from "@/components/repo-ritual-clouds";
import { useLang } from "@/lib/i18n/context";

const LOTTIE_URL = "/lottie/aang-ritual.json";

type Props = {
  repos: RitualRepoLink[];
  /** Lab: zašto su oblaci prazni (nema env identiteta vs. bacila se greška pri fetch-u). */
  labGithubHint?: LabGithubHint;
};

export function AangRitualScene({ repos, labGithubHint = "none" }: Props) {
  const { T } = useLang();
  const [status, setStatus] = useState<"loading" | "lottie" | "png">(
    "loading",
  );
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(LOTTIE_URL)
      .then((r) => {
        if (!r.ok) throw new Error("no lottie");
        return r.json();
      })
      .then((json: object) => {
        if (cancelled) return;
        setData(json);
        setStatus("lottie");
      })
      .catch(() => {
        if (!cancelled) setStatus("png");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        {T.lab.scene.loadingLottie}
      </div>
    );
  }

  if (status === "lottie" && data) {
    return (
      <AangLottieScene animationData={data} repos={repos} labGithubHint={labGithubHint} />
    );
  }

  return <StaffRitualScene repos={repos} labGithubHint={labGithubHint} />;
}
