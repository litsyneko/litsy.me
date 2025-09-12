
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ThemeProviderClient from "./components/ThemeProviderClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "릿시네코 - 웹사이트",
  description: "릿시네코의 웹사이트입니다. 포트폴리오겸 블로그 입니다.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["릿시", "릿시네코", "네코", "개발자", "디스코드 봇", "유튜버", "버튜버"]
};

// Move theme color to viewport per Next.js guidance
export const viewport: Viewport = {
  themeColor: "#8c9fff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-900 dark:text-slate-50 overflow-x-hidden`}>
        <ThemeProviderClient>
          {/* Background layers */}
          {/* Base subtle gradient */}
          <div className="fixed inset-0 -z-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
          {/* Soft radial overlay + glassy blobs for unified look */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.03),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08),transparent_55%)]" />
            <div className="absolute top-1/4 left-1/3 w-80 h-80 md:w-96 md:h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-xl md:blur-3xl md:animate-pulse opacity-60" />
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 md:w-80 md:h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-xl md:blur-3xl md:animate-pulse delay-1000 opacity-50" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1 px-4 pt-24 pb-12 md:pb-16">
              {children}
            </main>

            <Footer />
          </div>

        </ThemeProviderClient>
      </body>
    </html>
  );
}
