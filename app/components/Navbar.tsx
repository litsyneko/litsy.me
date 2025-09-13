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

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session?.user));
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
                <>
                  <Link href="/account/settings" className="text-sm opacity-90 hover:opacity-100">계정</Link>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-sm"
                  >
                    로그아웃
                  </button>
                </>
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
