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
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch {
          // ignore; user may already be authed by hash token
        }
      }
    })();
  }, []);

  const onChangePassword = async () => {
    if (password !== confirm) return setMessage("비밀번호가 일치하지 않습니다.");
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setMessage(error.message);
    setMessage("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");
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
