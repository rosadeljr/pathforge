/**
 * PathForge localization — lightweight, dependency-free, localStorage-first.
 *
 * Language preference lives in localStorage (NOT a DB column) on purpose: it
 * works instantly with zero migration risk. The AI tutor reads it per-request;
 * the UI reads it via LanguageProvider.
 */

export type Language = "en" | "fil";

export const DEFAULT_LANGUAGE: Language = "en";
export const LANG_STORAGE_KEY = "pf-lang";

export const LANGUAGES: {
  code: Language;
  label: string;
  native: string;
  flag: string;
}[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "fil", label: "Filipino", native: "Filipino / Taglish", flag: "🇵🇭" },
];

export function isLanguage(v: unknown): v is Language {
  return v === "en" || v === "fil";
}

export function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const v = window.localStorage.getItem(LANG_STORAGE_KEY);
    return isLanguage(v) ? v : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function storeLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* private mode / quota — non-fatal */
  }
}
