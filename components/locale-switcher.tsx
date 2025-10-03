"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { locales, localeNames, type Locale } from "@/lib/i18n/config"
import { useLocale } from "@/lib/i18n/hooks"
import { Globe } from "lucide-react"

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/")
    const currentLocaleInPath = segments[1]

    if (currentLocaleInPath === "en" || currentLocaleInPath === "ko" || currentLocaleInPath === "ja") {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }

    const newPath = segments.join("/")
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? "bg-accent" : ""}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
