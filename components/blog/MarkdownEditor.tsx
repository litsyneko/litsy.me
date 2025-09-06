"use client"

import { useState } from 'react'
import { Eye, Edit, Bold, Italic, Link, List, ListOrdered, Quote, Code, Image, Heading1, Heading2, Heading3 } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MarkdownEditor({ value, onChange, placeholder = "마크다운으로 작성하세요..." }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

  // 텍스트 삽입 헬퍼 함수
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef) return

    const start = textareaRef.selectionStart
    const end = textareaRef.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    onChange(newText)

    // 커서 위치 조정
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = start + before.length + textToInsert.length
        textareaRef.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.focus()
      }
    }, 0)
  }

  // 라인 시작에 텍스트 삽입
  const insertAtLineStart = (prefix: string) => {
    if (!textareaRef) return

    const start = textareaRef.selectionStart
    const lines = value.split('\n')
    let currentPos = 0
    let lineIndex = 0

    // 현재 커서가 있는 라인 찾기
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= start) {
        lineIndex = i
        break
      }
      currentPos += lines[i].length + 1 // +1 for newline
    }

    lines[lineIndex] = prefix + lines[lineIndex]
    const newText = lines.join('\n')
    onChange(newText)

    // 커서 위치 조정
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = start + prefix.length
        textareaRef.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.focus()
      }
    }, 0)
  }

  // 간단한 마크다운 렌더링
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-muted pl-4 italic text-muted-foreground">$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n/g, '<br>')
  }

  const toolbarButtons = [
    { icon: Heading1, action: () => insertAtLineStart('# '), title: '제목 1' },
    { icon: Heading2, action: () => insertAtLineStart('## '), title: '제목 2' },
    { icon: Heading3, action: () => insertAtLineStart('### '), title: '제목 3' },
    { icon: Bold, action: () => insertText('**', '**', '굵은 텍스트'), title: '굵게' },
    { icon: Italic, action: () => insertText('*', '*', '기울임 텍스트'), title: '기울임' },
    { icon: Code, action: () => insertText('`', '`', '코드'), title: '인라인 코드' },
    { icon: Link, action: () => insertText('[', '](url)', '링크 텍스트'), title: '링크' },
    { icon: Image, action: () => insertText('![', '](image-url)', '이미지 설명'), title: '이미지' },
    { icon: List, action: () => insertAtLineStart('- '), title: '목록' },
    { icon: ListOrdered, action: () => insertAtLineStart('1. '), title: '번호 목록' },
    { icon: Quote, action: () => insertAtLineStart('> '), title: '인용' },
  ]

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* 툴바 */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.action}
              title={button.title}
              className="p-2 hover:bg-muted rounded transition-colors"
            >
              <button.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              !isPreview ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <Edit className="w-4 h-4 inline mr-1" />
            편집
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              isPreview ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            미리보기
          </button>
        </div>
      </div>

      {/* 편집기/미리보기 영역 */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div 
            className="p-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: value ? renderMarkdown(value) : '<p class="text-muted-foreground">미리보기할 내용이 없습니다.</p>' 
            }}
          />
        ) : (
          <textarea
            ref={setTextareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[400px] p-4 resize-none border-0 bg-transparent focus:outline-none font-mono text-sm"
          />
        )}
      </div>

      {/* 하단 도움말 */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <span><code>**굵게**</code></span>
          <span><code>*기울임*</code></span>
          <span><code>`코드`</code></span>
          <span><code>[링크](url)</code></span>
          <span><code>![이미지](url)</code></span>
          <span><code># 제목</code></span>
          <span><code>- 목록</code></span>
          <span><code>&gt; 인용</code></span>
        </div>
      </div>
    </div>
  )
}