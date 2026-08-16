import type { Language } from "./config";

/**
 * UI string dictionary. Flat dotted keys. English is the source of truth and
 * the fallback; Filipino is natural Taglish as Filipino students actually
 * speak (common English loan/technical words kept, not force-translated).
 *
 * Add keys incrementally — any missing Filipino key falls back to English,
 * so partial coverage never breaks the UI.
 */
export const dictionary: Record<Language, Record<string, string>> = {
  en: {
    // common
    "common.loading": "Loading…",
    "common.save": "Save",
    "common.saved": "Saved!",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.next": "Next",
    "common.continue": "Continue",
    "common.retry": "Try again",

    // nav
    "nav.home": "Home",
    "nav.tutor": "Tutor",
    "nav.careers": "Careers",
    "nav.friends": "Friends",
    "nav.achievements": "Achievements",
    "nav.leaderboard": "Leaderboard",
    "nav.settings": "Settings",
    "nav.dashboard": "Dashboard",

    // mentor
    "mentor.subtitle": "Your kid-safe AI tutor",
    "mentor.placeholder": "Ask me anything about your lessons…",
    "mentor.send": "Send",
    "mentor.thinking": "Thinking…",
    "mentor.clear": "Clear chat",

    // settings — language
    "settings.language": "Language",
    "settings.languageDesc":
      "Choose how PathForge and your AI tutor talk to you.",
    "settings.languageTutorNote":
      "Your AI tutor will reply in this language right away.",
  },
  fil: {
    // common
    "common.loading": "Naglo-load…",
    "common.save": "I-save",
    "common.saved": "Na-save na!",
    "common.cancel": "Kanselahin",
    "common.back": "Bumalik",
    "common.next": "Susunod",
    "common.continue": "Magpatuloy",
    "common.retry": "Subukan ulit",

    // nav
    "nav.home": "Home",
    "nav.tutor": "Tutor",
    "nav.careers": "Karera",
    "nav.friends": "Mga Kaibigan",
    "nav.achievements": "Mga Tagumpay",
    "nav.leaderboard": "Ranggo",
    "nav.settings": "Mga Setting",
    "nav.dashboard": "Dashboard",

    // mentor
    "mentor.subtitle": "Ang iyong ligtas na AI tutor",
    "mentor.placeholder": "Magtanong tungkol sa iyong mga aralin…",
    "mentor.send": "Ipadala",
    "mentor.thinking": "Nag-iisip…",
    "mentor.clear": "I-clear ang usapan",

    // settings — language
    "settings.language": "Wika",
    "settings.languageDesc":
      "Piliin kung paano makikipag-usap sa iyo ang PathForge at ang iyong AI tutor.",
    "settings.languageTutorNote":
      "Sasagot agad ang iyong AI tutor sa wikang ito.",
  },
};
