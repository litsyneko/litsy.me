"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "../components/ToastProvider";
import AuthCard from "@/app/components/AuthCard";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // If the user landed here from the email link, ensure we have a session.
  const [ready, setReady] = useState(false);
  const [isOAuth, setIsOAuth] = useState(false);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 먼저: query 또는 hash에 Supabase error 파라미터가 있는지 검사하여
        // 이 페이지에서 (update-password) 토스트로 표시하고 초기화합니다.
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          const urlQueryError = searchParams.get("error") || searchParams.get("error_code") || searchParams.get("error_description");
          const hash = window.location.hash || "";
          const hashParams = new URLSearchParams(hash.replace("#", ""));
          const urlHashError = hashParams.get("error") || hashParams.get("error_code") || hashParams.get("error_description");
          const rawError = urlQueryError || urlHashError;
          if (rawError) {
            const decoded = decodeURIComponent(rawError.replace(/\+/g, " "));
            toast.show({
              title: "인증 오류",
              description: decoded || "링크가 유효하지 않거나 만료되었습니다.",
              variant: "error",
              duration: 6000,
            });
            // fragment/query 제거하여 중복 표시를 방지
            try {
              const cleanUrl = window.location.pathname + window.location.search;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch {
              // noop
            }
            setLoading(false);
            return;
          }
        }

        // get current session safely
        const sessionRes = await supabase.auth.getSession();
        let session = sessionRes?.data?.session ?? null;

        // try exchange (handles magiclink/hash flow) and handle query token (verify) fallback
        if (!session) {
          // If the link contains a query token (e.g. /verify?token=...&type=recovery), call the verify endpoint
          if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            const tokenType = urlParams.get("type") || "recovery";
            if (token) {
              // Redirect the browser to Supabase verify endpoint so the server can redirect back
              // with fragment tokens (access_token/refresh_token). Fetching here would not
              // expose the redirect fragment to the browser.
              if (typeof window !== "undefined") {
                const redirectTo = window.location.origin + "/update-password";
                const verifyUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(
                  token
                )}&type=${encodeURIComponent(tokenType)}&redirect_to=${encodeURIComponent(redirectTo)}`;
                window.location.href = verifyUrl;
              }
            }
          }

          // attempt exchangeCodeForSession (handles magiclink/hash flow)
          await supabase.auth
            .exchangeCodeForSession(typeof window !== "undefined" ? window.location.href : "")
            .catch(() => null);

          // if still no session, try parsing URL hash (older magic-link behavior)
          if (!session && typeof window !== "undefined") {
            const hash = window.location.hash || "";
            if (hash) {
              const params = new URLSearchParams(hash.replace("#", ""));
              const access_token = params.get("access_token");
              const refresh_token = params.get("refresh_token");
                if (access_token) {
                  await supabase.auth.setSession({ access_token, refresh_token: refresh_token ?? "" });
                }
            }
          }

          // refresh session after attempts
          const refreshed = await supabase.auth.getSession();
          session = refreshed?.data?.session ?? null;
        }

        if (session) {
          // 확인: OAuth(소셜) 계정인 경우 비밀번호 재설정을 허용하지 않음
          const { data: userData } = await supabase.auth.getUser();
          const u = userData?.user;
          const prov = (u?.identities?.[0]?.provider || u?.app_metadata?.provider || "EMAIL").toUpperCase();
          if (prov !== "EMAIL") {
            const msg = "이 계정은 OAuth 공급자로 생성된 계정입니다. 비밀번호 재설정을 이용할 수 없습니다. 해당 공급자로 로그인해 주세요.";
            // show prominent error toast
            toast.show({ title: "OAuth 계정", description: msg, variant: "error", duration: 6000 });
            // mark oauth and prevent password form from showing
            setIsOAuth(true);
            setMessage(null);
            setReady(false);
          } else {
            setIsOAuth(false);
            setReady(true);
          }
        } else {
          setMessage("비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다. 다시 요청해 주세요.");
        }
      } catch {
        setMessage("세션 확인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChangePassword = async () => {
    if (password !== confirm) return setMessage("비밀번호가 일치하지 않습니다.");
    if (!ready) return setMessage("세션을 확인할 수 없습니다. 재설정 링크로 다시 시도하세요.");
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setMessage(error.message);
    setMessage("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");
    // optional: clear session after password change for security
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setTimeout(() => router.replace("/login"), 1000);
  };

  return (
    <AuthCard title="새 비밀번호 설정" subtitle="메일 링크를 통해 접속하셨다면 비밀번호를 변경하세요.">
      {isOAuth ? (
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold">OAuth 계정입니다</p>
          <p className="text-sm text-muted-foreground">
            이 계정은 소셜 로그인을 통해 생성된 계정이므로 비밀번호 재설정을 사용할 수 없습니다.
            해당 공급자(예: GitHub, Discord)로 로그인해 주세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Button onClick={() => router.replace("/login")} className="px-6 py-2">
              로그인 하러가기
            </Button>
            <Button variant="outline" onClick={() => router.replace("/account/settings")} className="px-6 py-2">
              계정 설정으로 이동
            </Button>
          </div>

          {message && <p className="text-xs text-muted-foreground mt-2">{message}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="password"
            placeholder="새 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <Button className="w-full" onClick={onChangePassword} disabled={loading || !password || !confirm}>
            {loading ? "변경 중..." : "비밀번호 변경"}
          </Button>
          {message && <p className="text-xs text-muted-foreground">{message}</p>}
        </div>
      )}
    </AuthCard>
  );
}
