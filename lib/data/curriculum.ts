/**
 * Curriculum helpers — sit on top of learner-lessons.
 *
 * Centralises lesson lookups, prerequisite resolution, mastery scoring,
 * and subject XP rollups. Designed so the lesson player, parent
 * dashboard, career system, and "next best lesson" recommender can all
 * derive views from one place without dragging the raw LESSONS array
 * through component code.
 */

import { LESSONS, type Lesson } from "./learner-lessons";
import { SUBJECTS, type SubjectId } from "./learner";

/** Get all lessons published for surface. */
export function publishedLessons(): Lesson[] {
  return LESSONS.filter(
    (l) => !l.reviewStatus || l.reviewStatus !== "draft"
  );
}

/** Lessons for a competency slug. */
export function lessonsForCompetency(competency: string): Lesson[] {
  return LESSONS.filter((l) => l.competency === competency);
}

/** Lessons for a subject + grade. */
export function lessonsForGradeSubject(
  subject: SubjectId,
  grade: number
): Lesson[] {
  return LESSONS.filter((l) => l.subject === subject && l.grade === grade);
}

/** All unique competencies inside a subject (in declared order). */
export function competenciesForSubject(subject: SubjectId): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const l of LESSONS) {
    if (l.subject !== subject || !l.competency) continue;
    if (!seen.has(l.competency)) {
      seen.add(l.competency);
      out.push(l.competency);
    }
  }
  return out;
}

/** Resolve a lesson's prerequisite lessons (returns the first match per competency). */
export function prerequisiteLessons(lesson: Lesson): Lesson[] {
  if (!lesson.prerequisites?.length) return [];
  const found: Lesson[] = [];
  for (const competency of lesson.prerequisites) {
    const first = LESSONS.find((l) => l.competency === competency);
    if (first) found.push(first);
  }
  return found;
}

/**
 * Compute subject XP rollups from a list of completion analytics events.
 * Each event must carry event_payload.subject and xp_delta.
 *
 * Returns a map of SubjectId → XP earned so far in that subject.
 */
export function subjectXpFromEvents(
  events: Array<{ event_payload?: { subject?: string } | null; xp_delta?: number | null }>
): Record<SubjectId, number> {
  const out: Record<SubjectId, number> = {
    math: 0,
    english: 0,
    filipino: 0,
    science: 0,
    "araling-panlipunan": 0,
  };
  for (const e of events) {
    const s = e?.event_payload?.subject as SubjectId | undefined;
    if (!s || !(s in out)) continue;
    out[s] += e.xp_delta || 0;
  }
  return out;
}

/**
 * Compute mastery score (0..1) for a single lesson given the learner's
 * answer history. mastered = score >= masteryThreshold (default 0.8).
 *
 * Currently uses first-try-correct / total questions, the same metric
 * the lesson player already tracks.
 */
export function masteryScore(firstTryCorrect: boolean[], totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const correct = firstTryCorrect.filter(Boolean).length;
  return correct / totalQuestions;
}

export function isMastered(lesson: Lesson, score: number): boolean {
  const threshold = lesson.masteryThreshold ?? 0.8;
  return score >= threshold;
}

/**
 * Suggest the "next best lesson" for a learner.
 *
 * Priority order:
 *   1. An un-mastered lesson at the learner's grade in a picked subject
 *      whose prerequisites are satisfied.
 *   2. Any un-mastered lesson at the learner's grade.
 *   3. Closest-grade un-mastered lesson.
 */
export function nextBestLesson(opts: {
  grade: number | null | undefined;
  pickedSubjects: SubjectId[];
  masteredCompetencies: Set<string>;
  completedLessonIds: Set<string>;
}): Lesson | null {
  const { grade, pickedSubjects, masteredCompetencies, completedLessonIds } = opts;
  if (!grade) return null;

  const eligible = (l: Lesson) => {
    if (completedLessonIds.has(l.id)) return false;
    if (l.reviewStatus === "draft") return false;
    if (!l.prerequisites?.length) return true;
    return l.prerequisites.every((p) => masteredCompetencies.has(p));
  };

  const pickedSet = new Set(pickedSubjects);

  // 1. Same grade + picked subject + prereqs met.
  const inGradeAndPicked = LESSONS.find(
    (l) =>
      l.grade === grade &&
      (pickedSet.size === 0 || pickedSet.has(l.subject)) &&
      eligible(l)
  );
  if (inGradeAndPicked) return inGradeAndPicked;

  // 2. Same grade.
  const inGrade = LESSONS.find((l) => l.grade === grade && eligible(l));
  if (inGrade) return inGrade;

  // 3. Closest grade.
  const candidates = LESSONS.filter(eligible).sort(
    (a, b) => Math.abs(a.grade - grade) - Math.abs(b.grade - grade)
  );
  return candidates[0] || null;
}

/** Validate that the SubjectId list contains only known subjects. */
export function isValidSubject(id: string): id is SubjectId {
  return SUBJECTS.some((s) => s.id === id);
}
