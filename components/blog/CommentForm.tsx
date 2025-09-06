"use client"

import { useState } from 'react'

interface Comment {
  id: string
  post_id: string
  author_name: string
  author_avatar?: string | null
  content: string
  created_at: string
}

interface Props {
  slug: string
  onNewComment: (c: Comment) => void
}

export default function CommentForm({ slug, onNewComment }: Props) {
  const [text, setText] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: slug,
          content: text.trim(),
        })
      })
      if (!res.ok) throw new Error('댓글 등록 실패')
      const comment: Comment = await res.json()
      
      // onNewComment 콜백의 타입 시그니처와 맞추기 위해
      // API 응답 필드명을 text, createdAt으로 변환
      const formattedComment = {
        ...comment,
        text: comment.content,
        createdAt: comment.created_at
      };

      onNewComment(formattedComment as any) // 임시로 any 사용
      setText('')
    } catch (err) {
      alert('댓글 등록 중 오류가 발생했습니다.')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="댓글을 작성하세요"
        className="w-full p-3 rounded-md border bg-card"
        rows={3}
      />
      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-md bg-primary text-white">댓글 등록</button>
      </div>
    </form>
  )
}
