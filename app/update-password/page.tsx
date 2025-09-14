"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import AuthCard from "@/app/components/AuthCard";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // If the user landed here from the email link, ensure we have a session.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // get current session safely
        const sessionRes = await supabase.auth.getSession();
        let session = sessionRes?.data?.session ?? null;

        // try exchange (handles magiclink/hash flow)
        if (!session) {
          // attempt exchangeCodeForSession (may throw)
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
          setReady(true);
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
    </AuthCard>
  );
}
