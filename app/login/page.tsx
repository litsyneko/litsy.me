"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import AuthCard from "@/app/components/AuthCard";
import SocialAuthButtons from "@/app/components/SocialAuthButtons";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signInWithPassword = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMessage(error.message);
    router.replace("/");
  };

  return (
    <AuthCard title="로그인" subtitle="계정에 접근하려면 로그인하세요.">
      <div className="space-y-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
          autoComplete="email"
        />
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 pr-10 text-sm"
            autoComplete="current-password"
          />
          <button type="button" aria-label="비밀번호 표시" onClick={() => setShowPw((p) => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10">
            {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <Button className="w-full" onClick={signInWithPassword} disabled={loading || !email || !password}>
          {loading ? "로그인 중..." : "이메일로 로그인"}
        </Button>
        {message && <p className="text-xs text-red-500">{message}</p>}
        <div className="h-px bg-white/10 my-2" />
        <SocialAuthButtons />
        <div className="text-xs text-muted-foreground mt-3">
          비밀번호를 잊으셨나요? <a href="/forgot-password" className="underline">재설정</a>
          <br />
          계정이 없으신가요? <a href="/signup" className="underline">회원가입</a>
        </div>
      </div>
    </AuthCard>
  );
}

