"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string>("");
  const [provider, setProvider] = useState<string>("EMAIL");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? "");
      const p = user?.identities?.[0]?.provider?.toUpperCase();
      setProvider(p || "EMAIL");
    })();
  }, []);

  const items = useMemo(
    () => [
      { href: "/account/profile", label: "프로필" },
      { href: "/account/account", label: "이메일" },
      { href: "/account/security", label: "보안" },
      { href: "/account/connections", label: "연결" },
    ],
    []
  );

  return (
    <section className="px-4 pt-10 pb-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">계정</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            계정 타입: <span className="font-medium">{provider}</span> · 이메일: <span className="font-medium">{email || "-"}</span>
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="glass-effect rounded-2xl p-4 border border-white/10 sticky top-20">
              <nav className="space-y-1 text-sm">
                {items.map((it) => (
                  <Link key={it.href} href={it.href} className="block px-3 py-2 rounded-md hover:bg-white/5">
                    {it.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <div className="md:col-span-8 lg:col-span-9">{children}</div>
        </div>
      </div>
    </section>
  );
}

