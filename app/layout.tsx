import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HashRedirectToUpdate from "./components/HashRedirectToUpdate";
import { ToastProvider } from "./components/ToastProvider";
import ThemeProviderClient from "./components/ThemeProviderClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 기본 메타데이터 - 각 페이지에서 오버라이드될 수 있음
export const metadata: Metadata = {
  title: {
    default: "릿시네코 - 웹사이트",
    template: "%s | 릿시네코"
  },
  description: "릿시네코의 웹사이트입니다. 포트폴리오겸 블로그 입니다.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["릿시", "릿시네코", "네코", "개발자", "디스코드 봇", "유튜버", "버튜버"],
  authors: [{ name: "릿시네코" }],
  creator: "릿시네코",
  publisher: "릿시네코",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://litsy.me',
    siteName: '릿시네코',
    images: [
      {
        url: 'https://litsy.me/images/profile.png',
        width: 1200,
        height: 630,
        alt: '릿시네코',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '릿시네코 - 웹사이트',
    description: '릿시네코의 웹사이트입니다. 포트폴리오겸 블로그 입니다.',
    images: ['https://litsy.me/images/profile.png'],
    creator: '@litsyn',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ThemeProviderClient>
        <ToastProvider>
          <HashRedirectToUpdate />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="h-16 md:h-20" aria-hidden />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ToastProvider>
      </ThemeProviderClient>
      </body>
    </html>
  );
}
