"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "discord" })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <Button disabled>로딩중...</Button>

  return user ? (
    <div className="flex items-center gap-2">
      <span className="text-sm">{user.user_metadata?.full_name || user.email}</span>
      <Button variant="outline" onClick={signOut}>로그아웃</Button>
    </div>
  ) : (
    <Button onClick={signIn} variant="default">Discord로 로그인</Button>
  )
}
