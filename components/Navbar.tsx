"use client";

import Link from "next/link";
import { FiGithub, FiTwitter, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full fixed top-4 left-0 z-40 flex justify-center">
      <nav className="max-w-4xl w-full mx-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between gap-4 shadow-md">
        <Link href="/" className="font-semibold text-lg">릿시네코</Link>

        <div className="hidden sm:flex items-center gap-4">
          <Link href="#about" className="text-sm opacity-90 hover:opacity-100">About</Link>
          <Link href="#projects" className="text-sm opacity-90 hover:opacity-100">Projects</Link>
          <Link href="#blog" className="text-sm opacity-90 hover:opacity-100">Blog</Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-white/5"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
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
