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
import { CharacterSprite } from "./CharacterSprite";

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
      className="relative h-[70vh] min-h-[480px] w-full touch-none select-none overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(56,189,248,0.25)", cursor: "pointer", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), 0 18px 55px -22px #000" }}
    >
      {/* world */}
      <div ref={worldRef} className="absolute left-0 top-0" style={{ width: WORLD_W, height: WORLD_H, willChange: "transform" }}>
        <GroundLayer reduced={!!reduced} />

        {/* portals (drawn on ground, walkable) */}
        {SPOTS.filter((s) => s.kind === "portal").map((s) => (
          <Portal key={s.id} spot={s} active={activeId === s.id} reduced={!!reduced} />
        ))}

        {/* market stalls */}
        {STALLS.map((st) => (
          <Stall key={st.id} st={st} />
        ))}

        {/* buildings */}
        {SPOTS.filter((s) => s.kind === "building").map((s) => (
          <Building key={s.id} spot={s} active={activeId === s.id} reduced={!!reduced} />
        ))}

        {/* townsfolk (foundation for co-op) */}
        {NPCS.map((n, i) => (
          <Townsfolk key={n.id} npc={n} reduced={!!reduced} delay={i * 0.5} />
        ))}

        {/* avatar */}
        <div ref={avatarRef} className="absolute" style={{ left: pos.current.x, top: pos.current.y, transform: "translate(-50%,-100%)", willChange: "transform", zIndex: 640 }}>
          <HeroSprite accent={ps.cls?.accent ?? "#38bdf8"} name={ps.name} />
        </div>
      </div>

      {/* ambient floating particles (screen space) */}
      {!reduced && <Particles />}

      {/* atmosphere glow + vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(56,189,248,0.12), transparent 45%), radial-gradient(120% 90% at 50% 120%, rgba(167,139,250,0.10), transparent 50%)",
          boxShadow: "inset 0 0 140px 40px rgba(0,0,0,0.5)",
        }}
      />

      {/* game-screen corner brackets */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-2 top-2 h-5 w-5 rounded-tl-lg" style={{ borderTop: "2px solid rgba(56,189,248,0.5)", borderLeft: "2px solid rgba(56,189,248,0.5)" }} />
        <span className="absolute right-2 top-2 h-5 w-5 rounded-tr-lg" style={{ borderTop: "2px solid rgba(56,189,248,0.5)", borderRight: "2px solid rgba(56,189,248,0.5)" }} />
        <span className="absolute bottom-2 left-2 h-5 w-5 rounded-bl-lg" style={{ borderBottom: "2px solid rgba(56,189,248,0.5)", borderLeft: "2px solid rgba(56,189,248,0.5)" }} />
        <span className="absolute bottom-2 right-2 h-5 w-5 rounded-br-lg" style={{ borderBottom: "2px solid rgba(56,189,248,0.5)", borderRight: "2px solid rgba(56,189,248,0.5)" }} />
      </div>

      {/* top bar label */}
      <div
        className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-bold tracking-wide text-cyan-100 backdrop-blur"
        style={{ background: "rgba(8,15,25,0.6)", border: "1px solid rgba(56,189,248,0.35)", boxShadow: "0 0 18px rgba(56,189,248,0.22)" }}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 8px #22d3ee" }} />
        FORGEHEART CITY
      </div>

      {showHint && (
        <div
          className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] text-cyan-50 backdrop-blur"
          style={{ background: "rgba(8,15,25,0.6)", border: "1px solid rgba(56,189,248,0.25)" }}
        >
          Tap to move · WASD / arrows · walk into a place, then press Enter
        </div>
      )}

      {/* interaction prompt */}
      {activeSpot && (
        <button
          onClick={() => enter(activeSpot.route)}
          className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 shadow-xl transition active:scale-95"
          style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: `0 8px 28px -4px ${activeSpot.accent}, 0 0 0 1px ${activeSpot.accent}66` }}
        >
          <span className="mr-1.5">Enter</span>
          {activeSpot.label}
          <span className="ml-2 rounded bg-black/15 px-1.5 py-0.5 text-[10px]">↵</span>
        </button>
      )}
    </div>
  );
}

/* ---------------- ambient particles ---------------- */
function Particles() {
  const dots = [];
  let s = 1234;
  const colors = ["#67e8f9", "#a78bfa", "#fcd34d", "#34d399"];
  for (let i = 0; i < 22; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    dots.push({
      l: `${s % 100}%`,
      t: `${(s >> 8) % 100}%`,
      sz: 2 + (s % 4),
      c: colors[i % colors.length],
      d: `${(s % 40) / 10}s`,
      tw: i % 2 === 0,
    });
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((p, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${p.tw ? "rpg-twinkle" : "rpg-float-slow"}`}
          style={{ left: p.l, top: p.t, width: p.sz, height: p.sz, background: p.c, boxShadow: `0 0 ${p.sz * 2.5}px ${p.c}`, opacity: 0.55, animationDelay: p.d }}
        />
      ))}
    </div>
  );
}

/* ---------------- ground (futuristic) ---------------- */
function GroundLayer({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} width={WORLD_W} height={WORLD_H} className="absolute inset-0">
      <defs>
        <radialGradient id="tw-ground" cx="50%" cy="42%" r="78%">
          <stop offset="0%" stopColor="#1b5e57" />
          <stop offset="45%" stopColor="#123f4a" />
          <stop offset="100%" stopColor="#0a1f30" />
        </radialGradient>
        <radialGradient id="tw-plaza" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#243a5e" />
          <stop offset="70%" stopColor="#16233c" />
          <stop offset="100%" stopColor="#0e1830" />
        </radialGradient>
        <radialGradient id="tw-pool" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </radialGradient>
        <pattern id="tw-grid" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0 H0 V64" fill="none" stroke="#5eead4" strokeWidth="1" opacity="0.05" />
        </pattern>
        <filter id="tw-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width={WORLD_W} height={WORLD_H} fill="url(#tw-ground)" />
      <rect width={WORLD_W} height={WORLD_H} fill="url(#tw-grid)" />

      {/* energy walkways: dark base + glowing animated center line */}
      <g strokeLinecap="round">
        {SPOTS.filter((s) => s.kind === "building").map((s) => (
          <line key={`pb${s.id}`} x1={800} y1={640} x2={s.x} y2={s.y + 30} stroke="#0c1c2e" strokeWidth={38} opacity={0.9} />
        ))}
        {SPOTS.filter((s) => s.kind === "building").map((s) => (
          <line key={`pe${s.id}`} x1={800} y1={640} x2={s.x} y2={s.y + 30} stroke="#22d3ee" strokeWidth={26} opacity={0.08} />
        ))}
        {SPOTS.filter((s) => s.kind === "building").map((s) => (
          <line key={`pc${s.id}`} x1={800} y1={640} x2={s.x} y2={s.y + 30} stroke="#7dd3fc" strokeWidth={3} opacity={0.7} className={reduced ? "" : "rpg-dash"} />
        ))}
      </g>

      {/* holographic plaza */}
      <circle cx={800} cy={640} r={155} fill="url(#tw-plaza)" stroke="#22d3ee" strokeWidth={2} opacity={0.95} />
      <circle cx={800} cy={640} r={155} fill="none" stroke="#67e8f9" strokeWidth={4} opacity={0.18} />
      <circle cx={800} cy={640} r={110} fill="none" stroke="#38bdf8" strokeWidth={1.2} opacity={0.3} />
      <circle cx={800} cy={640} r={70} fill="none" stroke="#a78bfa" strokeWidth={1.2} opacity={0.4} />
      {/* rotating dashed ring */}
      <circle cx={800} cy={640} r={130} fill="none" stroke="#67e8f9" strokeWidth={2} strokeDasharray="3 16" opacity={0.6} className={reduced ? "" : "rpg-spin"} />
      {/* central hologram beam + emblem */}
      <rect x={788} y={520} width={24} height={120} rx={12} fill="#67e8f9" opacity={0.12} filter="url(#tw-glow)" className={reduced ? "" : "rpg-beam"} />
      <g className={reduced ? "" : "rpg-float"} filter="url(#tw-glow)">
        <polygon points="800,600 814,632 800,664 786,632" fill="#a5f3fc" opacity={0.9} />
        <polygon points="800,612 808,632 800,652 792,632" fill="#0ea5e9" />
      </g>

      {/* energy pool */}
      <ellipse cx={1180} cy={560} rx={84} ry={52} fill="url(#tw-pool)" opacity={0.85} />
      <ellipse cx={1180} cy={560} rx={84} ry={52} fill="none" stroke="#a5f3fc" strokeWidth={2} opacity={0.5} />
      <ellipse cx={1180} cy={560} rx={54} ry={32} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.25} className={reduced ? "" : "rpg-twinkle"} />

      {/* glow-canopy trees */}
      {scatterTrees().map((t, i) => (
        <g key={i}>
          <ellipse cx={t.x} cy={t.y + 10} rx={t.r} ry={t.r * 0.4} fill="#000" opacity={0.22} />
          <rect x={t.x - 2.5} y={t.y} width={5} height={9} fill="#3f2d1a" />
          <circle cx={t.x} cy={t.y - 6} r={t.r + 5} fill={t.c} opacity={0.18} />
          <circle cx={t.x} cy={t.y - 6} r={t.r} fill={t.dark ? "#0f766e" : "#15803d"} />
          <circle cx={t.x - t.r * 0.35} cy={t.y - t.r * 0.7} r={t.r * 0.5} fill={t.c} opacity={0.85} />
        </g>
      ))}

      {/* glowing crystals */}
      {scatterCrystals().map((c, i) => (
        <g key={`c${i}`}>
          <ellipse cx={c.x} cy={c.y + 12} rx={12} ry={4} fill="#000" opacity={0.25} />
          <polygon points={`${c.x},${c.y - 18} ${c.x + 9},${c.y} ${c.x},${c.y + 12} ${c.x - 9},${c.y}`} fill={c.col} opacity={0.25} />
          <polygon points={`${c.x},${c.y - 14} ${c.x + 6},${c.y - 1} ${c.x},${c.y + 9} ${c.x - 6},${c.y - 1}`} fill={c.col} />
          <polygon points={`${c.x},${c.y - 14} ${c.x + 6},${c.y - 1} ${c.x},${c.y - 1}`} fill="#ffffff" opacity={0.35} />
        </g>
      ))}

      {/* floating drone orbs */}
      {scatterOrbs().map((o, i) => (
        <g key={`o${i}`} className={reduced ? "" : "rpg-float-slow"} style={{ animationDelay: `${i * 0.7}s` }}>
          <circle cx={o.x} cy={o.y} r={9} fill={o.col} opacity={0.2} />
          <circle cx={o.x} cy={o.y} r={5} fill={o.col} />
          <circle cx={o.x - 1.5} cy={o.y - 1.5} r={1.6} fill="#fff" opacity={0.9} />
          <ellipse cx={o.x} cy={o.y + 14} rx={6} ry={2} fill="#000" opacity={0.2} />
        </g>
      ))}

      {/* fireflies / sparks */}
      {scatterFireflies().map((f, i) => (
        <circle key={`f${i}`} cx={f.x} cy={f.y} r={f.r} fill={f.c} className={reduced ? "" : "rpg-twinkle"} style={{ animationDelay: `${(i % 8) * 0.4}s` }} />
      ))}
    </svg>
  );
}

const TREE_COLS = ["#34d399", "#22d3ee", "#5eead4", "#4ade80"];
function scatterTrees() {
  const out: { x: number; y: number; r: number; dark: boolean; c: string }[] = [];
  let s = 7;
  for (let i = 0; i < 54; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % WORLD_W;
    const y = (s >> 8) % WORLD_H;
    if (Math.hypot(x - 800, y - 640) < 220) continue;
    if (SPOTS.some((sp) => Math.hypot(sp.x - x, sp.y - y) < 130)) continue;
    out.push({ x, y, r: 15 + (s % 10), dark: i % 2 === 0, c: TREE_COLS[i % TREE_COLS.length] });
  }
  return out;
}
const CRYSTAL_COLS = ["#a78bfa", "#67e8f9", "#f472b6", "#fcd34d"];
function scatterCrystals() {
  const out: { x: number; y: number; col: string }[] = [];
  let s = 313;
  for (let i = 0; i < 14; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % WORLD_W;
    const y = (s >> 8) % WORLD_H;
    if (Math.hypot(x - 800, y - 640) < 210) continue;
    if (SPOTS.some((sp) => Math.hypot(sp.x - x, sp.y - y) < 120)) continue;
    out.push({ x, y, col: CRYSTAL_COLS[i % CRYSTAL_COLS.length] });
  }
  return out;
}
function scatterOrbs() {
  const out: { x: number; y: number; col: string }[] = [];
  const cols = ["#67e8f9", "#a78bfa", "#fcd34d"];
  let s = 555;
  for (let i = 0; i < 7; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % WORLD_W;
    const y = (s >> 8) % WORLD_H;
    if (Math.hypot(x - 800, y - 640) < 240) continue;
    if (SPOTS.some((sp) => Math.hypot(sp.x - x, sp.y - y) < 140)) continue;
    out.push({ x, y, col: cols[i % cols.length] });
  }
  return out;
}
function scatterFireflies() {
  const cols = ["#fcd34d", "#67e8f9", "#a7f3d0"];
  const out: { x: number; y: number; r: number; c: string }[] = [];
  let s = 99;
  for (let i = 0; i < 80; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % WORLD_W;
    const y = (s >> 9) % WORLD_H;
    if (Math.hypot(x - 800, y - 640) < 170) continue;
    out.push({ x, y, r: 1.6 + (s % 3) * 0.6, c: cols[i % cols.length] });
  }
  return out;
}

/* ---------------- portal (futuristic vortex) ---------------- */
function Portal({ spot, active, reduced }: { spot: Spot; active: boolean; reduced: boolean }) {
  const a = spot.accent;
  return (
    <div className="absolute" style={{ left: spot.x, top: spot.y, transform: "translate(-50%,-50%)", zIndex: Math.round(spot.y) - 200 }}>
      {/* light beam */}
      <div
        className={reduced ? "" : "rpg-beam"}
        style={{ position: "absolute", left: "50%", bottom: 8, transform: "translateX(-50%)", width: 22, height: 70, borderRadius: 11, background: `linear-gradient(to top, ${a}, transparent)`, opacity: 0.45, filter: "blur(2px)" }}
      />
      {/* base glow disc */}
      <div
        style={{ width: 96, height: 56, borderRadius: "50%", background: `radial-gradient(ellipse at center, ${a}, ${a}33 55%, transparent 75%)`, boxShadow: active ? `0 0 34px ${a}` : `0 0 18px ${a}aa` }}
      />
      {/* rotating rings */}
      <svg width="120" height="76" viewBox="0 0 120 76" className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", overflow: "visible" }}>
        <ellipse cx="60" cy="38" rx="50" ry="26" fill="none" stroke={a} strokeWidth="2.5" strokeDasharray="4 10" opacity="0.85" className={reduced ? "" : "rpg-spin"} />
        <ellipse cx="60" cy="38" rx="34" ry="17" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 8" opacity="0.5" className={reduced ? "" : "rpg-spin-r"} />
      </svg>
      {/* core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg" style={{ filter: `drop-shadow(0 0 8px ${a})`, color: "#ffffff" }}>✦</div>
      {/* label */}
      <div
        className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold backdrop-blur"
        style={{ background: "rgba(8,15,25,0.6)", color: "#e2e8f0", border: `1px solid ${a}77`, boxShadow: active ? `0 0 12px ${a}88` : "none" }}
      >
        {spot.label}
      </div>
    </div>
  );
}

/* ---------------- building (neon-futuristic) ---------------- */
const GLYPHS: Record<string, string> = {
  quest: "📜", class: "🎓", guild: "🏛️", skill: "🌳", shop: "🛍️", arena: "⚔️", home: "🏡",
};

function Building({ spot, active, reduced }: { spot: Spot; active: boolean; reduced: boolean }) {
  const w = spot.w!;
  const h = spot.h!;
  const a = spot.accent;
  return (
    <div className="absolute" style={{ left: spot.x, top: spot.y, transform: "translate(-50%,-50%)", width: w, height: h + 52, zIndex: Math.round(spot.y) }}>
      {/* holographic floating sign */}
      <div
        className={`absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold backdrop-blur transition ${reduced ? "" : "rpg-float-slow"}`}
        style={{
          background: active ? a : "rgba(8,15,25,0.7)",
          color: active ? "#0f172a" : "#e2e8f0",
          border: `1px solid ${a}`,
          boxShadow: active ? `0 0 18px ${a}` : `0 0 10px ${a}55`,
        }}
      >
        {spot.label}
      </div>

      {/* structure */}
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="absolute bottom-0 left-0" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`bw-${spot.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#33415a" />
            <stop offset="100%" stopColor="#141d2e" />
          </linearGradient>
          <linearGradient id={`br-${spot.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={a} stopOpacity={0.7} />
          </linearGradient>
        </defs>

        {/* glow pad */}
        <ellipse cx={w / 2} cy={h - 3} rx={w / 2} ry={11} fill={a} opacity={active ? 0.4 : 0.18} />
        <ellipse cx={w / 2} cy={h - 3} rx={w / 2} ry={11} fill="#000" opacity={0.15} />

        {/* body */}
        <rect x={w * 0.14} y={h * 0.4} width={w * 0.72} height={h * 0.52} rx={10} fill={`url(#bw-${spot.id})`} stroke={a} strokeWidth={1.5} />
        {/* neon under-glow trim */}
        <rect x={w * 0.14} y={h * 0.86} width={w * 0.72} height={3} rx={1.5} fill={a} opacity={0.9} />
        {/* curved neon roof */}
        <path d={`M ${w * 0.08} ${h * 0.44} Q ${w / 2} ${h * 0.04} ${w * 0.92} ${h * 0.44} Z`} fill={`url(#br-${spot.id})`} stroke="#0c1018" strokeWidth={1.2} />
        <path d={`M ${w * 0.08} ${h * 0.44} Q ${w / 2} ${h * 0.04} ${w / 2} ${h * 0.16}`} fill="#fff" opacity={0.12} />
        {/* antenna + blinking light */}
        <line x1={w / 2} y1={h * 0.1} x2={w / 2} y2={h * -0.04} stroke={a} strokeWidth={1.5} />
        <circle cx={w / 2} cy={h * -0.06} r={3} fill="#fff" className={reduced ? "" : "rpg-twinkle"} style={{ filter: `drop-shadow(0 0 4px ${a})` }} />
        {/* glowing window strips */}
        <rect x={w * 0.22} y={h * 0.54} width={w * 0.16} height={h * 0.07} rx={2} fill="#a5f3fc" opacity={0.85} />
        <rect x={w * 0.62} y={h * 0.54} width={w * 0.16} height={h * 0.07} rx={2} fill="#a5f3fc" opacity={0.85} />
        {/* door */}
        <rect x={w * 0.43} y={h * 0.66} width={w * 0.14} height={h * 0.26} rx={3} fill="#0a1322" stroke={a} strokeWidth={1.2} />
        <rect x={w * 0.43} y={h * 0.66} width={w * 0.14} height={3} rx={1.5} fill={a} opacity={0.8} />

        {active && <ellipse cx={w / 2} cy={h - 3} rx={w / 2 + 7} ry={14} fill="none" stroke={a} strokeWidth={2} opacity={0.85} />}
      </svg>

      {/* emblem */}
      <div className="absolute left-1/2 text-base" style={{ top: h * 0.5, transform: "translate(-50%,-50%)", filter: `drop-shadow(0 0 4px ${a})` }}>
        {GLYPHS[spot.glyph ?? "quest"]}
      </div>
    </div>
  );
}

/* ---------------- townsfolk (populated RPG feel) ---------------- */
interface Npc {
  id: string;
  x: number;
  y: number;
  accent: string;
  trim: string;
  hair: string;
  skin: string;
  sign: string;
}

const NPCS: Npc[] = [
  { id: "n1", x: 985, y: 742, accent: "#fb7185", trim: "#fcd34d", hair: "#2b2b2b", skin: "#f6d3b0", sign: "Join my party!" },
  { id: "n2", x: 636, y: 720, accent: "#22d3ee", trim: "#a5f3fc", hair: "#5b3a21", skin: "#e8b88f", sign: "Quiz duel?" },
  { id: "n3", x: 1086, y: 662, accent: "#a78bfa", trim: "#e9d5ff", hair: "#1f2937", skin: "#f2c79b", sign: "Trade stickers!" },
  { id: "n4", x: 560, y: 726, accent: "#f59e0b", trim: "#fde68a", hair: "#3b2a1a", skin: "#f6d3b0", sign: "Math tips here" },
  { id: "n5", x: 900, y: 446, accent: "#34d399", trim: "#bbf7d0", hair: "#4b2e1e", skin: "#e8b88f", sign: "Reading club" },
  { id: "n6", x: 700, y: 498, accent: "#38bdf8", trim: "#bae6fd", hair: "#222", skin: "#f6d3b0", sign: "Study buddy?" },
  { id: "n7", x: 1186, y: 720, accent: "#f472b6", trim: "#fbcfe8", hair: "#3b2a1a", skin: "#f2c79b", sign: "Art jam today!" },
];

function Townsfolk({ npc, reduced, delay }: { npc: Npc; reduced: boolean; delay: number }) {
  return (
    <div className="absolute" style={{ left: npc.x, top: npc.y, transform: "translate(-50%,-100%)", zIndex: Math.round(npc.y) }}>
      {/* vendor-style sign bubble */}
      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-0.5 text-[10px] font-semibold text-slate-900"
        style={{ bottom: "calc(100% + 4px)", background: "rgba(255,255,255,0.94)", border: `1.5px solid ${npc.accent}`, boxShadow: `0 2px 8px rgba(0,0,0,0.4)` }}
      >
        <span className="mr-1" style={{ color: npc.accent }}>◈</span>
        {npc.sign}
        <span
          className="absolute left-1/2 top-full -translate-x-1/2"
          style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid rgba(255,255,255,0.94)" }}
        />
      </div>
      <div className={reduced ? "" : "rpg-float-slow"} style={{ animationDelay: `${delay}s` }}>
        <CharacterSprite accent={npc.accent} trim={npc.trim} hair={npc.hair} skin={npc.skin} width={48} />
      </div>
    </div>
  );
}

/* ---------------- market stalls ---------------- */
interface StallData { id: string; x: number; y: number; accent: string; }
const STALLS: StallData[] = [
  { id: "s1", x: 1024, y: 748, accent: "#fb7185" },
  { id: "s2", x: 600, y: 730, accent: "#22d3ee" },
  { id: "s3", x: 1150, y: 726, accent: "#f472b6" },
];

function Stall({ st }: { st: StallData }) {
  const a = st.accent;
  const w = 84;
  const h = 70;
  return (
    <div className="absolute" style={{ left: st.x, top: st.y, transform: "translate(-50%,-100%)", zIndex: Math.round(st.y) - 4 }}>
      <svg width={w} height={h} viewBox="0 0 84 70" style={{ overflow: "visible" }}>
        <ellipse cx="42" cy="66" rx="38" ry="6" fill="#000" opacity="0.25" />
        {/* posts */}
        <rect x="10" y="20" width="4" height="46" fill="#6b4a2b" />
        <rect x="70" y="20" width="4" height="46" fill="#6b4a2b" />
        {/* counter */}
        <rect x="8" y="46" width="68" height="18" rx="3" fill="#7c5a36" stroke="#0c1018" strokeWidth="1" />
        <rect x="8" y="46" width="68" height="5" fill="#9a7349" />
        {/* goods */}
        <circle cx="22" cy="44" r="5" fill="#ef4444" /><circle cx="33" cy="44" r="5" fill="#fcd34d" /><circle cx="44" cy="44" r="5" fill="#34d399" /><circle cx="55" cy="44" r="5" fill="#a78bfa" />
        {/* striped awning */}
        <path d="M2 22 L82 22 L74 36 L10 36 Z" fill={a} stroke="#0c1018" strokeWidth="1" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${10 + i * 16} 22 L${6 + i * 16} 36 L${14 + i * 16} 36 L${18 + i * 16} 22 Z`} fill="#ffffff" opacity="0.85" />
        ))}
        <rect x="2" y="20" width="80" height="3" rx="1.5" fill={a} />
        {/* little hanging lantern */}
        <line x1="42" y1="22" x2="42" y2="28" stroke="#0c1018" strokeWidth="1" />
        <circle cx="42" cy="30" r="3" fill="#fde68a" style={{ filter: "drop-shadow(0 0 4px #fde68a)" }} />
      </svg>
    </div>
  );
}
