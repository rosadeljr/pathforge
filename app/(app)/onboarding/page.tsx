"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const DEFAULT_CAREER_PATHS = [
  { id: "1", title: "Software Engineer", category: "Technology", description: "Build apps", salary_min: 80000, salary_max: 200000, demand_level: "high" },
  { id: "2", title: "Data Analyst", category: "Business", description: "Data insights", salary_min: 70000, salary_max: 150000, demand_level: "high" },
  { id: "3", title: "Product Manager", category: "Business", description: "Lead strategy", salary_min: 100000, salary_max: 250000, demand_level: "high" },
  { id: "4", title: "UI/UX Designer", category: "Creative", description: "Design UX", salary_min: 60000, salary_max: 140000, demand_level: "medium" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState("");
  const [salaryMin, setSalaryMin] = useState(80000);
  const [salaryMax, setSalaryMax] = useState(120000);
  const [timeline, setTimeline] = useState(6);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleComplete = async () => {
    if (!selected || !goal) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("profiles")
        .update({
          selected_career_path_id: selected,
          target_salary_min: salaryMin,
          target_salary_max: salaryMax,
          target_timeline_months: timeline,
          primary_goal: goal,
        })
        .eq("id", user.id);

      toast.success("Welcome!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Build Your Path</h1>
        <div className="w-full bg-slate-800 rounded-full h-1 mb-12">
          <div className="bg-gradient-to-r from-cyan-400 to-violet-500 h-1 rounded-full" style={{ width: `${(step / 2) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Choose Career Path</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {DEFAULT_CAREER_PATHS.map((path) => (
                <div
                  key={path.id}
                  onClick={() => setSelected(path.id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selected === path.id
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  <h3 className="font-semibold text-lg">{path.title}</h3>
                  <p className="text-slate-400 text-sm">{path.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold">Your Goals</h2>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(parseInt(e.target.value))}
              placeholder="Min salary"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            />
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(parseInt(e.target.value))}
              placeholder="Max salary"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            />
            <input
              type="number"
              value={timeline}
              onChange={(e) => setTimeline(parseInt(e.target.value))}
              placeholder="Timeline (months)"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            />
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Your main goal"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg h-24"
            />
          </div>
        )}

        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-8 py-2 border border-slate-700 rounded-lg font-semibold"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (step === 1 ? setStep(2) : handleComplete())}
            disabled={!selected || loading}
            className="ml-auto px-8 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? "Setting up..." : step === 1 ? "Next" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
