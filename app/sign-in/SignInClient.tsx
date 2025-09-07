"use client"

import React from "react"
import { SignIn } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { dark as clerkDark } from "@clerk/themes"

export default function SignInClient() {
  const { theme, resolvedTheme } = useTheme()
  const current = theme === 'system' ? resolvedTheme : theme

  const baseTheme = current === 'dark' ? clerkDark : undefined

  const primaryColor = typeof document !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#6366f1'
    : '#6366f1'

  const appearance: any = {
    cssLayerName: 'clerk',
    baseTheme,
    elements: {
      // Card background: light = white, dark = theme card variable from globals.css
      card: `shadow-2xl border-0 bg-white dark:bg-[var(--card)] rounded-xl p-8`,
      // Enforce black text on light, white on dark to match main page
      headerTitle: `text-3xl font-extrabold text-black dark:text-white text-center mb-2`,
      headerSubtitle: `text-sm text-gray-600 dark:text-gray-200 text-center mb-6`,
      formFieldInput: `w-full px-4 py-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--card)] text-black dark:text-white placeholder:text-muted-foreground`,
      formFieldLabel: `block text-sm font-medium text-black dark:text-white mb-2`,
      formButtonPrimary: `w-full bg-gradient-to-r from-primary to-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary`,
      socialButtonsBlockButton: `w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg`,
  footerActionLink: `text-primary dark:text-primary hover:underline`,
      dividerLine: 'bg-gray-200 dark:bg-gray-700',
      dividerText: 'text-gray-500 dark:text-gray-400 text-sm',
      formFieldError: 'text-red-600 dark:text-red-400 text-sm mt-1',
    },
    variables: {
      colorPrimary: primaryColor,
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorDanger: '#ef4444',
    },
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md px-4">
        <SignIn appearance={appearance} />
      </div>
    </div>
  )
}