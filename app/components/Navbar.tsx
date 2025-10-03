"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { FiGithub, FiTwitter, FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase/client"
import { AnimatePresence, motion } from "framer-motion"

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      setSignedIn(!!user)

      if (user?.id) {
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle()

          setUserName(
            prof?.display_name ??
              user.user_metadata?.display_name ??
              (user.email ? String(user.email).split("@")[0] : null),
          )
          setUserAvatar(prof?.avatar_url ?? user.user_metadata?.avatar_url ?? null)
        } catch {
          setUserName(user.user_metadata?.display_name ?? (user.email ? String(user.email).split("@")[0] : null))
          setUserAvatar(user.user_metadata?.avatar_url ?? null)
        }
      }
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const user = session?.user
      setSignedIn(!!user)
      if (!user) {
        setUserName(null)
        setUserAvatar(null)
      } else {
        ;(async () => {
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("display_name, avatar_url")
              .eq("id", user.id)
              .maybeSingle()

            setUserName(
              prof?.display_name ??
                user.user_metadata?.display_name ??
                (user.email ? String(user.email).split("@")[0] : null),
            )
            setUserAvatar(prof?.avatar_url ?? user.user_metadata?.avatar_url ?? null)
          } catch {
            setUserName(user.user_metadata?.display_name ?? (user.email ? String(user.email).split("@")[0] : null))
            setUserAvatar(user.user_metadata?.avatar_url ?? null)
          }
        })()
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href))

  const navItems = [
    { href: "/", label: "홈" },
    { href: "/about", label: "소개" },
    { href: "/projects", label: "프로젝트" },
    { href: "/post", label: "블로그" },
    { href: "/my/posts", label: "내 게시글" },
  ]

  return (
    <header className="fixed left-0 top-0 z-40 w-full">
      <div className={`mx-auto max-w-7xl px-4 transition-all duration-300 ${scrolled ? "mt-0" : "mt-2"}`}>
        <nav
          className={`w-full rounded-xl border bg-white/10 shadow-lg backdrop-blur-md transition-all duration-300 dark:bg-black/20 ${
            scrolled ? "border-white/20 shadow-xl" : "border-white/10"
          }`}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
            {/* Brand */}
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight transition-colors hover:text-primary md:text-2xl"
            >
              Litsy
            </Link>

            <div className="hidden items-center gap-1 rounded-lg bg-white/5 p-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`relative rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive(item.href)
                      ? "bg-white/10 text-primary shadow-sm"
                      : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              {signedIn ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userAvatar || "/placeholder.svg"}
                        alt="avatar"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                        {userName ? userName[0].toUpperCase() : "?"}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate text-sm font-medium">{userName ?? "계정"}</span>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-background/95 shadow-xl backdrop-blur-md"
                      >
                        <div className="py-1">
                          <Link
                            href="/account/settings"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            설정
                          </Link>
                          <Link
                            href="/account/settings"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            프로필
                          </Link>
                          <div className="my-1 h-px bg-border" />
                          <button
                            onClick={async () => {
                              setMenuOpen(false)
                              await supabase.auth.signOut()
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                          >
                            로그아웃
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  로그인
                </Link>
              )}

              <button
                aria-label="테마 전환"
                onClick={() => {
                  const root = document.documentElement
                  root.classList.add("theme-changing")
                  setTheme(theme === "dark" ? "light" : "dark")
                  window.setTimeout(() => root.classList.remove("theme-changing"), 250)
                }}
                className="rounded-lg p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {mounted ? (
                  theme === "dark" ? (
                    <FiSun size={18} />
                  ) : (
                    <FiMoon size={18} />
                  )
                ) : (
                  <span className="inline-block h-4 w-4" />
                )}
              </button>

              <a
                href="https://github.com/litsyneko"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <FiGithub size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <FiTwitter size={18} />
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="rounded-lg p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setOpen((p) => !p)}
            >
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden border-t border-white/10 md:hidden"
              >
                <div className="space-y-1 p-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-white/10 p-3">
                  {signedIn ? (
                    <div className="space-y-2">
                      <Link
                        href="/account/settings"
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                      >
                        계정 설정
                      </Link>
                      <button
                        onClick={() => {
                          setOpen(false)
                          supabase.auth.signOut()
                        }}
                        className="w-full rounded-lg bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                      >
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg bg-primary/10 px-4 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      로그인
                    </Link>
                  )}

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      aria-label="테마 전환"
                      onClick={() => {
                        const root = document.documentElement
                        root.classList.add("theme-changing")
                        setTheme(theme === "dark" ? "light" : "dark")
                        window.setTimeout(() => root.classList.remove("theme-changing"), 250)
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    >
                      {mounted ? (
                        theme === "dark" ? (
                          <FiSun size={18} />
                        ) : (
                          <FiMoon size={18} />
                        )
                      ) : (
                        <span className="inline-block h-4 w-4" />
                      )}
                    </button>
                    <a
                      href="https://github.com/litsyneko"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    >
                      <FiGithub size={18} />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    >
                      <FiTwitter size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  )
}
