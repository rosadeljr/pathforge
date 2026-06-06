"use client";

/**
 * TownWorld — a 2D top-down explorable Forgeheart City. Steer your hero with
 * tap/click-to-move or WASD/arrow keys; the camera follows. Walk up to a
 * building or subject portal to open that activity (Enter / tap the prompt).
 *
 * Pure DOM + SVG (no game engine). Movement runs in a single rAF loop that
 * mutates refs directly (no per-frame React re-render). Reduced-motion aware.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import type { PlayerState } from "@/lib/rpg/state";
import { HeroSprite } from "./HeroSprite";

const WORLD_W = 1600;
const WORLD_H = 1200;
const SPEED = 240; // px/sec
const AV_R = 16;

type SpotKind = "building" | "portal";
interface Spot {
  id: string;
  label: string;
  x: number; // center
  y: number;
  route: string;
  accent: string;
  kind: SpotKind;
  w?: number; // building footprint
  h?: number;
  glyph?: "quest" | "class" | "guild" | "skill" | "shop" | "arena" | "home";
}

const SPOTS: Spot[] = [
  { id: "quest", label: "Quest Board", x: 330, y: 300, route: "/learn/quests", accent: "#f59e0b", kind: "building", w: 120, h: 96, glyph: "quest" },
  { id: "class", label: "Class Hall", x: 770, y: 250, route: "/learn/skills", accent: "#a78bfa", kind: "building", w: 140, h: 110, glyph: "class" },
  { id: "guild", label: "Career Guild Hall", x: 1200, y: 300, route: "/learn/guilds", accent: "#fb7185", kind: "building", w: 150, h: 110, glyph: "guild" },
  { id: "skill", label: "Skill Tree Hall", x: 1320, y: 660, route: "/learn/skills", accent: "#34d399", kind: "building", w: 130, h: 100, glyph: "skill" },
  { id: "shop", label: "Reward Shop", x: 300, y: 690, route: "/learn/rewards", accent: "#fbbf24", kind: "building", w: 120, h: 96, glyph: "shop" },
  { id: "arena", label: "Knowledge Arena", x: 830, y: 990, route: "/learn/arena", accent: "#f43f5e", kind: "building", w: 150, h: 110, glyph: "arena" },
  { id: "parent", label: "Parent Report Center", x: 1300, y: 990, route: "/parent", accent: "#60a5fa", kind: "building", w: 130, h: 100, glyph: "home" },
  // subject portals
  { id: "p-math", label: "Number Kingdom", x: 560, y: 560, route: "/learn/math", accent: "#6366f1", kind: "portal" },
  { id: "p-eng", label: "Story Forest", x: 980, y: 560, route: "/learn/english", accent: "#10b981", kind: "portal" },
  { id: "p-fil", label: "Bayani Isles", x: 680, y: 860, route: "/learn/filipino", accent: "#f59e0b", kind: "portal" },
  { id: "p-sci", label: "Lab Reef", x: 1080, y: 820, route: "/learn/science", accent: "#06b6d4", kind: "portal" },
  { id: "p-ap", label: "History Archipelago", x: 520, y: 1010, route: "/learn/araling-panlipunan", accent: "#a78bfa", kind: "portal" },
];

const SOLIDS = SPOTS.filter((s) => s.kind === "building").map((s) => ({
  x1: s.x - (s.w! / 2),
  y1: s.y - 10, // only the lower part of the building blocks (walk behind roofs)
  x2: s.x + (s.w! / 2),
  y2: s.y + (s.h! / 2) - 6,
}));

export function TownWorld({ ps }: { ps: PlayerState }) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const pos = useRef({ x: 800, y: 640 });
  const target = useRef<{ x: number; y: number } | null>(null);
  const keys = useRef<Set<string>>(new Set());
  const facing = useRef<1 | -1>(1);
  const moving = useRef(false);
  const activeIdRef = useRef<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  const enter = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router]
  );

  // keyboard
  useEffect(() => {
    const KEYMAP: Record<string, string> = {
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right",
    };
    function down(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " " || e.key === "e" || e.key === "E") {
        const a = activeIdRef.current;
        if (a) {
          const spot = SPOTS.find((s) => s.id === a);
          if (spot) {
            e.preventDefault();
            enter(spot.route);
          }
        }
        return;
      }
      const k = KEYMAP[e.key];
      if (k) {
        keys.current.add(k);
        target.current = null;
        setShowHint(false);
        e.preventDefault();
      }
    }
    function up(e: KeyboardEvent) {
      const k = KEYMAP[e.key];
      if (k) keys.current.delete(k);
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [enter]);

  // main loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let bob = 0;

    function collide(nx: number, ny: number, axis: "x" | "y") {
      for (const s of SOLIDS) {
        if (nx + AV_R > s.x1 && nx - AV_R < s.x2 && ny + AV_R > s.y1 && ny - AV_R < s.y2) {
          return axis === "x" ? pos.current.x : pos.current.y; // blocked → keep old
        }
      }
      return axis === "x" ? nx : ny;
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      let dx = 0;
      let dy = 0;
      const k = keys.current;
      if (k.has("up")) dy -= 1;
      if (k.has("down")) dy += 1;
      if (k.has("left")) dx -= 1;
      if (k.has("right")) dx += 1;

      if (dx === 0 && dy === 0 && target.current) {
        const tx = target.current.x - pos.current.x;
        const ty = target.current.y - pos.current.y;
        const d = Math.hypot(tx, ty);
        if (d < 6) {
          target.current = null;
        } else {
          dx = tx / d;
          dy = ty / d;
        }
      }

      const mag = Math.hypot(dx, dy);
      moving.current = mag > 0.01;
      if (mag > 0.01) {
        dx /= mag;
        dy /= mag;
        if (dx !== 0) facing.current = dx < 0 ? -1 : 1;
        const step = SPEED * dt;
        const nx = Math.max(AV_R, Math.min(WORLD_W - AV_R, pos.current.x + dx * step));
        const ny = Math.max(AV_R + 40, Math.min(WORLD_H - AV_R, pos.current.y + dy * step));
        pos.current.x = collide(nx, pos.current.y, "x");
        pos.current.y = collide(pos.current.x, ny, "y");
      }

      // camera
      const vp = viewportRef.current;
      const world = worldRef.current;
      const av = avatarRef.current;
      if (vp && world) {
        const vw = vp.clientWidth;
        const vh = vp.clientHeight;
        const camX = Math.max(0, Math.min(WORLD_W - vw, pos.current.x - vw / 2));
        const camY = Math.max(0, Math.min(WORLD_H - vh, pos.current.y - vh / 2));
        world.style.transform = `translate3d(${-camX}px, ${-camY}px, 0)`;
      }
      if (av) {
        bob = moving.current && !reduced ? (bob + dt * 12) % (Math.PI * 2) : 0;
        const bobY = moving.current && !reduced ? Math.abs(Math.sin(bob)) * 3 : 0;
        av.style.left = `${pos.current.x}px`;
        av.style.top = `${pos.current.y}px`;
        av.style.transform = `translate(-50%, -100%) translateY(${-bobY}px) scaleX(${facing.current})`;
        av.style.zIndex = String(Math.round(pos.current.y));
      }

      // proximity
      let nearest: string | null = null;
      let best = Infinity;
      for (const s of SPOTS) {
        const r = s.kind === "portal" ? 64 : 96;
        const d = Math.hypot(s.x - pos.current.x, s.y - pos.current.y);
        if (d < r && d < best) {
          best = d;
          nearest = s.id;
        }
      }
      if (nearest !== activeIdRef.current) {
        activeIdRef.current = nearest;
        setActiveId(nearest);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const vp = viewportRef.current;
    const world = worldRef.current;
    if (!vp || !world) return;
    const rect = vp.getBoundingClientRect();
    // current camera offset from transform
    const m = new DOMMatrixReadOnly(getComputedStyle(world).transform);
    const camX = -m.m41;
    const camY = -m.m42;
    target.current = { x: e.clientX - rect.left + camX, y: e.clientY - rect.top + camY };
    keys.current.clear();
    setShowHint(false);
  }

  const activeSpot = activeId ? SPOTS.find((s) => s.id === activeId) ?? null : null;

  return (
    <div
      ref={viewportRef}
      onPointerDown={onPointerDown}
      className="relative h-[68vh] min-h-[460px] w-full touch-none select-none overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(255,255,255,0.10)", cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px -16px #000" }}
    >
      {/* world */}
      <div ref={worldRef} className="absolute left-0 top-0" style={{ width: WORLD_W, height: WORLD_H, willChange: "transform" }}>
        <GroundLayer />

        {/* portals (drawn on ground, walkable) */}
        {SPOTS.filter((s) => s.kind === "portal").map((s) => (
          <Portal key={s.id} spot={s} active={activeId === s.id} reduced={!!reduced} />
        ))}

        {/* buildings */}
        {SPOTS.filter((s) => s.kind === "building").map((s) => (
          <Building key={s.id} spot={s} active={activeId === s.id} />
        ))}

        {/* avatar */}
        <div ref={avatarRef} className="absolute" style={{ left: pos.current.x, top: pos.current.y, transform: "translate(-50%,-100%)", willChange: "transform", zIndex: 640 }}>
          <HeroSprite accent={ps.cls?.accent ?? "#38bdf8"} name={ps.name} />
        </div>
      </div>

      {/* HUD overlays */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-slate-200 backdrop-blur">
        🏙️ Forgeheart City
      </div>
      {showHint && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-4 py-1.5 text-[11px] text-slate-200 backdrop-blur">
          Tap to move · WASD / arrows · walk into a place, then press Enter
        </div>
      )}

      {/* interaction prompt */}
      {activeSpot && (
        <button
          onClick={() => enter(activeSpot.route)}
          className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 shadow-xl transition active:scale-95"
          style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: `0 8px 24px -6px ${activeSpot.accent}` }}
        >
          Enter {activeSpot.label}
          <span className="ml-2 rounded bg-black/15 px-1.5 py-0.5 text-[10px]">↵</span>
        </button>
      )}
    </div>
  );
}

/* ---------------- ground ---------------- */
function GroundLayer() {
  return (
    <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} width={WORLD_W} height={WORLD_H} className="absolute inset-0">
      <defs>
        <radialGradient id="tw-grass" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#1c5a3a" />
          <stop offset="60%" stopColor="#164a30" />
          <stop offset="100%" stopColor="#0f3322" />
        </radialGradient>
        <radialGradient id="tw-plaza" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#33415a" />
          <stop offset="100%" stopColor="#222b3d" />
        </radialGradient>
        <linearGradient id="tw-pond" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width={WORLD_W} height={WORLD_H} fill="url(#tw-grass)" />

      {/* paths from plaza to each landmark */}
      <g stroke="#3b4458" strokeWidth="34" strokeLinecap="round" opacity="0.85">
        {SPOTS.filter((s) => s.kind === "building").map((s) => (
          <line key={s.id} x1={800} y1={640} x2={s.x} y2={s.y + 30} />
        ))}
      </g>
      {/* central plaza */}
      <circle cx={800} cy={640} r={150} fill="url(#tw-plaza)" stroke="#475569" strokeWidth="3" />
      <circle cx={800} cy={640} r={150} fill="none" stroke="#fcd34d" strokeWidth="1.5" opacity="0.25" />
      <circle cx={800} cy={640} r={60} fill="none" stroke="#64748b" strokeWidth="2" opacity="0.5" />
      <polygon points="800,612 808,636 832,636 813,651 820,675 800,660 780,675 787,651 768,636 792,636" fill="#fcd34d" opacity="0.7" />

      {/* pond */}
      <ellipse cx={1180} cy={560} rx={80} ry={54} fill="url(#tw-pond)" opacity="0.9" />
      <ellipse cx={1180} cy={560} rx={80} ry={54} fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.4" />

      {/* trees + bushes (deterministic scatter, avoiding plaza) */}
      {scatterTrees().map((t, i) => (
        <g key={i}>
          <ellipse cx={t.x} cy={t.y + 10} rx={t.r} ry={t.r * 0.4} fill="#000" opacity="0.18" />
          <rect x={t.x - 2} y={t.y} width={4} height={8} fill="#5b3a21" />
          <circle cx={t.x} cy={t.y - 4} r={t.r} fill={t.dark ? "#166534" : "#15803d"} />
          <circle cx={t.x - t.r * 0.4} cy={t.y - t.r * 0.6} r={t.r * 0.5} fill={t.dark ? "#15803d" : "#22a155"} opacity="0.8" />
        </g>
      ))}
      {/* flowers */}
      {scatterFlowers().map((f, i) => (
        <circle key={`f${i}`} cx={f.x} cy={f.y} r={3} fill={f.c} opacity="0.85" />
      ))}
    </svg>
  );
}

function scatterTrees() {
  const out: { x: number; y: number; r: number; dark: boolean }[] = [];
  let s = 7;
  for (let i = 0; i < 60; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % WORLD_W;
    const y = (s >> 8) % WORLD_H;
    if (Math.hypot(x - 800, y - 640) < 220) continue; // keep plaza clear
    if (SPOTS.some((sp) => Math.hypot(sp.x - x, sp.y - y) < 130)) continue;
    out.push({ x, y, r: 14 + (s % 10), dark: i % 2 === 0 });
  }
  return out;
}
function scatterFlowers() {
  const cols = ["#f472b6", "#fcd34d", "#f87171", "#a78bfa"];
  const out: { x: number; y: number; c: string }[] = [];
  let s = 99;
  for (let i = 0; i < 120; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % WORLD_W;
    const y = (s >> 9) % WORLD_H;
    if (Math.hypot(x - 800, y - 640) < 160) continue;
    out.push({ x, y, c: cols[i % cols.length] });
  }
  return out;
}

/* ---------------- portal ---------------- */
function Portal({ spot, active, reduced }: { spot: Spot; active: boolean; reduced: boolean }) {
  return (
    <div className="absolute" style={{ left: spot.x, top: spot.y, transform: "translate(-50%,-50%)", zIndex: Math.round(spot.y) - 200 }}>
      <div
        className={reduced ? "" : "animate-pulse"}
        style={{
          width: 84,
          height: 48,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${spot.accent}cc, ${spot.accent}33 60%, transparent 75%)`,
          border: `2px solid ${spot.accent}`,
          boxShadow: active ? `0 0 26px ${spot.accent}` : `0 0 14px ${spot.accent}88`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg"
        style={{ filter: `drop-shadow(0 0 6px ${spot.accent})` }}
      >
        ✦
      </div>
      <div
        className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold"
        style={{ background: "rgba(0,0,0,0.5)", color: "#e2e8f0", border: `1px solid ${spot.accent}66` }}
      >
        {spot.label}
      </div>
    </div>
  );
}

/* ---------------- building ---------------- */
const GLYPHS: Record<string, string> = {
  quest: "📜", class: "🎓", guild: "🏛️", skill: "🌳", shop: "🛍️", arena: "⚔️", home: "🏡",
};

function Building({ spot, active }: { spot: Spot; active: boolean }) {
  const w = spot.w!;
  const h = spot.h!;
  return (
    <div
      className="absolute"
      style={{ left: spot.x, top: spot.y, transform: "translate(-50%,-50%)", width: w, height: h + 40, zIndex: Math.round(spot.y) }}
    >
      {/* sign label */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold transition"
        style={{
          background: active ? spot.accent : "rgba(0,0,0,0.55)",
          color: active ? "#0f172a" : "#e2e8f0",
          border: `1px solid ${spot.accent}88`,
          boxShadow: active ? `0 0 14px ${spot.accent}` : "none",
        }}
      >
        {spot.label}
      </div>

      {/* structure */}
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="absolute bottom-0 left-0" style={{ overflow: "visible" }}>
        {/* shadow */}
        <ellipse cx={w / 2} cy={h - 4} rx={w / 2} ry={10} fill="#000" opacity="0.28" />
        {/* walls */}
        <rect x={w * 0.12} y={h * 0.42} width={w * 0.76} height={h * 0.5} rx={6} fill="#2b3344" stroke="#0c1018" strokeWidth="1.5" />
        {/* roof */}
        <polygon points={`${w * 0.06},${h * 0.46} ${w / 2},${h * 0.1} ${w * 0.94},${h * 0.46}`} fill={spot.accent} stroke="#0c1018" strokeWidth="1.5" />
        <polygon points={`${w * 0.06},${h * 0.46} ${w / 2},${h * 0.1} ${w / 2},${h * 0.2}`} fill="#000" opacity="0.12" />
        {/* door */}
        <rect x={w * 0.42} y={h * 0.62} width={w * 0.16} height={h * 0.3} rx={3} fill="#0e1626" stroke={`${spot.accent}`} strokeWidth="1" />
        {/* windows */}
        <rect x={w * 0.2} y={h * 0.56} width={w * 0.12} height={h * 0.12} rx={2} fill="#fcd34d" opacity="0.7" />
        <rect x={w * 0.68} y={h * 0.56} width={w * 0.12} height={h * 0.12} rx={2} fill="#fcd34d" opacity="0.7" />
        {/* active glow ring on ground */}
        {active && <ellipse cx={w / 2} cy={h - 4} rx={w / 2 + 6} ry={13} fill="none" stroke={spot.accent} strokeWidth="2" opacity="0.8" />}
      </svg>

      {/* emblem */}
      <div className="absolute left-1/2 text-base" style={{ top: h * 0.5, transform: "translate(-50%,-50%)" }}>
        {GLYPHS[spot.glyph ?? "quest"]}
      </div>
    </div>
  );
}
