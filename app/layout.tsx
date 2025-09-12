import type { Metadata } from 'next'
import ClerkProviderClient from '@/components/ClerkProviderClient'
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navigation from "@/components/navigation";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"
// Using a standard Google Fonts <link> instead of next/font to avoid Next 15 API
// mismatches in this project environment.


const siteConfig = {
  title: '릿시네코 | 블로그 & 포트폴리오',
  description: '안녕하세요! 개발자 릿시네코의 기술 블로그 및 포트폴리오 웹사이트입니다. 웹 개발, 프로그래밍, 그리고 다양한 프로젝트 이야기를 만나보세요.',
  url: 'https://litsy.me', // 실제 운영 도메인으로 설정해주세요.
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | 릿시네코`,
  },
  description: siteConfig.description,
  keywords: ['릿시네코', '블로그', '포트폴리오', '프론트엔드', '개발자', '잡다한 블로그', '버튜버','유튜버', 'TypeScript', '디스코드', '디스코드 개발자', '버츄얼'],
  authors: [{ name: 'LitsyNeko', url: siteConfig.url }],
  creator: 'LitsyNeko',

  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: '릿시네코',
    images: [
      {
        url: '/siteimage.png', // 공유 썸네일용 가로 이미지 (public/siteimage.png)
        width: 1200,
        height: 630,
        alt: '릿시네코 사이트 미리보기',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/siteimage.png'],
    creator: '@litsyme', // 트위터 핸들이 있다면 여기에 입력해주세요.
  },

  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // RootLayout must render <html> and <body> at the top level (server component).
  // Place client-only ClerkProvider inside <body> so Next can detect root tags.
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="46a4cc0ec327f438b21ecdce34934a76db0fe86f" />
      </head>
      <body>
        <ClerkProviderClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navigation />
            <main>
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </ClerkProviderClient>
      </body>
    </html>
  )
}
