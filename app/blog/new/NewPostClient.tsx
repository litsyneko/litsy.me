"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, AlertCircle, Clock } from 'lucide-react'
import BlogForm, { type BlogFormData } from '@/components/blog/BlogForm'
import { saveDraft, loadDraft, clearDraft } from '@/lib/utils/draft'
import { useUser } from '@clerk/nextjs'

export default function NewPostClient() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialFormData, setInitialFormData] = useState<Partial<BlogFormData>>({})
  const [draftInfo, setDraftInfo] = useState<{ exists: boolean; lastSaved: Date | null }>({ exists: false, lastSaved: null })
  const [postId, setPostId] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState<boolean>(true)

  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setLoadingState(false)
      return
    }

    const draft = loadDraft()
    if (draft) {
      setInitialFormData({
        title: draft.title,
        summary: draft.summary,
        content: draft.content,
        tags: draft.tags,
        cover: draft.cover,
      })
      setDraftInfo({ exists: true, lastSaved: new Date(draft.lastSaved) })
    } else {
      setDraftInfo({ exists: false, lastSaved: null })
    }

    setLoadingState(false)
  }, [isLoaded, isSignedIn])

  const handleSubmit = async (formData: BlogFormData) => {
    if (!isSignedIn || !user) {
      alert('로그인이 필요합니다.')
      router.push('/sign-in')
      return
    }

    setIsSubmitting(true)
    try {
      const postData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags,
        cover: formData.cover,
        author: user.fullName || user.firstName || user.username || user.primaryEmailAddress?.emailAddress || '',
  published: true,
  postId: postId || undefined,
      }

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Failed to create post')
      }

  clearDraft()
  setPostId(null)
      router.push('/blog')
    } catch (error) {
      console.error('Error creating post:', error)
      try {
        const fallbackPost = {
          id: `${Date.now()}`,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, ''),
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          date: new Date().toISOString(),
          tags: formData.tags,
          user_id: user?.id || '',
          cover: formData.cover,
        }

        const raw = localStorage.getItem('posts')
        const arr = raw ? JSON.parse(raw) : []
        arr.unshift(fallbackPost)
        localStorage.setItem('posts', JSON.stringify(arr))

        alert('서버 저장에 실패했지만 로컬에 임시 저장되었습니다.')
        router.push('/blog')
      } catch (localError) {
        alert('포스트 저장에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => router.push('/blog')

  const handleSaveDraft = async (formData: BlogFormData) => {
    try {
      if (!isSignedIn || !user) {
        saveDraft(formData)
        setDraftInfo({ exists: true, lastSaved: new Date() })
        alert('임시 저장되었습니다. (로컬)')
        return
      }

      const payload: any = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags,
        cover: formData.cover,
        author: user.fullName || user.firstName || user.username || user.primaryEmailAddress?.emailAddress || '',
        published: false,
      }
      if (postId) payload.postId = postId

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save draft')

      const saved = json.post
      if (saved?.id) {
        setPostId(saved.id)
        saveDraft({ ...formData, postId: saved.id } as any)
      } else {
        saveDraft(formData)
      }

      setDraftInfo({ exists: true, lastSaved: new Date() })
      alert('서버에 임시 저장되었습니다.')
    } catch (err) {
      console.error('Error saving draft to server, falling back to local:', err)
      saveDraft(formData)
      setDraftInfo({ exists: true, lastSaved: new Date() })
      alert('임시 저장되었습니다. (로컬)')
    }
  }

  if (loadingState) {
    return (
      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">권한을 확인하는 중...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center py-20">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h1>
          <p className="text-muted-foreground mb-6">로그인이 필요합니다.</p>
          <div className="space-x-4">
            <button onClick={() => router.push('/blog')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              블로그 홈으로
            </button>
            <button onClick={() => router.push('/sign-in')} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
              로그인
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">새 글 작성</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">작성자: {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || '알 수 없음'}</p>
          {draftInfo.exists && draftInfo.lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>임시 저장: {draftInfo.lastSaved.toLocaleString('ko-KR')}</span>
            </div>
          )}
        </div>
      </div>

      <BlogForm initialData={initialFormData} onSubmit={handleSubmit} onCancel={handleCancel} onSaveDraft={handleSaveDraft} isSubmitting={isSubmitting} submitLabel="발행하기" />
    </main>
  )
}