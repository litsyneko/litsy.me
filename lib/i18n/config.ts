export const locales = ["en", "ko", "ja"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "ko"

export const localeNames: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
}

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  ko: "🇰🇷",
  ja: "🇯🇵",
}
