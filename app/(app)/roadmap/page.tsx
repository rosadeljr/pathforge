"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const SAMPLE_ROADMAP = [
  { id: 1, title: "Foundations", progress: 100, skills: ["HTML", "CSS", "JavaScript Basics"] },
  { id: 2, title: "Core Skills", progress: 60, skills: ["React", "State Management", "APIs"] },
  { id: 3, title: "Advanced", progress: 20, skills: ["Testing", "DevOps", "System Design"] },
  { id: 4, title: "Career Ready", progress: 0, skills: ["Interview Prep", "Resume", "Negotiation"] },
];

export default function Roadmap() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    }
    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">Your Career Roadmap</h1>
        <p className="text-slate-400 mb-8">Track your progression through career milestones</p>

        <div className="space-y-6">
          {SAMPLE_ROADMAP.map((phase, idx) => (
            <div key={phase.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Phase {idx + 1}</p>
                  <h3 className="text-xl font-semibold">{phase.title}</h3>
                </div>
                <span className="text-2xl font-bold text-cyan-400">{phase.progress}%</span>
              </div>

              <div className="bg-slate-800 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {phase.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
