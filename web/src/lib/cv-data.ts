/**
 * Centralni podaci za /cv — menjaj ovaj fajl kao ranije main.js + HTML.
 * Fotografija: kopiraj `Photo_me.jpg` iz CVApp u `web/public/Photo_me.jpg`
 * (isto ime kao u starom index.html). Ako fajl nedostaje, prikazaće se inicijali.
 */

export type CvLink = { label: string; href: string };

export type CvExperienceBlock = {
  company: string;
  period?: string;
  roleTitle?: string;
  bullets: string[];
};

export type CvEducationBlock = {
  institution: string;
  period?: string;
  bullets: string[];
};

export const cvData = {
  name: "Nebojša Šimović",

  /** Kratak naslov ispod imena (npr. za koju prijavu CV trenutno ciljaš). */
  headlineApplyingFor:
    "IT Bootcamp - Testiranje Softvera (QA) - Kurs",

  /** Kratka biografija (varijanta iz main.js / aboutMe2). */
  about: `I have turned my passion for coding into a reality by actively building applications and expanding my knowledge in modern technologies. I thrive on problem-solving and continuously refine my skills in JavaScript (Vue, React) and Python. Throughout my journey, I have embraced AI as a mentor, exploring how it enhances creativity and efficiency in development. Now, I am eager to join a team where I can apply my expertise to real-world projects, collaborate, and continue growing.`,

  photo: {
    src: "/Photo_me.jpg",
    alt: "Nebojša Šimović",
  },

  languages: [{ label: "English", level: "Intermediate" }],

  contact: {
    email: "nebojsa.simovic@outlook.com",
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
      company: "IT Practice Center – ENON Solutions",
      period: "Nov 2024 – Feb 2025",
      roleTitle: "Web Development",
      bullets: [
        "Vue.js, Router/Pinia, VueUse, MySQL",
        "Practical frontend techniques and project teamwork",
      ],
    },
    {
      company: "Goc-Developement (GitHub Project)",
      roleTitle: "Frontend & AI Integration",
      bullets: [
        "Maintained multi-branch repo",
        "Implemented frontend features and AI workflows",
      ],
    },
  ] satisfies CvExperienceBlock[],

  education: [
    {
      institution: "ITAcademy – Frontend JavaScript Development",
      period: "Nov 2023 – Jul 2024",
      bullets: [
        "Advanced JS, CSS, HTML, TypeScript",
        "REST API, Express, Vue, React, Angular",
      ],
    },
    {
      institution: "ITAcademy – AI & Python Development",
      period: "Nov 2024 – Present",
      bullets: [
        "OOP Python, Data Analysis & Visualization",
        "Cloud Data Engineering, Machine Learning",
      ],
    },
    {
      institution: "Faculty of Forestry, Belgrade",
      period: "2011",
      bullets: ["Wood Processing Engineer – Master Degree"],
    },
  ] satisfies CvEducationBlock[],

  skills: [
    "JavaScript",
    "Vue3",
    "React",
    "Node.js",
    "Express",
    "Python",
    "Git/GitHub",
    "REST API",
    "Websocket",
    "CSS/HTML",
    "Tailwind",
    "Bootstrap",
    "Figma",
    "Data Visualization",
    "AI Tools (Copilot, Claude, Gemini, Cursor, Antigravity AI)",
  ],

  portfolioLinks: [
    { label: "Nastavna Baza Goc", href: "https://nastavnabazagoc.netlify.app" },
    { label: "Quizi App", href: "https://quizi-if-not-busy.netlify.app/" },
    { label: "Open Meteo", href: "https://openmeteo.netlify.app/" },
    { label: "Weather Forecast", href: "https://weatherforecastom.netlify.app/" },
    { label: "Kuvar App", href: "https://kuvar.netlify.app/" },
    { label: "E-Korpa", href: "https://e-korpa2.netlify.app/" },
  ] satisfies CvLink[],
};
