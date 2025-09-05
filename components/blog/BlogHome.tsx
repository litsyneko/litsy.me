"use client"

import { useMemo, useState, useEffect } from 'react'
import BlogList from './BlogList'

// 기본(샘플) 포스트 데이터 — 로컬에 저장된 포스트가 있으면 병합하여 사용
const DEFAULT_POSTS = [
  {
    slug: 'nextjs-blog-tutorial',
    title: 'Next.js 블로그 튜토리얼',
    summary: 'Next.js로 블로그를 만드는 방법을 단계별로 설명합니다.',
    date: '2025-09-01',
    tags: ['Next.js', 'React', '블로그'],
    author: 'litsy25',
    cover: '/placeholder.jpg'
  },
  {
    slug: 'supabase-auth-guide',
    title: 'Supabase 인증 완벽 가이드',
    summary: 'Supabase로 소셜 로그인과 이메일 인증을 구현하는 방법.',
    date: '2025-08-20',
    tags: ['Supabase', '인증', '보안'],
    author: 'litsy25',
    cover: '/placeholder-user.jpg'
  }
]

function useFiltered(posts: any[], query: string, tag: string) {
  return useMemo(() => {
    let res = posts
    if (tag) {
      res = res.filter(p => Array.isArray(p.tags) && p.tags.includes(tag))
    }
    if (query) {
      const q = query.toLowerCase()
      res = res.filter(p => (p.title || '').toLowerCase().includes(q) || (p.summary || '').toLowerCase().includes(q))
    }
    return res
  }, [posts, query, tag])
}

export default function BlogHome() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 6

  // posts state: 서버 API(/api/posts)에서 실제 게시물을 가져온다. 실패 시 DEFAULT_POSTS 사용
  const [posts, setPosts] = useState<any[]>(DEFAULT_POSTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    const url = '/api/posts?published=true'
    fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`)
      const data = await res.json()
      if (mounted) setPosts(Array.isArray(data) ? data : DEFAULT_POSTS)
    }).catch((err) => {
      console.error('Error fetching posts from API:', err)
      if (mounted) {
        setError(String(err?.message || err))
        setPosts(DEFAULT_POSTS)
      }
    }).finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [])

  const filtered = useFiltered(posts, query, tag)
  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  // ensure current page is within bounds when posts change
  if (page > pages) setPage(pages)
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  const allTags = Array.from(new Set(posts.flatMap((p: any) => Array.isArray(p.tags) ? p.tags : [])))

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12 px-4">
      <header className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Blog</h1>
        <p className="text-muted-foreground text-sm sm:text-base">기술과 생각을 공유합니다.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <aside className="lg:col-span-1 order-1 lg:order-2">
          <div className="p-3 sm:p-4 border rounded-lg bg-card mb-4">
            <h4 className="font-semibold mb-2 text-sm sm:text-base">태그</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button onClick={() => { setTag(''); setPage(1) }} className={`px-2.5 py-1.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm min-h-[36px] sm:min-h-[32px] ${tag === '' ? 'bg-primary text-white' : 'bg-muted'}`}>전체</button>
              {allTags.map(t => (
                <button key={t} onClick={() => { setTag(t); setPage(1) }} className={`px-2.5 py-1.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm min-h-[36px] sm:min-h-[32px] ${tag === t ? 'bg-primary text-white' : 'bg-muted'}`}>#{t}</button>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-4 border rounded-lg bg-card">
            <h4 className="font-semibold mb-2 text-sm sm:text-base">작성자</h4>
            <div className="text-xs sm:text-sm text-muted-foreground">litsy25</div>
          </div>
        </aside>

        <main className="lg:col-span-3 order-2 lg:order-1">
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="검색어를 입력하세요" 
              className="flex-1 p-3 sm:p-2.5 text-base sm:text-sm rounded-md bg-card border min-h-[44px] sm:min-h-[40px]" 
            />
            <button 
              onClick={() => { setQuery(''); setTag(''); setPage(1) }} 
              className="px-4 py-3 sm:px-3 sm:py-2 bg-muted rounded-md text-sm font-medium min-h-[44px] sm:min-h-[40px] hover:bg-muted/80 transition-colors"
            >
              초기화
            </button>
          </div>

          <BlogList posts={visible} />

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
            <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">총 {total}개의 글</div>
            <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className="px-4 py-2.5 sm:px-3 sm:py-1.5 bg-muted rounded-md text-sm font-medium min-h-[44px] sm:min-h-[36px] hover:bg-muted/80 transition-colors disabled:opacity-50"
                disabled={page <= 1}
              >
                이전
              </button>
              <div className="px-3 py-2 sm:py-1 text-sm font-medium min-w-[60px] text-center">{page} / {pages}</div>
              <button 
                onClick={() => setPage(p => Math.min(pages, p + 1))} 
                className="px-4 py-2.5 sm:px-3 sm:py-1.5 bg-muted rounded-md text-sm font-medium min-h-[44px] sm:min-h-[36px] hover:bg-muted/80 transition-colors disabled:opacity-50"
                disabled={page >= pages}
              >
                다음
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
