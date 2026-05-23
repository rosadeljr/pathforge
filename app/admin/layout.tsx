"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/Logo";
import {
  LayoutDashboard,
  Users,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  CreditCard,
} from "lucide-react";

const adminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [authState, setAuthState] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
      if (data?.is_admin) {
        setAuthState("admin");
      } else {
        setAuthState("denied");
      }
    }
    check();
  }, [supabase, router]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 size={20} className="text-white/40 animate-spin" />
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/[0.08] border border-rose-500/30 mb-5">
            <ShieldCheck size={22} className="text-rose-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Admin only</h1>
          <p className="text-sm text-slate-400 mb-6">
            This area is restricted to PathForge admins. Get in touch if you believe this is an
            error.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Back to learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top admin bar */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <Logo size={26} />
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight">PathForge</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-rose-500/[0.15] text-rose-300 border border-rose-500/30">
                  Admin
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {adminNav.map(({ icon: Icon, label, href }) => {
                const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="admin-active"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                      />
                    )}
                    <Icon size={14} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            Exit admin
          </Link>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center border-t border-white/[0.06] px-2">
          {adminNav.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? "text-white border-b-2 border-indigo-400" : "text-slate-400"
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
