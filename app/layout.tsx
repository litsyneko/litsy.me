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
  title: "LitsyNeko - 디스코드,웹 개발자",
  description: "디스코드와 웹을 사랑하는 개발자 LitsyNeko의 포트폴리오",
  generator: "v0.app",
  keywords: ["디스코드", "웹개발", "프론트엔드", "개발자", "React", "Next.js", "TypeScript", "포트폴리오", "LitsyNeko"],
  authors: [{ name: "LitsyNeko", url: "https://github.com/litsyme" }],
  creator: "LitsyNeko",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://litsy.dev",
    siteName: "LitsyNeko Portfolio",
    title: "LitsyNeko - 디스코드,웹 개발자",
    description: "디스코드와 웹을 사랑하는 개발자 LitsyNeko의 포트폴리오",
    images: ["/siteimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LitsyNeko - 디스코드,웹 개발자",
    description: "디스코드와 웹을 사랑하는 개발자 LitsyNeko의 포트폴리오",
    creator: "@litsyme",
    images: ["/siteimage.png"],
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
