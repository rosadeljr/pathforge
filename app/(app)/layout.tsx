"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, Home, Target, BookOpen, Award, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !pathname.includes("(marketing)") && !pathname.includes("(auth)")) {
        router.push("/login");
      } else {
        setAuthenticated(!!user);
      }
    }
    checkAuth();
  }, [router, supabase, pathname]);

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Target, label: "Quests", href: "/quests" },
    { icon: BookOpen, label: "Roadmap", href: "/roadmap" },
    { icon: Award, label: "Portfolio", href: "/portfolio" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950">
      {authenticated && (
        <nav className="md:w-64 bg-slate-900 border-b md:border-r border-slate-800 flex md:flex-col overflow-x-auto md:overflow-x-visible sticky bottom-0 md:sticky top-0">
          <div className="hidden md:flex md:p-6 gap-3 items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-950" />
            </div>
            <span className="font-bold text-lg">PathForge</span>
          </div>

          <div className="flex md:flex-col gap-1 flex-1 md:flex-none px-2 md:px-6 py-4">
            {navLinks.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap md:whitespace-normal ${
                  pathname === href
                    ? "bg-cyan-500/20 text-cyan-400 border-l-2 md:border-l-4 border-cyan-400"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm md:text-base">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
