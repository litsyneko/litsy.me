import type { Metadata } from 'next'
import AboutClient from './AboutClient'

// About 페이지를 위한 메타데이터
export const metadata: Metadata = {
  title: '릿시네코의 도움말 | 프론트엔드 & 디스코드 개발자 소개',
  description: '릿시네코의 도움말: 저에 대해 알아보세요. 프론트엔드 개발자 및 버츄얼 유튜버 활동을 소개합니다. Discord 봇 개발, 웹 프로젝트, 팀 협업 경험을 공유합니다.',
  keywords: ['릿시네코', '개발자', '프론트엔드', '디스코드 개발자', '버튜버', '버츄얼', 'Discord 봇', 'React', 'Next.js'],
  authors: [{ name: 'LitsyNeko' }],
  openGraph: {
    title: '릿시네코의 도움말',
    description: '프론트엔드 개발자 및 버츄얼 유튜버, LitsyNeko의 소개 페이지입니다.',
    type: 'website',
    locale: 'ko_KR',
    url: '/about',
    images: [
      {
        url: '/siteimage.png',
        width: 1200,
        height: 630,
        alt: '릿시네코 프로필 이미지',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '릿시네코의 도움말',
    description: '프론트엔드 개발자 및 버츄얼 유튜버, LitsyNeko의 소개 페이지입니다.',
    images: ['/siteimage.png'],
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
