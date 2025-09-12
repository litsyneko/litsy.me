"use client";

import Link from "next/link";
import { FiGithub, FiTwitter, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const linkBase =
    "relative text-sm px-3 py-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <header className="w-full fixed top-4 left-0 z-40 flex justify-center">
      <nav className="max-w-6xl w-full mx-4 bg-white/10 backdrop-blur-sm md:backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between gap-4 shadow-md">
        <Link href="/" className="font-semibold text-lg">릿시네코</Link>

        <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <Link
            href="/"
            aria-current={isActive("/") ? "page" : undefined}
            className={`${linkBase} ${isActive("/") ? "text-primary bg-white/10" : "opacity-90 hover:opacity-100"}`}
          >
            Home
          </Link>
          <Link
            href="/about"
            aria-current={isActive("/about") ? "page" : undefined}
            className={`${linkBase} ${isActive("/about") ? "text-primary bg-white/10" : "opacity-90 hover:opacity-100"}`}
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
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
            {/* Render icon only after client mount to avoid hydration mismatch */}
            {mounted ? (theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />) : <span className="w-4 h-4 inline-block" />}
          </button>

          <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
            <FiGithub size={18} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
            <FiTwitter size={18} />
          </a>
        </div>
      </nav>
    </header>
  );
}
