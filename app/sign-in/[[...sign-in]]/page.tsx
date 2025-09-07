"use client"


import { SignIn } from "@clerk/nextjs"
import { useTheme } from "next-themes"

export default function Page() {
  const { theme } = useTheme()
  // theme: 'dark' | 'light' | 'system'
  const cardClass =
    theme === "dark"
      ? "shadow-lg rounded-2xl border border-border bg-[#18181b] text-white"
      : "shadow-lg rounded-2xl border border-border bg-white text-black"

  return (
    <div className="flex justify-center items-center min-h-[60vh] pt-24">
      <SignIn
        appearance={{
          elements: {
            card: cardClass,
          },
        }}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
