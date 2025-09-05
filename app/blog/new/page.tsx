"use client"

import { useState } from 'react'
import ImageUploader from '@/components/blog/ImageUploader'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [cover, setCover] = useState('')
  const router = useRouter()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const post = {
      id: `${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      summary,
      content,
      date: new Date().toISOString(),
      tags: [],
      author: 'litsy25',
      cover
    }
    // 먼저 API에 POST 시도
    const url = '/api/posts'
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(post) })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`)
        return res.json()
      }).then(() => {
        router.push('/blog')
      }).catch(() => {
        // 실패 시 localStorage에 저장(오프라인/개발용 폴백)
        try {
          const raw = localStorage.getItem('posts')
          const arr = raw ? JSON.parse(raw) : []
          arr.unshift(post)
          localStorage.setItem('posts', JSON.stringify(arr))
        } catch (err) {
          // ignore
        }
        router.push('/blog')
      })
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">새 글 작성</h1>
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-md border bg-card" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">요약</label>
          <input value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full p-3 rounded-md border bg-card" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">본문</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="w-full p-3 rounded-md border bg-card" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">표지 이미지</label>
          <ImageUploader onComplete={(d) => setCover(d)} initial={cover} />
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-primary text-white rounded">저장</button>
        </div>
      </form>
    </main>
  )
}
