import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServiceRole as supabase } from '@/lib/supabase-server'
import BlogDetail from '@/components/blog/BlogDetail'
import { normalizePost } from '@/lib/utils/blog'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !post) {
      return {
        title: '포스트를 찾을 수 없습니다 | 릿시네코',
        description: '요청하신 블로그 포스트를 찾을 수 없습니다.',
      }
    }

    const normalizedPost = normalizePost(post)
    const description = normalizedPost.summary || 
      `"${normalizedPost.title}" - ${normalizedPost.author}의 포스트`

    return {
      title: `${normalizedPost.title} | 릿시네코`,
      description,
      keywords: normalizedPost.tags || [],
      authors: [{ name: normalizedPost.author }],
      openGraph: {
        title: normalizedPost.title,
        description,
        type: 'article',
        locale: 'ko_KR',
        publishedTime: normalizedPost.date,
        authors: [normalizedPost.author],
        tags: normalizedPost.tags,
        images: normalizedPost.cover ? [normalizedPost.cover] : ['/siteimage.png'],
      },
      twitter: {
        card: 'summary_large_image',
        title: normalizedPost.title,
        description,
        images: normalizedPost.cover ? [normalizedPost.cover] : ['/siteimage.png'],
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: '포스트를 찾을 수 없습니다 | 릿시네코',
      description: '요청하신 블로그 포스트를 찾을 수 없습니다.',
    }
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !post) {
      notFound()
    }

    const normalizedPost = normalizePost(post)

    return (
      <div className="min-h-screen bg-background pt-16">
        <BlogDetail post={normalizedPost} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    notFound()
  }
}