import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — PathForge",
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: May 2026</p>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <Section title="Who we are">
            <p>
              PathForge is operated by ZenForge Technologies (DTI Registered, Philippines). We
              take your privacy seriously and comply with the Data Privacy Act of 2012 (R.A.
              10173).
            </p>
          </Section>

          <Section title="What we collect">
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Account info</strong>: email, username, optional full name
              </li>
              <li>
                <strong>Progress data</strong>: quests completed, XP earned, streaks, achievements
              </li>
              <li>
                <strong>Career preferences</strong>: selected path, goals, timeline, availability
              </li>
              <li>
                <strong>Portfolio content</strong>: projects you choose to add (with proof URLs)
              </li>
              <li>
                <strong>AI mentor messages</strong>: stored to maintain conversation history
              </li>
              <li>
                <strong>Usage analytics</strong>: anonymized event tracking (page views,
                features used)
              </li>
            </ul>
          </Section>

          <Section title="What we don't collect">
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Government IDs or sensitive personal information</li>
              <li>Financial data (payments are processed by Stripe — they handle card data)</li>
              <li>Your browsing on other websites</li>
              <li>Contacts, location, or device sensors (we never request these permissions)</li>
            </ul>
          </Section>

          <Section title="How we use your data">
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>To provide the Service (track progress, customize quests, render dashboards)</li>
              <li>To improve PathForge through anonymized analytics</li>
              <li>To send transactional emails (welcome, password reset, milestone alerts)</li>
              <li>To moderate abusive content (admins can review reported messages)</li>
            </ul>
            <p className="mt-3">
              <strong>We never sell your data.</strong> We never share personally identifiable
              information with third parties for marketing.
            </p>
          </Section>

          <Section title="Public profiles">
            <p>
              If you publish your profile at /u/[username], the following becomes publicly
              visible: username, full name (if added), level, rank, XP, streaks, career path,
              completed projects with their public URLs, and unlocked achievements. Your email
              address is NEVER displayed publicly.
            </p>
          </Section>

          <Section title="Third-party services">
            <p>We use the following services to operate PathForge:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Supabase</strong> — database, authentication, file storage
              </li>
              <li>
                <strong>Vercel</strong> — hosting and infrastructure
              </li>
              <li>
                <strong>OpenAI</strong> — AI mentor responses (only if API key configured; we
                send only the message text and minimal user context)
              </li>
              <li>
                <strong>Stripe</strong> — payment processing for Pro/Elite plans
              </li>
              <li>
                <strong>Vercel Analytics</strong> — anonymized page view tracking
              </li>
            </ul>
            <p className="mt-3">
              Each of these services has its own privacy policy that you can review on their
              websites.
            </p>
          </Section>

          <Section title="Your rights under the Data Privacy Act">
            <p>Filipino users have the following rights:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Right to be informed about how your data is used</li>
              <li>Right to access and correct your data</li>
              <li>Right to data portability (export your data)</li>
              <li>Right to object to processing</li>
              <li>Right to erasure (delete your account and data)</li>
              <li>Right to file a complaint with the National Privacy Commission</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a
                href="mailto:privacy@pathforge.app"
                className="text-indigo-300 hover:text-indigo-200 underline"
              >
                privacy@pathforge.app
              </a>
              . We respond within 7 business days.
            </p>
          </Section>

          <Section title="Data retention">
            <p>
              We keep your data while your account is active. If you delete your account, all
              personal data is removed within 30 days. Aggregated, anonymized analytics may be
              retained for service improvement.
            </p>
          </Section>

          <Section title="Security">
            <p>
              Your data is encrypted in transit (HTTPS) and at rest. Passwords are hashed using
              industry-standard bcrypt. Database access is limited to authorized personnel.
              We use Supabase Row Level Security to ensure users can only access their own data.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              PathForge is not intended for users under 16. We do not knowingly collect data
              from children. If we learn we've collected data from a child under 16, we will
              delete it promptly.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use essential cookies for authentication (your session) and to remember your
              preferences. We do not use tracking cookies for advertising.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this Privacy Policy. Material changes will be communicated via
              email or in-app notification at least 14 days before taking effect.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions or concerns about your privacy? Reach our Data Protection Officer at{" "}
              <a
                href="mailto:privacy@pathforge.app"
                className="text-indigo-300 hover:text-indigo-200 underline"
              >
                privacy@pathforge.app
              </a>
              .
            </p>
            <p className="text-xs text-slate-500 mt-4">
              ZenForge Technologies · DTI Registered · Philippines
            </p>
          </Section>
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
