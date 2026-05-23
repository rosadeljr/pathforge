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
