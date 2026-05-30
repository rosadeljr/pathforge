/**
 * Username profanity filter — kid-safety bar.
 *
 * Blocks common English + Tagalog slurs/profanity. Intentionally
 * conservative — better to reject a borderline name than approve
 * something hurtful in a kids' app.
 *
 * Strategy:
 *   1. Normalize username (lowercase, strip non-alphanum, collapse
 *      common leet-speak substitutions like 0→o, 1→i, 3→e, 4→a).
 *   2. Check if any banned term appears as a substring.
 *   3. Also block reserved system words.
 */

const BANNED: string[] = [
  // English profanity
  "fuck", "fck", "shit", "sht", "bitch", "btch", "cunt", "cnt",
  "dick", "dik", "pussy", "pusy", "cock", "ass", "asshole", "asshat",
  "bastard", "damn", "piss", "prick", "slut", "whore", "hoe",
  "wank", "tits", "tit", "boobs", "fag", "faggot", "homo",
  "queer", "dyke", "tranny", "retard", "spaz",
  // Racial slurs (any variant)
  "nigger", "nigga", "chink", "spic", "kike", "wetback", "gook",
  // Hate / violence
  "kill", "murder", "rape", "raper", "rapist", "molest", "pedo",
  "nazi", "hitler", "isis", "terror", "terrorist", "bomb",
  // Tagalog profanity
  "putang", "puta", "puke", "puki", "tite", "titi", "pepe", "pekpek",
  "bobo", "tanga", "gago", "ulol", "tarantado", "kupal", "hayop",
  "leche", "siraulo", "tang ina", "tangina", "yawa", "tanginamo",
  // Sexual
  "porn", "sex", "xxx", "nude", "nudes", "horny", "thong",
  // System-reserved
  "admin", "administrator", "root", "moderator", "system", "support",
  "pathforge", "forgebot", "zenforge", "support",
];

/** Replace common leet-speak so "f4g" / "sh1t" / "n1gg3r" still get caught. */
function deLeet(s: string): string {
  return s
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "i");
}

/**
 * @returns the offending term if username is profane, or null if clean.
 */
export function findProfanity(username: string): string | null {
  if (!username) return null;
  const cleaned = deLeet(username.toLowerCase()).replace(/[^a-z]/g, "");
  if (cleaned.length < 2) return null;
  for (const term of BANNED) {
    if (cleaned.includes(term)) return term;
  }
  return null;
}

export function isProfaneUsername(username: string): boolean {
  return findProfanity(username) !== null;
}
