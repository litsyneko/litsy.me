"use client"

import { useState, useEffect } from 'react'
import { Tag, Loader2, AlertCircle, CheckCircle, Save, Eye, EyeOff, History, Trash2, Undo2 } from 'lucide-react'
import ImageUploader from './ImageUploader'
import MarkdownEditor from './MarkdownEditor'
import { loadDraftVersions, restoreDraftVersion, deleteDraftVersion } from '@/lib/utils/draft'

export interface BlogFormData {
  title: string
  summary: string
  content: string
  tags: string[]
  cover: string
}

interface BlogFormProps {
  initialData?: Partial<BlogFormData>
  onSubmit: (data: BlogFormData) => Promise<void>
  onCancel: () => void
  onAutoSave?: (data: BlogFormData) => void;
  onManualSave?: (data: BlogFormData) => Promise<void>;
  onFormChange?: (data: BlogFormData, isDirty: boolean) => void
  isSubmitting?: boolean
  submitLabel?: string
}

interface FormErrors {
  title?: string
  content?: string
  summary?: string
}

export default function BlogForm({
  initialData = {},
  onSubmit,
  onCancel,
  onAutoSave,
  onManualSave,
  onFormChange,
  isSubmitting = false,
  submitLabel = '발행하기'
}: BlogFormProps) {
  const [title, setTitle] = useState(initialData.title || '')
  const [summary, setSummary] = useState(initialData.summary || '')
  const [content, setContent] = useState(initialData.content || '')
  const [cover, setCover] = useState(initialData.cover || '')
  const [tags, setTags] = useState<string[]>(initialData.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPreview, setShowPreview] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [draftVersions, setDraftVersions] = useState<import('@/lib/utils/draft').DraftData[]>([])

  // 폼 변경 감지
  useEffect(() => {
    const hasChanges = 
      title !== (initialData.title || '') ||
      summary !== (initialData.summary || '') ||
      content !== (initialData.content || '') ||
      cover !== (initialData.cover || '') ||
      JSON.stringify(tags) !== JSON.stringify(initialData.tags || [])
    
    if (hasChanges && !isDirty) setIsDirty(true);
    if (!hasChanges && isDirty) setIsDirty(false);
    
    // 폼 변경사항이 있으면 부모 컴포넌트에 알림
    if (onFormChange) {
      onFormChange({
        title,
        summary,
        content,
        tags,
        cover,
      }, isDirty);
    }
  }, [title, summary, content, cover, tags, initialData, isDirty, onFormChange])

  // 변경 시마다(300ms 디바운스) 자동 저장
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        const formData: BlogFormData = {
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          tags,
          cover,
        };
        if (onAutoSave) {
          onAutoSave(formData);
        }
        setLastSaved(new Date());
        setIsDirty(false); // 저장 후 dirty 해제
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [title, summary, content, tags, cover, isDirty, onAutoSave]);

  // 버전 히스토리 불러오기
  useEffect(() => {
    if (showHistory) {
      setDraftVersions(loadDraftVersions())
    }
  }, [showHistory])

  // 버전 복원
  const handleRestoreVersion = (idx: number) => {
    const restored = restoreDraftVersion(idx)
    if (restored) {
      setTitle(restored.title)
      setSummary(restored.summary)
      setContent(restored.content)
      setTags(restored.tags)
      setCover(restored.cover)
      setShowHistory(false)
      setLastSaved(new Date(restored.lastSaved))
    }
  }

  // 버전 삭제
  const handleDeleteVersion = (idx: number) => {
    deleteDraftVersion(idx)
    setDraftVersions(loadDraftVersions())
  }

  // 폼 유효성 검사
  const isFormValid = (): boolean => {
    const newErrors: FormErrors = {}
    if (!title.trim()) newErrors.title = '제목을 입력해주세요.'
    if (!content.trim()) newErrors.content = '내용을 입력해주세요.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.'
    } else if (title.trim().length < 2) {
      newErrors.title = '제목은 2자 이상이어야 합니다.'
    } else if (title.trim().length > 100) {
      newErrors.title = '제목은 100자 이하여야 합니다.'
    }

    if (!content.trim()) {
      newErrors.content = '본문을 입력해주세요.'
    } else if (content.trim().length < 10) {
      newErrors.content = '본문은 10자 이상이어야 합니다.'
    }

    if (summary.trim().length > 200) {
      newErrors.summary = '요약은 200자 이하여야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const formData: BlogFormData = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags,
      cover
    }

    await onSubmit(formData)
  }

  const handleSaveDraft = async () => {
    const formData: BlogFormData = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags,
      cover
    }
    if (onManualSave) {
      await onManualSave(formData)
    }
    setLastSaved(new Date())
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 상태 표시 및 버전 히스토리 */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          {isDirty ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-300">저장되지 않은 변경사항</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700 dark:text-green-300">모든 변경사항 저장됨</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Save className="w-3 h-3" />
              <span>마지막 저장: {lastSaved.toLocaleTimeString('ko-KR')}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-xs text-muted-foreground border border-border"
            title="버전 히스토리"
          >
            <History className="w-4 h-4" />
            히스토리
          </button>
        </div>
      </div>

      {/* 버전 히스토리 모달 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowHistory(false)}
              title="닫기"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" /> 버전 히스토리
            </h3>
            {draftVersions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">저장된 버전이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {draftVersions.map((v, idx) => (
                  <li key={idx} className="flex flex-col border rounded p-2 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm truncate max-w-[70%]">{v.title || <span className="italic text-muted-foreground">(제목 없음)</span>}</div>
                      <div className="text-xs text-muted-foreground">{new Date(v.lastSaved).toLocaleString('ko-KR')}</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80 text-xs"
                        onClick={() => handleRestoreVersion(idx)}
                        title="이 버전으로 복원"
                      >
                        <Undo2 className="w-4 h-4" /> 복원
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/80 text-xs"
                        onClick={() => handleDeleteVersion(idx)}
                        title="이 버전 삭제"
                      >
                        <Trash2 className="w-4 h-4" /> 삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="블로그 포스트 제목을 입력하세요"
          className={`w-full p-3 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-red-500' : ''}`}
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.title}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {title.length}/100자
        </p>
      </div>

      {/* 요약 */}
      <div>
        <label className="block text-sm font-medium mb-2">요약</label>
        <textarea 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)} 
          rows={3}
          placeholder="포스트의 간단한 요약을 작성하세요..."
          className={`w-full p-3 rounded-lg border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.summary ? 'border-red-500' : ''}`}
        />
        {errors.summary && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.summary}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {summary.length}/200자
        </p>
      </div>

      {/* 태그 */}
      <div>
        <label className="block text-sm font-medium mb-2">태그</label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그를 입력하고 Enter 또는 쉼표를 누르세요"
              className="flex-1 p-3 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={tags.length >= 10}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={tags.length >= 10}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
              title="태그 추가"
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="hover:text-primary/70 ml-1 text-lg leading-none"
                    title="태그 삭제"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            최대 10개까지 추가할 수 있습니다. ({tags.length}/10)
          </p>
        </div>
      </div>

      {/* 본문 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">
            본문 <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                편집 모드
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                미리보기
              </>
            )}
          </button>
        </div>
        
        {showPreview ? (
          <div 
            className="min-h-[400px] p-4 border rounded-lg bg-card prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: content ? content.replace(/\n/g, '<br>') : '<p class="text-muted-foreground">미리보기할 내용이 없습니다.</p>'
            }}
          />
        ) : (
          <MarkdownEditor 
            value={content} 
            onChange={setContent}
            placeholder="마크다운으로 블로그 포스트를 작성하세요..."
          />
        )}
        
        {errors.content && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.content}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {content.length}자
        </p>
      </div>

      {/* 표지 이미지 */}
      <div>
        <label className="block text-sm font-medium mb-2">표지 이미지</label>
        <ImageUploader onComplete={setCover} initial={cover} />
      </div>

      {/* 액션 버튼들 */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!isDirty || isSubmitting}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>임시 저장</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <div className="text-sm text-muted-foreground">
              마지막 저장: {new Date(lastSaved).toLocaleString()}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>미리보기 닫기</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>미리보기</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <History className="h-4 w-4" />
            <span>버전 기록</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <span>{submitLabel}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
