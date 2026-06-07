/**
 * Canonical site URL helpers.
 *
 * The whole app — OAuth redirects, metadata, sitemap/robots, transactional
 * emails — must agree on ONE public origin. Host drift (e.g. landing on a
 * *.vercel.app deployment URL instead of pathforger.app) breaks Google sign-in:
 * the Supabase session cookie gets written for the wrong host, so the canonical
 * domain still looks signed-out and the user has to log in again.
 *
 * Source of truth: NEXT_PUBLIC_APP_URL (set this in the hosting env to
 * https://pathforger.app). If unset we default to the production domain rather
 * than any deployment-specific URL.
 */

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://pathforger.app").replace(/\/$/, "");

/**
 * Best base origin to send the user to on the client. Prefers the configured
 * canonical URL; falls back to the current browser origin (so local dev on
 * http://localhost still works without env config).
 */
export function clientAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return APP_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return APP_URL;
}

/**
 * Server-side canonical origin for redirects in route handlers. Prefers the
 * configured URL, then the original (proxied) host the user actually requested,
 * then the raw request origin — never an internal/deployment host when we can
 * avoid it.
 */
export function serverAppUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return APP_URL;
  const h = request.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  try {
    return new URL(request.url).origin;
  } catch {
    return APP_URL;
  }
}
