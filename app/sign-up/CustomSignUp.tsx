"use client"

import React, { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function CustomSignUp() {
  const { signUp, isLoaded } = useSignUp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isLoaded || !signUp) {
      setError("인증 시스템이 준비되지 않았습니다. 잠시 후 다시 시도하세요.")
      return
    }

    setLoading(true)
    try {
      const result = await signUp.create({
        primaryEmailAddress: email,
        password,
      } as any)

      // If sign up created and complete, redirect home
      if ((result as any)?.status === "complete") {
        router.push("/")
        return
      }

      setError("추가 확인이 필요합니다. 안내를 따라 진행하세요.")
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || "회원가입에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold">회원가입</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="text-sm block mb-1">이메일</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </div>
      <div>
        <label className="text-sm block mb-1">비밀번호</label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </div>
      <div className="flex items-center justify-between">
        <Button type="submit" disabled={loading}>{loading ? "로딩..." : "회원가입"}</Button>
      </div>
    </form>
  )
}