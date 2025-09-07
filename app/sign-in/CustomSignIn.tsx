"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export default function CustomSignIn() {
  const [SignIn, setSignIn] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setIsClient(true)
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    if (!key) return
    let mounted = true
    import("@clerk/nextjs").then((mod) => {
      if (!mounted) return
      setSignIn(() => mod.SignIn)
    })
    return () => {
      mounted = false
    }
  }, [])

  if (!isClient || !SignIn) {
    // 클라이언트 사이드에서 렌더링될 때까지 로딩 상태 표시
    return <div style={{ minHeight: 400 }} />
  }

  // Clerk의 baseTheme에 확인된 테마를 명시적으로 전달
  const baseTheme = resolvedTheme === "dark" ? "dark" : "light"

  // 카드 배경색을 테마에 따라 동적으로 적용
  const cardClass =
    resolvedTheme === "dark"
      ? "bg-[#1e1e3f] shadow-lg rounded-2xl border border-border" // 다크 모드 카드 배경색
      : "bg-white shadow-lg rounded-2xl border border-border" // 라이트 모드 카드 배경색

  const elements = {
    card: cardClass,
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <SignIn
        appearance={{
          baseTheme,
          elements,
        }}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </div>
  )
}