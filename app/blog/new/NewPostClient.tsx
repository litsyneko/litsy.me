"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, AlertCircle, Clock } from 'lucide-react'
import BlogForm, { type BlogFormData } from '@/components/blog/BlogForm'
// import { checkBlogWritePermission, hasWritePermission, type BlogAuthUser } from '@/lib/utils/blog-auth' // 제거 예정
import { createSupabaseClient } from '@/lib/supabase'
import { BlogService } from '@/lib/services/blog'
import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftLastSaved } from '@/lib/utils/draft'
import type { UserProfile } from '@/lib/supabase' // UserProfile 타입 가져오기

interface BlogAuthStatus {
  hasPermission: boolean;
  user: UserProfile | null; // UserProfile 타입 사용
  error: string | null;
}

export default function NewPostClient() {
  const [authStatus, setAuthStatus] = useState<BlogAuthStatus>({ hasPermission: false, user: null, error: null })
  const [authLoading, setAuthLoading] = useState(true)
  // const [authError, setAuthError] = useState<string | null>(null) // authStatus에 포함되므로 제거
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialFormData, setInitialFormData] = useState<Partial<BlogFormData>>({})
  const [draftInfo, setDraftInfo] = useState<{ exists: boolean; lastSaved: Date | null }>({
    exists: false,
    lastSaved: null
  })
  
  const router = useRouter()
  const supabase = createSupabaseClient()
  const blogService = new BlogService(supabase)

  // 권한 체크 및 드래프트 불러오기
  useEffect(() => {
    const fetchAuthStatusAndDraft = async () => {
      try {
        setAuthLoading(true)
        // setAuthError(null) // authStatus에 포함되므로 제거
        
        // 새로운 API 라우트에서 권한 상태 가져오기
        const response = await fetch('/api/auth/status')
        const data: BlogAuthStatus = await response.json()
        setAuthStatus(data)
        
        // 권한이 없으면 블로그 홈으로 리다이렉트
        if (!data.hasPermission) {
          router.push('/blog')
          return
        }
        
        // 드래프트 불러오기
        const draft = loadDraft()
        if (draft) {
          setInitialFormData({
            title: draft.title,
            summary: draft.summary,
            content: draft.content,
            tags: draft.tags,
            cover: draft.cover
          })
          setDraftInfo({
            exists: true,
            lastSaved: new Date(draft.lastSaved)
          })
        } else {
          setDraftInfo({
            exists: false,
            lastSaved: null
          })
        }
        
      } catch (error) {
        console.error('Error fetching auth status or draft:', error)
        setAuthStatus(prev => ({ ...prev, error: '권한 확인 중 오류가 발생했습니다.' }))
      } finally {
        setAuthLoading(false)
      }
    }

    fetchAuthStatusAndDraft()
  }, [router])

  // 폼 제출 핸들러
  const handleSubmit = async (formData: BlogFormData) => {
    // 권한 재확인
    if (!authStatus.hasPermission) { // authStatus 사용
      alert('블로그 작성 권한이 없습니다.')
      return
    }

    setIsSubmitting(true)

    try {
      // BlogService를 사용하여 포스트 생성
      const postData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags,
        cover: formData.cover,
        // author 필드는 DB에서 필요 없음, author_id로 대체
        user_id: authStatus.user?.id || '' // authStatus.user?.id 사용
      }
      
      const result = await blogService.createPost(postData)
      console.log('Post created:', result)
      
      // 드래프트 삭제
      clearDraft()
      
      // 성공 시 블로그 홈으로 이동
      router.push('/blog')
      
    } catch (error) {
      console.error('Error creating post:', error)
      
      // 실패 시 로컬스토리지에 저장 (폴백)
      try {
        const fallbackPost = {
          id: `${Date.now()}`,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, ''),
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          date: new Date().toISOString(),
          tags: formData.tags,
          // author 필드 제거, user_id만 저장
          user_id: authStatus.user?.id || '', // authStatus.user?.id 사용
          cover: formData.cover
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

  // 취소 핸들러
  const handleCancel = () => {
    router.push('/blog')
  }

  // 드래프트 저장 핸들러
  const handleSaveDraft = (formData: BlogFormData) => {
    saveDraft(formData)
    setDraftInfo({
      exists: true,
      lastSaved: new Date()
    })
    alert('임시 저장되었습니다.')
  }

  // 로딩 중
  if (authLoading) {
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

  // 권한 없음
  if (!authStatus.hasPermission) { // authStatus 사용
    return (
      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center py-20">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h1>
          <p className="text-muted-foreground mb-6">
            {authStatus.user ? ( // authStatus.user 사용
              <>
                현재 사용자: {authStatus.user.display_name || authStatus.user.username || authStatus.user.email || '알 수 없음'}
                <br />
                블로그 작성 권한이 필요합니다.
              </>
            ) : (
              '로그인이 필요합니다.'
            )}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/blog')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              블로그 홈으로
            </button>
            {!authStatus.user && ( // authStatus.user 사용
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </main>
    )
  }

  // 오류 발생
  if (authStatus.error) { // authStatus.error 사용
    return (
      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">오류가 발생했습니다</h1>
          <p className="text-muted-foreground mb-6">{authStatus.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">새 글 작성</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            작성자: {authStatus.user?.display_name || authStatus.user?.username || authStatus.user?.email || '알 수 없음'} // authStatus.user?.display_name 또는 username 사용
          </p>
          
          {/* 드래프트 정보 */}
          {draftInfo.exists && draftInfo.lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                임시 저장: {draftInfo.lastSaved.toLocaleString('ko-KR')}
              </span>
            </div>
          )}
        </div>
      </div>

      <BlogForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
        submitLabel="발행하기"
      />
    </main>
  )
}