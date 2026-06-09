import type { CvData } from "@/lib/cv-schema";

/** Koristi se samo ako `content/cv.json` nedostaje ili je neispravan. */
export const cvDataFallback: CvData = {
  name: "Nebojša Simović",
  headlineApplyingFor: "Developer Next Generation",
  about:
    "I have turned my passion for coding into a reality by actively building applications and expanding my knowledge in modern technologies. I thrive on problem-solving and continuously refine my skills in JavaScript (Vue, React) and Python. Throughout my journey, I have used AI tooling to accelerate learning and delivery, exploring how it enhances creativity and efficiency in development. Now, I am eager to join a team where I can apply my expertise to real-world projects, collaborate, and continue growing.",
  aboutSr:
    "Svoju strast prema programiranju sam pretvorio u stvarnost — aktivno gradim aplikacije i proširujem znanje u modernim tehnologijama. Volim rešavanje problema i stalno unapređujem veštine u JavaScript-u (Vue, React) i Python-u. Na svom putu koristio sam AI alate da ubrzam učenje i isporuku, istražujući kako poboljšavaju kreativnost i efikasnost u razvoju. Sada sam spreman da se pridružim timu gde mogu primeniti svoja znanja na realnim projektima, sarađivati i nastaviti da rastem.",
  photo: {
    src: "/Photo_me.jpg",
    alt: "Nebojša Simović",
  },
  languages: [{ label: "English", level: "Intermediate" }],
  contact: {
    email: "nebojsa.simovic@outlook.com",
    location: "Belgrade, Serbia",
    locationSr: "Beograd, Srbija",
    linkedIn: {
      href: "https://www.linkedin.com/in/nebojsa-simovic-68258612",
      label: "linkedin.com/in/nebojsa-simovic-68258612",
    },
    github: {
      href: "https://github.com/Newbluewood",
      label: "github.com/Newbluewood",
    },
  },
  experience: [
    {
      company: "Nastavna Baza Goc (GitHub Project)",
      period: "May 2026",
      roleTitle: "Full Stack & AI Integration",
      roleTitleSr: "Full Stack i AI integracija",
      bullets: [
        "Monorepo: Vue 3 + Vite frontend and Node.js/Express backend (MySQL, Qdrant, OpenAI, JWT).",
        "Maintained multi-branch repo and implemented frontend features across multiple sprints.",
        "Integrated a chat agent microservice with RAG pipeline on the backend.",
      ],
      bulletsSr: [
        "Monorepo: Vue 3 + Vite frontend i Node.js/Express backend (MySQL, Qdrant, OpenAI, JWT).",
        "Održavao repo sa više grana i implementirao frontend funkcionalnosti kroz više sprintova.",
        "Integrisao mikroservis chat agenta sa RAG pipeline-om na backend strani.",
      ],
    },
    {
      company: "ZenHire AI Coding Hackathon (Startit x CDT Hub)",
      period: "Apr 2026 (48h)",
      roleTitle: "Hackathon Participant",
      roleTitleSr: "Učesnik hakatona",
      bullets: [
        "Built an AI-driven game prototype with hiring and psychometric mechanics during a 48-hour sprint.",
        "Collaborated in a fast vibe-coding workflow and delivered a functional demo under deadline pressure.",
      ],
      bulletsSr: [
        "Napravio prototip AI igre sa mehanizmima zapošljavanja i psihometrije tokom 48-satnog sprinta.",
        "Sarađivao u brzom vibe-coding toku rada i isporučio funkcionalan demo pod vremenskim pritiskom.",
      ],
    },
    {
      company: "IT Practice Center – ENON Solutions",
      period: "Nov 2024 – Feb 2025",
      roleTitle: "Web Development",
      roleTitleSr: "Web razvoj",
      bullets: [
        "Vue.js, Router/Pinia, VueUse, MySQL",
        "Practical frontend techniques and project teamwork",
      ],
      bulletsSr: [
        "Vue.js, Router/Pinia, VueUse, MySQL",
        "Praktične frontend tehnike i timski rad na projektu",
      ],
    },
  ],
  education: [
    {
      institution: "UKISAI Academy - AI Bootcamp",
      period: "4-week intensive program (2026)",
      bullets: [
        "Completed practical AI bootcamp focused on product building and modern AI tooling.",
        "Earned bootcamp completion certificate.",
      ],
      bulletsSr: [
        "Završio praktičan AI bootcamp fokusiran na izgradnju produkata i moderne AI alate.",
        "Stekao sertifikat o završetku bootcampa.",
      ],
    },
    {
      institution: "ITAcademy – AI & Python Development",
      period: "Nov 2024 – Jun 2026",
      bullets: [
        "OOP Python, Data Analysis & Visualization",
        "Cloud Data Engineering, Machine Learning",
      ],
      bulletsSr: [
        "OOP Python, analiza i vizuelizacija podataka",
        "Cloud data inženjering, mašinsko učenje",
      ],
    },
    {
      institution: "ITAcademy – Frontend JavaScript Development",
      period: "Nov 2023 – Jul 2024",
      bullets: [
        "Advanced JS, CSS, HTML, TypeScript",
        "REST API, Express, Vue, React, Angular",
      ],
      bulletsSr: [
        "Napredni JS, CSS, HTML, TypeScript",
        "REST API, Express, Vue, React, Angular",
      ],
    },
    {
      institution: "Faculty of Forestry, Belgrade",
      period: "2011",
      bullets: ["Wood Processing Engineer – Master Degree"],
      bulletsSr: ["Inženjer prerade drveta – Master diploma"],
    },
  ],
  credentials: [],
  skills: [
    "JavaScript",
    "Vue3",
    "React",
    "Node.js",
    "Express",
    "Python",
    "R",
    "Jupyter",
    "ML",
    "Data Analysis",
    "AWS",
    "Git/GitHub",
    "REST API",
    "Websocket",
    "CSS/HTML",
    "Tailwind",
    "Bootstrap",
    "Figma",
    "Data Visualization",
    "AI Tools (Copilot, Claude, Gemini, Cursor, Antigravity AI, Loveable)",
  ],
  portfolioLinks: [
    {
      label: "ZenHire AI Coding Hackathon (Startit)",
      href: "https://startit.rs/zenhire-ai-coding-hackathon-gradi-igru-koja-zaposljava-48-sati-vibe-codinga-i-psihometrije-25-i-26-aprila-u-cdt-hub-u-u-beogradu/",
      description:
        "48-hour hackathon — AI game prototype with hiring and psychometric mechanics.",
      descriptionSr:
        "48h hakaton — prototip AI igre sa zapošljavanjem i psihometrijom.",
    },
    {
      label: "Nastavna Baza Goc",
      href: "https://nastavnabazagoc.netlify.app",
      description:
        "Teaching monorepo: Vue 3, Express, MySQL, and a RAG classroom assistant.",
      descriptionSr:
        "Nastavni monorepo: Vue 3, Express, MySQL i RAG asistent u učionici.",
    },
    {
      label: "Quizi App",
      href: "https://quizi-if-not-busy.netlify.app/",
      description: "ITAcademy capstone — Vue 3 quiz app with Router and Pinia.",
      descriptionSr:
        "Završni rad ITAcademy — Vue 3 kviz aplikacija (Router, Pinia).",
    },
    {
      label: "Open Meteo",
      href: "https://openmeteo.netlify.app/",
      description: "Weather UI on Open-Meteo API (Nunjucks, jQuery, Bulma).",
      descriptionSr:
        "Vremenska aplikacija preko Open-Meteo API-ja (Nunjucks, jQuery, Bulma).",
    },
    {
      label: "Weather Forecast",
      href: "https://weatherforecastom.netlify.app/",
      description: "Internship qualification task — API-driven weather frontend.",
      descriptionSr:
        "Kvalifikacioni zadatak za praksu — frontend nad weather API-jem.",
    },
    {
      label: "Kuvar App",
      href: "https://kuvar.netlify.app/",
      description: "Vue 3 cookbook with hosted backend and MySQL.",
      descriptionSr:
        "Vue 3 kuvar aplikacija sa hostovanim backendom i MySQL bazom.",
    },
    {
      label: "Gemini Models List App",
      href: "https://github.com/Newbluewood/Gemini-Models-List-App",
      description:
        "Catalog and playground for 52 Google Gemini models (Express proxy).",
      descriptionSr: "Katalog i playground za 52 Gemini modela (Express proxy).",
    },
  ],
};
