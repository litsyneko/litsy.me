"use client";

import { useEffect } from "react";
import { useToast } from "./ToastProvider";

/**
 * Detects Supabase fragment tokens on the root page (e.g. #access_token=...)
 * and redirects the browser to /update-password preserving the fragment so the
 * update-password page can establish the session.
 *
 * Also detects Supabase error fragments (e.g. #error=access_denied&error_code=otp_expired&error_description=...)
 * and shows a toast notification instead of redirecting.
 */
export default function HashRedirectToUpdate() {
  const toast = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const hash = window.location.hash || "";
      if (!hash) return;

      // parse fragment params
      const params = new URLSearchParams(hash.replace("#", ""));

      // If Supabase returned an error in the fragment, show a toast and stop.
      const error = params.get("error");
      const errorCode = params.get("error_code");
      const errorDescription = params.get("error_description");
      if (error || errorCode || errorDescription) {
        const raw = errorDescription || errorCode || error || "";
        // Supabase encodes spaces as + in some templates — normalize before decode
        const decoded = decodeURIComponent(raw.replace(/\+/g, " "));
        toast.show({
          title: "인증 오류",
          description: decoded || "링크가 유효하지 않거나 만료되었습니다.",
          variant: "error",
          duration: 6000,
        });
        // remove fragment to avoid repeated toasts if user stays on page
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        return;
      }

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
  }, [toast]);

  return null;
}
