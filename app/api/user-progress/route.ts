import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const { data: quests } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", user.id);

    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id);

    return NextResponse.json({
      profile,
      questCount: quests?.length || 0,
      projectCount: projects?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
