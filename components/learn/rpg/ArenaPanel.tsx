"use client";

/**
 * ArenaPanel — the Knowledge Arena. Kid-safe educational competition against a
 * deterministic, anonymous "ghost" opponent (no chat, no real names, matched by
 * grade). Flow: choose mode → matchup → play a short challenge → results +
 * reward summary + encouraging feedback. No pay-to-win, no negative language.
 */

import { useMemo, useState } from "react";
import { ShieldCheck, Trophy, RotateCcw } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import {
  ARENA_MODES,
  ARENA_SAFETY_RULES,
  makeGhost,
  scoreDuel,
  type ArenaMode,
  type ArenaResult,
} from "@/lib/data/rpg-arena";
import { Panel, PanelHeader, ScreenIntro } from "./primitives";
import { LevelProgressBar } from "./LevelProgressBar";
import { logRpgEvent } from "@/lib/rpg/track";
import { bumpDailyGoal } from "@/lib/rpg/daily-goals";
import { Celebration } from "./Celebration";

type Phase = "select" | "matchup" | "playing" | "result";
interface MiniQ {
  prompt: string;
  options: string[];
  answer: number;
}

export function ArenaPanel({ ps }: { ps: PlayerState }) {
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<ArenaMode | null>(null);
  const [seed, setSeed] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState<ArenaResult | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const ghost = useMemo(() => (mode ? makeGhost(mode.id, ps.grade, seed) : null), [mode, ps.grade, seed]);
  const questions = useMemo(() => (mode ? buildQuestions(mode, ps.grade, seed) : []), [mode, ps.grade, seed]);

  function choose(m: ArenaMode) {
    setMode(m);
    setPhase("matchup");
  }
  function begin() {
    setQIndex(0);
    setCorrect(0);
    setPicked(null);
    setPhase("playing");
  }
  function answer(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const isRight = i === questions[qIndex].answer;
    const nextCorrect = correct + (isRight ? 1 : 0);
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        const res = scoreDuel(mode!, nextCorrect, questions.length, ghost!);
        setResult(res);
        setPhase("result");
        if (res.outcome === "win") setCelebrate(true);
        void logRpgEvent("rpg_arena_completed", { mode: mode!.id, correct: res.correct, total: res.total, accuracy: res.accuracy, outcome: res.outcome }, res.xpEarned);
        bumpDailyGoal("arena");
      } else {
        setCorrect(nextCorrect);
        setQIndex(qIndex + 1);
        setPicked(null);
      }
    }, 500);
  }
  function rematch() {
    setSeed((s) => s + 1);
    setResult(null);
    setPhase("matchup");
  }
  function backToSelect() {
    setMode(null);
    setResult(null);
    setPhase("select");
  }

  return (
    <div className="space-y-4">
      <ScreenIntro
        emoji="⚔️"
        eyebrow="Live Duels"
        title="Knowledge Arena"
        blurb="Test your knowledge in fast, fair duels against an AI rival matched to your level. Every match earns XP — no chat, no real names, ever."
        accent="#f43f5e"
        stats={[
          { value: ARENA_MODES.length, label: "Duel modes" },
          { value: `Grade ${ps.grade}`, label: "Your bracket" },
          { value: ps.cls?.name ?? "—", label: "Fighting as" },
        ]}
        chips={ARENA_SAFETY_RULES.map((r) => (
          <span key={r} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            <ShieldCheck size={10} /> {r}
          </span>
        ))}
      />

      {phase === "select" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ARENA_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => choose(m)}
              className="group flex flex-col gap-2 overflow-hidden rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(8,11,18,0.65))", border: `1px solid ${m.accent}55` }}
            >
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: `${m.accent}22`, border: `1px solid ${m.accent}66` }}>
                  {m.emoji}
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">{m.name}</h3>
                  <p className="text-[10px] text-slate-400">{m.cooperative ? "Co-op" : "1v1"} · {m.questions} rounds{m.timed ? " · timed" : ""}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">{m.blurb}</p>
              <span className="mt-auto text-[11px] font-bold" style={{ color: m.accent }}>+{m.xpReward} XP · Play →</span>
            </button>
          ))}
        </div>
      )}

      {phase === "matchup" && mode && ghost && (
        <Panel accent={mode.accent}>
          <PanelHeader emoji={mode.emoji} title={`${mode.name} — Matchup`} subtitle="Matched by your grade band" accent={mode.accent} />
          <div className="flex items-center justify-around gap-3 p-5">
            <Fighter emoji={ps.cls?.emoji ?? "🧑‍🎓"} name={ps.name} sub={`Grade ${ps.grade}`} accent={mode.accent} />
            <span className="font-display text-2xl font-black text-slate-500">VS</span>
            <Fighter emoji={ghost.emoji} name={ghost.codename} sub={`Grades ${ghost.gradeBand[0]}–${ghost.gradeBand[1]}`} accent="#94a3b8" />
          </div>
          <div className="flex gap-2 px-5 pb-5">
            <button onClick={backToSelect} className="rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10">
              Back
            </button>
            <button
              onClick={begin}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-slate-900 transition active:scale-[0.98]"
              style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }}
            >
              Start duel
            </button>
          </div>
        </Panel>
      )}

      {phase === "playing" && mode && questions[qIndex] && (
        <Panel accent={mode.accent}>
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span>Round {qIndex + 1} / {questions.length}</span>
              <span>✓ {correct}</span>
            </div>
            <LevelProgressBar pct={Math.round((qIndex / questions.length) * 100)} accent={mode.accent} height={6} showShine={false} />
            <h3 className="mt-4 text-center font-display text-xl font-bold text-white">{questions[qIndex].prompt}</h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {questions[qIndex].options.map((opt, i) => {
                const isAnswer = i === questions[qIndex].answer;
                const show = picked !== null;
                return (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    disabled={picked !== null}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
                    style={{
                      background: show ? (isAnswer ? "rgba(52,211,153,0.2)" : i === picked ? "rgba(244,63,94,0.18)" : "rgba(255,255,255,0.04)") : "rgba(255,255,255,0.05)",
                      border: `1px solid ${show && isAnswer ? "#34d399" : "rgba(255,255,255,0.10)"}`,
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </Panel>
      )}

      {phase === "result" && result && mode && (
        <Panel accent={result.outcome === "win" ? "#34d399" : mode.accent} glow>
          <div className="p-6 text-center">
            <Trophy size={36} className="mx-auto" style={{ color: result.outcome === "win" ? "#fbbf24" : "#94a3b8" }} />
            <h3 className="mt-2 font-display text-2xl font-black text-white">
              {result.outcome === "win" ? "You won!" : result.outcome === "tie" ? "It's a tie!" : "Good effort!"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-300">{result.encouragement}</p>

            <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2 text-left">
              <ResultStat label="Your score" value={`${result.correct}/${result.total}`} />
              <ResultStat label="Accuracy" value={`${Math.round(result.accuracy * 100)}%`} />
              <ResultStat label={`${result.ghost.codename}`} value={`${Math.round(result.ghost.targetAccuracy * 100)}%`} />
              <ResultStat label="XP earned" value={`+${result.xpEarned}`} accent="#a78bfa" />
            </div>

            <div className="mt-5 flex justify-center gap-2">
              <button onClick={rematch} className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10">
                <RotateCcw size={14} /> Rematch
              </button>
              <button onClick={backToSelect} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900" style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }}>
                New duel
              </button>
            </div>
            <p className="mt-3 text-[10px] text-slate-500">Arena XP is shown for fun in this preview and isn't saved yet.</p>
          </div>
        </Panel>
      )}

      <Celebration
        show={celebrate}
        title="Victory!"
        subtitle={result ? `+${result.xpEarned} XP earned` : undefined}
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}

function Fighter({ emoji, name, sub, accent }: { emoji: string; name: string; sub: string; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="grid h-16 w-16 place-items-center rounded-2xl text-3xl" style={{ background: `${accent}22`, border: `2px solid ${accent}88` }}>
        {emoji}
      </span>
      <span className="max-w-[100px] truncate text-sm font-bold text-white">{name}</span>
      <span className="text-[10px] text-slate-400">{sub}</span>
    </div>
  );
}

function ResultStat({ label, value, accent = "#e2e8f0" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="truncate text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-display text-lg font-bold tabular-nums" style={{ color: accent }}>{value}</div>
    </div>
  );
}

/** Tiny built-in challenge generator. Math/speed = generated arithmetic; others
 *  use a small static bank. Deterministic by seed for fair rematches. */
function buildQuestions(mode: ArenaMode, grade: number, seed: number): MiniQ[] {
  const n = Math.min(6, mode.questions);
  if (mode.id === "speed-math" || mode.subject === "math") {
    const out: MiniQ[] = [];
    let s = seed * 7 + grade;
    for (let i = 0; i < n; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const max = grade <= 3 ? 12 : grade <= 6 ? 30 : 99;
      const a = (s % max) + 1;
      const b = ((s >> 4) % max) + 1;
      const ans = a + b;
      const opts = shuffle([ans, ans + 1, ans - 1 < 0 ? ans + 2 : ans - 1, ans + 3], s);
      out.push({ prompt: `${a} + ${b} = ?`, options: opts.map(String), answer: opts.indexOf(ans) });
    }
    return out;
  }
  const bank = STATIC_BANK[mode.id] ?? STATIC_BANK.default;
  return bank.slice(0, n);
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STATIC_BANK: Record<string, MiniQ[]> = {
  "vocab-duel": [
    { prompt: "Which word means 'happy'?", options: ["Joyful", "Sleepy", "Angry", "Cold"], answer: 0 },
    { prompt: "Opposite of 'big'?", options: ["Huge", "Small", "Tall", "Wide"], answer: 1 },
    { prompt: "A synonym for 'fast'?", options: ["Slow", "Quick", "Quiet", "Soft"], answer: 1 },
    { prompt: "Which is a noun?", options: ["Run", "Blue", "Dog", "Quickly"], answer: 2 },
    { prompt: "Opposite of 'begin'?", options: ["Start", "Open", "End", "Go"], answer: 2 },
    { prompt: "A synonym for 'smart'?", options: ["Clever", "Lazy", "Loud", "Late"], answer: 0 },
  ],
  "science-facts": [
    { prompt: "Water freezes into…", options: ["Steam", "Ice", "Salt", "Sand"], answer: 1 },
    { prompt: "Plants make food using…", options: ["Moonlight", "Sunlight", "Wind", "Rocks"], answer: 1 },
    { prompt: "We breathe in…", options: ["Oxygen", "Helium", "Iron", "Plastic"], answer: 0 },
    { prompt: "The sun is a…", options: ["Planet", "Moon", "Star", "Comet"], answer: 2 },
    { prompt: "How many legs does an insect have?", options: ["4", "6", "8", "10"], answer: 1 },
    { prompt: "What do bees make?", options: ["Milk", "Honey", "Silk", "Bread"], answer: 1 },
  ],
  "career-scenario": [
    { prompt: "A patient feels sick. Who helps?", options: ["Pilot", "Doctor", "Farmer", "Artist"], answer: 1 },
    { prompt: "Who designs a safe bridge?", options: ["Engineer", "Chef", "Singer", "Sailor"], answer: 0 },
    { prompt: "Who plans a ship's route?", options: ["Navigator", "Painter", "Baker", "Coder"], answer: 0 },
    { prompt: "Who writes the code for a game?", options: ["Vet", "Developer", "Nurse", "Driver"], answer: 1 },
    { prompt: "Who grows our food?", options: ["Farmer", "Lawyer", "Actor", "Banker"], answer: 0 },
  ],
  default: [
    { prompt: "5 + 7 = ?", options: ["11", "12", "13", "14"], answer: 1 },
    { prompt: "Opposite of 'up'?", options: ["Down", "Side", "Over", "In"], answer: 0 },
    { prompt: "Water freezes into…", options: ["Ice", "Steam", "Salt", "Sand"], answer: 0 },
    { prompt: "A dog says…", options: ["Moo", "Woof", "Meow", "Quack"], answer: 1 },
    { prompt: "3 × 3 = ?", options: ["6", "9", "12", "3"], answer: 1 },
    { prompt: "Which is a color?", options: ["Run", "Blue", "Loud", "Fast"], answer: 1 },
  ],
};
