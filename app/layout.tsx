import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Navigation from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Litsy - Frontend Developer",
  description: "사용자 경험을 최우선으로 생각하는 프론트엔드 개발자 Litsy의 포트폴리오",
  generator: "v0.app",
  keywords: ["프론트엔드", "개발자", "React", "Next.js", "TypeScript", "웹개발", "포트폴리오"],
  authors: [{ name: "Litsy", url: "https://github.com/litsyme" }],
  creator: "Litsy",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://litsy.dev",
    siteName: "Litsy Portfolio",
    title: "Litsy - Frontend Developer",
    description: "사용자 경험을 최우선으로 생각하는 프론트엔드 개발자 Litsy의 포트폴리오",
  },
  twitter: {
    card: "summary_large_image",
    title: "Litsy - Frontend Developer",
    description: "사용자 경험을 최우선으로 생각하는 프론트엔드 개발자 Litsy의 포트폴리오",
    creator: "@litsyme",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
