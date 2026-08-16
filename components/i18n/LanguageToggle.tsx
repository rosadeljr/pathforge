"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANGUAGES } from "@/lib/i18n/config";

/**
 * EN / Filipino language switcher. Writes the preference to localStorage via
 * the provider, so the whole app (and the AI tutor) picks it up immediately.
 */
export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]"
    >
      {LANGUAGES.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              active
                ? "bg-white text-slate-900"
                : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {compact ? l.code.toUpperCase() : `${l.flag} ${l.native}`}
          </button>
        );
      })}
    </div>
  );
}
