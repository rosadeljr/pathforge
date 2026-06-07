"use client";

/** Avatar customization store. Durable to the account via profiles.rpg_avatar
 *  (JSONB, added by RPG_PROGRESSION_MIGRATION.sql) with a localStorage cache so
 *  the hero renders instantly and still works before the migration is applied. */

import { createClient } from "@/lib/supabase/client";
import type { AvatarLook } from "./forgeheartArt";

export type SavedAvatar = AvatarLook & { title?: string };

const KEY = "pf_avatar";

/** Instant, synchronous read from the localStorage cache. */
export function loadAvatar(): SavedAvatar {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as SavedAvatar;
  } catch {
    return {};
  }
}

/** Best-effort durable read from the account; updates the cache when found. */
export async function hydrateAvatar(): Promise<SavedAvatar | null> {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;
    const { data } = await supabase.from("profiles").select("rpg_avatar").eq("id", auth.user.id).maybeSingle();
    const saved = (data as { rpg_avatar?: SavedAvatar } | null)?.rpg_avatar;
    if (saved && typeof saved === "object") {
      try { window.localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
      return saved;
    }
  } catch {
    /* column may not exist yet — fall back to cache */
  }
  return null;
}

/** Save to cache immediately + best-effort durable write to the account. */
export function saveAvatar(a: SavedAvatar) {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(a)); } catch {}
  }
  void (async () => {
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) await supabase.from("profiles").update({ rpg_avatar: a }).eq("id", auth.user.id);
    } catch {
      /* tolerated — cache still holds the choice */
    }
  })();
}
