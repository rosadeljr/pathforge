import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { APP_URL } from "@/lib/site-url";

// Renamed from middleware.ts → proxy.ts per Next.js 16 file-convention change.
export async function proxy(request: NextRequest) {
  // ── Canonical host enforcement ──────────────────────────────────────────
  // In production, force traffic off the raw *.vercel.app deployment URL onto
  // the real custom domain (pathforger.app). This guarantees one canonical
  // origin even if the Vercel domain / Supabase Site URL config drifts — which
  // is what was stranding users on pathforge-zeta.vercel.app. We only act when:
  //   • running on Vercel production (never previews/local), and
  //   • the canonical URL is a real custom domain (not itself a *.vercel.app), and
  //   • the current request is on a *.vercel.app host that isn't canonical.
  // Cookies are host-scoped, so this one-time bounce re-establishes the session
  // on the canonical domain going forward.
  const canonicalHost = (() => {
    try {
      return new URL(APP_URL).host;
    } catch {
      return "";
    }
  })();
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (
    process.env.VERCEL_ENV === "production" &&
    canonicalHost &&
    !canonicalHost.endsWith(".vercel.app") &&
    host.endsWith(".vercel.app") &&
    host !== canonicalHost
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = canonicalHost;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon / apple-icon / manifest (generated metadata routes)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|sw\\.js|screenshots/|public).*)",
  ],
};
