"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { User, UserMetadata } from "@supabase/supabase-js";

function deriveDisplayName(user: User): string | undefined {
  const m = user?.user_metadata || {};
  return (
    m.display_name ||
    m.name ||
    m.full_name ||
    m.user_name ||
    m.preferred_username ||
    (user?.email ? String(user.email).split("@")[0] : undefined)
  );
}

function deriveAvatar(user: User): string | undefined {
  const m = user?.user_metadata || {};
  return m.avatar_url || m.picture || undefined;
}

export default function AuthProfileSync() {
  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted || !user) return;

      const displayName = deriveDisplayName(user);
      const avatarUrl = deriveAvatar(user);

      // Upsert into profiles if missing fields
      try {
        const { data: existing } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        const needUpsert = !existing || !existing.display_name || !existing.avatar_url;
        if (needUpsert) {
          await supabase.from("profiles").upsert({
            id: user.id,
            display_name: existing?.display_name || displayName || null,
            avatar_url: existing?.avatar_url || avatarUrl || null,
          });
        }

        // Mirror into auth metadata for convenience
        const metaUpdates: Partial<UserMetadata> = {};
        if (displayName && user.user_metadata?.display_name !== displayName) metaUpdates.display_name = displayName;
        if (avatarUrl && user.user_metadata?.avatar_url !== avatarUrl) metaUpdates.avatar_url = avatarUrl;
        if (Object.keys(metaUpdates).length) await supabase.auth.updateUser({ data: metaUpdates });
      } catch {
        // ignore
      }
    };

    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => sync());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}

