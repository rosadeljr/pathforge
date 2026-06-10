import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Cookie Policy",
  description:
    "Cookie Policy for PathForge, a ZenForge Technologies product. Compliant with the Data Privacy Act of 2012.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-semibold tracking-tight">PathForge</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Cookie Policy</h1>
        <p className="text-sm text-slate-500 mb-10">
          Effective: 1 January 2026 · Last updated: May 2026
        </p>

        <div className="space-y-7 text-slate-300 leading-relaxed">
          <Section title="What are cookies?">
            <p>
              Cookies are small text files stored on your device when you visit a website.
              They help the website remember information about your visit (like your login
              session) and improve your experience.
            </p>
            <p className="mt-2">
              This Cookie Policy explains how PathForge — operated by ZenForge Technologies
              (DTI registered, Philippines) — uses cookies and similar technologies. It
              complements our{" "}
              <Link href="/privacy" className="text-indigo-300 underline">
                Privacy Policy
              </Link>{" "}
              and forms part of our commitment to compliance with the Data Privacy Act of
              2012 (R.A. 10173).
            </p>
          </Section>

          <Section title="Categories of cookies we use">
            <div className="mt-3 space-y-4">
              <CookieCategory
                title="Strictly Necessary (Essential)"
                required
                description="Required for the Service to function. Cannot be disabled."
                examples={[
                  {
                    name: "sb-access-token",
                    purpose: "Authenticates your session with Supabase",
                    duration: "Session",
                  },
                  {
                    name: "sb-refresh-token",
                    purpose: "Refreshes expired access tokens",
                    duration: "30 days",
                  },
                ]}
              />
              <CookieCategory
                title="Preferences"
                description="Remember your choices (sound on/off, dark mode, language)."
                examples={[
                  {
                    name: "pathforge-theme",
                    purpose: "Stores your dark / light mode choice",
                    duration: "Persistent (LocalStorage)",
                  },
                  {
                    name: "pathforge-sound-enabled",
                    purpose: "Stores your sound effects preference",
                    duration: "Persistent (LocalStorage)",
                  },
                  {
                    name: "pathforge-welcome-seen-v1",
                    purpose: "Remembers if you've seen the welcome modal",
                    duration: "Persistent (LocalStorage)",
                  },
                ]}
              />
              <CookieCategory
                title="Analytics"
                description="Anonymized usage data to improve the Service. No personal identifiers."
                examples={[
                  {
                    name: "Vercel Analytics",
                    purpose: "Anonymized page views and performance metrics",
                    duration: "Session-based",
                  },
                ]}
              />
            </div>
          </Section>

          <Section title="What we DON'T use">
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Third-party advertising cookies (e.g., Google Ads, Meta Pixel)</li>
              <li>Cross-site tracking cookies</li>
              <li>Behavioral retargeting</li>
              <li>Social media tracking pixels</li>
            </ul>
          </Section>

          <Section title="How to manage cookies">
            <p>
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Chrome</strong>: Settings → Privacy and security → Cookies and other site data
              </li>
              <li>
                <strong>Safari</strong>: Preferences → Privacy → Manage Website Data
              </li>
              <li>
                <strong>Firefox</strong>: Settings → Privacy & Security → Cookies and Site Data
              </li>
              <li>
                <strong>Edge</strong>: Settings → Cookies and site permissions → Cookies and site data
              </li>
            </ul>
            <p className="mt-3 text-amber-200/80 text-xs italic">
              Note: Disabling essential cookies will prevent you from signing in and using
              the Service.
            </p>
          </Section>

          <Section title="LocalStorage and SessionStorage">
            <p>
              We also use browser LocalStorage and SessionStorage for the same purposes as
              cookies — to remember your preferences and authentication state. These are
              cleared when you sign out or clear your browser data.
            </p>
          </Section>

          <Section title="Updates to this policy">
            <p>
              We may update this Cookie Policy as our use of cookies evolves. Material
              changes will be communicated via email or in-app notification.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about our use of cookies? Email{" "}
              <a href="mailto:privacy@pathforger.app" className="text-indigo-300 underline">
                privacy@pathforger.app
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

interface CookieExample {
  name: string;
  purpose: string;
  duration: string;
}

function CookieCategory({
  title,
  description,
  examples,
  required,
}: {
  title: string;
  description: string;
  examples: CookieExample[];
  required?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {required && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Required
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-400 mb-3">{description}</p>
        <div className="space-y-2">
          {examples.map((ex, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className="font-mono text-[11px] text-indigo-300 mb-1">{ex.name}</div>
              <div className="text-[11px] text-slate-400">{ex.purpose}</div>
              <div className="text-[10px] text-slate-500 mt-1">Duration: {ex.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white tracking-tight mb-2">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
