import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
