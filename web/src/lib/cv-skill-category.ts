export type CvSkillCategory = "frontend" | "backend" | "data-ai" | "tools";

const SKILL_CATEGORY: Record<string, CvSkillCategory> = {
  JavaScript: "frontend",
  Vue3: "frontend",
  React: "frontend",
  "Next.js": "frontend",
  "CSS/HTML": "frontend",
  Tailwind: "frontend",
  Bootstrap: "frontend",
  Figma: "frontend",
  WordPress: "frontend",
  "Node.js": "backend",
  Express: "backend",
  Python: "backend",
  FastAPI: "backend",
  "REST API": "backend",
  Websocket: "backend",
  R: "data-ai",
  Jupyter: "data-ai",
  ML: "data-ai",
  RAG: "data-ai",
  "Data Analysis": "data-ai",
  AWS: "data-ai",
  "Data Visualization": "data-ai",
  "AI Tools (Copilot, Claude, Gemini, Cursor, Lovable)": "data-ai",
  "Git/GitHub": "tools",
};

export function cvSkillCategory(skill: string): CvSkillCategory {
  return SKILL_CATEGORY[skill] ?? "frontend";
}

/** Chip border/background — frontend stays neutral gray; others grouped by stack. */
export function cvSkillBadgeClass(category: CvSkillCategory): string {
  const base =
    "rounded-md border px-2 py-1 text-xs print:px-1.5 print:py-0.5 print:text-[10px] print:leading-snug print:text-black";

  switch (category) {
    case "backend":
      return `${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-100/95 print:border-emerald-800/55 print:bg-emerald-50`;
    case "data-ai":
      return `${base} border-violet-500/40 bg-violet-500/10 text-violet-100/95 print:border-violet-900/50 print:bg-violet-50`;
    case "tools":
      return `${base} border-amber-500/40 bg-amber-500/10 text-amber-100/95 print:border-amber-900/50 print:bg-amber-50`;
    case "frontend":
    default:
      return `${base} border-white/10 bg-zinc-900/50 text-zinc-200 print:border-black/15 print:bg-white`;
  }
}
