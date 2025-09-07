"use client"

import React, { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function CustomSignIn() {
  const { signIn, isLoaded } = useSignIn()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isLoaded || !signIn) {
      setError("인증 시스템이 준비되지 않았습니다. 잠시 후 다시 시도하세요.")
      return
    }

    setLoading(true)
    try {
      // 안전하게 signIn.create 호출
      const result = await signIn.create({
        identifier: email,
        password,
      } as any)

      // result may vary by workflow; if complete, redirect home
      if ((result as any)?.status === "complete") {
        router.push("/")
        return
      }

      // If additional steps required (MFA/redirect), show generic message
      setError("추가 인증이 필요합니다. 안내에 따라 진행하세요.")
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || "로그인에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold">로그인</h2>
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
        <Button type="submit" disabled={loading}>{loading ? "로딩..." : "로그인"}</Button>
      </div>
    </form>
  )
}