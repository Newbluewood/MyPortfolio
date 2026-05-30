"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { t, type Lang, type Translations } from "./translations";

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  T: Translations;
};

const LangContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  T: t.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("portfolio-lang");
    if (stored === "sr" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("portfolio-lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, T: t[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
