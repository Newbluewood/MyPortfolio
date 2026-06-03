"use client";

import Link from "next/link";

import { useLang } from "@/lib/i18n/context";

export function LabBackLink() {
  const { T } = useLang();
  return (
    <Link
      href="/projects"
      className="text-sm text-cyan-400/90 underline-offset-4 hover:underline"
    >
      {T.lab.scene.backToProjects}
    </Link>
  );
}
