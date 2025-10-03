import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stripe Clone - Financial Infrastructure",
  description: "A recreation of the Stripe homepage showcasing financial infrastructure and payment solutions.",
}

export default function StripeCloneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
