"use client"

import { useEffect, useState } from 'react'
import Comments from '@/components/comments'

type Post = {
  id: string
  title: string
  slug: string
  summary?: string
  content?: string
  author_name?: string
  author_avatar?: string
  author?: string
  date?: string
  created_at?: string
  updated_at?: string
  comments?: any[]
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params as any
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    // 먼저 localStorage에서 찾아본다 (새로 작성한 로컬 포스트 포함)
    try {
      const raw = localStorage.getItem('posts')
      const arr = raw ? JSON.parse(raw) : []
      const found = Array.isArray(arr) ? arr.find((p: any) => p.slug === slug) : null
      if (found) {
        if (mounted) {
          setPost(found)
          setLoading(false)
        }
        return
      }
    } catch (err) {
      // ignore json parse errors
    }

    // local에서 못 찾으면 API로 시도
    const base = process.env.NEXT_PUBLIC_APP_URL || ''
    const url = base ? `${base}/api/posts/${slug}` : `/api/posts/${slug}`
    fetch(url).then(res => {
      if (!res.ok) {
        if (mounted) setLoading(false)
        return null
      }
      return res.json()
    }).then((data) => {
      if (data && mounted) setPost(data)
    }).catch(() => {
      // ignore
    }).finally(() => {
      if (mounted) setLoading(false)
    })

    return () => { mounted = false }
  }, [slug])

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">로딩 중...</div>
  }

  if (!post) {
    return <div className="py-20 text-center text-muted-foreground">해당 게시물을 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 mb-4">
          <img src={post.author_avatar || '/placeholder-user.jpg'} alt="author" className="w-10 h-10 rounded-full" />
          <div>
            <div className="text-sm font-medium">{post.author_name || post.author || 'Anonymous'}</div>
            <div className="text-xs text-muted-foreground">{post.created_at ? new Date(post.created_at).toLocaleString() : (post.date ? new Date(post.date).toLocaleString() : '')}</div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">{post.summary}</p>
        <div className="prose max-w-none">
          <article dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(post.content || '') }} />
        </div>

        <Comments postId={post.id} />
      </div>
    </div>
  )
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function simpleMarkdownToHtml(md: string) {
  if (!md) return ''
  // escape first
  let html = escapeHtml(md)
  // codeblocks ```
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre class="bg-black text-white p-4 rounded">${escapeHtml(code)}</pre>`)
  // headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  // bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // italics
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  // paragraphs
  html = html.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
  return html
}
