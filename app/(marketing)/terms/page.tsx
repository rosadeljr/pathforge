import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — PathForge",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: May 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-slate-300 leading-relaxed">
          <Section title="1. Agreement">
            <p>
              By accessing or using PathForge (the "Service"), operated by ZenForge Technologies
              (DTI Registered, Philippines), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the Service.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 16 years old to create an account. By using PathForge, you
              represent that you meet this age requirement and have the legal capacity to enter
              into this agreement.
            </p>
          </Section>

          <Section title="3. Your Account">
            <p>
              You are responsible for keeping your login credentials secure. You agree to notify
              us immediately of any unauthorized access. We reserve the right to suspend or
              terminate accounts that violate these Terms or engage in abusive behavior.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Use the Service for unlawful purposes</li>
              <li>Attempt to gain unauthorized access to other accounts or systems</li>
              <li>Scrape, copy, or redistribute the curated career content</li>
              <li>Impersonate any person or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </Section>

          <Section title="5. Content and Intellectual Property">
            <p>
              All career path content, quest templates, branding, and platform code are the
              property of ZenForge Technologies. You retain ownership of work and submissions
              you create, but grant PathForge a license to display them on your public profile
              if you opt to make them visible.
            </p>
          </Section>

          <Section title="6. Subscriptions and Payments">
            <p>
              Free tier is available indefinitely. Pro and Elite plans are billed monthly and
              renew automatically. You may cancel at any time from your account settings. No
              refunds for partial months, but you keep access until the end of the billing
              period. We offer a 30-day refund window from your first paid subscription.
            </p>
          </Section>

          <Section title="7. Public Profiles">
            <p>
              If you choose to make your profile public at /u/[username], the displayed
              information (level, projects, achievements) is visible to anyone. Your email
              address is never displayed publicly.
            </p>
          </Section>

          <Section title="8. Termination">
            <p>
              You may delete your account at any time. We may terminate accounts that violate
              these Terms with notice when reasonable. Upon termination, your data is removed
              within 30 days, except where retention is required by law.
            </p>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              PathForge is a productivity and education tool. We do not guarantee employment,
              income, or specific career outcomes. The Service is provided "as is" without
              warranties of any kind.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by Philippine law, ZenForge Technologies shall
              not be liable for any indirect, incidental, or consequential damages arising
              from your use of the Service.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms are governed by the laws of the Republic of the Philippines.
              Disputes will be resolved through Philippine courts of competent jurisdiction.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may update these Terms occasionally. Material changes will be announced
              via email or in-app notification at least 14 days before taking effect.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions about these Terms? Reach us at{" "}
              <a href="mailto:hello@pathforge.app" className="text-indigo-300 hover:text-indigo-200 underline">
                hello@pathforge.app
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
