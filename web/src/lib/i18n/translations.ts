export type Lang = "en" | "sr";

export const t = {
  en: {
    nav: {
      home: "Home",
      projects: "Projects",
      cv: "CV",
      lab: "Lab",
      contact: "Contact",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    header: { logo: "Portfolio" },
    home: {
      eyebrow: "Portfolio",
      greeting: "Hi, I'm",
      viewProjects: "View projects",
      cvResume: "CV / Resume",
      githubProfile: "GitHub profile",
      aboutEyebrow: "About",
      aboutTitle: "What I do",
      skillsEyebrow: "Stack",
      skillsTitle: "Skills",
      credentialsEyebrow: "Proof",
      credentialsTitle: "Diplomas & certificates",
      credentialsHint: "Tap a card to open the scan. Full résumé on the CV page.",
    },
    footer: {
      built: "Built with Next.js and a RAG-powered assistant.",
      labNoteLink: "Why Aang",
    },
    projects: {
      eyebrow: "Portfolio",
      title: "Projects",
      noDescription: "No description",
      additionalLink: "Additional link →",
    },
    contact: {
      eyebrow: "Hello",
      title: "Contact",
      body: "Prefer reaching out through GitHub or your usual professional channel. For questions about projects or skills, try the assistant in the corner — it uses retrieval over this site's knowledge base.",
      openGithub: "Open GitHub profile",
      envHint: "Set NEXT_PUBLIC_GITHUB_URL in your env to show a profile link here.",
    },
    cv: {
      exportPdf: "Download PDF",
      exportPdfBusy: "Generating PDF…",
      printManually: "Print manually",
      pdfDownloadFailed: "PDF download failed. Try Print manually below.",
      printHint:
        "Download PDF uses zero page margins with clickable links. Manual print: Edge → Save as PDF, Margins → None, Headers and footers off.",
      applyingForClickToEdit: "Click to edit position title (this tab only)",
      applyingForInputLabel: "Position title for this application",
      aboutMe: "About me",
      languages: "Languages",
      contactSection: "Contact",
      applyingFor: "Applying for:",
      experience: "Experience",
      education: "Education & Courses",
      credentials: "Diplomas & certificates",
      skills: "Skills",
      portfolio: "Portfolio",
      moreProjects: "More projects at /projects.",
    },
    chat: {
      title: "Nebojša",
      ariaLabel: "Chat with Nebojša",
      empty: "Ask about my skills, projects, or background. I'll answer based on what's on this site.",
      error: "Sorry — something went wrong. Is the API running?",
      inputLabel: "Message",
      placeholder: "Ask me anything…",
      send: "Send",
      fab: "Chat with Nebojša",
      close: "Close",
      sources: "Sources",
      closeChat: "Close chat",
    },
    lab: {
      hint: {
        missingIdentity: {
          intro: "Repo clouds weren’t loaded — in the repo root",
          addAtLeastOne: "add at least one:",
          profileUrl: "(profile URL)",
          or: "or",
          restart: "then restart",
          note: "Clouds show only projects with a deploy link (GitHub Website or Netlify).",
        },
        fetchFailed: {
          intro: "GitHub / Netlify data couldn’t be loaded (server exception — e.g. network, rate limit, wrong token).",
          checkTerminal: "Check the terminal for",
          andRun: "and run",
          restartIfAdded: "If you just added",
          restartDev: "restart the dev server.",
          note: "Clouds still show only projects with a deploy link.",
        },
      },
      aang: {
        heading: "Why Aang?",
        body:
          "Aang from the series Avatar: The Last Airbender remains one of those characters who keeps a childlike core — not naive, but uncorrupted and kind-hearted: through mistakes, fear, and responsibility he learns, listens, and returns to the path even when it would be easier to quit. In the end he grows from a runaway into someone who connects and unites — his strength isn’t brutality, but calm and the choice to protect what’s shared. I carry that metaphor into my projects: steady work, learning from experience, and intent for something useful to become stable (like the “deploy” clouds around him).",
        rights:
          "The character, titles, and visual world of the series belong to the rights holders (e.g. Nickelodeon / Paramount). This site doesn’t use official series material; the reference is cultural and made in a spirit of respect for the original work.",
        wikiAang: "Wikipedia — Aang",
        wikiSeries: "Wikipedia — series",
      },
      scene: {
        cornerHintPng:
          "Lab · Aang — clouds are only projects with a deploy link (they open the live site)",
        cornerHintLottie:
          "Lab · Lottie sequence (no clicks during animation) · clouds after it ends",
        replay: "Replay animation",
        loadingLottie: "Checking for a Lottie file…",
        footerImageBefore: "Image is in ",
        footerImageAfter:
          ". Repository names come from the GitHub list (otherwise placeholder names).",
        footerLottieBefore:
          "Put your After Effects export (Bodymovin / LottieFiles) in ",
        footerLottieAfter: ". Repo-name clouds appear once Lottie finishes (",
        footerLottieEnd: ").",
        aangImageAlt:
          "Aang — The Last Airbender (fan art), fighting stance with staff",
        backToProjects: "← Back to projects",
      },
    },
  },
  sr: {
    nav: {
      home: "Početna",
      projects: "Projekti",
      cv: "CV",
      lab: "Lab",
      contact: "Kontakt",
      openMenu: "Otvori meni",
      closeMenu: "Zatvori meni",
    },
    header: { logo: "Portfolio" },
    home: {
      eyebrow: "Portfolio",
      greeting: "Zdravo, ja sam",
      viewProjects: "Projekti",
      cvResume: "CV / Rezime",
      githubProfile: "GitHub profil",
      aboutEyebrow: "O meni",
      aboutTitle: "Šta radim",
      skillsEyebrow: "Stack",
      skillsTitle: "Veštine",
      credentialsEyebrow: "Dokazi",
      credentialsTitle: "Diplome i sertifikati",
      credentialsHint: "Klik na karticu otvara sken. Kompletan CV je na stranici CV.",
    },
    footer: {
      built: "Napravljeno sa Next.js i RAG asistentom.",
      labNoteLink: "Zašto Aang",
    },
    projects: {
      eyebrow: "Portfolio",
      title: "Projekti",
      noDescription: "Bez opisa",
      additionalLink: "Dodatni link →",
    },
    contact: {
      eyebrow: "Zdravo",
      title: "Kontakt",
      body: "Javite se putem GitHub-a ili uobičajenog profesionalnog kanala. Za pitanja o projektima ili veštinama, probajte asistenta u uglu — koristi preuzimanje iz baze znanja sajta.",
      openGithub: "Otvori GitHub profil",
      envHint: "Podesi NEXT_PUBLIC_GITHUB_URL u .env da bi se prikazao link ka profilu.",
    },
    cv: {
      exportPdf: "Preuzmi PDF",
      exportPdfBusy: "Generišem PDF…",
      printManually: "Štampaj ručno",
      pdfDownloadFailed: "Preuzimanje PDF-a nije uspelo. Probaj Štampaj ručno ispod.",
      printHint:
        "Preuzmi PDF koristi nulte margine stranice i klikabilne linkove. Ručna štampa: Edge → Sačuvaj kao PDF, Margine → Nema, isključi zaglavlja i podnožja.",
      applyingForClickToEdit: "Klikni da izmeniš naziv pozicije (samo u ovom tabu)",
      applyingForInputLabel: "Naziv pozicije za ovu prijavu",
      aboutMe: "O meni",
      languages: "Jezici",
      contactSection: "Kontakt",
      applyingFor: "Pozicija:",
      experience: "Iskustvo",
      education: "Obrazovanje i kursevi",
      credentials: "Diplome i sertifikati",
      skills: "Veštine",
      portfolio: "Portfolio",
      moreProjects: "Više projekata na /projects.",
    },
    chat: {
      title: "Nebojša",
      ariaLabel: "Razgovor sa Nebojšom",
      empty: "Pitaj o mojim veštinama, projektima ili iskustvu. Odgovaram na osnovu sadržaja ovog sajta.",
      error: "Nažalost, nešto nije prošlo. Da li API radi?",
      inputLabel: "Poruka",
      placeholder: "Pitaj me nešto…",
      send: "Pošalji",
      fab: "Razgovor sa Nebojšom",
      close: "Zatvori",
      sources: "Izvori",
      closeChat: "Zatvori razgovor",
    },
    lab: {
      hint: {
        missingIdentity: {
          intro: "Nisu učitani repo oblaci — u",
          addAtLeastOne: "dodaj bar jedno:",
          profileUrl: "(URL profila)",
          or: "ili",
          restart: "pa restartuj",
          note: "Oblaci su samo projekti sa deploy linkom (GitHub Website ili Netlify).",
        },
        fetchFailed: {
          intro:
            "GitHub / Netlify podaci nisu učitani (izuzetak na serveru — npr. mreža, rate limit, pogrešan token).",
          checkTerminal: "Proveri terminal za",
          andRun: "i pokreni",
          restartIfAdded: "Ako je tek dodat",
          restartDev: "obavezno restartuj dev server.",
          note: "Oblaci i dalje: samo projekti sa deploy linkom.",
        },
      },
      aang: {
        heading: "Zašto Aang?",
        body:
          "Aang iz serije Avatar: Poslednji vladar vetrova (Avatar: The Last Airbender) ostaje jedan od onih likova koji u sebi čuvaju dete — ne naivno, nego neiskvareno i dobrog srca: kroz greške, strah i odgovornost uči, sluša druge i vraća se putu iako bi bilo lakše odustati. Na kraju izrasta iz begunca u nekoga ko povezuje i ujedinjuje — snaga mu nije surovost, nego smirenje i izbor da štiti ono što je zajedničko. Tu metaforu nosim i u radu na projektima: rad, učenje iz iskustva i namena da nešto korisno za druge postane stabilno (kao ti „deploy“ oblaci oko njega).",
        rights:
          "Lik, naslovi i vizuelni svet serije u vlasništvu su nosilaca prava (npr. Nickelodeon / Paramount). Ovaj sajt ne koristi zvaničan materijal serije; referenca je kulturna i u duhu poštovanja prema autorskom delu.",
        wikiAang: "Wikipedia — Aang",
        wikiSeries: "Wikipedia — serija",
      },
      scene: {
        cornerHintPng:
          "Lab · Aang — oblaci su samo projekti sa deploy linkom (otvaraju live sajt)",
        cornerHintLottie:
          "Lab · Lottie sekvenca (bez klika tokom animacije) · oblaci nakon kraja",
        replay: "Ponovi animaciju",
        loadingLottie: "Proveravam da li postoji Lottie fajl…",
        footerImageBefore: "Slika je u ",
        footerImageAfter:
          ". Imena repozitorijuma sa GitHub liste (inače rezervna imena).",
        footerLottieBefore:
          "Stavi izvoz iz After Effects (Bodymovin / LottieFiles) u fajl ",
        footerLottieAfter:
          ". Oblaci sa imenima repoa pojavljuju se kada Lottie jednom završi (",
        footerLottieEnd: ").",
        aangImageAlt:
          "Aang — Poslednji vladar vetrova (fan art), borbeni stav sa štapom",
        backToProjects: "← Nazad na projekte",
      },
    },
  },
} as const;

type StringifyLeaves<T> = T extends string ? string : { [K in keyof T]: StringifyLeaves<T[K]> };
export type Translations = StringifyLeaves<(typeof t)["en"]>;
