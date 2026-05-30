import type { SubjectId } from "./learner";

/**
 * Learner mode — lesson content.
 *
 * Each lesson is a multi-question unit aligned to a PH K-10 competency.
 * The curriculum metadata fields below let us track mastery, gate
 * prerequisite skills, surface "next best lesson" recommendations, and
 * give parents/teachers an audit trail of what their kid is learning.
 *
 * Lesson schema is intentionally additive — new fields are optional so
 * old lessons keep working while we backfill curriculum metadata.
 */

export interface LessonQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  /** Tags the misconception this question is designed to surface. */
  misconceptionTag?: string;
}

/** Quarter inside a PH school year (1–4) or "year-round" for non-quarterly skills. */
export type Quarter = 1 | 2 | 3 | 4 | "year-round";

/** Status of teacher/curriculum review for the lesson. */
export type ReviewStatus = "draft" | "reviewed" | "published";

/** Primary language of instruction in the lesson. */
export type LessonLanguage = "en" | "fil" | "taglish";

export interface Lesson {
  // Required core
  id: string;
  subject: SubjectId;
  grade: number;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  questions: LessonQuestion[];

  // ── Curriculum metadata (optional, additive — backfill over time) ──
  /** Slug for the K-10 competency (e.g. "math-3-add-2digit-no-regroup"). */
  competency?: string;
  /** Bayanihan-style human description of the skill being trained. */
  competencyTitle?: string;
  /** Approximate school quarter this content lives in. */
  quarter?: Quarter;
  /** Skill slugs that should be mastered first. */
  prerequisites?: string[];
  /** Estimated time to complete in minutes — used in parent reports. */
  estimatedMinutes?: number;
  /** 1 (gentle intro) to 5 (boss challenge). */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /**
   * Mastery threshold — fraction of first-try-correct (0..1) at or above
   * which the learner is considered to have mastered the competency.
   * Defaults to 0.8 if omitted.
   */
  masteryThreshold?: number;
  /** Career ids whose skill tree includes this competency. */
  careerLinks?: string[];
  /** Primary language of instruction. Defaults to "en" if omitted. */
  language?: LessonLanguage;
  /** Curriculum review state — affects whether the lesson is surfaced. */
  reviewStatus?: ReviewStatus;
  /** Why this skill matters / how to teach if asked. Internal-only. */
  teacherNotes?: string;
}

export const LESSONS: Lesson[] = [
  // ============ GRADE 3 · MATH ============
  {
    id: "math-3-add-basic",
    subject: "math",
    grade: 3,
    title: "Adding 2-digit numbers",
    description: "Practice adding two numbers between 10 and 99 — no regrouping yet.",
    emoji: "➕",
    xpReward: 100,
    questions: [
      {
        id: "q1",
        prompt: "12 + 25 = ?",
        options: ["35", "37", "38", "40"],
        correctIndex: 1,
        explanation: "Add the ones: 2 + 5 = 7. Add the tens: 1 + 2 = 3. So 37.",
      },
      {
        id: "q2",
        prompt: "34 + 21 = ?",
        options: ["53", "54", "55", "56"],
        correctIndex: 2,
      },
      {
        id: "q3",
        prompt: "50 + 38 = ?",
        options: ["78", "88", "98", "108"],
        correctIndex: 1,
      },
      {
        id: "q4",
        prompt: "41 + 27 = ?",
        options: ["58", "67", "68", "78"],
        correctIndex: 2,
      },
      {
        id: "q5",
        prompt: "60 + 19 = ?",
        options: ["69", "79", "80", "89"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "math-3-add-regroup",
    subject: "math",
    grade: 3,
    title: "Adding with regrouping",
    description: "When the ones add up past 9, carry the 1 to the tens place.",
    emoji: "🧮",
    xpReward: 120,
    questions: [
      {
        id: "q1",
        prompt: "28 + 16 = ?",
        options: ["34", "42", "44", "46"],
        correctIndex: 2,
        explanation: "Ones: 8 + 6 = 14. Write 4, carry 1. Tens: 2 + 1 + 1 = 4. So 44.",
      },
      {
        id: "q2",
        prompt: "47 + 35 = ?",
        options: ["72", "81", "82", "92"],
        correctIndex: 2,
      },
      {
        id: "q3",
        prompt: "56 + 28 = ?",
        options: ["74", "83", "84", "94"],
        correctIndex: 2,
      },
      {
        id: "q4",
        prompt: "39 + 47 = ?",
        options: ["76", "86", "87", "96"],
        correctIndex: 1,
      },
      {
        id: "q5",
        prompt: "65 + 27 = ?",
        options: ["82", "91", "92", "93"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "math-3-subtract",
    subject: "math",
    grade: 3,
    title: "Subtracting 2-digit numbers",
    description: "Practice taking away — the opposite of adding.",
    emoji: "➖",
    xpReward: 100,
    questions: [
      {
        id: "q1",
        prompt: "35 − 14 = ?",
        options: ["19", "20", "21", "23"],
        correctIndex: 2,
      },
      {
        id: "q2",
        prompt: "58 − 23 = ?",
        options: ["31", "35", "37", "41"],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt: "76 − 41 = ?",
        options: ["33", "35", "37", "45"],
        correctIndex: 1,
      },
      {
        id: "q4",
        prompt: "89 − 55 = ?",
        options: ["24", "34", "44", "54"],
        correctIndex: 1,
      },
      {
        id: "q5",
        prompt: "60 − 27 = ?",
        options: ["27", "33", "37", "43"],
        correctIndex: 1,
        explanation: "Think: 27 + ? = 60. 27 + 33 = 60. So the answer is 33.",
      },
    ],
  },
  {
    id: "math-3-multiply-2",
    subject: "math",
    grade: 3,
    title: "Multiplication: ×2 table",
    description: "Doubling numbers — the easiest times table to start with.",
    emoji: "✖️",
    xpReward: 90,
    questions: [
      {
        id: "q1",
        prompt: "2 × 3 = ?",
        options: ["5", "6", "7", "8"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "2 × 5 = ?",
        options: ["7", "8", "10", "12"],
        correctIndex: 2,
      },
      {
        id: "q3",
        prompt: "2 × 7 = ?",
        options: ["9", "12", "14", "16"],
        correctIndex: 2,
      },
      {
        id: "q4",
        prompt: "2 × 9 = ?",
        options: ["11", "16", "18", "20"],
        correctIndex: 2,
      },
      {
        id: "q5",
        prompt: "2 × 8 = ?",
        options: ["10", "14", "16", "18"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "math-3-multiply-5",
    subject: "math",
    grade: 3,
    title: "Multiplication: ×5 table",
    description: "Counting by fives — a pattern that ends in 0 or 5.",
    emoji: "🖐️",
    xpReward: 90,
    questions: [
      {
        id: "q1",
        prompt: "5 × 4 = ?",
        options: ["15", "20", "25", "30"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "5 × 6 = ?",
        options: ["25", "30", "35", "40"],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt: "5 × 8 = ?",
        options: ["35", "40", "45", "50"],
        correctIndex: 1,
      },
      {
        id: "q4",
        prompt: "5 × 3 = ?",
        options: ["10", "12", "15", "20"],
        correctIndex: 2,
      },
      {
        id: "q5",
        prompt: "5 × 9 = ?",
        options: ["40", "45", "50", "55"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "math-3-ph-money",
    subject: "math",
    grade: 3,
    title: "Philippine money",
    description: "Counting pesos — at the sari-sari store, the jeep, the palengke.",
    emoji: "💵",
    xpReward: 110,
    questions: [
      {
        id: "q1",
        prompt: "Maria has a ₱20 bill and a ₱10 bill. How much does she have?",
        options: ["₱20", "₱25", "₱30", "₱40"],
        correctIndex: 2,
      },
      {
        id: "q2",
        prompt: "Juan bought a chocolate for ₱15. He paid with ₱20. How much change?",
        options: ["₱3", "₱5", "₱10", "₱15"],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt: "Lola gave you ₱50 + ₱20 + ₱10. How much money is that?",
        options: ["₱70", "₱75", "₱80", "₱85"],
        correctIndex: 2,
      },
      {
        id: "q4",
        prompt: "A pandesal costs ₱5. How much do 4 pieces cost?",
        options: ["₱15", "₱20", "₱25", "₱40"],
        correctIndex: 1,
      },
      {
        id: "q5",
        prompt: "You have ₱500. You spent ₱120 on groceries. How much is left?",
        options: ["₱280", "₱370", "₱380", "₱480"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "math-3-place-value",
    subject: "math",
    grade: 3,
    title: "Place value: hundreds, tens, ones",
    description: "Each digit in a number means a different amount — based on its place.",
    emoji: "🏷️",
    xpReward: 100,
    questions: [
      {
        id: "q1",
        prompt: "How many tens are in 56?",
        options: ["5", "6", "11", "56"],
        correctIndex: 0,
      },
      {
        id: "q2",
        prompt: "How many hundreds are in 234?",
        options: ["2", "3", "4", "23"],
        correctIndex: 0,
      },
      {
        id: "q3",
        prompt: "Which digit is in the tens place of 487?",
        options: ["4", "7", "8", "0"],
        correctIndex: 2,
      },
      {
        id: "q4",
        prompt: "Which number has 3 hundreds, 2 tens, and 5 ones?",
        options: ["235", "325", "352", "523"],
        correctIndex: 1,
      },
      {
        id: "q5",
        prompt: "Which digit in 562 is in the ones place?",
        options: ["5", "6", "2", "0"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "math-3-fractions",
    subject: "math",
    grade: 3,
    title: "Fractions: halves & quarters",
    description: "What happens when we split things into equal parts.",
    emoji: "🍕",
    xpReward: 100,
    questions: [
      {
        id: "q1",
        prompt: "A pizza is cut into 2 equal slices. You eat 1. What fraction did you eat?",
        options: ["1/4", "1/3", "1/2", "2/2"],
        correctIndex: 2,
      },
      {
        id: "q2",
        prompt: "A chocolate bar has 4 equal squares. You eat 1. What fraction is that?",
        options: ["1/2", "1/3", "1/4", "1/5"],
        correctIndex: 2,
      },
      {
        id: "q3",
        prompt: "What is 1/2 + 1/2?",
        options: ["1/4", "2/4", "1", "2"],
        correctIndex: 2,
        explanation: "Two halves make one whole.",
      },
      {
        id: "q4",
        prompt: "Half of 10 is?",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
      },
      {
        id: "q5",
        prompt: "A quarter (1/4) of 12 is?",
        options: ["2", "3", "4", "6"],
        correctIndex: 1,
        explanation: "12 ÷ 4 = 3.",
      },
    ],
  },

  // ============ GRADE 4 · MATH ============
  {
    id: "math-4-multiply-3",
    subject: "math",
    grade: 4,
    title: "Multiplication: ×3 table",
    description: "Three of something — small jumps, big results.",
    emoji: "3️⃣",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "3 × 4 = ?", options: ["9", "12", "14", "15"], correctIndex: 1 },
      { id: "q2", prompt: "3 × 6 = ?", options: ["15", "16", "18", "21"], correctIndex: 2 },
      { id: "q3", prompt: "3 × 7 = ?", options: ["18", "21", "24", "27"], correctIndex: 1 },
      { id: "q4", prompt: "3 × 9 = ?", options: ["24", "27", "30", "33"], correctIndex: 1 },
      { id: "q5", prompt: "3 × 8 = ?", options: ["22", "24", "26", "28"], correctIndex: 1 },
    ],
  },
  {
    id: "math-4-multiply-4",
    subject: "math",
    grade: 4,
    title: "Multiplication: ×4 table",
    description: "Four times as much — double-double-up.",
    emoji: "4️⃣",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "4 × 3 = ?", options: ["10", "12", "14", "16"], correctIndex: 1 },
      { id: "q2", prompt: "4 × 5 = ?", options: ["16", "18", "20", "22"], correctIndex: 2 },
      { id: "q3", prompt: "4 × 7 = ?", options: ["24", "26", "28", "30"], correctIndex: 2 },
      { id: "q4", prompt: "4 × 6 = ?", options: ["20", "22", "24", "26"], correctIndex: 2 },
      { id: "q5", prompt: "4 × 9 = ?", options: ["32", "34", "36", "38"], correctIndex: 2 },
    ],
  },
  {
    id: "math-4-multiply-6",
    subject: "math",
    grade: 4,
    title: "Multiplication: ×6 table",
    description: "Sixes — a step up from fives.",
    emoji: "6️⃣",
    xpReward: 110,
    questions: [
      { id: "q1", prompt: "6 × 2 = ?", options: ["10", "12", "14", "16"], correctIndex: 1 },
      { id: "q2", prompt: "6 × 4 = ?", options: ["22", "24", "26", "28"], correctIndex: 1 },
      { id: "q3", prompt: "6 × 7 = ?", options: ["36", "42", "48", "54"], correctIndex: 1 },
      { id: "q4", prompt: "6 × 8 = ?", options: ["42", "46", "48", "56"], correctIndex: 2 },
      { id: "q5", prompt: "6 × 9 = ?", options: ["48", "52", "54", "56"], correctIndex: 2 },
    ],
  },
  {
    id: "math-4-add-3digit",
    subject: "math",
    grade: 4,
    title: "Adding 3-digit numbers",
    description: "Bigger numbers, same plan — line up the ones, tens, and hundreds.",
    emoji: "🧱",
    xpReward: 120,
    questions: [
      { id: "q1", prompt: "245 + 132 = ?", options: ["357", "377", "387", "397"], correctIndex: 1 },
      { id: "q2", prompt: "360 + 247 = ?", options: ["507", "587", "607", "617"], correctIndex: 2 },
      { id: "q3", prompt: "158 + 274 = ?", options: ["422", "432", "442", "452"], correctIndex: 1 },
      { id: "q4", prompt: "415 + 386 = ?", options: ["791", "801", "811", "821"], correctIndex: 1 },
      { id: "q5", prompt: "506 + 198 = ?", options: ["694", "704", "714", "724"], correctIndex: 1 },
    ],
  },

  // ============ GRADE 5 · MATH ============
  {
    id: "math-5-decimals",
    subject: "math",
    grade: 5,
    title: "Decimals: the basics",
    description: "Numbers smaller than 1 — written with a dot.",
    emoji: "🔢",
    xpReward: 130,
    questions: [
      { id: "q1", prompt: "0.5 + 0.5 = ?", options: ["0.10", "0.55", "1.0", "5.0"], correctIndex: 2, explanation: "Two halves make one whole." },
      { id: "q2", prompt: "1.5 + 2.5 = ?", options: ["3.5", "4.0", "4.5", "5.0"], correctIndex: 1 },
      { id: "q3", prompt: "Which is bigger: 0.7 or 0.65?", options: ["0.65", "0.7", "They're equal", "Neither"], correctIndex: 1, explanation: "0.7 is the same as 0.70, which is bigger than 0.65." },
      { id: "q4", prompt: "3.2 + 1.8 = ?", options: ["4.0", "4.5", "5.0", "5.5"], correctIndex: 2 },
      { id: "q5", prompt: "How do you write 'three-tenths' as a decimal?", options: ["0.03", "0.3", "3.0", "0.30"], correctIndex: 1 },
    ],
  },
  {
    id: "math-5-area-perimeter",
    subject: "math",
    grade: 5,
    title: "Area & perimeter",
    description: "Around the edges vs the space inside.",
    emoji: "📐",
    xpReward: 130,
    questions: [
      { id: "q1", prompt: "A square has sides of 4 cm. What's its perimeter?", options: ["8 cm", "12 cm", "16 cm", "20 cm"], correctIndex: 2, explanation: "Perimeter of a square = 4 × side. 4 × 4 = 16." },
      { id: "q2", prompt: "A rectangle is 5 cm long and 3 cm wide. What's its area?", options: ["8 sq cm", "12 sq cm", "15 sq cm", "18 sq cm"], correctIndex: 2, explanation: "Area = length × width. 5 × 3 = 15." },
      { id: "q3", prompt: "A square has sides of 5 cm. What's its area?", options: ["10 sq cm", "20 sq cm", "25 sq cm", "30 sq cm"], correctIndex: 2 },
      { id: "q4", prompt: "A rectangle is 6 cm long and 4 cm wide. What's its perimeter?", options: ["10 cm", "18 cm", "20 cm", "24 cm"], correctIndex: 2, explanation: "Perimeter = 2 × (length + width) = 2 × 10 = 20." },
      { id: "q5", prompt: "Perimeter of a triangle with sides 3, 4, and 5 cm?", options: ["9 cm", "12 cm", "15 cm", "18 cm"], correctIndex: 1 },
    ],
  },

  // ============ GRADE 3 · ENGLISH ============
  {
    id: "english-3-synonyms",
    subject: "english",
    grade: 3,
    title: "Synonyms: words that mean the same",
    description: "Different words, same meaning — your vocabulary toolkit.",
    emoji: "🔁",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "Which word means almost the same as 'happy'?", options: ["sad", "joyful", "angry", "tired"], correctIndex: 1 },
      { id: "q2", prompt: "Synonym for 'big'?", options: ["small", "tiny", "huge", "short"], correctIndex: 2 },
      { id: "q3", prompt: "Synonym for 'fast'?", options: ["slow", "quick", "lazy", "late"], correctIndex: 1 },
      { id: "q4", prompt: "Synonym for 'smart'?", options: ["silly", "clever", "weak", "loud"], correctIndex: 1 },
      { id: "q5", prompt: "Synonym for 'scared'?", options: ["brave", "calm", "afraid", "proud"], correctIndex: 2 },
    ],
  },
  {
    id: "english-3-antonyms",
    subject: "english",
    grade: 3,
    title: "Antonyms: opposite words",
    description: "Find the opposite — sharpen your vocabulary.",
    emoji: "↔️",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "What's the opposite of 'hot'?", options: ["warm", "cool", "cold", "mild"], correctIndex: 2 },
      { id: "q2", prompt: "Opposite of 'tall'?", options: ["thin", "short", "long", "high"], correctIndex: 1 },
      { id: "q3", prompt: "Opposite of 'open'?", options: ["empty", "full", "closed", "locked"], correctIndex: 2 },
      { id: "q4", prompt: "Opposite of 'old'?", options: ["new", "weak", "broken", "used"], correctIndex: 0 },
      { id: "q5", prompt: "Opposite of 'kind'?", options: ["generous", "helpful", "mean", "friendly"], correctIndex: 2 },
    ],
  },
  {
    id: "english-3-subject-verb",
    subject: "english",
    grade: 3,
    title: "Subject + verb",
    description: "Every sentence has a 'who' and a 'does what.'",
    emoji: "📝",
    xpReward: 110,
    questions: [
      { id: "q1", prompt: "In 'The dog runs,' what's the verb?", options: ["The", "dog", "runs", "none"], correctIndex: 2, explanation: "The verb is the action word — what someone or something does." },
      { id: "q2", prompt: "In 'Maria sings,' what's the subject?", options: ["sings", "Maria", "the", "a"], correctIndex: 1, explanation: "The subject is who or what the sentence is about." },
      { id: "q3", prompt: "Pick the correct sentence:", options: ["The boy plays.", "Plays the boy.", "Both are right.", "Neither is right."], correctIndex: 0 },
      { id: "q4", prompt: "Which is the verb in 'Birds fly south'?", options: ["Birds", "fly", "south", "none"], correctIndex: 1 },
      { id: "q5", prompt: "In 'We eat breakfast,' what's the subject?", options: ["We", "eat", "breakfast", "none"], correctIndex: 0 },
    ],
  },

  // ============ GRADE 4 · ENGLISH ============
  {
    id: "english-4-parts-of-speech",
    subject: "english",
    grade: 4,
    title: "Parts of speech",
    description: "Words have jobs — noun, verb, adjective, adverb.",
    emoji: "🧩",
    xpReward: 120,
    questions: [
      { id: "q1", prompt: "'Dog' is a...", options: ["verb", "noun", "adjective", "adverb"], correctIndex: 1, explanation: "Nouns name people, places, things, or ideas." },
      { id: "q2", prompt: "'Run' is a...", options: ["verb", "noun", "adjective", "adverb"], correctIndex: 0, explanation: "Verbs are action words." },
      { id: "q3", prompt: "'Big' is a...", options: ["verb", "noun", "adjective", "adverb"], correctIndex: 2, explanation: "Adjectives describe nouns." },
      { id: "q4", prompt: "'Sing' is a...", options: ["verb", "noun", "adjective", "adverb"], correctIndex: 0 },
      { id: "q5", prompt: "Identify the noun in 'The yellow bus is fast.'", options: ["yellow", "bus", "fast", "is"], correctIndex: 1 },
    ],
  },
  {
    id: "english-4-tenses",
    subject: "english",
    grade: 4,
    title: "Past, present, future",
    description: "When did it happen? Verbs change to tell us.",
    emoji: "⏳",
    xpReward: 120,
    questions: [
      { id: "q1", prompt: "'I walk to school.' Which tense?", options: ["past", "present", "future", "none"], correctIndex: 1 },
      { id: "q2", prompt: "'She walked to school.' Which tense?", options: ["past", "present", "future", "none"], correctIndex: 0 },
      { id: "q3", prompt: "'I will go tomorrow.' Which tense?", options: ["past", "present", "future", "none"], correctIndex: 2 },
      { id: "q4", prompt: "Past tense of 'eat' is?", options: ["eats", "eated", "ate", "eaten"], correctIndex: 2 },
      { id: "q5", prompt: "Past tense of 'run' is?", options: ["runned", "ran", "runs", "running"], correctIndex: 1 },
    ],
  },

  // ============ GRADE 5 · ENGLISH ============
  {
    id: "english-5-reading",
    subject: "english",
    grade: 5,
    title: "Reading comprehension",
    description: "Read carefully — then answer what's actually there.",
    emoji: "📚",
    xpReward: 130,
    questions: [
      { id: "q1", prompt: "'Maria has a red ball. She gave it to her brother.' Who got the ball?", options: ["Maria", "the brother", "a friend", "nobody"], correctIndex: 1 },
      { id: "q2", prompt: "'The cat is on the mat.' Where's the cat?", options: ["under the mat", "on the mat", "behind the mat", "beside the mat"], correctIndex: 1 },
      { id: "q3", prompt: "'It was raining, so I brought an umbrella.' Why did I bring an umbrella?", options: ["it was sunny", "it was raining", "it was windy", "it was cold"], correctIndex: 1 },
      { id: "q4", prompt: "'Juan reads three books a week.' How many books does Juan read each week?", options: ["one", "two", "three", "four"], correctIndex: 2 },
      { id: "q5", prompt: "'The library opens at 8 AM and closes at 5 PM.' How long is it open?", options: ["7 hours", "8 hours", "9 hours", "10 hours"], correctIndex: 2, explanation: "5 PM minus 8 AM = 9 hours." },
    ],
  },
  {
    id: "english-5-punctuation",
    subject: "english",
    grade: 5,
    title: "Punctuation marks",
    description: "Periods, commas, question marks — the road signs of writing.",
    emoji: "❓",
    xpReward: 110,
    questions: [
      { id: "q1", prompt: "Which mark ends a question?", options: ["period", "comma", "question mark", "exclamation"], correctIndex: 2 },
      { id: "q2", prompt: "Which mark shows excitement?", options: ["period", "comma", "question mark", "exclamation"], correctIndex: 3 },
      { id: "q3", prompt: "Where does a period go?", options: ["at the start", "at the end", "in the middle", "anywhere"], correctIndex: 1 },
      { id: "q4", prompt: "Pick the correct sentence:", options: ["I love mangoes", "I love mangoes.", "i love mangoes", "I love Mangoes"], correctIndex: 1 },
      { id: "q5", prompt: "Where do commas go in 'I like apples oranges and bananas'?", options: ["no commas needed", "after 'apples' only", "after 'apples' and after 'oranges'", "after every word"], correctIndex: 2 },
    ],
  },
  {
    id: "english-5-idioms",
    subject: "english",
    grade: 5,
    title: "Common idioms",
    description: "Phrases that don't mean what they literally say.",
    emoji: "💬",
    xpReward: 110,
    questions: [
      { id: "q1", prompt: "'It's raining cats and dogs' means...", options: ["animals are falling", "it's raining very hard", "the weather is mild", "it's sunny"], correctIndex: 1 },
      { id: "q2", prompt: "'Break a leg' means...", options: ["be careful", "good luck", "hurt yourself", "stop now"], correctIndex: 1 },
      { id: "q3", prompt: "'Piece of cake' means...", options: ["very easy", "very hard", "a snack", "a celebration"], correctIndex: 0 },
      { id: "q4", prompt: "'Spill the beans' means...", options: ["drop food", "share a secret", "cook lunch", "lose money"], correctIndex: 1 },
      { id: "q5", prompt: "'Hit the books' means...", options: ["study hard", "throw books", "be angry", "read for fun only"], correctIndex: 0 },
    ],
  },

  // ============ GRADE 3 · FILIPINO ============
  {
    id: "filipino-3-pangngalan",
    subject: "filipino",
    grade: 3,
    title: "Pangngalan",
    description: "Mga salita para sa tao, lugar, bagay, at hayop.",
    emoji: "🏷️",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "Alin sa mga ito ang pangngalan?", options: ["tumakbo", "mabilis", "aso", "masaya"], correctIndex: 2 },
      { id: "q2", prompt: "Pangngalan ba ang 'bahay'?", options: ["oo", "hindi", "minsan", "hindi sigurado"], correctIndex: 0 },
      { id: "q3", prompt: "Alin ang pangngalan?", options: ["takbo", "mesa", "biglaan", "masipag"], correctIndex: 1 },
      { id: "q4", prompt: "'Lapis' ay isang...", options: ["pandiwa", "pangngalan", "pang-uri", "pang-abay"], correctIndex: 1 },
      { id: "q5", prompt: "Aling salita ang pangngalan sa 'Tumakbo ang aso'?", options: ["tumakbo", "ang", "aso", "lahat"], correctIndex: 2 },
    ],
  },
  {
    id: "filipino-3-pandiwa",
    subject: "filipino",
    grade: 3,
    title: "Pandiwa",
    description: "Mga salitang nagsasaad ng kilos o gawa.",
    emoji: "🏃",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "Pandiwa ba ang 'kumain'?", options: ["oo", "hindi", "minsan", "hindi sigurado"], correctIndex: 0 },
      { id: "q2", prompt: "Alin ang pandiwa?", options: ["lapis", "sumayaw", "bola", "libro"], correctIndex: 1 },
      { id: "q3", prompt: "'Naglalaro' ay isang...", options: ["pangngalan", "pandiwa", "pang-uri", "pang-abay"], correctIndex: 1 },
      { id: "q4", prompt: "Pandiwa ba ang 'matulog'?", options: ["oo", "hindi", "minsan", "hindi sigurado"], correctIndex: 0 },
      { id: "q5", prompt: "Aling salita ang pandiwa sa 'Umupo ang lalaki'?", options: ["umupo", "ang", "lalaki", "walang pandiwa"], correctIndex: 0 },
    ],
  },
  {
    id: "filipino-3-bokabularyo",
    subject: "filipino",
    grade: 3,
    title: "Bokabularyo",
    description: "Mga simpleng salita at kahulugan nila.",
    emoji: "📖",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "Ano ang ibig sabihin ng 'masipag'?", options: ["tamad", "mabait", "magaling at masigasig sa gawain", "mahirap"], correctIndex: 2 },
      { id: "q2", prompt: "Ano ang Filipino ng 'school'?", options: ["bahay", "paaralan", "simbahan", "palengke"], correctIndex: 1 },
      { id: "q3", prompt: "Ano ang Filipino ng 'book'?", options: ["papel", "kuwaderno", "libro", "lapis"], correctIndex: 2 },
      { id: "q4", prompt: "Ano ang ibig sabihin ng 'marunong'?", options: ["tamad", "mahina", "mahusay o matalino", "mabagal"], correctIndex: 2 },
      { id: "q5", prompt: "Ano ang Filipino ng 'friend'?", options: ["kaaway", "kapatid", "kaibigan", "kapitbahay"], correctIndex: 2 },
    ],
  },

  // ============ GRADE 4 · FILIPINO ============
  {
    id: "filipino-4-pangungusap",
    subject: "filipino",
    grade: 4,
    title: "Pangungusap",
    description: "Pagbuo at pagsusuri ng tamang pangungusap.",
    emoji: "📜",
    xpReward: 110,
    questions: [
      { id: "q1", prompt: "Ano ang dapat unang titik sa simula ng pangungusap?", options: ["maliit", "malaki", "lahat ay puwede", "walang patakaran"], correctIndex: 1 },
      { id: "q2", prompt: "Ano ang inilalagay sa dulo ng pasalaysay na pangungusap?", options: ["tandang pananong", "tandang padamdam", "tuldok", "kuwit"], correctIndex: 2 },
      { id: "q3", prompt: "'kumain ako ng adobo.' — Ano ang mali?", options: ["Walang mali", "Simula sa maliit na titik", "Walang tuldok", "Lahat ay mali"], correctIndex: 1 },
      { id: "q4", prompt: "Aling tanda ang ginagamit sa tanong?", options: ["tuldok", "tandang pananong", "tandang padamdam", "kuwit"], correctIndex: 1 },
      { id: "q5", prompt: "Aling pangungusap ang tama?", options: ["Si Maria kumain ng saging.", "Kumain si Maria ng saging.", "Saging si Maria kumain.", "Maria kumain saging."], correctIndex: 1 },
    ],
  },
  {
    id: "filipino-4-pagbasa",
    subject: "filipino",
    grade: 4,
    title: "Pagbasa at pag-unawa",
    description: "Basahin nang mabuti, sagutin nang tama.",
    emoji: "👀",
    xpReward: 120,
    questions: [
      { id: "q1", prompt: "'Si Lola ay nagluto ng adobo.' Sino ang nagluto?", options: ["Si Lolo", "Si Lola", "Si Nanay", "Walang nabanggit"], correctIndex: 1 },
      { id: "q2", prompt: "'Ang pusa ay nakatulog sa sofa.' Saan natulog ang pusa?", options: ["sa sahig", "sa kama", "sa sofa", "sa mesa"], correctIndex: 2 },
      { id: "q3", prompt: "'Si Juan ay naglalakad papuntang paaralan.' Saan papunta si Juan?", options: ["sa palengke", "sa bahay", "sa paaralan", "sa simbahan"], correctIndex: 2 },
      { id: "q4", prompt: "'Bumili sila ng mansanas at saging.' Ano ang binili?", options: ["mansanas at orange", "mansanas at saging", "saging lang", "mansanas lang"], correctIndex: 1 },
      { id: "q5", prompt: "'Tumakbo ng mabilis ang aso.' Paano tumakbo ang aso?", options: ["mabagal", "mabilis", "marahan", "hindi tumakbo"], correctIndex: 1 },
    ],
  },

  // ============ GRADE 5 · FILIPINO ============
  {
    id: "filipino-5-pantukoy",
    subject: "filipino",
    grade: 5,
    title: "Mga pantukoy: ang, ng, sa, mga, si",
    description: "Maliliit na salita na nagdadala sa pangungusap.",
    emoji: "🔗",
    xpReward: 130,
    questions: [
      { id: "q1", prompt: "Alin ang tamang pantukoy: '___ libro ay mahaba.'", options: ["Ang", "Ng", "Sa", "Mga"], correctIndex: 0 },
      { id: "q2", prompt: "'Naglaro siya ___ bola.'", options: ["ang", "ng", "sa", "mga"], correctIndex: 1 },
      { id: "q3", prompt: "'Pumunta si Maria ___ paaralan.'", options: ["ang", "ng", "sa", "mga"], correctIndex: 2 },
      { id: "q4", prompt: "Aling pantukoy ang ginagamit sa marami?", options: ["ang", "ng", "sa", "mga"], correctIndex: 3 },
      { id: "q5", prompt: "Aling pantukoy ang ginagamit sa pangngalang pantangi tulad ng 'Juan'?", options: ["ang", "si", "ng", "sa"], correctIndex: 1 },
    ],
  },
  {
    id: "filipino-5-panguri",
    subject: "filipino",
    grade: 5,
    title: "Pang-uri",
    description: "Mga salitang naglalarawan ng pangngalan.",
    emoji: "🎨",
    xpReward: 120,
    questions: [
      { id: "q1", prompt: "Ano ang pang-uri sa 'Mabait si Maria.'?", options: ["Mabait", "si", "Maria", "wala"], correctIndex: 0 },
      { id: "q2", prompt: "Alin ang pang-uri?", options: ["aso", "malaki", "tumakbo", "lapis"], correctIndex: 1 },
      { id: "q3", prompt: "'Mataas ang puno.' Aling salita ang pang-uri?", options: ["Mataas", "ang", "puno", "walang pang-uri"], correctIndex: 0 },
      { id: "q4", prompt: "Ano ang kasalungat ng 'masaya'?", options: ["malungkot", "mabait", "matalino", "mabilis"], correctIndex: 0 },
      { id: "q5", prompt: "Pang-uri ba ang 'matamis'?", options: ["oo", "hindi", "minsan", "hindi sigurado"], correctIndex: 0 },
    ],
  },
  {
    id: "filipino-5-sawikain",
    subject: "filipino",
    grade: 5,
    title: "Sawikain",
    description: "Mga pananalitang Pilipino na may matalinghagang kahulugan.",
    emoji: "🪨",
    xpReward: 130,
    questions: [
      { id: "q1", prompt: "'Magaan ang dugo' ay nangangahulugan ng...", options: ["galit", "madaling makipagkaibigan", "malungkot", "masama"], correctIndex: 1 },
      { id: "q2", prompt: "'Mabigat ang loob' ay...", options: ["masaya", "nag-aatubili o ayaw", "nagtatakbo", "kumakain"], correctIndex: 1 },
      { id: "q3", prompt: "'Bahay-bahayan' ay isang...", options: ["larong bata", "putahe", "kasabihan", "hayop"], correctIndex: 0 },
      { id: "q4", prompt: "'Mukhang Biyernes Santo' ay nangangahulugan ng...", options: ["masaya", "malungkot o seryoso", "gutom", "antok"], correctIndex: 1 },
      { id: "q5", prompt: "'Itaga mo sa bato' ay...", options: ["pasalita lang", "tatandaan o totoong-totoo", "magtago", "magsimula"], correctIndex: 1 },
    ],
  },

  // ============ GRADE 1–2 · LITTLE LEARNERS ============
  // Friendly, image-light, repetition-heavy. Built for ages 6–8.
  {
    id: "math-1-count-to-10",
    subject: "math",
    grade: 1,
    title: "Counting to 10",
    description: "Count objects, recognize numbers, and match them up.",
    emoji: "🍎",
    xpReward: 80,
    questions: [
      { id: "q1", prompt: "🍎🍎🍎 — How many apples?", options: ["2", "3", "4", "5"], correctIndex: 1 },
      { id: "q2", prompt: "Which is more? 5 or 7?", options: ["5", "7", "Same", "Don't know"], correctIndex: 1 },
      { id: "q3", prompt: "What comes after 6?", options: ["5", "7", "8", "10"], correctIndex: 1 },
      { id: "q4", prompt: "🌟🌟🌟🌟🌟 — How many stars?", options: ["3", "4", "5", "6"], correctIndex: 2 },
      { id: "q5", prompt: "Count down: 10, 9, 8, ?", options: ["6", "7", "9", "11"], correctIndex: 1 },
    ],
  },
  {
    id: "math-1-add-small",
    subject: "math",
    grade: 1,
    title: "Adding small numbers",
    description: "Add numbers from 1 to 10 using fingers or counters.",
    emoji: "➕",
    xpReward: 90,
    questions: [
      { id: "q1", prompt: "2 + 3 = ?", options: ["4", "5", "6", "7"], correctIndex: 1, explanation: "Start at 2, count up 3 more: 3, 4, 5." },
      { id: "q2", prompt: "4 + 4 = ?", options: ["6", "7", "8", "9"], correctIndex: 2 },
      { id: "q3", prompt: "1 + 6 = ?", options: ["5", "6", "7", "8"], correctIndex: 2 },
      { id: "q4", prompt: "5 + 5 = ?", options: ["8", "9", "10", "11"], correctIndex: 2 },
      { id: "q5", prompt: "3 + 6 = ?", options: ["8", "9", "10", "11"], correctIndex: 1 },
    ],
  },
  {
    id: "math-2-add-20",
    subject: "math",
    grade: 2,
    title: "Adding within 20",
    description: "Add two numbers up to 20 — the building block of all math.",
    emoji: "🧮",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "8 + 7 = ?", options: ["13", "14", "15", "16"], correctIndex: 2, explanation: "Make a 10: 8 + 2 = 10, then add the 5 left from 7. So 15." },
      { id: "q2", prompt: "9 + 6 = ?", options: ["13", "14", "15", "16"], correctIndex: 2 },
      { id: "q3", prompt: "11 + 4 = ?", options: ["13", "14", "15", "17"], correctIndex: 2 },
      { id: "q4", prompt: "13 + 5 = ?", options: ["17", "18", "19", "20"], correctIndex: 1 },
      { id: "q5", prompt: "14 + 6 = ?", options: ["18", "19", "20", "21"], correctIndex: 2 },
    ],
  },
  {
    id: "english-1-alphabet",
    subject: "english",
    grade: 1,
    title: "ABC: the alphabet",
    description: "Letters, sounds, and the words that start with them.",
    emoji: "🔤",
    xpReward: 80,
    questions: [
      { id: "q1", prompt: "Which letter comes after 'B'?", options: ["A", "C", "D", "E"], correctIndex: 1 },
      { id: "q2", prompt: "'Apple' starts with which letter?", options: ["A", "B", "C", "P"], correctIndex: 0 },
      { id: "q3", prompt: "Which letter is a vowel?", options: ["B", "M", "E", "T"], correctIndex: 2, explanation: "Vowels are A, E, I, O, U." },
      { id: "q4", prompt: "Which letter comes BEFORE 'M'?", options: ["K", "L", "N", "O"], correctIndex: 1 },
      { id: "q5", prompt: "How many letters are in the English alphabet?", options: ["24", "25", "26", "28"], correctIndex: 2 },
    ],
  },
  {
    id: "english-2-sight-words",
    subject: "english",
    grade: 2,
    title: "Sight words",
    description: "Common words that show up everywhere — recognize them on sight.",
    emoji: "👀",
    xpReward: 90,
    questions: [
      { id: "q1", prompt: "Fill in: 'I ___ to school.'", options: ["go", "goes", "going", "gone"], correctIndex: 0 },
      { id: "q2", prompt: "Fill in: 'She ___ a book.'", options: ["have", "has", "had", "having"], correctIndex: 1 },
      { id: "q3", prompt: "Which word means 'big'?", options: ["small", "tiny", "large", "thin"], correctIndex: 2 },
      { id: "q4", prompt: "Fill in: '___ are friends.'", options: ["He", "She", "We", "It"], correctIndex: 2 },
      { id: "q5", prompt: "Which is a question word?", options: ["the", "and", "what", "is"], correctIndex: 2 },
    ],
  },
  {
    id: "filipino-1-titik",
    subject: "filipino",
    grade: 1,
    title: "Mga Titik",
    description: "Alpabeto, tunog, at unang salita sa Filipino.",
    emoji: "🔠",
    xpReward: 80,
    questions: [
      { id: "q1", prompt: "Ilang titik ang Alpabetong Filipino?", options: ["26", "27", "28", "30"], correctIndex: 2 },
      { id: "q2", prompt: "Aling salita ang nagsisimula sa 'A'?", options: ["Bola", "Aso", "Mesa", "Bata"], correctIndex: 1 },
      { id: "q3", prompt: "Ang patinig ay...", options: ["A, E, I, O, U", "B, C, D", "Lahat ng titik", "Wala"], correctIndex: 0 },
      { id: "q4", prompt: "Aling titik ang katinig?", options: ["A", "E", "I", "M"], correctIndex: 3 },
      { id: "q5", prompt: "Ano ang unang titik ng 'Lola'?", options: ["L", "O", "A", "M"], correctIndex: 0 },
    ],
  },
  {
    id: "filipino-2-pagbasa-simple",
    subject: "filipino",
    grade: 2,
    title: "Pagbasa: simpleng pangungusap",
    description: "Bumasa ng maikling pangungusap at sagutin ang tanong.",
    emoji: "📚",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "Pangungusap: 'Si Ana ay may aso.' Ano ang pangalan ng bata?", options: ["Aso", "Ana", "Nanay", "Tatay"], correctIndex: 1 },
      { id: "q2", prompt: "'Ang araw ay maliwanag.' Ano ang kulay ng araw na karaniwang inilalarawan?", options: ["Itim", "Asul", "Dilaw", "Berde"], correctIndex: 2 },
      { id: "q3", prompt: "'Ang pusa ay naliligo.' Ano ang ginagawa ng pusa?", options: ["Natutulog", "Kumakain", "Naliligo", "Tumatakbo"], correctIndex: 2 },
      { id: "q4", prompt: "Aling pangungusap ang TAMA?", options: ["Ako maglalaro.", "Ako ay maglalaro.", "Ay ako maglalaro.", "Maglalaro ako ay."], correctIndex: 1 },
      { id: "q5", prompt: "'Maganda ang bulaklak.' Ano ang inilalarawan?", options: ["Mesa", "Bulaklak", "Aso", "Bata"], correctIndex: 1 },
    ],
  },

  // ============ GRADE 6–7 · JUNIOR LEARNERS ============
  {
    id: "math-6-long-division",
    subject: "math",
    grade: 6,
    title: "Long division",
    description: "Divide bigger numbers step by step.",
    emoji: "➗",
    xpReward: 140,
    questions: [
      { id: "q1", prompt: "144 ÷ 12 = ?", options: ["10", "11", "12", "13"], correctIndex: 2 },
      { id: "q2", prompt: "256 ÷ 8 = ?", options: ["28", "30", "32", "34"], correctIndex: 2, explanation: "8 × 32 = 256. So 256 ÷ 8 = 32." },
      { id: "q3", prompt: "375 ÷ 15 = ?", options: ["20", "22", "25", "27"], correctIndex: 2 },
      { id: "q4", prompt: "What is 200 ÷ 4?", options: ["40", "45", "50", "55"], correctIndex: 2 },
      { id: "q5", prompt: "If 5 friends split ₱625 equally, each gets...", options: ["₱115", "₱120", "₱125", "₱130"], correctIndex: 2 },
    ],
  },
  {
    id: "math-6-percent",
    subject: "math",
    grade: 6,
    title: "Percent basics",
    description: "What % means, and how to find a percent of a number.",
    emoji: "%",
    xpReward: 140,
    questions: [
      { id: "q1", prompt: "What is 50% of 80?", options: ["20", "30", "40", "50"], correctIndex: 2, explanation: "50% means half. Half of 80 is 40." },
      { id: "q2", prompt: "What is 25% of 200?", options: ["25", "40", "50", "75"], correctIndex: 2 },
      { id: "q3", prompt: "What is 10% of 350?", options: ["3.5", "30", "35", "350"], correctIndex: 2 },
      { id: "q4", prompt: "A ₱500 shirt is 20% off. How much do you save?", options: ["₱50", "₱80", "₱100", "₱150"], correctIndex: 2 },
      { id: "q5", prompt: "75% of 40 = ?", options: ["20", "25", "30", "35"], correctIndex: 2 },
    ],
  },
  {
    id: "math-7-ratios",
    subject: "math",
    grade: 7,
    title: "Ratios & proportions",
    description: "Compare quantities and scale them up or down.",
    emoji: "⚖️",
    xpReward: 150,
    questions: [
      { id: "q1", prompt: "The ratio 2:4 simplified is...", options: ["1:1", "1:2", "1:4", "2:1"], correctIndex: 1 },
      { id: "q2", prompt: "If 3 pencils cost ₱15, 5 pencils cost...", options: ["₱18", "₱20", "₱25", "₱30"], correctIndex: 2 },
      { id: "q3", prompt: "Boys:Girls = 3:5. If there are 24 students total, how many girls?", options: ["8", "9", "12", "15"], correctIndex: 3, explanation: "3+5 = 8 parts. 24/8 = 3 per part. Girls = 5 × 3 = 15." },
      { id: "q4", prompt: "Equivalent ratio to 6:8?", options: ["2:3", "3:4", "4:5", "5:6"], correctIndex: 1 },
      { id: "q5", prompt: "Solve: x/4 = 12/16", options: ["2", "3", "4", "6"], correctIndex: 1 },
    ],
  },
  {
    id: "english-6-vocab",
    subject: "english",
    grade: 6,
    title: "Vocabulary builder",
    description: "Stronger words to use in writing and speaking.",
    emoji: "📝",
    xpReward: 130,
    questions: [
      { id: "q1", prompt: "A 'meticulous' person is...", options: ["lazy", "careful and precise", "loud", "shy"], correctIndex: 1 },
      { id: "q2", prompt: "'Resilient' means...", options: ["weak", "able to recover", "angry", "tired"], correctIndex: 1 },
      { id: "q3", prompt: "Opposite of 'optimistic'?", options: ["hopeful", "happy", "pessimistic", "calm"], correctIndex: 2 },
      { id: "q4", prompt: "A 'novel' idea is...", options: ["a book", "boring", "new and original", "old"], correctIndex: 2 },
      { id: "q5", prompt: "'Diligent' means...", options: ["hardworking", "lazy", "funny", "fast"], correctIndex: 0 },
    ],
  },
  {
    id: "english-7-essay-structure",
    subject: "english",
    grade: 7,
    title: "Essay structure",
    description: "Intro, body, conclusion — write essays that flow.",
    emoji: "📑",
    xpReward: 150,
    questions: [
      { id: "q1", prompt: "The MAIN idea of an essay is the...", options: ["title", "thesis statement", "first sentence", "conclusion"], correctIndex: 1 },
      { id: "q2", prompt: "Where does the thesis statement usually go?", options: ["End of intro", "End of essay", "Middle", "Anywhere"], correctIndex: 0 },
      { id: "q3", prompt: "Each body paragraph should focus on...", options: ["everything", "one main point", "the conclusion", "nothing"], correctIndex: 1 },
      { id: "q4", prompt: "A 'topic sentence' is...", options: ["the title", "the first sentence of a paragraph", "any sentence", "the last sentence"], correctIndex: 1 },
      { id: "q5", prompt: "The conclusion should...", options: ["introduce new ideas", "restate the thesis and wrap up", "be one word", "be a question"], correctIndex: 1 },
    ],
  },

  // ============ GRADE 8–10 · TEEN LEARNERS ============
  {
    id: "math-8-algebra-intro",
    subject: "math",
    grade: 8,
    title: "Algebra: solving for x",
    description: "Variables, equations, and isolating x.",
    emoji: "🧠",
    xpReward: 160,
    questions: [
      { id: "q1", prompt: "Solve: x + 5 = 12", options: ["5", "6", "7", "8"], correctIndex: 2, explanation: "Subtract 5 from both sides: x = 12 - 5 = 7." },
      { id: "q2", prompt: "Solve: 3x = 21", options: ["5", "6", "7", "8"], correctIndex: 2 },
      { id: "q3", prompt: "Solve: 2x - 4 = 10", options: ["5", "6", "7", "8"], correctIndex: 2, explanation: "Add 4: 2x = 14. Divide by 2: x = 7." },
      { id: "q4", prompt: "If 5x + 3 = 28, then x = ?", options: ["3", "4", "5", "6"], correctIndex: 2 },
      { id: "q5", prompt: "Solve: x/4 = 6", options: ["12", "18", "24", "30"], correctIndex: 2 },
    ],
  },
  {
    id: "math-9-geometry-angles",
    subject: "math",
    grade: 9,
    title: "Geometry: angles & triangles",
    description: "Angle types, triangle sum, and basic theorems.",
    emoji: "📐",
    xpReward: 170,
    questions: [
      { id: "q1", prompt: "Angles in a triangle add up to...", options: ["90°", "180°", "270°", "360°"], correctIndex: 1 },
      { id: "q2", prompt: "A right angle is...", options: ["45°", "90°", "180°", "360°"], correctIndex: 1 },
      { id: "q3", prompt: "If two angles of a triangle are 60° and 70°, the third is...", options: ["40°", "50°", "60°", "70°"], correctIndex: 1, explanation: "180 - 60 - 70 = 50°." },
      { id: "q4", prompt: "An equilateral triangle has each angle equal to...", options: ["45°", "60°", "75°", "90°"], correctIndex: 1 },
      { id: "q5", prompt: "Angles in a quadrilateral add up to...", options: ["180°", "270°", "360°", "540°"], correctIndex: 2 },
    ],
  },
  {
    id: "math-10-pythagoras",
    subject: "math",
    grade: 10,
    title: "Pythagorean theorem",
    description: "a² + b² = c² — find the side of a right triangle.",
    emoji: "🔺",
    xpReward: 180,
    questions: [
      { id: "q1", prompt: "If a = 3 and b = 4, what is c?", options: ["5", "6", "7", "8"], correctIndex: 0, explanation: "3² + 4² = 9 + 16 = 25. √25 = 5." },
      { id: "q2", prompt: "If a = 5 and b = 12, c = ?", options: ["13", "15", "17", "20"], correctIndex: 0 },
      { id: "q3", prompt: "A right triangle has c = 10 and a = 6. Find b.", options: ["4", "6", "8", "10"], correctIndex: 2, explanation: "b² = c² − a² = 100 − 36 = 64. b = 8." },
      { id: "q4", prompt: "If a = 8 and b = 15, c = ?", options: ["17", "20", "23", "25"], correctIndex: 0 },
      { id: "q5", prompt: "The theorem works only for which kind of triangle?", options: ["any", "right", "equilateral", "scalene"], correctIndex: 1 },
    ],
  },
  {
    id: "english-9-figurative",
    subject: "english",
    grade: 9,
    title: "Figurative language",
    description: "Metaphors, similes, personification, and hyperbole.",
    emoji: "🎭",
    xpReward: 150,
    questions: [
      { id: "q1", prompt: "'Her smile was sunshine.' This is a...", options: ["simile", "metaphor", "hyperbole", "irony"], correctIndex: 1 },
      { id: "q2", prompt: "'Brave as a lion.' This is a...", options: ["simile", "metaphor", "alliteration", "irony"], correctIndex: 0 },
      { id: "q3", prompt: "'The wind whispered through the trees.' This is...", options: ["metaphor", "personification", "hyperbole", "irony"], correctIndex: 1 },
      { id: "q4", prompt: "'I've told you a million times.' This is...", options: ["simile", "metaphor", "hyperbole", "irony"], correctIndex: 2 },
      { id: "q5", prompt: "Similes always use the words...", options: ["like or as", "is or was", "and or but", "the or a"], correctIndex: 0 },
    ],
  },
  {
    id: "english-10-research-skills",
    subject: "english",
    grade: 10,
    title: "Research & citations",
    description: "Evaluate sources, paraphrase, and cite without plagiarizing.",
    emoji: "🔍",
    xpReward: 170,
    questions: [
      { id: "q1", prompt: "Which is the MOST reliable source?", options: ["A random blog", "An academic journal", "A TikTok", "A meme"], correctIndex: 1 },
      { id: "q2", prompt: "Using someone's words without credit is...", options: ["paraphrasing", "summarizing", "plagiarism", "citing"], correctIndex: 2 },
      { id: "q3", prompt: "A paraphrase should be...", options: ["a copy", "in your own words but same idea", "shorter only", "a quote"], correctIndex: 1 },
      { id: "q4", prompt: "When in doubt, you should...", options: ["skip the citation", "cite the source", "change a few words", "delete it"], correctIndex: 1 },
      { id: "q5", prompt: "A primary source is...", options: ["original/first-hand", "a summary", "a blog about it", "Wikipedia"], correctIndex: 0 },
    ],
  },

  // ============ SCIENCE — across grades ============
  {
    id: "science-3-living-things",
    subject: "science",
    grade: 3,
    title: "Living vs non-living",
    description: "What makes something alive? Spot the difference.",
    emoji: "🌱",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "Which is LIVING?", options: ["A rock", "A tree", "A pencil", "A chair"], correctIndex: 1 },
      { id: "q2", prompt: "Living things can...", options: ["grow", "stay forever the same", "be plugged in", "be melted"], correctIndex: 0 },
      { id: "q3", prompt: "Plants need ___ to grow.", options: ["only water", "only sunlight", "water, sunlight, and air", "milk"], correctIndex: 2 },
      { id: "q4", prompt: "Which is NON-living?", options: ["A fish", "A cat", "A river", "A frog"], correctIndex: 2 },
      { id: "q5", prompt: "All living things eventually...", options: ["stay forever", "die", "turn to stone", "become magic"], correctIndex: 1 },
    ],
  },
  {
    id: "science-4-water-cycle",
    subject: "science",
    grade: 4,
    title: "The water cycle",
    description: "Evaporation, condensation, precipitation — the planet's loop.",
    emoji: "💧",
    xpReward: 130,
    questions: [
      { id: "q1", prompt: "When water turns into vapor in the sky, it is called...", options: ["condensation", "evaporation", "precipitation", "collection"], correctIndex: 1 },
      { id: "q2", prompt: "Clouds are formed by...", options: ["evaporation", "condensation", "rain", "rocks"], correctIndex: 1 },
      { id: "q3", prompt: "Rain is an example of...", options: ["evaporation", "precipitation", "freezing", "melting"], correctIndex: 1 },
      { id: "q4", prompt: "The sun powers the cycle by...", options: ["cooling water", "heating water", "freezing oceans", "blowing wind"], correctIndex: 1 },
      { id: "q5", prompt: "Most of Earth's water is in the...", options: ["clouds", "rivers", "oceans", "underground"], correctIndex: 2 },
    ],
  },
  {
    id: "science-7-photosynthesis",
    subject: "science",
    grade: 7,
    title: "Photosynthesis",
    description: "How plants make food from sunlight, water, and CO₂.",
    emoji: "🌿",
    xpReward: 150,
    questions: [
      { id: "q1", prompt: "Plants need ___ from the air for photosynthesis.", options: ["oxygen", "carbon dioxide", "nitrogen", "helium"], correctIndex: 1 },
      { id: "q2", prompt: "Photosynthesis releases ___ into the air.", options: ["oxygen", "carbon dioxide", "smoke", "nothing"], correctIndex: 0 },
      { id: "q3", prompt: "The green pigment in plants is called...", options: ["melanin", "chlorophyll", "hemoglobin", "keratin"], correctIndex: 1 },
      { id: "q4", prompt: "Plants make their own food, called...", options: ["fat", "protein", "glucose (sugar)", "starch only"], correctIndex: 2 },
      { id: "q5", prompt: "Photosynthesis happens mainly in the...", options: ["roots", "stem", "leaves", "flowers"], correctIndex: 2 },
    ],
  },
  {
    id: "science-9-cells",
    subject: "science",
    grade: 9,
    title: "Cells: the basics",
    description: "Cells, nucleus, organelles — the units of life.",
    emoji: "🦠",
    xpReward: 170,
    questions: [
      { id: "q1", prompt: "The basic unit of life is the...", options: ["atom", "cell", "tissue", "organ"], correctIndex: 1 },
      { id: "q2", prompt: "The control center of a cell is the...", options: ["mitochondrion", "nucleus", "ribosome", "membrane"], correctIndex: 1 },
      { id: "q3", prompt: "Mitochondria are best known as the...", options: ["brains", "powerhouses", "skin", "trash bins"], correctIndex: 1 },
      { id: "q4", prompt: "Only plant cells have...", options: ["a nucleus", "a cell wall", "DNA", "ribosomes"], correctIndex: 1 },
      { id: "q5", prompt: "Cells with no nucleus (like bacteria) are called...", options: ["eukaryotic", "prokaryotic", "viral", "fungal"], correctIndex: 1 },
    ],
  },
  {
    id: "science-10-newton-laws",
    subject: "science",
    grade: 10,
    title: "Newton's laws of motion",
    description: "Three rules that explain how things move.",
    emoji: "🍎",
    xpReward: 200,
    questions: [
      { id: "q1", prompt: "An object at rest stays at rest unless... (1st law)", options: ["it floats", "a force acts on it", "you watch it", "it's sunny"], correctIndex: 1 },
      { id: "q2", prompt: "The 2nd law: Force = ?", options: ["mass × velocity", "mass × acceleration", "mass + acceleration", "energy × time"], correctIndex: 1 },
      { id: "q3", prompt: "3rd law: every action has an equal and opposite...", options: ["force", "reaction", "energy", "speed"], correctIndex: 1 },
      { id: "q4", prompt: "Heavier objects need ___ force to accelerate the same amount.", options: ["less", "the same", "more", "no"], correctIndex: 2 },
      { id: "q5", prompt: "A rocket launches because of which law?", options: ["1st", "2nd", "3rd", "none"], correctIndex: 2 },
    ],
  },

  // ============ ARALING PANLIPUNAN — across grades ============
  {
    id: "ap-3-bayan-ko",
    subject: "araling-panlipunan",
    grade: 3,
    title: "Ang Pilipinas: aking bansa",
    description: "Mga rehiyon, bandila, at simbolo ng Pilipinas.",
    emoji: "🇵🇭",
    xpReward: 100,
    questions: [
      { id: "q1", prompt: "Ilan ang pangunahing pulo ng Pilipinas?", options: ["2", "3", "5", "7"], correctIndex: 1, explanation: "Luzon, Visayas, at Mindanao — tatlo." },
      { id: "q2", prompt: "Ano ang pambansang bulaklak ng Pilipinas?", options: ["Rosas", "Sampaguita", "Gumamela", "Orchid"], correctIndex: 1 },
      { id: "q3", prompt: "Ano ang pambansang ibon?", options: ["Maya", "Tikling", "Agila ng Pilipinas", "Loro"], correctIndex: 2 },
      { id: "q4", prompt: "Ang kabisera ng Pilipinas ay...", options: ["Cebu", "Davao", "Manila", "Baguio"], correctIndex: 2 },
      { id: "q5", prompt: "Ilang bituin ang nasa bandila ng Pilipinas?", options: ["1", "2", "3", "5"], correctIndex: 2 },
    ],
  },
  {
    id: "ap-5-bayani",
    subject: "araling-panlipunan",
    grade: 5,
    title: "Mga bayani ng Pilipinas",
    description: "Sina Rizal, Bonifacio, at iba pang bayani ng bansa.",
    emoji: "⚔️",
    xpReward: 140,
    questions: [
      { id: "q1", prompt: "Sino ang pambansang bayani ng Pilipinas?", options: ["Bonifacio", "Aguinaldo", "Rizal", "Mabini"], correctIndex: 2 },
      { id: "q2", prompt: "Sino ang 'Ama ng Katipunan'?", options: ["Rizal", "Bonifacio", "Aguinaldo", "Lapu-Lapu"], correctIndex: 1 },
      { id: "q3", prompt: "Sinong pinuno ang tumalo kay Magellan sa Mactan?", options: ["Rizal", "Bonifacio", "Lapu-Lapu", "Aguinaldo"], correctIndex: 2 },
      { id: "q4", prompt: "Ang 'Utak ng Himagsikan' ay si...", options: ["Mabini", "Rizal", "Bonifacio", "Luna"], correctIndex: 0 },
      { id: "q5", prompt: "Sinong nobela ni Rizal ang naglantad ng pang-aabuso ng Espanyol?", options: ["Florante at Laura", "Noli Me Tangere", "Ibong Adarna", "Mi Ultimo Adios"], correctIndex: 1 },
    ],
  },
  {
    id: "ap-7-asyano",
    subject: "araling-panlipunan",
    grade: 7,
    title: "Mga bansa sa Asya",
    description: "Heograpiya at kultura ng mga kapitbahay nating bansa.",
    emoji: "🌏",
    xpReward: 150,
    questions: [
      { id: "q1", prompt: "Pinakamalaking bansa sa Asya ayon sa populasyon?", options: ["Hapon", "India", "China", "Indonesia"], correctIndex: 2 },
      { id: "q2", prompt: "Saang rehiyon kabilang ang Pilipinas?", options: ["Hilagang Asya", "Timog-Silangang Asya", "Kanlurang Asya", "Gitnang Asya"], correctIndex: 1 },
      { id: "q3", prompt: "Aling bansa ang tinatawag na 'Lupain ng Sumisikat na Araw'?", options: ["China", "Korea", "Hapon", "Vietnam"], correctIndex: 2 },
      { id: "q4", prompt: "Anong samahan ang pinagsasamahan ng mga bansa sa Timog-Silangang Asya?", options: ["EU", "ASEAN", "UN", "NATO"], correctIndex: 1 },
      { id: "q5", prompt: "Aling ilog ang pinakamahaba sa Asya?", options: ["Yangtze", "Ganges", "Mekong", "Indus"], correctIndex: 0 },
    ],
  },
  {
    id: "ap-9-ekonomiya",
    subject: "araling-panlipunan",
    grade: 9,
    title: "Ekonomiya: supply at demand",
    description: "Pagkakaintindi sa presyo, pangangailangan, at kakayahan.",
    emoji: "💰",
    xpReward: 170,
    questions: [
      { id: "q1", prompt: "Kapag mataas ang demand at mababa ang supply, ang presyo ay...", options: ["bababa", "mananatili", "tataas", "wala"], correctIndex: 2 },
      { id: "q2", prompt: "Ang 'inflation' ay nangangahulugan ng...", options: ["pagbaba ng presyo", "pagtaas ng presyo", "pareho lang", "walang halaga"], correctIndex: 1 },
      { id: "q3", prompt: "GDP ay sukatan ng...", options: ["populasyon", "kayamanan ng pamilya", "kabuuang produksyon ng bansa", "edukasyon"], correctIndex: 2 },
      { id: "q4", prompt: "Ang 'opportunity cost' ay...", options: ["presyo ng pagkain", "ang pinili mong isuko", "buwis", "utang"], correctIndex: 1 },
      { id: "q5", prompt: "Sino ang nagtatakda ng patakaran sa pera sa Pilipinas?", options: ["Senado", "Bangko Sentral", "Kongreso", "DSWD"], correctIndex: 1 },
    ],
  },
];

/** All lessons for a subject (optionally filtered by grade). */
export function getLessonsBySubject(subject: SubjectId, grade?: number): Lesson[] {
  return LESSONS.filter(
    (l) => l.subject === subject && (grade == null || l.grade === grade)
  );
}

/** Find one lesson by id. */
export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
