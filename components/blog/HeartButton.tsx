"use client"

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

interface Props {
  slug: string
}

export default function HeartButton({ slug }: Props) {
  const storageKey = `likes:${slug}`
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
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
  }, [storageKey])

  const toggle = () => {
    const nextLiked = !liked
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1)
    setLiked(nextLiked)
    setCount(nextCount)
    localStorage.setItem(storageKey, JSON.stringify({ count: nextCount, liked: nextLiked }))
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${liked ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground'}`}
      aria-pressed={liked}
    >
      <Heart className="w-4 h-4" />
      <span className="text-sm font-medium">{count}</span>
    </button>
  )
}
