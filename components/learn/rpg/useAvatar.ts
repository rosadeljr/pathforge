"use client";

/** Client-side avatar customization store (localStorage MVP; safe to swap for a
 *  profile column later). Holds the kid's cosmetic choices for their hero. */

import type { AvatarLook } from "./forgeheartArt";

export type SavedAvatar = AvatarLook & { title?: string };

const KEY = "pf_avatar";

export function loadAvatar(): SavedAvatar {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as SavedAvatar;
  } catch {
    return {};
  }
}

export function saveAvatar(a: SavedAvatar) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* ignore quota/availability errors */
  }
}
