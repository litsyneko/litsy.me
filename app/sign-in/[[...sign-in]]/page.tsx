"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";

export default function Page() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signInWithOAuth = async (provider: "discord" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
  };

  const signInWithEmail = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined } });
    setLoading(false);
    setMessage(error ? error.message : "메일로 로그인 링크를 보냈습니다.");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-sm glass-effect rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-4">로그인</h1>
        <div className="space-y-3">
          <Button className="w-full" onClick={() => signInWithOAuth("discord")}>Discord로 계속</Button>
          <Button variant="outline" className="w-full" onClick={() => signInWithOAuth("google")}>Google로 계속</Button>
          <div className="h-px bg-white/10 my-3" />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <Button className="w-full" onClick={signInWithEmail} disabled={loading || !email}>
            {loading ? "전송 중..." : "이메일로 로그인 링크 받기"}
          </Button>
          {message && <p className="text-xs text-muted-foreground mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
}
