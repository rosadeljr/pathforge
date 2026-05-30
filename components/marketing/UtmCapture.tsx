"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/marketing/track";

/**
 * Drops into the landing page (or any entry route). On mount, captures
 * any utm_* params from the URL into sessionStorage so we can attribute
 * the signup conversion to the right ad campaign later.
 */
export function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);
  return null;
}
