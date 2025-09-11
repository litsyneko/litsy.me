"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Lock, AlertCircle, Clock } from 'lucide-react'
import BlogForm, { type BlogFormData } from '@/components/blog/BlogForm'
import { saveDraft, loadDraft, clearDraft } from '@/lib/utils/draft'
import { useUser } from '@clerk/nextjs'
import { redirectToSignIn } from '@/lib/auth-redirects'

export default function NewPostClient() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialFormData, setInitialFormData] = useState<Partial<BlogFormData>>({})
  const [draftInfo, setDraftInfo] = useState<{ 
    exists: boolean; 
    lastSaved: Date | null; 
    status: 'idle' | 'saving' | 'saved' | 'error';
    error?: string;
  }>({ 
    exists: false, 
    lastSaved: null, 
    status: 'idle' 
  })
  const [postId, setPostId] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [forbidden, setForbidden] = useState<boolean>(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const lastFormData = useRef<BlogFormData | null>(null)
  const [urlPostId, setUrlPostId] = useState<string | null>(null)

  // Handle form changes
  const handleFormChange = useCallback((formData: BlogFormData) => {
    lastFormData.current = formData
  }, [])
  
  useEffect(() => {
    if (!isLoaded) return
    
    // URL에서 postId 가져오기
    const postId = searchParams?.get('postId') || null
    setUrlPostId(postId)
  }, [isLoaded, searchParams])

    const run = async () => {
      setLoadingState(true)
      setForbidden(false)

      if (!isSignedIn) {
        setLoadingState(false)
        return
      }

      try {
        const permRes = await fetch('/api/blog?mode=all')
        if (permRes.status === 403) {
          setForbidden(true)
          setLoadingState(false)
          return
        }
      } catch (err) {
        console.error('Permission check failed:', err)
      }

      const draft = loadDraft()

      if (urlPostId) {
        try {
          const res = await fetch(`/api/blog?postId=${urlPostId}`)
          if (res.ok) {
            const json = await res.json()
            if (json.post) {
              const p = json.post
              setInitialFormData({ title: p.title, summary: p.summary || '', content: p.content || '', tags: p.tags || [], cover: p.cover || '' })
              setPostId(p.id)
              setDraftInfo({ exists: true, lastSaved: p.updated_at ? new Date(p.updated_at) : new Date(), status: 'saved' })
              setLoadingState(false)
              return
            }
          }
        } catch (e) {
          console.error('Failed to fetch post by postId:', e)
        }
      }

      if (draft) {
        setInitialFormData({
          title: draft.title,
          summary: draft.summary,
          content: draft.content,
          tags: draft.tags,
          cover: draft.cover,
        })
        setDraftInfo({ exists: true, lastSaved: new Date(draft.lastSaved), status: 'saved' })
      } else {
        setDraftInfo({ exists: false, lastSaved: null, status: 'idle' })
      }

      setLoadingState(false)
    }

    run()
  }, [isLoaded, isSignedIn, urlPostId])

  const prevSignedInRef = useRef<boolean>(isSignedIn)
  useEffect(() => {
    if (!isLoaded) {
      prevSignedInRef.current = isSignedIn
      return
    }

    if (!prevSignedInRef.current && isSignedIn) {
      try {
        const local = loadDraft()
        if (local && window.confirm('임시 저장된 글이 있습니다. 불러오시겠습니까?')) {
          setInitialFormData({
            title: local.title || '',
            summary: local.summary || '',
            content: local.content || '',
            tags: local.tags || [],
            cover: local.cover || '',
          })
          setDraftInfo({ 
            exists: true, 
            lastSaved: new Date(local.lastSaved),
            status: 'saved' 
          })
        }
      } catch (e) {
        console.error('Draft restore check failed:', e)
      }
    }

    prevSignedInRef.current = isSignedIn
  }, [isLoaded, isSignedIn])

  const handleSubmit = async (formData: BlogFormData) => {
    if (!user) {
      setDraftInfo(prev => ({ ...prev, status: 'error', error: '로그인이 필요합니다.' }))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          author: user.id,
          username: user.username || '',
          postId: postId, 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create post')
      }

      const result = await response.json()
      
      // Clear the draft after successful submission
      clearDraft()
      
      router.push(`/blog/${result.post.slug}`)
      router.refresh()
    } catch (error) {
      console.error('Error creating post:', error)
      setDraftInfo(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : '게시물 저장 중 오류가 발생했습니다.'
      }))
      
      try {
        // Save the current form data to local storage as a fallback
        saveDraft({
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          tags: formData.tags,
          cover: formData.cover,
          lastSaved: new Date().toISOString(),
          postId: postId || undefined
        })
        alert('서버 저장에 실패하여 로컬에 임시 저장되었습니다.')
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError)
        alert('포스트 저장에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (draftInfo.status === 'saving' && !window.confirm('저장 중인 내용이 있습니다. 계속하시겠습니까?')) {
      return
    }
    if (window.confirm('작성 중인 내용은 자동으로 저장됩니다. 블로그 목록으로 이동하시겠습니까?')) {
      router.push('/blog')
    }
  }

  const handleManualSaveDraft = async (formData: BlogFormData) => {
    try {
      if (!isSignedIn || !user) {
        saveDraft(formData)
        setDraftInfo({ exists: true, lastSaved: new Date(), status: 'saved' })
        alert('임시 저장되었습니다. (로컬)')
        return
      }

      const payload: any = {
        ...formData,
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
        saveDraft({ ...formData, postId: saved.id })
      } else {
        saveDraft(formData)
      }

      setDraftInfo({ exists: true, lastSaved: new Date(), status: 'saved' })
      alert('서버에 임시 저장되었습니다.')
    } catch (err) {
      console.error('Error saving draft to server, falling back to local:', err)
      saveDraft(formData)
      setDraftInfo({ exists: true, lastSaved: new Date(), status: 'saved' })
      alert('임시 저장되었습니다. (로컬)')
    }
  }

  if (!isLoaded || loadingState) {
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
            <button onClick={() => redirectToSignIn()} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
              로그인
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (forbidden) {
    return (
      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">권한이 없습니다</h1>
          <p className="text-muted-foreground mb-6">블로그 작성 권한이 없습니다. 문의해주세요.</p>
          <div className="space-x-4">
            <button onClick={() => router.push('/blog')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              블로그 홈으로
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2">새 글 작성</h1>
          <div className="flex items-center space-x-4">
            {draftInfo.status === 'saving' && (
              <div className="flex items-center text-yellow-600 text-sm">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                저장 중...
              </div>
            )}
            {draftInfo.status === 'saved' && draftInfo.lastSaved && (
              <div className="flex items-center text-green-600 text-sm">
                <span className="mr-1">✓</span>
                <span>마지막 저장: {draftInfo.lastSaved.toLocaleString('ko-KR')}</span>
              </div>
            )}
            {draftInfo.status === 'error' && (
              <div className="flex items-center text-red-600 text-sm">
                <span className="mr-1">⚠️</span>
                <span>{draftInfo.error || '저장 중 오류 발생'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            작성자: {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || '알 수 없음'}
          </p>
          {draftInfo.exists && draftInfo.lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>임시 저장: {draftInfo.lastSaved.toLocaleString('ko-KR')}</span>
            </div>
          )}
        </div>
      </div>

      <BlogForm 
        initialData={initialFormData} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        onManualSave={handleManualSaveDraft}
        onFormChange={handleFormChange}
        isSubmitting={isSubmitting} 
        submitLabel="발행하기" 
      />
    </main>
  )
}