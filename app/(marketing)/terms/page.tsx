import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — PathForge",
  description:
    "Terms of Service for PathForge, a ZenForge Technologies product. Governed by Philippine law.",
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
        <p className="text-sm text-slate-500 mb-2">
          Effective: 1 January 2026 · Last updated: May 2026
        </p>
        <p className="text-sm text-slate-500 mb-10">
          Governed by the laws of the Republic of the Philippines.
        </p>

        <div className="space-y-7 text-slate-300 leading-relaxed">
          <Section title="1. Agreement to Terms">
            <p>
              These Terms of Service ("Terms") form a binding legal agreement between you
              ("User," "you") and ZenForge Technologies, a sole proprietorship registered with
              the Philippine Department of Trade and Industry (DTI), with business address in
              the Philippines ("Company," "we," "our," "us"), governing your access to and use
              of PathForge — the web application, mobile app, APIs, and related services
              (collectively, the "Service").
            </p>
            <p className="mt-2">
              By creating an account, accessing, or using the Service, you acknowledge that
              you have read, understood, and agreed to be bound by these Terms, our{" "}
              <Link href="/privacy" className="text-indigo-300 underline">
                Privacy Policy
              </Link>
              , and our{" "}
              <Link href="/cookies" className="text-indigo-300 underline">
                Cookie Policy
              </Link>
              . If you do not agree, do not use the Service.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least sixteen (16) years of age to create an account. Users under
              the age of eighteen (18) require parental or guardian consent under Article 234
              of the Civil Code of the Philippines (R.A. 6809). By using the Service, you
              represent that you meet the age requirement and have the legal capacity to enter
              into this agreement.
            </p>
          </Section>

          <Section title="3. Account Registration and Security">
            <p>
              You agree to provide accurate, current, and complete information during
              registration. You are solely responsible for safeguarding your password and for
              all activities that occur under your account. You must notify us immediately at{" "}
              <a href="mailto:support@pathforge.app" className="text-indigo-300 underline">
                support@pathforge.app
              </a>{" "}
              of any unauthorized access or security breach.
            </p>
            <p className="mt-2">
              We reserve the right to refuse service, suspend, or terminate accounts that
              violate these Terms, engage in abusive behavior, or pose a security risk to
              other users or the Service.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree NOT to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Use the Service for any unlawful purpose or in violation of any Philippine law</li>
              <li>
                Engage in acts prohibited by the Cybercrime Prevention Act of 2012 (R.A. 10175),
                including unauthorized access, identity theft, computer-related fraud, and
                cyber-libel
              </li>
              <li>Attempt to gain unauthorized access to other accounts, systems, or data</li>
              <li>Scrape, copy, reproduce, or redistribute the curated career content, quest templates, or any other proprietary material</li>
              <li>Impersonate any person or entity, or falsely represent your affiliation</li>
              <li>Upload viruses, malware, or other malicious code</li>
              <li>Interfere with, disrupt, or overload the Service infrastructure</li>
              <li>Use automated tools (bots, scrapers) to access the Service without our written consent</li>
              <li>Use the Service to harass, defame, or harm other users</li>
              <li>Post content that is obscene, defamatory, or violates the rights of others</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              In accordance with the Intellectual Property Code of the Philippines (R.A. 8293),
              all content, features, and functionality of the Service — including but not
              limited to career path content, quest templates, the PathForge name and logo,
              software code, design, graphics, and compilation — are the exclusive property
              of ZenForge Technologies and are protected by Philippine and international
              copyright, trademark, patent, and other intellectual property laws.
            </p>
            <p className="mt-2">
              <strong>Your content.</strong> You retain ownership of original content you
              submit (projects, portfolio items, written reflections). By submitting content
              to the Service, you grant ZenForge Technologies a worldwide, non-exclusive,
              royalty-free, transferable license to use, reproduce, display, and distribute
              such content solely for the purpose of operating the Service. If you choose to
              make your profile public, you grant us the right to display the content as part
              of your public profile.
            </p>
          </Section>

          <Section title="6. Subscriptions, Fees, and Payment">
            <p>
              The Service offers a free tier and paid subscription plans (Pro and Elite).
              Paid plans are priced monthly in Philippine Pesos (PHP). Payment is made manually
              via GCash or Maya — after sending payment, you submit a proof of payment which our
              team verifies (typically within 4 hours during PH business hours) before your plan
              is activated. All fees are exclusive of applicable taxes (including VAT under
              R.A. 9337) unless otherwise stated.
            </p>
            <p className="mt-2">
              <strong>Renewal.</strong> Plans do not auto-charge. Before each period ends, you
              will be reminded to renew via the same GCash/Maya process. Your plan reverts to
              Free if not renewed.
            </p>
            <p className="mt-2">
              <strong>Cancellation and refunds.</strong> You may stop using a paid plan at any
              time — simply do not renew. Since plans do not auto-charge, there is nothing to
              cancel. As required under the
              Consumer Act of the Philippines (R.A. 7394), a refund is available within thirty
              (30) days of your first paid subscription upon written request to{" "}
              <a href="mailto:support@pathforge.app" className="text-indigo-300 underline">
                support@pathforge.app
              </a>
              , subject to verification of eligibility.
            </p>
            <p className="mt-2">
              <strong>Price changes.</strong> We may change subscription prices with at least
              thirty (30) days' prior notice via email. Continued use after the effective date
              constitutes acceptance of the new pricing.
            </p>
          </Section>

          <Section title="7. Public Profiles and Sharing">
            <p>
              If you choose to make your profile public at /u/[username], the displayed data
              (username, optional full name, level, rank, XP, streaks, career path, completed
              projects, and unlocked achievements) is visible to anyone with the link. Your
              email address is never displayed publicly. You may disable your public profile
              at any time from your account settings.
            </p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>
              The Service integrates with third-party providers including Supabase
              (infrastructure), Vercel (hosting), OpenAI (optional AI features), GCash and
              Maya (payments), Resend (email delivery), and Vercel Analytics (anonymized
              usage). Use of these services is subject to their respective terms and privacy
              policies. We are not responsible for the practices of third parties.
            </p>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any
              warranties, express or implied. While PathForge is designed to support your
              career development, <strong>we do not guarantee any specific outcomes</strong>,
              including but not limited to employment, freelance income, promotion, or skill
              mastery. Results depend on your individual effort, market conditions, and
              factors beyond our control.
            </p>
            <p className="mt-2">
              To the maximum extent permitted by law, we disclaim all warranties including
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted under the Civil Code of the Philippines and
              applicable laws, in no event shall ZenForge Technologies, its officers,
              employees, or agents be liable for any indirect, incidental, special,
              consequential, or punitive damages — including loss of profits, revenue, data,
              use, goodwill, or other intangible losses — arising out of or in connection
              with your use of the Service.
            </p>
            <p className="mt-2">
              Our total cumulative liability for any claim arising out of or relating to the
              Service shall not exceed the greater of (a) the amount you paid us in the twelve
              (12) months preceding the claim, or (b) PHP 1,000.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless ZenForge Technologies and its
              affiliates from any claims, damages, liabilities, costs, or expenses (including
              reasonable attorney's fees) arising from your violation of these Terms, your use
              of the Service, or your infringement of any third-party rights.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              You may delete your account at any time from your account settings. Upon
              termination, your access to the Service ceases immediately and your personal
              data is removed within thirty (30) days, except where retention is required by
              law (e.g., financial records under R.A. 11232).
            </p>
            <p className="mt-2">
              We may suspend or terminate accounts that violate these Terms or applicable laws,
              with notice when reasonable. Sections regarding intellectual property, disclaimers,
              limitation of liability, indemnification, and governing law survive termination.
            </p>
          </Section>

          <Section title="13. Modifications to the Service and Terms">
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service
              at any time with reasonable notice. We may update these Terms periodically;
              material changes will be communicated via email or in-app notification at least
              fourteen (14) days before taking effect. Continued use after the effective date
              constitutes acceptance.
            </p>
          </Section>

          <Section title="14. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by and construed in accordance with the laws of the
              Republic of the Philippines, without regard to its conflict-of-law principles.
            </p>
            <p className="mt-2">
              Any dispute, controversy, or claim arising out of or relating to these Terms or
              the Service shall first be attempted to be resolved amicably through good-faith
              negotiation. If unresolved within sixty (60) days, the parties shall submit the
              dispute to mediation under the rules of the Philippine Mediation Center. If
              mediation fails, disputes shall be subject to the exclusive jurisdiction of the
              proper courts of Metro Manila, Philippines.
            </p>
          </Section>

          <Section title="15. Severability and Waiver">
            <p>
              If any provision of these Terms is held to be invalid or unenforceable by a
              court of competent jurisdiction, the remaining provisions shall remain in full
              force and effect. Our failure to enforce any right or provision shall not be
              deemed a waiver of such right.
            </p>
          </Section>

          <Section title="16. Entire Agreement">
            <p>
              These Terms, together with our Privacy Policy and Cookie Policy, constitute the
              entire agreement between you and ZenForge Technologies regarding the Service,
              superseding any prior agreements.
            </p>
          </Section>

          <Section title="17. Contact">
            <p>
              For questions about these Terms, please contact:
            </p>
            <p className="mt-2">
              <strong>ZenForge Technologies</strong>
              <br />
              DTI Business Name Registration · Philippines
              <br />
              Legal:{" "}
              <a href="mailto:legal@pathforge.app" className="text-indigo-300 underline">
                legal@pathforge.app
              </a>
              <br />
              Support:{" "}
              <a href="mailto:support@pathforge.app" className="text-indigo-300 underline">
                support@pathforge.app
              </a>
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
