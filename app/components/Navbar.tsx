"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiGithub, FiTwitter, FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // profile display state for navbar
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setSignedIn(!!user);

      if (user?.id) {
        // try to read profiles table first, fall back to auth metadata
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

          setUserName(prof?.display_name ?? user.user_metadata?.display_name ?? (user.email ? String(user.email).split("@")[0] : null));
          setUserAvatar(prof?.avatar_url ?? user.user_metadata?.avatar_url ?? null);
        } catch {
          // if profiles table isn't available, use auth metadata
          setUserName(user.user_metadata?.display_name ?? (user.email ? String(user.email).split("@")[0] : null));
          setUserAvatar(user.user_metadata?.avatar_url ?? null);
        }
      }
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const user = session?.user;
      setSignedIn(!!user);
      if (!user) {
        setUserName(null);
        setUserAvatar(null);
      } else {
        // refresh name/avatar on auth change
        (async () => {
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("display_name, avatar_url")
              .eq("id", user.id)
              .maybeSingle();

            setUserName(prof?.display_name ?? user.user_metadata?.display_name ?? (user.email ? String(user.email).split("@")[0] : null));
            setUserAvatar(prof?.avatar_url ?? user.user_metadata?.avatar_url ?? null);
          } catch {
            setUserName(user.user_metadata?.display_name ?? (user.email ? String(user.email).split("@")[0] : null));
            setUserAvatar(user.user_metadata?.avatar_url ?? null);
          }
        })();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const linkBase =
    "relative text-sm px-3 py-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  const navItems = [
    { href: "/", label: "홈" },
    { href: "/about", label: "소개" },
    { href: "/projects", label: "프로젝트" },
    { href: "/blog", label: "블로그" },
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-40 navbar-shell">
      <div className={`navbar-wrap mx-auto px-4 transition-all ${scrolled ? "mt-0" : "mt-2"}`}>
        <motion.nav
          initial={false}
          className={`navbar-card w-full bg-white/10 dark:bg-black/20 backdrop-blur-md border rounded-xl shadow-md transition-[background,border-color] ${
            scrolled ? "border-white/15" : "border-white/10"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-1 md:py-1.5">
            {/* Brand */}
            <Link href="/" className="navbar-brand font-semibold text-lg md:text-xl tracking-tight">
              Litsy
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`${linkBase} ${
                    isActive(item.href) ? "text-primary bg-white/10" : "opacity-90 hover:opacity-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              {signedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-white/5 focus:outline-none"
                  >
                    {userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-sm">
                        {userName ? userName[0] : "?"}
                      </div>
                    )}
                    <span className="text-sm font-medium truncate max-w-[140px]">{userName ?? "계정"}</span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-background/90 backdrop-blur-md rounded-md border border-border shadow-lg py-1 z-50">
                      <Link href="/account/settings" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">설정</Link>
                      <Link href="/account/settings" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">프로필</Link>
                      <button
                        onClick={async () => {
                          setMenuOpen(false);
                          await supabase.auth.signOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-sm">로그인</Link>
              )}

              <button
                aria-label="Toggle theme"
                onClick={() => {
                  const root = document.documentElement;
                  root.classList.add("theme-changing");
                  setTheme(theme === "dark" ? "light" : "dark");
                  window.setTimeout(() => root.classList.remove("theme-changing"), 250);
                }}
                className="p-2 rounded-md hover:bg-white/5"
              >
                {mounted ? (theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />) : <span className="w-4 h-4 inline-block" />}
              </button>

              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
                <FiGithub size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
                <FiTwitter size={18} />
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-white/5"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((p) => !p)}
            >
              {open ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="md:hidden border-t border-white/10 px-2 py-2"
              >
                <div className="flex flex-col gap-1 py-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2 rounded-md ${
                        isActive(item.href) ? "bg-white/10 text-primary" : "hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center justify-between px-1 py-2 gap-2">
                  {signedIn ? (
                    <>
                      <Link href="/account/settings" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-white/5">계정</Link>
                      <button
                        onClick={() => {
                          setOpen(false);
                          supabase.auth.signOut();
                        }}
                        className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm"
                      >로그아웃</button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm">로그인</Link>
                )}

                  <button
                    aria-label="Toggle theme"
                    onClick={() => {
                      const root = document.documentElement;
                      root.classList.add("theme-changing");
                      setTheme(theme === "dark" ? "light" : "dark");
                      window.setTimeout(() => root.classList.remove("theme-changing"), 250);
                    }}
                    className="p-2 rounded-md hover:bg-white/5"
                  >
                    {mounted ? (theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />) : <span className="w-4 h-4 inline-block" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 px-1 pb-2">
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
                    <FiGithub size={18} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
                    <FiTwitter size={18} />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </header>
  );
}
