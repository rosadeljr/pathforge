import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — PathForge",
  description:
    "Privacy Policy for PathForge, a ZenForge Technologies product. Compliant with the Data Privacy Act of 2012 (R.A. 10173).",
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
        <p className="text-sm text-slate-500 mb-2">
          Effective: 1 January 2026 · Last updated: May 2026
        </p>
        <p className="text-sm text-slate-500 mb-10">
          Compliant with the Data Privacy Act of 2012 (Republic Act No. 10173) and its
          Implementing Rules and Regulations. PathForge is designed for Filipino students
          ages 6–15; this policy explains how we handle children's data with extra care.
        </p>

        <div className="space-y-7 text-slate-300 leading-relaxed">
          <Section title="1. Personal Information Controller">
            <p>
              <strong>ZenForge Technologies</strong> ("we," "us," "our") is the Personal
              Information Controller (PIC) responsible for the processing of personal data
              collected through PathForge.
            </p>
            <p className="mt-2">
              Business name registered with the Department of Trade and Industry (DTI),
              Philippines. We are committed to protecting your personal data in accordance
              with the Data Privacy Act of 2012 (R.A. 10173), its Implementing Rules and
              Regulations (IRR), and issuances by the National Privacy Commission (NPC).
            </p>
            <div className="mt-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs">
              <strong>Data Protection Officer (DPO):</strong>
              <br />
              Email:{" "}
              <a href="mailto:privacy@pathforger.app" className="text-indigo-300 underline">
                privacy@pathforger.app
              </a>
            </div>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Account identifiers</strong>: email address, username, optional full name,
                hashed password (we never store plaintext passwords)
              </li>
              <li>
                <strong>Learner profile</strong>: grade level (1–12), picked subjects, optional
                dream career
              </li>
              <li>
                <strong>Parent/guardian email</strong>: required for learners under 13. Used only
                for progress notifications and account recovery.
              </li>
              <li>
                <strong>Activity data</strong>: lessons completed, XP earned, level, streaks,
                achievements unlocked, in-lesson answer history
              </li>
              <li>
                <strong>Tutor messages</strong>: text the learner sends to ForgeBot and the
                tutor's replies (used to maintain conversation context)
              </li>
              <li>
                <strong>Subscription data</strong>: subscription tier (free/pro/family), and the
                GCash/Maya payment proof you submit (reference number, amount, optional
                screenshot) for manual verification
              </li>
              <li>
                <strong>Technical data</strong>: IP address, browser type, device information,
                page views, feature interactions (anonymized analytics)
              </li>
            </ul>
            <p className="mt-3">
              <strong>Sensitive personal information.</strong> We do <em>not</em> collect
              government-issued IDs, biometric data, medical records, religious affiliation,
              political beliefs, sexual orientation, or other sensitive personal information
              as defined under Section 3(l) of R.A. 10173.
            </p>
            <p className="mt-3">
              <strong>What we do NOT collect from kids.</strong> No real-name requirement, no
              physical address, no phone number, no school name, no photos or biometric data,
              no location tracking.
            </p>
          </Section>

          <Section title="3. How We Collect Information">
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Directly from you (signup forms, profile updates, project submissions)</li>
              <li>Automatically through your use of the Service (cookies, analytics)</li>
              <li>From third-party authentication providers (if you sign in via OAuth)</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>Under Section 12 and 13 of R.A. 10173, we process your data based on:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Consent</strong> — given when you create an account and accept these
                terms
              </li>
              <li>
                <strong>Contract necessity</strong> — to deliver the Service you signed up for
              </li>
              <li>
                <strong>Legitimate interest</strong> — to improve the Service, prevent abuse,
                and provide customer support
              </li>
              <li>
                <strong>Legal obligation</strong> — to comply with applicable Philippine laws
                (e.g., tax records, NPC investigations)
              </li>
            </ul>
          </Section>

          <Section title="5. Purposes of Processing">
            <p>We use your personal data to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Provide, operate, and maintain the Service</li>
              <li>Match lessons to the learner's grade and adapt the tutor to their age tier</li>
              <li>Track progress (XP, levels, achievements, streaks)</li>
              <li>Show the leaderboard within the learner's age cohort</li>
              <li>Send transactional emails (welcome, weekly progress to parents, password reset)</li>
              <li>Process subscription payments and prevent fraud</li>
              <li>Improve the Service through anonymized analytics</li>
              <li>Respond to support inquiries</li>
              <li>Moderate inappropriate content and ensure age-safe interactions</li>
              <li>Comply with legal obligations and protect against legal claims</li>
            </ul>
            <p className="mt-3 font-semibold text-white">
              We will never sell your personal data. We do not share personally identifiable
              information with third parties for advertising purposes. We do not target ads to
              children — there are no ads in PathForge at all.
            </p>
          </Section>

          <Section title="6. Leaderboards & Friends">
            <p>
              Limited information is visible to other learners on PathForge:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>
                <strong>Leaderboard</strong>: username, current level, total XP, streak. Visible
                only to other signed-in learners.
              </li>
              <li>
                <strong>Friends</strong>: username, level, XP, streak. Visible only to learners
                you accept as friends. Friend requests are restricted to learners in the same
                user mode (kids only connect with kids).
              </li>
            </ul>
            <p className="mt-3">
              <strong>Email, full name, parent email, and grade are NEVER shown to other
              learners.</strong> You can decline any friend request and remove friends at any
              time. There are no public-facing learner profile pages.
            </p>
          </Section>

          <Section title="7. Data Sharing and Third-Party Processors">
            <p>
              We share your data only with the following Data Processors under strict data
              sharing agreements that comply with Section 20 of R.A. 10173:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Supabase</strong> (USA) — database, authentication, file storage.{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 underline"
                >
                  Privacy policy
                </a>
              </li>
              <li>
                <strong>Vercel</strong> (USA) — hosting and content delivery.{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 underline"
                >
                  Privacy policy
                </a>
              </li>
              <li>
                <strong>OpenAI</strong> (USA) — powers ForgeBot tutor responses. Only the
                learner's message text and minimal context (grade, picked subjects, dream
                career, level) are sent. The OpenAI API does not use this data for training
                under their no-training policy for API customers.{" "}
                <a
                  href="https://openai.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 underline"
                >
                  Privacy policy
                </a>
              </li>
              <li>
                <strong>GCash / Maya</strong> (Philippines) — you pay through your own
                GCash or Maya app. We only receive the payment proof you choose to submit
                (reference number, amount). We never see your wallet credentials or PIN.
              </li>
              <li>
                <strong>Resend</strong> (USA) — transactional email delivery (payment
                confirmations, account notices).{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 underline"
                >
                  Privacy policy
                </a>
              </li>
              <li>
                <strong>Vercel Analytics</strong> (USA) — anonymized page view tracking.
              </li>
            </ul>
            <p className="mt-3">
              <strong>Cross-border data transfer.</strong> Some of our processors are based
              outside the Philippines. We rely on the contractual safeguards required under
              Section 21 of R.A. 10173 to ensure your data maintains an equivalent level of
              protection.
            </p>
          </Section>

          <Section title="8. Your Rights as a Data Subject">
            <p>
              Under Sections 16–18 of R.A. 10173, you have the following rights:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Right to be informed</strong> — about how your data is collected and used
              </li>
              <li>
                <strong>Right to access</strong> — request a copy of your personal data
              </li>
              <li>
                <strong>Right to rectification</strong> — correct inaccurate or incomplete data
              </li>
              <li>
                <strong>Right to erasure or blocking</strong> — delete or restrict processing
                under qualifying conditions
              </li>
              <li>
                <strong>Right to damages</strong> — seek redress for violations
              </li>
              <li>
                <strong>Right to data portability</strong> — receive your data in a structured,
                commonly used, machine-readable format
              </li>
              <li>
                <strong>Right to object</strong> — refuse processing for direct marketing or
                profiling
              </li>
              <li>
                <strong>Right to file a complaint</strong> — with the National Privacy Commission
                if you believe your rights are violated
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a href="mailto:privacy@pathforger.app" className="text-indigo-300 underline">
                privacy@pathforger.app
              </a>{" "}
              with your request. We will respond within seven (7) business days. Verification
              of identity may be required.
            </p>
            <p className="mt-2">
              You may also file a complaint with the{" "}
              <a
                href="https://www.privacy.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 underline"
              >
                National Privacy Commission (NPC)
              </a>
              .
            </p>
          </Section>

          <Section title="9. Data Retention">
            <p>
              We retain your personal data only as long as necessary to fulfill the purposes
              for which it was collected, including:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>Active account data — for the duration your account is active</li>
              <li>
                Account deletion — personal data removed within thirty (30) days of your
                deletion request, except where retention is required by law
              </li>
              <li>
                Financial records — retained for ten (10) years as required by the Bureau of
                Internal Revenue (BIR) under the Tax Reform Act
              </li>
              <li>
                Anonymized analytics — retained indefinitely for service improvement (no
                personal identifiers)
              </li>
            </ul>
          </Section>

          <Section title="10. Security Measures">
            <p>
              In compliance with Section 20 of R.A. 10173 and the NPC's privacy and security
              standards, we implement appropriate organizational, physical, and technical
              security measures:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>Encryption</strong> — all data is encrypted in transit (HTTPS/TLS) and at rest
              </li>
              <li>
                <strong>Password security</strong> — bcrypt hashing (industry standard)
              </li>
              <li>
                <strong>Row-level security</strong> — database access controls ensure users
                can only access their own data
              </li>
              <li>
                <strong>Access controls</strong> — internal access limited to authorized
                personnel on a need-to-know basis
              </li>
              <li>
                <strong>Audit logs</strong> — administrative actions are logged for security review
              </li>
              <li>
                <strong>Incident response</strong> — breach notification within 72 hours to
                affected users and NPC as required by law
              </li>
            </ul>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              PathForge is built for Filipino students <strong>ages 6 to 15</strong>. We treat
              children's data with extra care under R.A. 10173, NPC Advisory Opinions on
              minors' personal data, and aligned with international best practices (UN CRC
              General Comment No. 25).
            </p>

            <p className="mt-3 font-semibold text-white">For learners under 13 years old:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                Account creation requires the consent of a parent or legal guardian, who
                must provide a verifiable parent/guardian email during signup.
              </li>
              <li>
                Parents may request to access, correct, or delete their child's data at any
                time by emailing{" "}
                <a href="mailto:privacy@pathforger.app" className="text-indigo-300 underline">
                  privacy@pathforger.app
                </a>
                .
              </li>
              <li>
                Weekly progress emails are sent to the parent/guardian email on Pro and Family
                plans.
              </li>
            </ul>

            <p className="mt-4 font-semibold text-white">Universal child-safety measures:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1.5">
              <li>
                <strong>No ads, no in-app purchases marketed to kids.</strong> Subscriptions
                are sold only to adults via the parent-facing pricing page.
              </li>
              <li>
                <strong>AI tutor guardrails.</strong> ForgeBot is age-tier calibrated. It
                refuses violence, adult content, drugs/alcohol, self-harm, and any sensitive
                topic outside school subjects. Sensitive personal topics (mental health,
                family stress) are gently redirected to trusted adults or PH crisis lines
                (e.g., NCMH 1553).
              </li>
              <li>
                <strong>No external links surfaced to kids.</strong> The app never sends a
                learner outside PathForge.
              </li>
              <li>
                <strong>Friend connections are restricted</strong> to learners in the same
                user mode. There are no DMs, no chat, no group messaging — only friend
                connections that show shared leaderboard standings.
              </li>
              <li>
                <strong>No photos, no biometrics, no location data</strong> are collected
                from learners — ever.
              </li>
              <li>
                Profiles are private by default. There are no public-facing profile pages.
              </li>
              <li>
                <strong>Right to be forgotten:</strong> a parent or learner can request full
                account deletion at any time. We remove all personal data within 30 days,
                except where retention is required by Philippine law.
              </li>
            </ul>

            <p className="mt-3">
              If you believe a child has signed up without parental consent or if you have any
              concern about a learner's safety on PathForge, please email{" "}
              <a href="mailto:privacy@pathforger.app" className="text-indigo-300 underline">
                privacy@pathforger.app
              </a>{" "}
              and we will act within 24 hours.
            </p>
          </Section>

          <Section title="12. Cookies">
            <p>
              We use essential cookies (for authentication and session management) and
              anonymized analytics cookies. See our{" "}
              <Link href="/cookies" className="text-indigo-300 underline">
                Cookie Policy
              </Link>{" "}
              for full details and your choices.
            </p>
          </Section>

          <Section title="13. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be
              communicated via email or in-app notification at least fourteen (14) days before
              taking effect. The "Last updated" date at the top of this page reflects the
              latest revision.
            </p>
          </Section>

          <Section title="14. Contact and Complaints">
            <p>
              For any questions, concerns, or requests regarding your personal data, contact
              our Data Protection Officer:
            </p>
            <div className="mt-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs space-y-1">
              <p>
                <strong>Data Protection Officer</strong>
              </p>
              <p>ZenForge Technologies</p>
              <p>
                Email:{" "}
                <a href="mailto:privacy@pathforger.app" className="text-indigo-300 underline">
                  privacy@pathforger.app
                </a>
              </p>
              <p>Response time: within 7 business days</p>
            </div>
            <p className="mt-3">
              If you are unsatisfied with our response, you may lodge a complaint with the{" "}
              <a
                href="https://www.privacy.gov.ph/complaints-assisted-form/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 underline"
              >
                National Privacy Commission (NPC)
              </a>
              .
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
