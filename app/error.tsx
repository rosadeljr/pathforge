"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Route-segment error boundary. Catches render/runtime errors anywhere in the
 * app and shows a calm, branded recovery screen with a retry instead of a raw
 * stack trace. Errors are logged to the console for diagnostics.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070a11] px-6 text-center">
      <span aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: "#f43f5e" }} />
      <div className="relative">
        <Logo size={44} showWordmark />
        <p className="mt-10 text-5xl">🛠️</p>
        <h1 className="mt-3 text-xl font-bold text-white">Something glitched in the forge</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
          That&apos;s on us, not you. Try again — most hiccups clear right up.
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-[11px] text-slate-600">ref: {error.digest}</p>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-900 transition active:scale-[0.98]"
            style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}
          >
            Try again
          </button>
          <Link
            href="/learn"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
          >
            Back to safety
          </Link>
        </div>
      </div>
    </main>
  );
}
