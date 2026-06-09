import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Global 404. Branded, friendly, and routes back into the product rather than
 * dead-ending. Server component (no client JS needed).
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070a11] px-6 text-center">
      <span aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: "#7c5cff" }} />
      <div className="relative">
        <Logo size={44} showWordmark />
        <p className="mt-10 font-display text-7xl font-black tracking-tight text-white">404</p>
        <h1 className="mt-2 text-xl font-bold text-white">This path leads off the map</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
          The page you&apos;re looking for moved or never existed. Let&apos;s get you back to solid ground.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/learn"
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-900 transition active:scale-[0.98]"
            style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}
          >
            Back to Forgeheart City
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
