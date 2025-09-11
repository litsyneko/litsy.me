"use client"

import { useState } from 'react'
import { Clock, Eye, Share2, Calendar, User } from 'lucide-react'
import HeartButton from './HeartButton'
import CommentsWrapper from './CommentsWrapper'
import CommentList from './CommentList'
import CommentForm from './CommentForm'

import { markdownToHtml, calculateReadingTime, getTagColor } from '@/lib/utils/blog'

interface BlogDetailProps {
  post: {
    id?: string
    slug: string
    title: string
    summary?: string
    content: string
    date: string
    tags: string[]
    author: string
    username?: string
    cover: string
    published_at?: string
    created_at?: string
  }
}

export default function BlogDetail({ post }: BlogDetailProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const readingTime = calculateReadingTime(post.content)
  const publishDate = post.published_at || post.created_at || post.date

  const handleShare = async (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = post.title
    const text = post.summary || post.title

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          alert('링크가 복사되었습니다!')
        } catch (err) {
          console.error('Failed to copy:', err)
        }
        break
    }
    setShowShareMenu(false)
  }

  return (
    <article className="max-w-4xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* 표지 이미지 */}
          {post.cover && (
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden mb-8 shadow-lg">
              <img 
                src={post.cover} 
                alt={post.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          {/* 제목 */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              {post.title}
            </h1>
            
            {/* 요약 */}
            {post.summary && (
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {post.summary}
              </p>
            )}

            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{post.author}</span>
                {post.username && (
                  <span className="text-xs">(@{post.username})</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={publishDate}>
                  {new Date(publishDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime}분 읽기</span>
              </div>
            </div>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 본문 */}
          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ 
              __html: markdownToHtml(post.content) 
            }}
          />

          {/* 액션 버튼들 */}
          <div className="flex items-center justify-between py-6 border-t border-b">
            <HeartButton slug={post.slug} />
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                공유
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    트위터
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    페이스북
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    링크드인
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    링크 복사
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">댓글</h3>
            {post.id && (
              <CommentForm slug={post.slug} onNewComment={() => {}} />
            )}
            <div className="mt-6">
              <CommentList slug={post.slug} />
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* 작성자 정보 */}
            <div className="p-6 border rounded-lg bg-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                작성자
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                  {post.author[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{post.author}</div>
                  {post.username && (
                    <div className="text-sm text-muted-foreground">@{post.username}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="p-6 border rounded-lg bg-card">
                <h4 className="font-semibold mb-4">태그</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 관련 포스트 (향후 구현) */}
            <div className="p-6 border rounded-lg bg-card">
              <h4 className="font-semibold mb-4">관련 포스트</h4>
              <p className="text-sm text-muted-foreground">곧 추가될 예정입니다.</p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  )
}