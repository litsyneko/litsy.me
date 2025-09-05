"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
  type ThemeProviderProps,
} from "next-themes"

function ThemeTransitionHandler() {
  const { theme } = useTheme()

  React.useEffect(() => {
    // 접근성 우선: 사용자가 reduced-motion을 선호하면 전환을 적용하지 않음
    if (typeof window === "undefined") return
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const html = document.documentElement
    // 전환을 잠시 활성화시키는 클래스
    html.classList.add("theme-transition")

    const t = setTimeout(() => html.classList.remove("theme-transition"), 350)
    return () => clearTimeout(t)
  }, [theme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Root에서 전달된 attribute/defaultTheme을 우선 사용하고, 없을 경우에만 기본값을 적용합니다.
  const attribute = (props as any)?.attribute ?? "class"
  const defaultTheme = (props as any)?.defaultTheme ?? "system"

  return (
    <NextThemesProvider {...props} attribute={attribute} defaultTheme={defaultTheme}>
      <ThemeTransitionHandler />
      {children}
    </NextThemesProvider>
  )
}
