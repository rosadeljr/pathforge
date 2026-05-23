import type { SubjectId } from "./learner";

/**
 * Learner mode — lesson content.
 *
 * Phase 1 ships ~8 Grade-3 Math lessons (PH-flavored where natural).
 * English, Filipino, and higher grades land in Phase 2.
 *
 * Each lesson is a sequence of multiple-choice questions with optional
 * teaching explanations. XP per lesson is fixed; the player awards a
 * bonus for first-try perfection (handled in the page).
 */

export interface LessonQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Lesson {
  id: string;
  subject: SubjectId;
  grade: number;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  questions: LessonQuestion[];
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
