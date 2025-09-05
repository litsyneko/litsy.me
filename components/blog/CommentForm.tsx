"use client"

import { useState } from 'react'

interface Props {
  slug: string
  onNewComment: (c: { id: string; text: string; createdAt: string }) => void
}

export default function CommentForm({ slug, onNewComment }: Props) {
  const [text, setText] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const comment = { id: `${Date.now()}`, text: text.trim(), createdAt: new Date().toISOString() }
    // 로컬 스토리지에 먼저 저장
    try {
      const key = `comments:${slug}`
      const raw = localStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift(comment)
      localStorage.setItem(key, JSON.stringify(arr))
    } catch (err) {
      // ignore
    }

    onNewComment(comment)
    setText('')
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
