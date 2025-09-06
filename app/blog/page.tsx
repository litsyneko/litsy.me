import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Metadata } from 'next'
import BlogHome from '@/components/blog/BlogHome'
import { BlogService } from '@/lib/services/blog' // BlogService 임포트
import { BlogPostWithAuthor } from '@/lib/services/blog' // BlogPostWithAuthor 임포트

export const metadata: Metadata = {
  title: '블로그 | 릿시 포트폴리오',
  description: '기술과 생각을 공유하는 블로그입니다. Next.js, React, Supabase 등 개발 관련 글을 한국어로 제공합니다.',
  keywords: ['Litsy', '릿시', '블로그', '개발', 'Next.js', 'React', 'Supabase'],
  authors: [{ name: 'Litsy' }],
  openGraph: {
    title: '블로그 | 릿시 포트폴리오',
    description: '기술과 생각을 공유하는 블로그입니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '블로그 | 릿시 포트폴리오',
    description: '기술과 생각을 공유하는 블로그입니다.',
  },
  alternates: {
    canonical: '/blog',
  },
}

// 페이지 기능: 블로그 글 목록 표시 및 서버사이드에서 초기 포스트 데이터 프리패치

export default async function BlogPage() { // async 함수로 변경
  const supabase = createSupabaseServerClient()
  const blogService = new BlogService(supabase)
  let initialPosts: BlogPostWithAuthor[] = []

  try {
    // 서버 컴포넌트에서 직접 BlogService를 호출하여 데이터 프리패치
    const posts = await blogService.getPosts({ published: true, limit: 6, offset: 0 }) // 첫 페이지 데이터
    initialPosts = posts
  } catch (error) {
    console.error('Error fetching initial posts in BlogPage (Server Component):', error)
    // 에러 발생 시 빈 배열 또는 기본 값 사용
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <BlogHome initialPosts={initialPosts} /> {/* initialPosts prop 전달 */}
    </div>
  )
}
