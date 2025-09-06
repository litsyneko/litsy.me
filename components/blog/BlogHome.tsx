"use client"

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2, AlertCircle, Plus, Lock } from 'lucide-react'
import Link from 'next/link'
import BlogList from './BlogList'
import { NormalizedPost } from '@/lib/types/blog'
import { normalizePost, getTagColor } from '@/lib/utils/blog'
import { checkBlogWritePermission, hasWritePermission, type BlogAuthUser } from '@/lib/utils/blog-auth'

// 기본(샘플) 포스트 데이터
const DEFAULT_POSTS: NormalizedPost[] = [
  {
    slug: 'nextjs-blog-tutorial',
    title: 'Next.js 블로그 튜토리얼',
    summary: 'Next.js로 블로그를 만드는 방법을 단계별로 설명합니다.',
    date: '2025-09-01T00:00:00Z',
    tags: ['Next.js', 'React', '블로그'],
    author: 'Litsy',
    username: 'litsy25',
    cover: '/placeholder.jpg'
  },
  {
    slug: 'supabase-auth-guide',
    title: 'Supabase 인증 완벽 가이드',
    summary: 'Supabase로 소셜 로그인과 이메일 인증을 구현하는 방법을 알아봅시다.',
    date: '2025-08-20T00:00:00Z',
    tags: ['Supabase', '인증', '보안'],
    author: 'Litsy',
    username: 'litsy25',
    cover: '/placeholder-user.jpg'
  }
]

interface BlogHomeProps {
  initialPosts?: NormalizedPost[]
}

function useFiltered(posts: NormalizedPost[], query: string, tag: string) {
  return useMemo(() => {
    let filtered = posts

    if (tag) {
      filtered = filtered.filter(post => post.tags.includes(tag))
    }

    if (query) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.summary.toLowerCase().includes(searchTerm) ||
        post.tags.some(t => t.toLowerCase().includes(searchTerm))
      )
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [posts, query, tag])
}

export default function BlogHome({ initialPosts }: BlogHomeProps) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const [posts, setPosts] = useState<NormalizedPost[]>(initialPosts || DEFAULT_POSTS)
  const [loading, setLoading] = useState(!initialPosts)
  const [error, setError] = useState<string | null>(null)
  const [authUser, setAuthUser] = useState<BlogAuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const perPage = 6

  // 사용자 권한 확인
  const checkAuth = useCallback(async () => {
    try {
      setAuthLoading(true)
      const user = await checkBlogWritePermission()
      setAuthUser(user)
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const fetchPosts = useCallback(async () => {
    if (initialPosts) return // SSR로 받은 데이터가 있으면 스킵

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/posts?published=true')
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const data = await response.json()
      const normalizedPosts = Array.isArray(data)
        ? data.map(normalizePost)
        : DEFAULT_POSTS

      setPosts(normalizedPosts)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      setPosts(DEFAULT_POSTS) // 폴백으로 기본 포스트 사용
    } finally {
      setLoading(false)
    }
  }, [initialPosts])

  useEffect(() => {
    fetchPosts()
    checkAuth()
  }, [fetchPosts, checkAuth])

  const filtered = useFiltered(posts, query, tag)
  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / perPage))

  // 페이지가 범위를 벗어나면 조정
  useEffect(() => {
    if (page > pages) {
      setPage(pages)
    }
  }, [page, pages])

  const visible = filtered.slice((page - 1) * perPage, page * perPage)
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))

  const handleSearch = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const handleTagSelect = (selectedTag: string) => {
    setTag(selectedTag)
    setPage(1)
  }

  const handleReset = () => {
    setQuery('')
    setTag('')
    setPage(1)
  }

  const handleRetry = () => {
    fetchPosts()
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">블로그 포스트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12 px-4">
      <header className="mb-6 sm:mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Blog</h1>

          {/* 글쓰기 버튼 */}
          {!authLoading && (
            hasWritePermission(authUser) ? (
              <Link
                href="/blog/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                글쓰기
              </Link>
            ) : authUser ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">
                <Lock className="w-4 h-4" />
                권한 없음
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
              >
                <Lock className="w-4 h-4" />
                로그인 필요
              </Link>
            )
          )}
        </div>

        <p className="text-muted-foreground text-sm sm:text-base">
          기술과 생각을 공유합니다.
        </p>

        {/* 권한 정보 표시 */}
        {!authLoading && authUser && (
          <div className="mt-3 text-xs text-muted-foreground">
            {hasWritePermission(authUser) ? (
              <span className="text-green-600 dark:text-green-400">
                ✓ {authUser.discord_username || authUser.discord_id}님, 블로그 작성 권한이 있습니다.
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠ 블로그 작성 권한이 없습니다. (현재: {authUser.discord_username || authUser.discord_id || '알 수 없음'})
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200 text-sm">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm underline"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* 사이드바 */}
        <aside className="lg:col-span-1 order-1 lg:order-2 space-y-4">
          {/* 태그 필터 */}
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="font-semibold mb-3 text-sm sm:text-base">태그</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagSelect('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tag === ''
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
                  }`}
              >
                전체
              </button>
              {allTags.map(t => (
                <button
                  key={t}
                  onClick={() => handleTagSelect(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tag === t
                    ? 'bg-primary text-primary-foreground'
                    : `${getTagColor(t)} hover:opacity-80`
                    }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>

          {/* 통계 */}
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="font-semibold mb-3 text-sm sm:text-base">통계</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>총 {posts.length}개의 포스트</div>
              <div>{allTags.length}개의 태그</div>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="lg:col-span-3 order-2 lg:order-1">
          {/* 검색 및 필터 */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="제목, 내용, 태그로 검색..."
                className="w-full pl-10 pr-10 py-3 sm:py-2.5 text-base sm:text-sm rounded-md bg-card border min-h-[44px] sm:min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {query && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-3 sm:px-3 sm:py-2 bg-muted rounded-md text-sm font-medium min-h-[44px] sm:min-h-[40px] hover:bg-muted/80 transition-colors"
            >
              초기화
            </button>
          </div>

          {/* 필터 상태 표시 */}
          {(query || tag) && (
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              {query && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  검색: "{query}"
                </span>
              )}
              {tag && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                  태그: #{tag}
                </span>
              )}
              <span className="text-muted-foreground">
                {total}개 결과
              </span>
            </div>
          )}

          {/* 블로그 포스트 목록 */}
          <BlogList posts={visible} />

          {/* 페이지네이션 */}
          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-md bg-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
              >
                이전
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-md transition-colors ${p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                    }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="px-3 py-2 rounded-md bg-muted disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
              >
                다음
              </button>
            </div>
          )}

          {/* 빈 상태 */}
          {visible.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {query || tag ? '검색 결과가 없습니다.' : '아직 포스트가 없습니다.'}
              </div>
              {(query || tag) && (
                <button
                  onClick={handleReset}
                  className="text-primary hover:underline"
                >
                  모든 포스트 보기
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}