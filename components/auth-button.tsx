"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronDown } from "lucide-react"
import { getDiscordDisplayName, getDiscordAvatarUrl } from '@/lib/discord'

export default function AuthButton({ isMobile = false }: { isMobile?: boolean }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) syncUserToServer(data.user)
      setLoading(false)
    }
    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) syncUserToServer(u)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function syncUserToServer(user: any) {
    try {
      const meta = user.user_metadata || {}

      // build sensible display_name and username from metadata without falling back to email
      const username = meta.username || meta.preferred_username || null
      const displayNameCandidate = meta.userdisplayname || meta.global_name || meta.name || meta.full_name || null

      const display_name = getDiscordDisplayName({
        id: user.id,
        username: username || undefined,
        global_name: displayNameCandidate || undefined,
      }) || displayNameCandidate || username || null

      const avatar = meta.avatar_url || meta.picture || (meta.avatar ? getDiscordAvatarUrl({ id: user.id, avatar: meta.avatar }) : null)

      await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          provider: (user.app_metadata && user.app_metadata.provider) || 'discord',
          username: username,
          discriminator: meta.discriminator || meta?.discriminator || null,
          global_name: meta.userdisplayname || meta.global_name || null,
          display_name,
          avatar,
          metadata: meta || null,
        }),
      })
    } catch (e) {
      // ignore sync failures
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <Button disabled className="text-muted-foreground" size="sm">로딩중...</Button>

  // 모바일에서는 간단한 로그아웃 버튼으로 표시
  if (isMobile && user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 w-full justify-start"
      >
        <LogOut className="w-4 h-4 mr-2" />
        로그아웃
      </Button>
    )
  }

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20">
          <Avatar className="w-7 h-7">
            <AvatarImage
              src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
              alt={user.user_metadata?.full_name || "User"}
            />
            <AvatarFallback className="text-xs bg-primary/10">
              <User className="w-3 h-3" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground dark:text-white font-medium hidden sm:inline">
            {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:inline" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
          {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={signOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 cursor-pointer px-2 py-2"
        >
          <LogOut className="w-4 h-4 mr-3" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Link href="/auth" passHref>
      <Button variant="default" className="text-white" size="sm">
        로그인
      </Button>
    </Link>
  )
}
