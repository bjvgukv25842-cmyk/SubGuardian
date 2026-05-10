"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { ProductCopy, productCopy } from "@/lib/productCopy";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
  p: ProductCopy;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [languageLoaded, setLanguageLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("subguardian-language");
    if (saved === "en" || saved === "zh") {
      setLanguageState(saved);
    }
    setLanguageLoaded(true);
  }, []);

  useEffect(() => {
    if (!languageLoaded) {
      return;
    }

    localStorage.setItem("subguardian-language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language, languageLoaded]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: translations[language],
      p: productCopy[language]
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}
