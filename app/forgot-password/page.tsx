"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import AuthCard from "@/app/components/AuthCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSend = async () => {
    setLoading(true);
    setMessage(null);
    const redirectTo = typeof window !== "undefined" ? window.location.origin + "/update-password" : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    setMessage(error ? error.message : "재설정 링크를 이메일로 보냈습니다.");
  };

  return (
    <AuthCard title="비밀번호 재설정" subtitle="이메일로 재설정 링크를 보내드립니다.">
      <div className="space-y-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
        />
        <Button className="w-full" onClick={onSend} disabled={loading || !email}>
          {loading ? "전송 중..." : "재설정 링크 보내기"}
        </Button>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </div>
    </AuthCard>
  );
}
