"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  readStoredLanguage,
  storeLanguage,
  type Language,
} from "./config";
import { dictionary } from "./dictionary";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translate;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function translateWith(lang: Language): Translate {
  return (key, vars) => {
    const table = dictionary[lang] || dictionary.en;
    let str = table[key] ?? dictionary.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return str;
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start at the default on server + first client render (avoids hydration
  // mismatch), then adopt the stored preference on mount.
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLangState(readStoredLanguage());
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    storeLanguage(l);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "lang",
        l === "fil" ? "fil-PH" : "en-PH"
      );
    }
  }, []);

  const t = useCallback<Translate>(
    (key, vars) => translateWith(lang)(key, vars),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback if a component renders outside the provider — English,
    // never crashes.
    return { lang: DEFAULT_LANGUAGE, setLang: () => {}, t: translateWith(DEFAULT_LANGUAGE) };
  }
  return ctx;
}
