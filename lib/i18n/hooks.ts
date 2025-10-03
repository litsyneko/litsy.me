"use client"

import { usePathname } from "next/navigation"
import { defaultLocale, type Locale } from "./config"

export function useLocale(): Locale {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const localeSegment = segments[1]

  if (localeSegment === "en" || localeSegment === "ko" || localeSegment === "ja") {
    return localeSegment
  }

  return defaultLocale
}
