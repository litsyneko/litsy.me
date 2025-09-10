"use client"

import { useEffect, useState } from 'react'

interface Comment {
  id: string
  author_name: string
  author_avatar?: string | null
  content: string
  created_at: string
}

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?post_id=${postId}`)
        if (!res.ok) throw new Error('댓글 로딩 실패')
        const data: Comment[] = await res.json()
        setComments(data)
      } catch (e) {
        // ignore
      }
    }
    fetchComments()
  }, [postId])

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
  }

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id} className="p-3 bg-card rounded-md border">
          <div className="flex items-center mb-2">
            {c.author_avatar && (
              <img src={c.author_avatar} alt={c.author_name} className="w-6 h-6 rounded-full mr-2" />
            )}
            <span className="text-sm font-semibold">{c.author_name}</span>
            <span className="text-xs text-muted-foreground ml-2">{new Date(c.created_at).toLocaleString()}</span>
          </div>
          <div className="text-sm">{c.content}</div>
        </div>
      ))}
    </div>
  )
}
