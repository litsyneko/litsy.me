import type { Metadata } from 'next'
import HomeClient from './HomeClient'

// 홈페이지를 위한 메인 메타데이터
export const metadata: Metadata = {
  title: '릿시네코 | 프론트엔드 개발자 포트폴리오',
  description: '사용자 경험을 최우선으로 생각하는 프론트엔드 개발자, 릿시네코의 포트폴리오입니다. React, Next.js, TypeScript 기반의 다양한 프로젝트를 만나보세요.',
  openGraph: {
    title: '릿시네코 | 프론트엔드 개발자 포트폴리오',
    description: 'React, Next.js 기반의 인터랙티브 웹 프로젝트',
    url: 'https://litsy.me', // Make sure this is correct
    siteName: '릿시네코 포트폴리오',
    images: [
      {
        url: '/siteimage.png', // Ensure this image exists in /public
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '릿시네코 | 프론트엔드 개발자 포트폴리오',
    description: 'React, Next.js 기반의 인터랙티브 웹 프로젝트',
    images: ['/siteimage.png'], // Ensure this image exists in /public
    creator: '@litsyme',
  },
}

export default function Page() {
  return <HomeClient />
}