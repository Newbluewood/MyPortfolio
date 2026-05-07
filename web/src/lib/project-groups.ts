/**
 * Oznake (kategorije) na /projects — jedan repo može imati više oznaka.
 * Izmeni `repoNameToGroups`: niz ID-jeva po `repo.name` sa GitHuba.
 */

export type ProjectGroupId =
  | "early_static"
  | "nodejs_env"
  | "python"
  | "csr_framework"
  | "fullstack"
  | "ai_vibe"
  | "wordpress"
  | "other";

export const PROJECT_GROUP_ORDER: ProjectGroupId[] = [
  "early_static",
  "nodejs_env",
  "python",
  "csr_framework",
  "fullstack",
  "ai_vibe",
  "wordpress",
  "other",
];

/** Kratak tekst na narandžastim čipovima (tooltip = meta.intro). */
export const PROJECT_GROUP_CHIP_LABEL: Record<ProjectGroupId, string> = {
  early_static: "Rani rad",
  nodejs_env: "Node.js",
  python: "Python",
  csr_framework: "CSR / SPA",
  fullstack: "Full stack",
  ai_vibe: "AI / Vibe",
  wordpress: "WordPress",
  other: "Ostalo",
};

export const PROJECT_GROUP_META: Record<
  ProjectGroupId,
  { title: string; intro: string }
> = {
  early_static: {
    title: "Rani radovi",
    intro:
      "HTML, CSS i JavaScript bez build okruženja — direktno u pregledaču i editoru.",
  },
  nodejs_env: {
    title: "Node.js i sopstveno okruženje",
    intro:
      "Node.js, napredniji JavaScript (moduli, klase, testovi) i alati koje si sam složio oko projekta.",
  },
  python: {
    title: "Python",
    intro:
      "Python u projektu: skripte, OOP, analiza podataka ili backend (npr. FastAPI) — uključujući materijal sa kursa.",
  },
  csr_framework: {
    title: "Klijentski frameworki (CSR)",
    intro: "Aplikacije u klijentskim frameworkima — prvenstveno Vue / SPA tok.",
  },
  fullstack: {
    title: "Full stack",
    intro:
      "Vite, Express, MySQL i slično — ili hostovanje na cloud servisima sa punim stogom.",
  },
  ai_vibe: {
    title: "Vibe coding i AI razvoj",
    intro:
      "Eksperimenti sa AI alatima, asistentima u editoru i brzim iteracijama.",
  },
  wordpress: {
    title: "WordPress",
    intro: "Sadržajski sajtovi u WordPressu.",
  },
  other: {
    title: "Ostalo",
    intro: "Materijal za kurs, probe i projekti koji ne upadaju u ostale oznake.",
  },
};

/** Više oznaka po imenu repozitorijuma (tačno kako na GitHubu). */
const repoNameToGroups: Record<string, ProjectGroupId[]> = {
  MemoGemo: ["early_static"],
  HangMan: ["early_static"],

  openmeteo: ["early_static"],

  "Jest-Test-Inter": ["nodejs_env"],
  CB_Internship: ["nodejs_env"],
  Korpa1: ["nodejs_env"],
  Korpa2: ["nodejs_env"],
  "To-Do": ["nodejs_env"],

  Quizi: ["csr_framework"],
  CookBook2025: ["csr_framework"],
  "Weather-OM": ["csr_framework"],

  Kuvar: ["fullstack", "csr_framework"],

  "nastavna-baza-goc": ["ai_vibe", "fullstack"],

  "CCD_Test_PracticeCenter---JSFD-NebojsaSimovic": ["other"],
  online_sales_analysis: ["python"],
  "Proba-GH": ["other"],
  "my-first-repo": ["other"],
  "netlify-feature-tour": ["other"],
  "pevac-irdin": ["other"],
};

function sortAndDedupeGroupIds(ids: ProjectGroupId[]): ProjectGroupId[] {
  const set = new Set(ids);
  const primary: ProjectGroupId[] = [];
  for (const id of PROJECT_GROUP_ORDER) {
    if (set.has(id)) primary.push(id);
  }
  const rest: ProjectGroupId[] = [];
  for (const id of ids) {
    if (!primary.includes(id) && !rest.includes(id)) rest.push(id);
  }
  return [...primary, ...rest];
}

export function projectGroupIdsForRepoName(name: string): ProjectGroupId[] {
  const direct = repoNameToGroups[name];
  if (direct?.length) return sortAndDedupeGroupIds(direct);
  const key = name.replace(/[-_]/g, "").toLowerCase();
  for (const [k, groups] of Object.entries(repoNameToGroups)) {
    if (k.replace(/[-_]/g, "").toLowerCase() === key && groups.length) {
      return sortAndDedupeGroupIds(groups);
    }
  }
  return ["other"];
}

/** GitHub `language` + ručna mapa — dodaje „python” čip kad je primarni jezik Python. */
export function projectGroupIdsForRepo(repo: {
  name: string;
  language: string | null;
}): ProjectGroupId[] {
  const base = projectGroupIdsForRepoName(repo.name);
  if (repo.language === "Python") {
    return sortAndDedupeGroupIds([...base, "python"]);
  }
  return base;
}

/** Prva oznaka — samo ako negde treba jedna vrednost. */
export function projectGroupIdForRepoName(name: string): ProjectGroupId {
  return projectGroupIdsForRepoName(name)[0] ?? "other";
}

export type ManualProject = {
  id: string;
  name: string;
  description: string;
  liveUrl: string;
  sourceUrl?: string;
  groupIds: ProjectGroupId[];
  language?: string | null;
  /** ISO 8601 — uključi u isti hronološki red sa GitHub repou (najnoviji gore). */
  listedAt: string;
};

export const MANUAL_PROJECTS: ManualProject[] = [
  {
    id: "atrijum-wordpress",
    name: "Atrijum (Šumarski fakultet)",
    description:
      "Realizovan projekat na WordPressu za Atrijum — Šumarski fakultet Univerziteta u Beogradu.",
    liveUrl: "https://atrijum.sfb.bg.ac.rs",
    groupIds: ["wordpress"],
    language: "WordPress",
    listedAt: "2024-09-01T12:00:00Z",
  },
];
