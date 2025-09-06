"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navigation from "@/components/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "릿시네코 | LitsyNeko",
  description: "릿시의 포트폴리오 및 프로젝트, 블로그를 소개하는 웹사이트",
  keywords: [
    'Litsy', 'LitsyNeko', 'Portfolio', '릿시', '릿시네코', '웹사이트', '개발자', '버튜버', '유튜버', 'Vtuber', 'Youtuber'
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="46a4cc0ec327f438b21ecdce34934a76db0fe86f" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navigation />
            <main>
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
