/**
 * Salita ng Araw — a small daily PH-culture widget for the learn home.
 *
 * Rotates a Filipino word, value, or local context every day so the
 * Forger learns something cultural even on a low-energy school day.
 * Picked by date hash so every kid sees the same word on the same day.
 *
 * Three categories rotate:
 *   - salita    Tagalog/Filipino word with kid-friendly definition
 *   - bayani    Real PH hero / inspirational figure tidbit
 *   - kultura   Cultural fact (food, holiday, place, custom)
 */

export type SalitaCategory = "salita" | "bayani" | "kultura";

export interface SalitaEntry {
  category: SalitaCategory;
  word: string;
  meaning: string;
  /** A short kid-friendly sentence using or explaining the entry. */
  example?: string;
  /** Optional source / attribution to keep claims honest. */
  source?: string;
  /** Single emoji used on the card. */
  emoji: string;
}

export const SALITA_POOL: SalitaEntry[] = [
  // ─── Salita (words) ──────────────────────────────────────────
  {
    category: "salita",
    word: "Bayanihan",
    meaning: "Helping each other for the good of the community.",
    example: "When neighbors carry a whole house on bamboo poles — that's bayanihan.",
    emoji: "🤝",
  },
  {
    category: "salita",
    word: "Kapwa",
    meaning: "The Filipino sense that you and another person share one soul.",
    example: "Treating someone kindly because they are kapwa-tao (fellow human).",
    emoji: "💞",
  },
  {
    category: "salita",
    word: "Utang na loob",
    meaning: "A debt of gratitude — remembering when someone helped you.",
    example: "Even after years, a Filipino remembers and returns the favor.",
    emoji: "🙏",
  },
  {
    category: "salita",
    word: "Pakikisama",
    meaning: "Getting along smoothly with others, going with the group.",
    example: "Playing patintero even when you're tired — for pakikisama.",
    emoji: "👫",
  },
  {
    category: "salita",
    word: "Mabuhay",
    meaning: "Long life! Welcome! A greeting full of warmth.",
    example: "Said at the start of every important Filipino moment.",
    emoji: "🌟",
  },
  {
    category: "salita",
    word: "Diskarte",
    meaning: "Cleverness — finding a smart way through any problem.",
    example: "Walang load? Diskarte na lang — ride bareback (offline).",
    emoji: "🧠",
  },
  {
    category: "salita",
    word: "Tibay",
    meaning: "Toughness — strength that lasts.",
    example: "May tibay ang Pilipino: bagyo today, smiling tomorrow.",
    emoji: "💪",
  },
  {
    category: "salita",
    word: "Kuya / Ate",
    meaning: "Older brother / older sister — used as respect even with strangers.",
    example: "'Kuya, magkano po?' — every sari-sari store conversation.",
    emoji: "👦",
  },
  {
    category: "salita",
    word: "Mano po",
    meaning: "Showing respect by pressing an elder's hand to your forehead.",
    example: "Done with grandparents, ninongs, ninangs — quietly, every time.",
    emoji: "🙇",
  },
  {
    category: "salita",
    word: "Pasalubong",
    meaning: "A gift you bring home after a trip — for the people who waited.",
    example: "Even one pack of polvoron counts. It's the thought.",
    emoji: "🎁",
  },

  // ─── Bayani (heroes) ─────────────────────────────────────────
  {
    category: "bayani",
    word: "José Rizal",
    meaning: "Our national hero. Doctor, writer, and quiet revolutionary.",
    example: "Wrote Noli Me Tangere at 26 — and changed the country forever.",
    emoji: "📜",
  },
  {
    category: "bayani",
    word: "Andres Bonifacio",
    meaning: "Founder of the Katipunan — the secret society that started the Philippine Revolution.",
    example: "Called the 'Supremo'. Worked as a warehouse keeper before becoming a hero.",
    emoji: "⚔️",
  },
  {
    category: "bayani",
    word: "Lapu-Lapu",
    meaning: "Chieftain who defeated Magellan in 1521 at the Battle of Mactan.",
    example: "The first Filipino hero to defend our islands from a foreign power.",
    emoji: "🛡️",
  },
  {
    category: "bayani",
    word: "Gabriela Silang",
    meaning: "Led Ilocano forces after her husband's death — the first Filipina to lead an uprising.",
    example: "Proof that bayani come in every form, regardless of gender.",
    emoji: "🏇",
  },
  {
    category: "bayani",
    word: "Apolinario Mabini",
    meaning: "The 'Brains of the Revolution' — wrote our first constitutional ideas.",
    example: "Paralyzed but never stopped thinking, writing, and serving the nation.",
    emoji: "🪶",
  },
  {
    category: "bayani",
    word: "Hidilyn Diaz",
    meaning: "Won the Philippines' first-ever Olympic gold medal in 2020 (weightlifting).",
    example: "Trained in a tiny gym in Zamboanga. Hard work beats every excuse.",
    emoji: "🥇",
  },
  {
    category: "bayani",
    word: "Manny Pacquiao",
    meaning: "Greatest pound-for-pound boxer in his era — from poverty in General Santos to the world.",
    example: "Sold pandesal as a kid. Then conquered the boxing world.",
    emoji: "🥊",
  },
  {
    category: "bayani",
    word: "Lea Salonga",
    meaning: "Voiced Disney's Mulan and Princess Jasmine — and won Broadway Tonys for Miss Saigon.",
    example: "A Filipina voice on every kid's screen worldwide.",
    emoji: "🎤",
  },
  {
    category: "bayani",
    word: "Dr. Fe del Mundo",
    meaning: "First woman admitted to Harvard Medical School. Invented an incubator for rural babies.",
    example: "Built a hospital in Manila from scratch to serve poor children.",
    emoji: "🩺",
  },
  {
    category: "bayani",
    word: "Carlos Yulo",
    meaning: "Won two Olympic gold medals in gymnastics at Paris 2024.",
    example: "Grew up in a small apartment in Manila. Now a national hero.",
    emoji: "🤸",
  },

  // ─── Kultura (culture facts) ─────────────────────────────────
  {
    category: "kultura",
    word: "Bahay Kubo",
    meaning: "Our traditional nipa hut — built to keep cool and survive typhoons.",
    example: "Bamboo + nipa leaves = an entire engineering lesson.",
    emoji: "🛖",
  },
  {
    category: "kultura",
    word: "Adobo",
    meaning: "Our national dish (almost) — soy, vinegar, garlic, time. Every family does it differently.",
    example: "Try chicken, pork, or even sitaw adobo. All correct.",
    emoji: "🍗",
  },
  {
    category: "kultura",
    word: "Jeepney",
    meaning: "Public transport made from leftover WWII jeeps. Colorful, loud, ours.",
    example: "Two seats, a hundred passengers, never miss your stop.",
    emoji: "🚌",
  },
  {
    category: "kultura",
    word: "Sinulog",
    meaning: "A festival in Cebu honoring Santo Niño. Drums, dance, faith.",
    example: "Held every January. Even non-Catholics come for the joy.",
    emoji: "💃",
  },
  {
    category: "kultura",
    word: "Pasko",
    meaning: "Christmas — the longest in the world. Starts in September.",
    example: "First 'ber month' = first parol lights up. That's the rule.",
    emoji: "🎄",
  },
  {
    category: "kultura",
    word: "Sari-sari store",
    meaning: "The neighborhood mini-shop that sells everything by tingi (small quantities).",
    example: "₱5 of soy sauce, three pieces of candy, one cigarette. We invented it.",
    emoji: "🏪",
  },
  {
    category: "kultura",
    word: "Tinapay (Pandesal)",
    meaning: "Our daily morning bread — soft, warm, eaten with kape (coffee) at 6am.",
    example: "The bakery's first batch wakes the whole barangay.",
    emoji: "🍞",
  },
  {
    category: "kultura",
    word: "Bayong",
    meaning: "Woven plastic or buri palm market bag — used at the palengke long before 'eco-bags'.",
    example: "Sustainability is not new. We've always carried bayong.",
    emoji: "👜",
  },
  {
    category: "kultura",
    word: "Tinikling",
    meaning: "Our national dance — bamboo poles clack while dancers hop in and out.",
    example: "Named after the tikling bird dodging bamboo traps.",
    emoji: "🎋",
  },
  {
    category: "kultura",
    word: "Mano po + Pagmamano",
    meaning: "When younger people take an elder's hand to their forehead as a sign of respect.",
    example: "Quiet, gentle, and uniquely Filipino. Pass it on.",
    emoji: "👴",
  },
];

/** Pick today's Salita using a date-seeded hash. Same day = same entry. */
export function todaysSalita(date = new Date()): SalitaEntry {
  const seed = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return SALITA_POOL[Math.abs(h) % SALITA_POOL.length];
}
