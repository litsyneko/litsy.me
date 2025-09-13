"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { FaDiscord, FaGithub } from "react-icons/fa";

export default function SocialAuthButtons() {
  const onClick = async (provider: "discord" | "github") => {
    const scopes = provider === "discord" ? "identify email" : "read:user user:email"; // github
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined, scopes },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <Button variant="outline" onClick={() => onClick("discord")} className="w-full justify-center">
        <FaDiscord />
        Discord로 계속하기
      </Button>
      <Button variant="outline" onClick={() => onClick("github")} className="w-full justify-center">
        <FaGithub />
        GitHub로 계속하기
      </Button>
    </div>
  );
}
