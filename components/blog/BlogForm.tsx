"use client"

import { useState } from 'react'
import { Tag, Loader2 } from 'lucide-react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 폼 검증
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    
    if (!content.trim()) {
      alert('본문을 입력해주세요.')
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
      title,
      summary,
      content,
      tags,
      cover
    }
    onSaveDraft(formData)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
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

  const isFormValid = title.trim() && content.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="블로그 포스트 제목을 입력하세요"
          className="w-full p-3 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      {/* 요약 */}
      <div>
        <label className="block text-sm font-medium mb-2">요약</label>
        <textarea 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)} 
          rows={2}
          placeholder="포스트의 간단한 요약을 작성하세요..."
          className="w-full p-3 rounded-lg border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" 
        />
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
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
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
        </div>
      </div>

      {/* 본문 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          본문 <span className="text-red-500">*</span>
        </label>
        <MarkdownEditor 
          value={content} 
          onChange={setContent}
          placeholder="마크다운으로 블로그 포스트를 작성하세요..."
        />
      </div>

      {/* 표지 이미지 */}
      <div>
        <label className="block text-sm font-medium mb-2">표지 이미지</label>
        <ImageUploader onComplete={setCover} initial={cover} />
      </div>

      {/* 액션 버튼들 */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          취소
        </button>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
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