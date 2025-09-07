"use client"

import React from "react"
import { SignUp } from "@clerk/nextjs"
import { useTheme } from "next-themes";

export default function SignUpClient() {
  const { resolvedTheme } = useTheme();

  const lightModeStyles = {
    card: 'bg-card/90 backdrop-blur-lg border border-border/80 rounded-2xl p-6 shadow-lg',
    headerTitle: 'text-4xl font-black bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent',
    headerSubtitle: 'text-muted-foreground',
    formButtonPrimary:
      'bg-gradient-to-r from-primary to-blue-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300',
    formFieldInput:
      'bg-card/70 border border-border/70 rounded-lg focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground',
    socialButtonsBlockButton:
      'border border-border/70 hover:border-primary/40 hover:bg-primary/10 text-foreground',
    footerActionLink: 'text-primary hover:underline',
  };

  const darkModeStyles = {
    card: 'bg-card/80 backdrop-blur-lg border border-border/40 rounded-2xl p-6 shadow-2xl',
    headerTitle: 'text-4xl font-black bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text text-transparent',
    headerSubtitle: 'text-muted-foreground',
    formButtonPrimary:
      'bg-gradient-to-r from-[#818cf8] to-blue-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300',
    formFieldInput:
      'bg-card/60 border border-border/40 rounded-lg focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground',
    socialButtonsBlockButton:
      'border border-border/40 hover:border-primary/35 hover:bg-primary/10 text-foreground',
    footerActionLink: 'text-primary hover:underline',
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-12 px-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: resolvedTheme === 'dark' ? darkModeStyles : lightModeStyles,
          }}
        />
      </div>
    </div>
  )
}