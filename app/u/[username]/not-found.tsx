import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowRight, UserX } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
          <Logo size={32} />
          <span className="text-base font-semibold tracking-tight">PathForge</span>
        </Link>

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-5">
          <UserX size={22} className="text-slate-400" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2">Profile not found</h1>
        <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
          We couldn't find that PathForger. They might have changed their username, or never
          existed.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
        >
          Forge your own profile
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
