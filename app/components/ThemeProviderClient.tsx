"use client";

import { ThemeProvider, useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";

function ThemeTransitionManager() {
  const { theme, resolvedTheme } = useTheme();
  const prev = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (prev.current === undefined) {
      prev.current = resolvedTheme ?? theme;
      return;
    }
    const root = document.documentElement;
    root.classList.add("theme-changing");
    const id = window.setTimeout(() => root.classList.remove("theme-changing"), 250);
    prev.current = resolvedTheme ?? theme;
    return () => window.clearTimeout(id);
  }, [theme, resolvedTheme]);

  return null;
}

export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
      <ThemeTransitionManager />
      {children}
    </ThemeProvider>
  );
}
