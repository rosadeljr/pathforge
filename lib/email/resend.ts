import { Resend } from "resend";

/**
 * Email sending via Resend.
 *
 * Required env var:
 *   RESEND_API_KEY   — from https://resend.com/api-keys
 *
 * Optional env vars:
 *   ADMIN_EMAIL      — where payment alerts go (default: rosadelreyes10@gmail.com)
 *   EMAIL_FROM       — sender (default: "PathForge <onboarding@resend.dev>")
 *
 * Note on the default sender:
 *   "onboarding@resend.dev" works WITHOUT verifying a domain, but Resend only
 *   delivers it to the email address that owns the Resend account. That's fine
 *   for ADMIN alerts (they go to the owner). To email arbitrary USERS
 *   (approval notices), you must verify a domain and set EMAIL_FROM.
 *
 * All functions are best-effort: if RESEND_API_KEY is missing or the send
 * fails, they log a warning and return false — they never throw.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "rosadelreyes10@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM || "PathForge <onboarding@resend.dev>";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const DARK_WRAP = (inner: string) => `
<div style="background:#0a0a0f;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#13131c;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <span style="font-size:16px;font-weight:600;color:#fff;letter-spacing:-0.02em;">⬢ PathForge</span>
    </div>
    <div style="padding:24px;">
      ${inner}
    </div>
    <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,0.06);">
      <span style="font-size:11px;color:#64748b;">ZenForge Technologies · DTI Registered · Philippines</span>
    </div>
  </div>
</div>`;

// ============================================================
// Admin: new payment request submitted
// ============================================================

interface PaymentAlertData {
  userName: string;
  userEmail: string;
  tier: string;
  amount: number;
  method: string;
  referenceNumber: string;
  senderName?: string;
  senderNumber?: string;
  proofUrl?: string;
  notes?: string;
}

export async function sendAdminPaymentAlert(data: PaymentAlertData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping admin payment alert");
    return false;
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pathforge-zeta.vercel.app";
    const row = (label: string, value: string) =>
      `<tr>
        <td style="padding:6px 0;font-size:13px;color:#94a3b8;width:130px;">${label}</td>
        <td style="padding:6px 0;font-size:13px;color:#e2e8f0;font-weight:500;">${value}</td>
      </tr>`;

    const inner = `
      <h1 style="margin:0 0 4px;font-size:18px;font-weight:600;color:#fff;">💸 New payment request</h1>
      <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;">
        A user submitted a ${data.method.toUpperCase()} payment. Review and approve it in the admin panel.
      </p>
      <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:14px 16px;margin-bottom:20px;">
        <span style="font-size:22px;font-weight:700;color:#fff;">₱${data.amount.toLocaleString()}</span>
        <span style="font-size:13px;color:#a5b4fc;margin-left:8px;text-transform:uppercase;font-weight:600;">${data.tier}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${row("From", `${data.userName} (${data.userEmail})`)}
        ${row("Method", data.method.toUpperCase())}
        ${row("Reference #", data.referenceNumber)}
        ${data.senderName ? row("Sender name", data.senderName) : ""}
        ${data.senderNumber ? row("Sender #", data.senderNumber) : ""}
        ${data.proofUrl ? row("Screenshot", `<a href="${data.proofUrl}" style="color:#818cf8;">View proof</a>`) : ""}
        ${data.notes ? row("Notes", data.notes) : ""}
      </table>
      <a href="${appUrl}/admin/payments"
         style="display:inline-block;margin-top:20px;background:#fff;color:#0a0a0f;font-size:13px;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:8px;">
        Review in admin panel →
      </a>`;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `💸 ₱${data.amount.toLocaleString()} ${data.tier.toUpperCase()} payment from ${data.userName}`,
      html: DARK_WRAP(inner),
    });

    if (error) {
      console.warn("[email] admin payment alert failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[email] admin payment alert threw:", err);
    return false;
  }
}

// ============================================================
// User: payment approved
// ============================================================

export async function sendPaymentApprovedEmail(
  userEmail: string,
  userName: string,
  tier: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pathforge-zeta.vercel.app";
    const inner = `
      <h1 style="margin:0 0 4px;font-size:18px;font-weight:600;color:#fff;">⚡ You're now ${tier.toUpperCase()}!</h1>
      <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;line-height:1.6;">
        Hi ${userName}, your payment has been verified and your PathForge
        <strong style="color:#e2e8f0;">${tier.toUpperCase()}</strong> plan is now active.
        Every premium feature is unlocked.
      </p>
      <a href="${appUrl}/learn"
         style="display:inline-block;background:#fff;color:#0a0a0f;font-size:13px;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:8px;">
        Open your lessons →
      </a>`;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: userEmail,
      subject: `⚡ Your PathForge ${tier.toUpperCase()} plan is active`,
      html: DARK_WRAP(inner),
    });
    if (error) {
      console.warn("[email] approval email failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[email] approval email threw:", err);
    return false;
  }
}

// ============================================================
// User: payment rejected
// ============================================================

export async function sendPaymentRejectedEmail(
  userEmail: string,
  userName: string,
  reason: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    const inner = `
      <h1 style="margin:0 0 4px;font-size:18px;font-weight:600;color:#fff;">Payment needs another look</h1>
      <p style="margin:0 0 12px;font-size:13px;color:#94a3b8;line-height:1.6;">
        Hi ${userName}, we couldn't verify your recent payment.
      </p>
      ${
        reason
          ? `<div style="background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.2);border-radius:10px;padding:12px 14px;margin-bottom:16px;">
              <span style="font-size:13px;color:#fda4af;">${reason}</span>
            </div>`
          : ""
      }
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
        Reply to this email or contact <strong style="color:#e2e8f0;">support@pathforger.app</strong>
        and we'll sort it out. No charge has been applied.
      </p>`;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: userEmail,
      subject: "Action needed: PathForge payment verification",
      html: DARK_WRAP(inner),
    });
    if (error) {
      console.warn("[email] rejection email failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[email] rejection email threw:", err);
    return false;
  }
}

// ============================================================
// User: re-engagement nudge ("ForgeBot misses you")
// ============================================================

export async function sendReengagementEmail(
  userEmail: string,
  userName: string,
  daysAway: number
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pathforge-zeta.vercel.app";
    const inner = `
      <h1 style="margin:0 0 4px;font-size:18px;font-weight:600;color:#fff;">ForgeBot misses you 👋</h1>
      <p style="margin:0 0 14px;font-size:13px;color:#94a3b8;line-height:1.6;">
        Hi ${userName} — it's been ${daysAway} days. You were building real
        momentum, and the learners who level up are the ones who keep showing up.
      </p>
      <p style="margin:0 0 18px;font-size:13px;color:#94a3b8;line-height:1.6;">
        You don't need a big session. One lesson. Ten minutes. That's how the
        climb compounds.
      </p>
      <a href="${appUrl}/learn"
         style="display:inline-block;background:#fff;color:#0a0a0f;font-size:13px;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:8px;">
        Pick up where you left off →
      </a>
      <p style="margin:18px 0 0;font-size:11px;color:#64748b;">
        — ForgeBot, your PathForge tutor
      </p>`;

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: userEmail,
      subject: `${userName}, your career path misses you`,
      html: DARK_WRAP(inner),
    });
    if (error) {
      console.warn("[email] reengagement email failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[email] reengagement email threw:", err);
    return false;
  }
}
