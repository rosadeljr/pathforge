/**
 * Cross-platform marketing event tracking.
 *
 * Fires the same conversion event to every configured ad platform:
 * Meta Pixel, TikTok Pixel, Google Ads, GA4. Each fire is wrapped in
 * a try/catch so a missing pixel never breaks the user flow.
 *
 * Call from the client after a real conversion happens — signup,
 * upgrade, lesson_completed, etc.
 */

type MarketingEvent =
  | "Lead" // signup completed
  | "CompleteRegistration" // account fully set up (grade picked)
  | "Subscribe" // paid plan started
  | "Purchase" // paid plan started — with value
  | "ViewContent" // landing or pricing visited
  | "AddToCart" // hit pricing page with intent
  | "FirstLesson"; // first lesson completed (engagement signal)

interface TrackOptions {
  value?: number;
  currency?: string; // default PHP
  contentName?: string;
  userId?: string;
}

export function trackConversion(event: MarketingEvent, opts: TrackOptions = {}) {
  if (typeof window === "undefined") return;
  const value = opts.value ?? 0;
  const currency = opts.currency ?? "PHP";

  // Meta Pixel
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      fbq("track", event, {
        value,
        currency,
        content_name: opts.contentName,
      });
    }
  } catch {
    /* non-fatal */
  }

  // TikTok Pixel — uses different event names; map common ones
  try {
    const ttq = (window as any).ttq;
    if (ttq && typeof ttq.track === "function") {
      const ttEvent =
        event === "Lead" ? "CompleteRegistration"
        : event === "Subscribe" || event === "Purchase" ? "PlaceAnOrder"
        : event === "AddToCart" ? "AddToCart"
        : event === "ViewContent" ? "ViewContent"
        : "ClickButton";
      ttq.track(ttEvent, { value, currency });
    }
  } catch {
    /* non-fatal */
  }

  // Google Ads / GA4
  try {
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", event, {
        value,
        currency,
        items: opts.contentName ? [{ item_name: opts.contentName }] : undefined,
      });
    }
  } catch {
    /* non-fatal */
  }
}

/**
 * Capture UTM params from the URL into sessionStorage on first visit.
 * Call once from any page that wants to remember the source for
 * later attribution.
 */
export function captureUtm() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    const captured: Record<string, string> = {};
    let any = false;
    for (const k of keys) {
      const v = params.get(k);
      if (v) {
        captured[k] = v;
        any = true;
      }
    }
    if (any) {
      sessionStorage.setItem("pf-utm", JSON.stringify(captured));
    }
  } catch {
    /* non-fatal */
  }
}

/** Read UTM params previously captured. */
export function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem("pf-utm");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
