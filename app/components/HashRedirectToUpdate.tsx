"use client";

import { useEffect } from "react";

/**
 * Detects Supabase fragment tokens on the root page (e.g. #access_token=...)
 * and redirects the browser to /update-password preserving the fragment so the
 * update-password page can establish the session.
 *
 * This is a lightweight, fail-safe client-side redirect to handle cases where
 * the Supabase `redirect_to` points to the site root.
 */
export default function HashRedirectToUpdate() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const hash = window.location.hash || "";
      if (!hash) return;
      // Only trigger when an access_token is present in the fragment
      if (!hash.includes("access_token")) return;
      // Only redirect when on the root path (avoid interfering on other pages)
      if (window.location.pathname === "/" || window.location.pathname === "") {
        const target = "/update-password" + hash;
        // replace so back button doesn't return to the fragment-at-root
        window.location.replace(target);
      }
    } catch {
      // silent noop
    }
  }, []);

  return null;
}
