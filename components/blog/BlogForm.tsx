"use client"

import { useState, useEffect } from 'react'
import { Tag, Loader2, AlertCircle, CheckCircle, Save, Eye, EyeOff } from 'lucide-react'
import ImageUploader from './ImageUploader'
import MarkdownEditor from './MarkdownEditor'

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
  onSaveDraft: (data: BlogFormData) => void
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
  onSaveDraft,
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

  // 폼 변경 감지
  useEffect(() => {
    const hasChanges = 
      title !== (initialData.title || '') ||
      summary !== (initialData.summary || '') ||
      content !== (initialData.content || '') ||
      cover !== (initialData.cover || '') ||
      JSON.stringify(tags) !== JSON.stringify(initialData.tags || [])
    
    setIsDirty(hasChanges)
  }, [title, summary, content, cover, tags, initialData])

  // 자동 저장 (5초마다)
  useEffect(() => {
    if (!isDirty) return

    const timer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        const formData: BlogFormData = {
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          tags,
          cover
        }
        onSaveDraft(formData)
        setLastSaved(new Date())
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [title, summary, content, tags, cover, isDirty, onSaveDraft])

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

  const handleSaveDraft = () => {
    const formData: BlogFormData = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags,
      cover
    }
    onSaveDraft(formData)
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

  const isFormValid = title.trim() && content.trim() && Object.keys(errors).length === 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 상태 표시 */}
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
        
        {lastSaved && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Save className="w-3 h-3" />
            <span>마지막 저장: {lastSaved.toLocaleTimeString('ko-KR')}</span>
          </div>
        )}
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="블로그 포스트 제목을 입력하세요"
          className={`w-full p-3 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.title ? 'border-red-500' : ''
          }`}
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
          className={`w-full p-3 rounded-lg border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.summary ? 'border-red-500' : ''
          }`}
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
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          취소
        </button>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            임시 저장
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? '발행 중...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}