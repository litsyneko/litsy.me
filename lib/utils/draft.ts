import type { BlogFormData } from '@/components/blog/BlogForm'

const DRAFT_KEY = 'blog-draft'

export interface DraftData extends BlogFormData {
  lastSaved: string
  postId?: string | null
}

/**
 * 드래프트 저장
 */
export function saveDraft(data: Partial<DraftData> | BlogFormData): void {
  try {
    const draftData: DraftData = {
      title: (data as any).title || '',
      summary: (data as any).summary || '',
      content: (data as any).content || '',
      tags: (data as any).tags || [],
      cover: (data as any).cover || '',
      lastSaved: new Date().toISOString(),
      postId: (data as any).postId || null,
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

/**
 * 드래프트 불러오기
 */
export function loadDraft(): DraftData | null {
  try {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (!draft) return null
    
    const parsed = JSON.parse(draft) as DraftData
    
    // 7일 이상 된 드래프트는 삭제
    const lastSaved = new Date(parsed.lastSaved)
    const now = new Date()
    const daysDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysDiff > 7) {
      clearDraft()
      return null
    }
    
    return parsed
  } catch (error) {
    console.error('Error loading draft:', error)
    return null
  }
}

/**
 * 드래프트 삭제
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch (error) {
    console.error('Error clearing draft:', error)
  }
}

/**
 * 드래프트 존재 여부 확인
 */
export function hasDraft(): boolean {
  return loadDraft() !== null
}

/**
 * 드래프트 마지막 저장 시간 가져오기
 */
export function getDraftLastSaved(): Date | null {
  const draft = loadDraft()
  return draft ? new Date(draft.lastSaved) : null
}

/**
 * 드래프트를 BlogFormData로 변환
 */
export function draftToFormData(draft: DraftData): BlogFormData {
  return {
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    tags: draft.tags,
    cover: draft.cover
  }
}