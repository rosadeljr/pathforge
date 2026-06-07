"use client";

/**
 * QuestCard — an RPG quest interface card. Surfaces quest type, difficulty,
 * time, XP + class XP, skill reward, subject, career, tier availability, and a
 * stateful action (Start / Continue / Locked / Completed).
 */

import Link from "next/link";
import { Clock, Star, Sparkles } from "lucide-react";
import type { Quest } from "@/lib/data/rpg-quests";
import { QUEST_TYPE_META, DIFFICULTY_META, questParentValue, questLessonHref } from "@/lib/data/rpg-quests";
import type { QuestStatus, PlayerState } from "@/lib/rpg/state";
import { questStatus } from "@/lib/rpg/state";
import { getSubject } from "@/lib/data/learner";
import { getCareer } from "@/lib/data/careers";
import { getSkill } from "@/lib/data/rpg-skills";
import { StatusChip } from "./primitives";
import { LockedContentOverlay } from "./LockedContentOverlay";
import { logRpgEvent } from "@/lib/rpg/track";

function actionHref(q: Quest, grade?: number): string {
  if (q.questType === "arena") return "/learn/arena";
  if (q.completionType === "ai_feedback") return "/mentor";
  // jump straight into a real, grade-appropriate lesson when there is one
  const lesson = questLessonHref(q, grade);
  if (lesson) return lesson;
  if (q.subject) return `/learn/${q.subject}`;
  return "/learn/map";
}

export function QuestCard({ quest, ps, highlight = false }: { quest: Quest; ps: PlayerState; highlight?: boolean }) {
  const status: QuestStatus = questStatus(quest, ps);
  const meta = QUEST_TYPE_META[quest.questType];
  const diff = DIFFICULTY_META[quest.difficulty];
  const subject = quest.subject ? getSubject(quest.subject) : undefined;
  const careers = quest.careerIds.map(getCareer).filter(Boolean).slice(0, 2);
  const skill = quest.skillRewards[0] ? getSkill(quest.skillRewards[0]) : undefined;
  const locked = status === "locked";
  const completed = status === "completed";
  const needsUpgrade = quest.paidTier !== "free" && ps.tier === "free";

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(8,11,18,0.65))",
        border: `1px solid ${highlight ? `${meta.accent}aa` : "rgba(255,255,255,0.10)"}`,
        boxShadow: highlight ? `0 0 0 1px ${meta.accent}55, 0 10px 28px -14px ${meta.accent}aa` : "inset 0 1px 0 rgba(255,255,255,0.08)",
        opacity: completed ? 0.85 : 1,
      }}
    >
      <span aria-hidden className="block h-1 w-full" style={{ background: `linear-gradient(90deg, ${meta.accent}, transparent)` }} />

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* header */}
        <div className="flex items-start gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ background: `${meta.accent}22`, color: meta.accent }}>
                {meta.label}
              </span>
              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: `${diff.color}1f`, color: diff.color }}>
                {diff.label}
              </span>
              {quest.paidTier !== "free" && (
                <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                  {quest.paidTier === "pro" ? "PRO" : "FAMILY"}
                </span>
              )}
            </div>
            <h3 className="mt-1 font-display text-sm font-bold leading-tight text-white">{quest.title}</h3>
          </div>
          <StatusChip status={status} />
        </div>

        <p className="line-clamp-2 text-xs text-slate-400">{quest.description}</p>

        {/* rewards row */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Chip icon={<Star size={11} />} text={`+${quest.xpReward} XP`} color="#a78bfa" />
          <Chip icon={<Sparkles size={11} />} text={`+${quest.classXpReward} class power`} color="#38bdf8" />
          <Chip icon={<Clock size={11} />} text={`${quest.estimatedMinutes} min`} color="#94a3b8" />
          {subject && <Chip text={`${subject.emoji} ${subject.title}`} color={subject.accentColor} />}
        </div>

        {/* skill + career footnote */}
        {(skill || careers.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            {skill && <span>🎁 Unlocks: {skill.name}</span>}
            {careers.length > 0 && (
              <span className="inline-flex items-center gap-1">
                Careers {careers.map((c) => <span key={c!.id} title={c!.title}>{c!.emoji}</span>)}
              </span>
            )}
          </div>
        )}

        {/* parent-visible value */}
        <div
          className="rounded-lg px-2 py-1.5 text-[10px] leading-snug"
          style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.18)" }}
        >
          <span className="font-semibold text-sky-300">For parents:</span>{" "}
          <span className="text-slate-300">
            {questParentValue(quest)}
            {careers[0] ? ` Connects to becoming a ${careers[0]!.title}.` : ""}
          </span>
        </div>

        {/* action */}
        <div className="mt-auto pt-1">
          {completed ? (
            <div className="w-full rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-300">✓ Completed</div>
          ) : locked ? (
            <div className="w-full rounded-xl bg-white/[0.05] py-2 text-center text-xs font-semibold text-slate-400">🔒 Locked</div>
          ) : (
            <Link
              href={actionHref(quest, ps.grade)}
              onClick={() => void logRpgEvent("rpg_quest_started", { quest_id: quest.id, subject: quest.subject ?? null, career: quest.careerIds[0] ?? null })}
              className="block w-full rounded-xl py-2 text-center text-xs font-bold text-slate-900 transition active:scale-[0.98]"
              style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}
            >
              {status === "in-progress" ? "Continue" : "Start quest"}
            </Link>
          )}
        </div>
      </div>

      {locked && <LockedContentOverlay reasons={buildLockReasons(quest, ps)} showUpgrade={needsUpgrade} compact />}
    </div>
  );
}

function buildLockReasons(quest: Quest, ps: PlayerState): string[] {
  const reasons: string[] = [];
  if (ps.characterLevel < quest.requiredLevel) reasons.push(`Reach level ${quest.requiredLevel}`);
  if (quest.paidTier !== "free" && ps.tier === "free") reasons.push(`Unlocks with ${quest.paidTier === "pro" ? "Pro" : "Family"}`);
  return reasons.length ? reasons : ["Locked"];
}

function Chip({ icon, text, color }: { icon?: React.ReactNode; text: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold" style={{ background: `${color}1a`, color }}>
      {icon}
      {text}
    </span>
  );
}
