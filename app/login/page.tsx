"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/app/components/ui/button"
import AuthCard from "@/app/components/AuthCard"
import SocialAuthButtons from "@/app/components/SocialAuthButtons"
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const signInWithPassword = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setMessage(error.message)
    router.replace("/")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !loading) {
      signInWithPassword()
    }
  }

  return (
    <AuthCard title="로그인" subtitle="계정에 접근하려면 로그인하세요.">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground/90">
            이메일
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm transition-all focus:border-primary/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground/90">
            비밀번호
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 pr-11 text-sm transition-all focus:border-primary/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {message && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <p className="leading-relaxed">{message}</p>
          </div>
        )}

        <Button
          className="w-full py-2.5 text-sm font-medium"
          onClick={signInWithPassword}
          disabled={loading || !email || !password}
        >
          {loading ? "로그인 중..." : "이메일로 로그인"}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">또는</span>
          </div>
        </div>

        <SocialAuthButtons />

        <div className="space-y-2 pt-2 text-center text-sm text-muted-foreground">
          <div>
            <a href="/forgot-password" className="text-primary hover:underline">
              비밀번호를 잊으셨나요?
            </a>
          </div>
          <div>
            계정이 없으신가요?{" "}
            <a href="/signup" className="font-medium text-primary hover:underline">
              회원가입
            </a>
          </div>
        </div>
      </div>
    </AuthCard>
  )
}
