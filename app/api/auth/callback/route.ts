import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to dashboard on successful auth
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect to login on error
  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
}
