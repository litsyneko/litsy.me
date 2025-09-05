"use client"

import { useEffect, useState } from 'react'

interface Comment {
  id: string
  text: string
  createdAt: string
}

export default function CommentList({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`comments:${slug}`)
      const arr = raw ? JSON.parse(raw) : []
      setComments(arr)
    } catch (e) {
      // ignore
    }
  }, [slug])

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
  }

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id} className="p-3 bg-card rounded-md border">
          <div className="text-sm text-muted-foreground mb-1">{new Date(c.createdAt).toLocaleString()}</div>
          <div className="text-sm">{c.text}</div>
        </div>
      ))}
    </div>
  )
}
