"use client";

import { useEffect } from "react";

/**
 * Detects Supabase fragment tokens or errors on the root page (e.g. #access_token=... or #error=...)
 * and redirects the browser to /update-password preserving the fragment so the
 * update-password page can establish the session and surface errors there.
 *
 * This avoids showing error UI on the root page; update-password will display errors as toasts.
 */
export default function HashRedirectToUpdate() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const hash = window.location.hash || "";
      if (!hash) return;

      // Only redirect when on the root path (avoid interfering on other pages)
      if (window.location.pathname === "/" || window.location.pathname === "") {
        // If fragment contains an access_token OR an error, forward to update-password preserving fragment
        if ((hash.includes("access_token") && hash.includes("type=reset_password")) || hash.includes("error")) {
          const target = "/update-password" + hash;
          // replace so back button doesn't return to the fragment-at-root
          window.location.replace(target);
        }
      }
    } catch {
      // silent noop
    }
  }, []);

  return null;
}
