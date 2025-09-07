"use client"

import React, { useEffect, useState } from 'react'

// Dynamically import ClerkProvider only when a publishable key is present.
// This avoids the Clerk SDK throwing during build/prerender when the key
// is not provided in the build environment (e.g., CI without env vars).
export default function ClerkProviderClient({ children }: { children: React.ReactNode }) {
  const [ClerkProvider, setClerkProvider] = useState<any>(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    if (!key) return
    // dynamic import ensures we only load the module when running in an
    // environment where the publishable key exists.
    import('@clerk/nextjs').then((mod) => {
      setClerkProvider(() => mod.ClerkProvider)
    }).catch(() => {
      // ignore import failures; fallback to rendering children directly
    })
  }, [])

  // If ClerkProvider wasn't loaded because the env is missing, render children
  // directly so the app can build/prerender without errors.
  if (!ClerkProvider) return <>{children}</>

  return <ClerkProvider>{children}</ClerkProvider>
}
