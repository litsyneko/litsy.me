"use client"

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'

interface Props {
  slug: string
  postId?: string
}

export default function HeartButton({ slug, postId }: Props) {
  const storageKey = `likes:${slug}`
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    // 로컬 스토리지에서 좋아요 상태 불러오기
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const data = JSON.parse(raw)
        setCount(data.count || 0)
        setLiked(!!data.liked)
      }
    } catch (e) {
      // ignore
    }

    // 서버에서 좋아요 수 불러오기 (향후 구현)
    if (postId) {
      fetchLikeCount()
    }
  }, [storageKey, postId])

  const fetchLikeCount = async () => {
    try {
      // 향후 API 구현 시 사용
      // const response = await fetch(`/api/posts/${postId}/likes`)
      // const data = await response.json()
      // setCount(data.count)
    } catch (error) {
      console.error('Failed to fetch like count:', error)
    }
  }

  const toggle = async () => {
    if (loading) return

    setLoading(true)
    setAnimating(true)

    try {
      const nextLiked = !liked
      const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1)
      
      // Optimistic update
      setLiked(nextLiked)
      setCount(nextCount)

      // 로컬 스토리지에 저장
      localStorage.setItem(storageKey, JSON.stringify({ 
        count: nextCount, 
        liked: nextLiked,
        timestamp: Date.now()
      }))

      // 서버에 동기화 (향후 구현)
      if (postId) {
        try {
          // const response = await fetch(`/api/posts/${postId}/likes`, {
          //   method: nextLiked ? 'POST' : 'DELETE',
          //   headers: { 'Content-Type': 'application/json' }
          // })
          // if (!response.ok) {
          //   throw new Error('Failed to sync like')
          // }
        } catch (error) {
          console.error('Failed to sync like:', error)
          // 실패 시 롤백
          setLiked(!nextLiked)
          setCount(count)
        }
      }

      // 애니메이션 완료 후 상태 초기화
      setTimeout(() => {
        setAnimating(false)
        setLoading(false)
      }, 300)

    } catch (error) {
      console.error('Failed to toggle like:', error)
      setLoading(false)
      setAnimating(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
        ${liked 
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }
        ${animating ? 'scale-110' : 'scale-100'}
        ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
      `}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart 
          className={`w-4 h-4 transition-all duration-200 ${
            liked ? 'fill-current' : ''
          }`} 
        />
      )}
      <span className="text-sm font-medium">
        {count > 0 ? count : ''}
      </span>
    </button>
  )
}