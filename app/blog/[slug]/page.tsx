import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServer as supabase } from '@/lib/supabase-server'
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
        title: 'Post Not Found | Litsy Portfolio',
        description: 'The requested blog post could not be found.',
      }
    }

    const normalizedPost = normalizePost(post)
    const description = normalizedPost.summary || 
      `Read "${normalizedPost.title}" by ${normalizedPost.author} on Litsy's blog.`

    return {
      title: `${normalizedPost.title} | Litsy Portfolio`,
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
        images: normalizedPost.cover ? [normalizedPost.cover] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: normalizedPost.title,
        description,
        images: normalizedPost.cover ? [normalizedPost.cover] : undefined,
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Post Not Found | Litsy Portfolio',
      description: 'The requested blog post could not be found.',
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