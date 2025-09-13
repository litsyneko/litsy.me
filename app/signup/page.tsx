"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import AuthCard from "@/app/components/AuthCard";
import SocialAuthButtons from "@/app/components/SocialAuthButtons";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSignUp = async () => {
    if (password.length < 6) return setMessage("비밀번호는 6자 이상이어야 합니다.");
    if (password !== confirm) return setMessage("비밀번호가 일치하지 않습니다.");
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/auth/welcome" : undefined },
    });
    setLoading(false);
    if (error) return setMessage(error.message);
    if (data.session) router.replace("/");
    else router.replace("/auth/confirm");
  };

  return (
    <AuthCard title="회원가입" subtitle="새 계정을 만들고 시작해 보세요.">
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
            autoComplete="new-password"
          />
          <button type="button" aria-label="비밀번호 표시" onClick={() => setShowPw((p) => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10">
            {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <div className="relative">
          <input
            type={showPw2 ? "text" : "password"}
            placeholder="비밀번호 확인"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 pr-10 text-sm"
            autoComplete="new-password"
          />
          <button type="button" aria-label="비밀번호 표시" onClick={() => setShowPw2((p) => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10">
            {showPw2 ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <Button className="w-full" onClick={onSignUp} disabled={loading || !email || !password || !confirm}>
          {loading ? "가입 중..." : "이메일로 가입"}
        </Button>
        {message && <p className="text-xs text-red-500">{message}</p>}
        <div className="h-px bg-white/10 my-2" />
        <SocialAuthButtons />
        <div className="text-xs text-muted-foreground mt-3">
          이미 계정이 있으신가요? <a href="/login" className="underline">로그인</a>
        </div>
      </div>
    </AuthCard>
  );
}

