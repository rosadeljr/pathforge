"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { LogOut, ArrowLeft } from "lucide-react";

interface Profile {
  username?: string;
  email?: string;
  target_salary_min?: number;
  target_salary_max?: number;
  primary_goal?: string;
  subscription_tier?: string;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profile?.username || ""}
                  disabled
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Career Goals</h2>
            <p className="text-slate-400 text-sm mb-4">
              {profile?.primary_goal || "No goal set"}
            </p>
            <p className="text-slate-400 text-sm">
              Target: ₱{profile?.target_salary_min} - ₱{profile?.target_salary_max}
            </p>
          </div>

          {/* Subscription Section */}
          <div className="bg-gradient-to-r from-violet-900/30 to-slate-900 border border-violet-500/30 rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Subscription</h2>
            <p className="text-slate-400 text-sm mb-4">
              Current plan:{" "}
              <span className="text-cyan-400 font-semibold capitalize">
                {profile?.subscription_tier || "free"}
              </span>
            </p>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
              Upgrade to Pro
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
