"use client";

import { useEffect, useState } from "react";

import { AangLottieScene } from "@/components/aang-lottie-scene";
import { StaffRitualScene } from "@/components/staff-ritual-scene";
import type { RitualRepoLink } from "@/components/repo-ritual-clouds";

const LOTTIE_URL = "/lottie/aang-ritual.json";

type Props = {
  repos: RitualRepoLink[];
  /** true kada GitHub/Netlify učitavanje ne uspe — prikaz upozorenja; oblaci su prazni. */
  demoRepos?: boolean;
};

export function AangRitualScene({ repos, demoRepos = false }: Props) {
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
        Proveravam da li postoji Lottie fajl…
      </div>
    );
  }

  if (status === "lottie" && data) {
    return <AangLottieScene animationData={data} repos={repos} demoRepos={demoRepos} />;
  }

  return <StaffRitualScene repos={repos} demoRepos={demoRepos} />;
}
