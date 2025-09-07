"use client"

import React, { useEffect, useState } from 'react'

// Dynamically load ClerkProvider only when a publishable key exists. While
// loading, avoid rendering children unwrapped. If the key is absent (e.g. in
// CI/build), render children directly so the app can prerender.
export default function ClerkProviderClient({ children }: { children: React.ReactNode }) {
  const [ClerkProvider, setClerkProvider] = useState<any | null>(null)
  const [hasKey, setHasKey] = useState<boolean | null>(null)
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    // Determine theme from document class or prefers-color-scheme
    const detectTheme = () => {
      try {
        if (typeof window === 'undefined') return null
        const doc = document.documentElement
        if (doc.classList.contains('dark')) return true
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        return prefersDark
      } catch {
        return null
      }
    }
    setIsDark(detectTheme())

    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    if (!key) {
      setHasKey(false)
      return
    }
    setHasKey(true)
    let mounted = true
    import('@clerk/nextjs')
      .then((mod) => {
        if (!mounted) return
        setClerkProvider(() => mod.ClerkProvider)
        // Signal that ClerkProvider has been loaded so other components can
        // safely import Clerk client UI/hooks.
        try {
          // @ts-ignore
          window.__CLERK_PROVIDER_LOADED__ = true
        } catch (e) {}
      })
      .catch(() => {
        // ignore import failures
      })
    return () => { mounted = false }
  }, [])

  // If no key present at runtime, render children so build/CI works.
  if (hasKey === false) return <>{children}</>

  // If key exists but ClerkProvider not yet loaded, avoid rendering children
  // to prevent Clerk hooks from running outside of the provider.
  if (hasKey === null || (hasKey === true && !ClerkProvider)) {
    return null
  }

  const Provider = ClerkProvider

  // Build Clerk appearance using theme and CSS variables from the app.
  const appearance: any = {
  // Ensure Clerk's styles use a dedicated Tailwind layer so they can be
  // ordered correctly (see Clerk docs: cssLayerName). This avoids
  // Tailwind <-> Clerk specificity/ordering issues.
  cssLayerName: 'clerk',
    baseTheme: isDark ? 'dark' : 'light',
    variables: {
      // Use CSS variables defined in the app theme (fallbacks provided)
      colorPrimary: getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#2563eb',
      colorText: getComputedStyle(document.documentElement).getPropertyValue('--foreground') || '#111827',
    },
  }

  return <Provider appearance={appearance}>{children}</Provider>
}
