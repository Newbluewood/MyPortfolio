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
export const PROJECT_GROUP_CHIP_LABEL: Record<ProjectGroupId, { en: string; sr: string }> = {
  early_static: { en: "Early work", sr: "Rani rad" },
  nodejs_env:   { en: "Node.js",    sr: "Node.js" },
  python:       { en: "Python",     sr: "Python" },
  csr_framework:{ en: "CSR / SPA",  sr: "CSR / SPA" },
  fullstack:    { en: "Full stack", sr: "Full stack" },
  ai_vibe:      { en: "AI / Vibe",  sr: "AI / Vibe" },
  wordpress:    { en: "WordPress",  sr: "WordPress" },
  other:        { en: "Other",      sr: "Ostalo" },
};

export const PROJECT_GROUP_META: Record<
  ProjectGroupId,
  { title: { en: string; sr: string }; intro: { en: string; sr: string } }
> = {
  early_static: {
    title: { en: "Early work", sr: "Rani radovi" },
    intro: {
      en: "HTML, CSS and JavaScript without a build environment — directly in the browser and editor.",
      sr: "HTML, CSS i JavaScript bez build okruženja — direktno u pregledaču i editoru.",
    },
  },
  nodejs_env: {
    title: { en: "Node.js & custom setup", sr: "Node.js i sopstveno okruženje" },
    intro: {
      en: "Node.js, more advanced JavaScript (modules, classes, tests), and tooling assembled around the project.",
      sr: "Node.js, napredniji JavaScript (moduli, klase, testovi) i alati koje si sam složio oko projekta.",
    },
  },
  python: {
    title: { en: "Python", sr: "Python" },
    intro: {
      en: "Python in the project: scripts, OOP, data analysis or backend (e.g. FastAPI) — including course material.",
      sr: "Python u projektu: skripte, OOP, analiza podataka ili backend (npr. FastAPI) — uključujući materijal sa kursa.",
    },
  },
  csr_framework: {
    title: { en: "Client-side frameworks (CSR)", sr: "Klijentski frameworki (CSR)" },
    intro: {
      en: "Apps built with client-side frameworks — primarily Vue / SPA flow.",
      sr: "Aplikacije u klijentskim frameworkima — prvenstveno Vue / SPA tok.",
    },
  },
  fullstack: {
    title: { en: "Full stack", sr: "Full stack" },
    intro: {
      en: "Vite, Express, MySQL and similar — or cloud-hosted projects with a full stack.",
      sr: "Vite, Express, MySQL i slično — ili hostovanje na cloud servisima sa punim stogom.",
    },
  },
  ai_vibe: {
    title: { en: "Vibe coding & AI development", sr: "Vibe coding i AI razvoj" },
    intro: {
      en: "Experiments with AI tools, editor assistants and rapid iteration.",
      sr: "Eksperimenti sa AI alatima, asistentima u editoru i brzim iteracijama.",
    },
  },
  wordpress: {
    title: { en: "WordPress", sr: "WordPress" },
    intro: {
      en: "Content sites built with WordPress.",
      sr: "Sadržajski sajtovi u WordPressu.",
    },
  },
  other: {
    title: { en: "Other", sr: "Ostalo" },
    intro: {
      en: "Course material, experiments, and projects that don't fit the other categories.",
      sr: "Materijal za kurs, probe i projekti koji ne upadaju u ostale oznake.",
    },
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
    id: "zenhire-metro-dispatcher",
    name: "Metro Dispatcher (ZenHire Hackathon)",
    description:
      "48h ZenHire AI Coding Hackathon (Startit × CDT Hub): working-memory assessment game prototype built with Lovable; live demo on Lovable deploy.",
    liveUrl: "https://station-recall-game.lovable.app/",
    groupIds: ["ai_vibe"],
    language: "Lovable / AI",
    listedAt: "2026-04-15T12:00:00Z",
  },
  {
    id: "atrijum-wordpress",
    name: "Atrijum (Šumarski fakultet)",
    description:
      "WordPress sajt za objekat Atrijum — Univerzitet u Beogradu, Šumarski fakultet (Apr–Maj 2026). U produkciji na fakultetskom serveru.",
    liveUrl: "https://atrijum.sfb.bg.ac.rs",
    groupIds: ["wordpress"],
    language: "WordPress",
    listedAt: "2026-05-01T12:00:00Z",
  },
];

/**
 * Forsiran „Live site” URL po GitHub `owner/repo` (mala slova), kad automatski
 * lanac (GitHub About / Netlify / README) da prazan ili pogrešan link na Vercelu bez tokena.
 * Dopuni po potrebi (npr. CookBook2025 kad imaš tačan deploy).
 */
export const GITHUB_REPO_LIVE_URL_OVERRIDES: Record<string, string> = {
  "newbluewood/nastavna-baza-goc": "https://nastavnabazagoc.netlify.app",
};
