import { BlogPost, BlogPostWithAuthor, NormalizedPost, NormalizedComment, BlogCommentWithAuthor } from '@/lib/types/blog'

/**
 * 블로그 포스트를 정규화된 형태로 변환
 */
export function normalizePost(post: BlogPostWithAuthor | any): NormalizedPost {
  // API에서 온 데이터인 경우
  if (post.id && post.created_at) {
    return {
      slug: post.slug || generateSlugFromTitle(post.title),
      title: post.title || 'Untitled',
      summary: post.summary || '',
      content: post.content || '',
      date: post.published_at || post.created_at,
      tags: Array.isArray(post.tags) ? post.tags : [],
      author: post.author?.display_name || post.author?.username || 'Anonymous',
      username: post.author?.username || null,
      cover: post.cover_url || '/placeholder.jpg',
      published: post.published
    }
  }

  // 로컬 데이터인 경우 (기존 형태)
  return {
    slug: post.slug || generateSlugFromTitle(post.title),
    title: post.title || 'Untitled',
    summary: post.summary || '',
    content: post.content || '',
    date: post.published_at || post.created_at || post.date || new Date().toISOString(),
    tags: Array.isArray(post.tags) ? post.tags : [],
    author: post.author || 'Anonymous',
    username: post.username || null,
    cover: post.cover || post.cover_url || '/placeholder.jpg',
    published: post.published !== false
  }
}

/**
 * 댓글을 정규화된 형태로 변환
 */
export function normalizeComment(comment: BlogCommentWithAuthor | any): NormalizedComment {
  return {
    id: comment.id,
    author_name: comment.author?.display_name || comment.author?.username || comment.author_name || 'Anonymous',
    author_avatar: comment.author?.avatar_url || comment.author_avatar || null,
    content: comment.content,
    created_at: comment.created_at
  }
}

/**
 * 제목에서 슬러그 생성
 */
export function generateSlugFromTitle(title: string): string {
  if (!title) return `post-${Date.now()}`
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // 특수문자 제거 (한글 허용)
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈 제거
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
    || `post-${Date.now()}`
}

/**
 * 마크다운을 HTML로 변환 (보안 강화)
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  // HTML 이스케이프
  let html = escapeHtml(markdown)

  // 코드 블록 (```로 감싸진 부분)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang ? ` data-language="${escapeHtml(lang)}"` : ''
    return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"${language}><code>${escapeHtml(code.trim())}</code></pre>`
  })

  // 인라인 코드
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">$1</code>')

  // 헤더
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')

  // 굵은 글씨
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')

  // 기울임
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

  // 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')

  // 리스트
  html = html.replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
  html = html.replace(/(<li.*<\/li>)/s, '<ul class="my-4 space-y-1">$1</ul>')

  // 단락
  html = html.split(/\n\n+/).map(paragraph => {
    // 이미 HTML 태그로 감싸진 경우 그대로 반환
    if (paragraph.match(/^<(h[1-6]|pre|ul|ol)/)) {
      return paragraph
    }
    return `<p class="mb-4 leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>`
  }).join('')

  return html
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 날짜 포맷팅
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return '날짜 없음'
  }
}

/**
 * 상대 시간 포맷팅
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
    
    return formatDate(dateString)
  } catch {
    return '날짜 없음'
  }
}

/**
 * 태그 색상 생성
 */
export function getTagColor(tag: string): string {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  ]
  
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/**
 * 읽기 시간 계산 (분)
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200 // 평균 읽기 속도
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * 검색어 하이라이트
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}