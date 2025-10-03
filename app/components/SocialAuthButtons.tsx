"use client"

import { Button } from "@/app/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { FaDiscord, FaGithub } from "react-icons/fa"

export default function SocialAuthButtons() {
  const onClick = async (provider: "discord" | "github") => {
    const scopes = provider === "discord" ? "identify email" : "read:user user:email"
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined, scopes },
    })
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
        variant="outline"
        onClick={() => onClick("discord")}
        className="w-full justify-center gap-2 border-white/15 bg-white/5 py-2.5 transition-all hover:bg-white/10 hover:border-white/25"
      >
        <FaDiscord size={18} />
        <span className="text-sm font-medium">Discord</span>
      </Button>
      <Button
        variant="outline"
        onClick={() => onClick("github")}
        className="w-full justify-center gap-2 border-white/15 bg-white/5 py-2.5 transition-all hover:bg-white/10 hover:border-white/25"
      >
        <FaGithub size={18} />
        <span className="text-sm font-medium">GitHub</span>
      </Button>
    </div>
  )
}
