/**
 * Celebration effects — confetti + sound for level-ups, achievements, milestones.
 * Sounds are generated procedurally via Web Audio API (no files needed).
 */

import confetti from "canvas-confetti";

const SOUND_PREF_KEY = "pathforge-sound-enabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const pref = localStorage.getItem(SOUND_PREF_KEY);
  // Default ON — users can disable in settings
  return pref !== "0";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_PREF_KEY, enabled ? "1" : "0");
}

// ============================================================
// Procedural sound generation (no audio files needed)
// ============================================================

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  release?: number;
}

function playTone({
  frequency,
  duration,
  type = "sine",
  volume = 0.15,
  attack = 0.01,
  release = 0.1,
}: ToneOptions, startOffset = 0): void {
  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);

  // ADSR envelope
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + attack);
  gain.gain.setValueAtTime(volume, t + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + duration);
}

// ============================================================
// Celebration types
// ============================================================

/** Standard quest completion — small ping + tiny confetti burst */
export function celebrateQuestComplete(): void {
  if (isSoundEnabled()) {
    playTone({ frequency: 660, duration: 0.12, type: "triangle", volume: 0.1 });
    playTone({ frequency: 880, duration: 0.18, type: "triangle", volume: 0.08 }, 0.08);
  }
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    colors: ["#6366f1", "#a855f7", "#ec4899"],
    scalar: 0.7,
    ticks: 100,
  });
}

/** Level up — bigger celebration, ascending chime */
export function celebrateLevelUp(): void {
  if (isSoundEnabled()) {
    // C major arpeggio (C-E-G-C)
    playTone({ frequency: 523.25, duration: 0.18, type: "triangle", volume: 0.18 }, 0);
    playTone({ frequency: 659.25, duration: 0.18, type: "triangle", volume: 0.18 }, 0.1);
    playTone({ frequency: 783.99, duration: 0.18, type: "triangle", volume: 0.18 }, 0.2);
    playTone({ frequency: 1046.5, duration: 0.35, type: "triangle", volume: 0.2 }, 0.3);
  }
  // Big confetti from both sides
  const colors = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors,
    ticks: 200,
  });
  confetti({
    particleCount: 60,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors,
    ticks: 200,
  });
}

/** Achievement unlocked — bell + golden confetti */
export function celebrateAchievement(): void {
  if (isSoundEnabled()) {
    // Bell-like: perfect 5th interval
    playTone({ frequency: 880, duration: 0.6, type: "sine", volume: 0.15, release: 0.5 });
    playTone({ frequency: 1318.51, duration: 0.6, type: "sine", volume: 0.12, release: 0.5 }, 0.02);
  }
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#fbbf24", "#f59e0b", "#ef4444", "#a855f7"],
    shapes: ["star", "circle"],
    ticks: 300,
    scalar: 1.1,
  });
}

/** Streak milestone (7d/30d/100d) — special celebration */
export function celebrateStreak(days: number): void {
  if (isSoundEnabled()) {
    // Triumphant ascending fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      playTone({ frequency: freq, duration: 0.2, type: "triangle", volume: 0.15 }, i * 0.08);
    });
  }
  // Fire-themed confetti
  const colors = days >= 30 ? ["#ef4444", "#f59e0b", "#fbbf24"] : ["#f59e0b", "#fbbf24", "#fde047"];
  confetti({
    particleCount: 100,
    angle: 90,
    spread: 120,
    origin: { y: 0.5 },
    colors,
    ticks: 250,
    scalar: 1.2,
  });
}
