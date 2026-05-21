import type { SupabaseClient } from "@supabase/supabase-js";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { CERTIFICATE_QUEST_THRESHOLD } from "@/lib/entitlements";

export interface Certificate {
  id: string;
  credential_id: string;
  career_path_id: string;
  career_path_title: string;
  recipient_name: string;
  skills: string[];
  final_level: number;
  quests_completed: number;
  issued_at: string;
}

export interface CertificateProgress {
  completed: number;
  threshold: number;
  pathTitle: string | null;
}

export interface IssueResult {
  certificate: Certificate | null;
  justIssued: boolean;
  progress: CertificateProgress;
}

// Credential codes: PF-XXXXXXXX. Alphabet excludes 0/O/1/I to stay unambiguous.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCredentialId(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `PF-${code}`;
}

/**
 * Checks whether the user has earned their selected career path's certificate
 * and issues it if so. Idempotent — the UNIQUE(user_id, career_path_id)
 * constraint guarantees a single certificate per path.
 */
export async function issueCertificateIfEligible(
  supabase: SupabaseClient,
  userId: string
): Promise<IssueResult> {
  const empty: CertificateProgress = {
    completed: 0,
    threshold: CERTIFICATE_QUEST_THRESHOLD,
    pathTitle: null,
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, selected_career_path_id, current_level")
    .eq("id", userId)
    .single();

  const pathId = profile?.selected_career_path_id;
  if (!profile || !pathId) {
    return { certificate: null, justIssued: false, progress: empty };
  }

  const path = CAREER_PATHS.find((p) => p.id === pathId);
  const pathTitle = path?.title ?? "Career Program";

  const { count } = await supabase
    .from("quests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("career_path_id", pathId)
    .eq("status", "completed");
  const completed = count ?? 0;
  const progress: CertificateProgress = {
    completed,
    threshold: CERTIFICATE_QUEST_THRESHOLD,
    pathTitle,
  };

  // Already earned?
  const { data: existing } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("career_path_id", pathId)
    .maybeSingle();
  if (existing) {
    return { certificate: existing as Certificate, justIssued: false, progress };
  }

  if (completed < CERTIFICATE_QUEST_THRESHOLD) {
    return { certificate: null, justIssued: false, progress };
  }

  // Eligible — issue it.
  const { data: inserted, error } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      credential_id: generateCredentialId(),
      career_path_id: pathId,
      career_path_title: pathTitle,
      recipient_name: profile.full_name || profile.username || "PathForge Member",
      skills: path?.skills ?? [],
      final_level: profile.current_level ?? 1,
      quests_completed: completed,
    })
    .select("*")
    .single();

  if (error || !inserted) {
    // A concurrent issue may have won the race — re-fetch.
    const { data: refetch } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("career_path_id", pathId)
      .maybeSingle();
    return {
      certificate: (refetch as Certificate) ?? null,
      justIssued: false,
      progress,
    };
  }

  return { certificate: inserted as Certificate, justIssued: true, progress };
}

/** LinkedIn "Add to profile" deep link for a certificate. */
export function linkedInAddUrl(cert: Certificate, verifyUrl: string): string {
  const issued = new Date(cert.issued_at);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${cert.career_path_title} Program — PathForge AI Academy`,
    organizationName: "PathForge AI Academy",
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: verifyUrl,
    certId: cert.credential_id,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
