import type { Metadata } from 'next'

export const siteMetadata: Metadata = {
  title: '릿시네코 | 프론트엔드 개발자 포트폴리오',
  description:
    '사용자 경험을 최우선으로 생각하는 프론트엔드 개발자, 릿시네코의 포트폴리오입니다. React, Next.js, TypeScript 기반의 다양한 프로젝트를 만나보세요. 디스코드, 버튜버, 버츄얼 관련 개발 경험도 있습니다.',
  keywords: [
    '릿시네코',
    '프론트엔드',
    '개발자',
    '포트폴리오',
    'React',
    'Next.js',
    'TypeScript',
  ],
  openGraph: {
    title: '릿시네코 | 프론트엔드 개발자 포트폴리오',
    description:
      'React, Next.js 기반의 인터랙티브 웹 프로젝트. 디스코드, 버튜버, 버츄얼 관련 개발 경험도 있습니다.',
    url: 'https://litsy.me',
    siteName: '릿시네코 포트폴리오',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://litsy.me'}/siteimage.png`,
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
    description:
      'React, Next.js 기반의 인터랙티브 웹 프로젝트. 디스코드, 버튜버, 버츄얼 관련 개발 경험도 있습니다.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://litsy.me'}/siteimage.png`],
    creator: '@litsyme',
  },
}

export default siteMetadata
