import { createServerClient } from '@/lib/supabase-server'
import { Metadata } from 'next'
import BlogHome from '@/components/blog/BlogHome'
import { BlogService } from '@/lib/services/blog'
import { BlogPostWithAuthor } from '@/lib/services/blog'

export const metadata: Metadata = {
  title: '블로그 | 릿시네코',
  description: '기술과 생각을 공유하는 블로그입니다. Next.js, React, Supabase 등 개발 관련 글을 한국어로 제공합니다.',
  keywords: ['Litsy', '릿시', '릿시네코', '블로그', '개발', 'Next.js', 'React', 'Supabase'],
  authors: [{ name: 'LitsyNeko' }],
  openGraph: {
    title: '블로그 | 릿시네코',
    description: '기술과 생각을 공유하는 블로그입니다.',
    type: 'website',
    locale: 'ko_KR',
    url: '/blog',
    images: [
      {
        url: '/siteimage.png',
        width: 1200,
        height: 630,
        alt: '릿시네코 블로그 미리보기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '블로그 | 릿시네코',
    description: '기술과 생각을 공유하는 블로그입니다.',
    images: ['/siteimage.png'],
  },
  alternates: {
    canonical: '/blog',
  },
}

export default async function BlogPage() {
  const supabase = createServerClient({ cookieStore: {} })
  const blogService = new BlogService(supabase)
  let initialPosts: BlogPostWithAuthor[] = []

  try {
    const posts = await blogService.getPosts({ published: true, limit: 6, offset: 0 })
    initialPosts = posts
  } catch (error) {
    console.error('Error fetching initial posts in BlogPage (Server Component):', error)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 메인 페이지의 애니메이션 배경 추가 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-morphing-blob" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-3xl animate-morphing-blob"
          style={{ animationDelay: "10s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl animate-morphing-blob"
          style={{ animationDelay: "5s" }}
        />
      </div>
      <div className="pt-16">
        <BlogHome initialPosts={initialPosts} />
      </div>
    </div>
  )
}