'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Youtube } from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { Palette } from 'lucide-react'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code as CodeIcon, 
  List, 
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube as YoutubeIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Code,
  SquareCode,
  CheckSquare,
  Square,
  Minus as MinusIcon,
  Quote,
  Code2,
  Undo,
  Redo,
  Type,
  CheckSquare,
  X,
  Check,
  Plus,
  Trash2,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = '내용을 작성하세요. 마크다운 문법을 지원합니다...',
  className = ''
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageTitle, setImageTitle] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [showYoutubeModal, setShowYoutubeModal] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showTableModal, setShowTableModal] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('plaintext')
  const [highlightColor, setHighlightColor] = useState('#fff176')
  const [textColor, setTextColor] = useState('#000000')
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [tableSize, setTableSize] = useState({ rows: 3, cols: 3 })
  const editorRef = useRef<HTMLDivElement>(null)
  const lowlight = createLowlight(common)

  useEffect(() => {
    lowlight.registerLanguage('html', html)
    lowlight.registerLanguage('css', css)
    lowlight.registerLanguage('js', js)
    lowlight.registerLanguage('ts', ts)
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CharacterCount.configure({
        limit: 20000,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return '제목을 입력하세요...'
          }
          return placeholder
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse w-full my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100',
        },
      }),
      Underline,
      Highlight,
      Color,
      TextStyle,
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none p-4 min-h-[200px]',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    setLinkUrl(previousUrl || '')
    setIsLinkModalOpen(true)
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return

    if (linkUrl) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      editor.chain().focus().setLink({ href: url }).run()
      setLinkUrl('')
      setIsLinkModalOpen(false)
    }
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return
    
    editor
      .chain()
      .focus()
      .setImage({ 
        src: imageUrl, 
        alt: imageAlt || '이미지',
        title: imageTitle || ''
      })
      .run()
    setImageUrl('')
    setImageAlt('')
    setImageTitle('')
    setIsImageModalOpen(false)
  }, [editor, imageUrl, imageAlt, imageTitle])

  const addYoutubeVideo = useCallback(() => {
    if (!editor || !youtubeUrl) return
    
    const videoId = youtubeUrl.includes('youtube.com/watch?v=')
      ? youtubeUrl.split('v=')[1].split('&')[0]
      : youtubeUrl.includes('youtu.be/')
      ? youtubeUrl.split('youtu.be/')[1].split('?')[0]
      : youtubeUrl
      
    if (videoId) {
      editor.chain().focus().setYoutubeVideo({ src: videoId }).run()
      setYoutubeUrl('')
      setIsYoutubeModalOpen(false)
    }
  }, [editor, youtubeUrl])

  const addTable = useCallback(() => {
    if (!editor) return
    
    editor
      .chain()
      .focus()
      .insertTable({
        rows: Math.max(1, Math.min(10, tableRows)),
        cols: Math.max(1, Math.min(10, tableCols)),
        withHeaderRow: true,
      })
      .run()
    setIsTableModalOpen(false)
  }, [editor, tableRows, tableCols])

  const setTextHighlight = useCallback(() => {
    if (!editor) return
    editor.chain().focus().setHighlight({ color: highlightColor }).run()
  }, [editor, highlightColor])

  const toggleFullscreen = () => {
    if (!editorRef.current) return
    
    if (!document.fullscreenElement) {
      editorRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!editor || !isMounted) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
        <div className="animate-pulse flex flex-col items-center space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // 링크 추가 함수
  const addLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkModalOpen(false)
    }
  }, [editor, linkUrl])

  // 이미지 추가 함수
  const addImage = useCallback(() => {
    if (imageUrl) {
      editor
        .chain()
        .focus()
        .setImage({ 
          src: imageUrl,
          title: imageTitle || undefined,
          alt: imageAlt || undefined 
        })
        .run()
      setImageUrl('')
      setImageTitle('')
      setImageAlt('')
      setIsImageModalOpen(false)
    }
  }, [editor, imageUrl, imageTitle, imageAlt])

  // 유튜브 동영상 추가 함수
  const addYoutubeVideo = useCallback(() => {
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
      setYoutubeUrl('')
      setIsYoutubeModalOpen(false)
    }
  }, [editor, youtubeUrl])

  // 테이블 추가 함수
  const addTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({
        rows: tableRows,
        cols: tableCols,
        withHeaderRow: true,
      })
      .run()
    setIsTableModalOpen(false)
  }, [editor, tableRows, tableCols])

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    isActive,
    title,
    icon: Icon,
    className = '',
  }: {
    onClick: () => void
    isActive?: boolean
    title: string
    icon: React.ElementType
    className?: string
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700',
        isActive ? 'bg-gray-200 dark:bg-gray-600' : '',
        className
      )}
      title={title}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  // 링크 모달 컴포넌트
  const LinkModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">링크 추가</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <Input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
              취소
            </Button>
            <Button onClick={addLink} disabled={!linkUrl}>
              추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // 이미지 모달 컴포넌트
  const ImageModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">이미지 추가</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이미지 URL</label>
            <Input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">제목 (선택사항)</label>
            <Input
              type="text"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="이미지 제목"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">대체 텍스트 (선택사항)</label>
            <Input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="이미지 설명"
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
              취소
            </Button>
            <Button onClick={addImage} disabled={!imageUrl}>
              추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // 유튜브 모달 컴포넌트
  const YoutubeModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">유튜브 동영상 추가</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">유튜브 URL</label>
            <Input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsYoutubeModalOpen(false)}>
              취소
            </Button>
            <Button onClick={addYoutubeVideo} disabled={!youtubeUrl}>
              추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // 테이블 모달 컴포넌트
  const TableModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">테이블 추가</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">행 수</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={tableSize.rows}
              onChange={(e) =>
                setTableSize((prev) => ({
                  ...prev,
                  rows: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">열 수</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={tableSize.cols}
              onChange={(e) =>
                setTableSize((prev) => ({
                  ...prev,
                  cols: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsTableModalOpen(false)}>
              취소
            </Button>
            <Button onClick={addTable}>추가</Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('relative', className, isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : '')}>
      <div 
        ref={editorRef}
        className={cn(
          'border rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-all duration-200',
          isFullscreen ? 'h-[calc(100vh-2rem)]' : ''
        )}
      >
        {/* Main Toolbar */}
        <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-1 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="굵게 (Ctrl+B)"
              icon={Bold}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="기울임 (Ctrl+I)"
              icon={Italic}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="밑줄 (Ctrl+U)"
              icon={UnderlineIcon}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="취소선 (Ctrl+Shift+S)"
              icon={Strikethrough}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="하이라이트 (Ctrl+Shift+H)"
              icon={Highlighter}
            />
          </div>
          
          <div className="flex items-center gap-1 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="제목 1"
              icon={Heading1}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="제목 2"
              icon={Heading2}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="제목 3"
              icon={Heading3}
            />
          </div>

          <div className="flex items-center gap-1 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="글머리 기호"
              icon={List}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="번호 매기기"
              icon={ListOrdered}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              title="할 일 목록"
              icon={CheckSquare}
            />
          </div>

          <div className="flex items-center gap-1 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="왼쪽 정렬"
              icon={AlignLeft}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="가운데 정렬"
              icon={AlignCenter}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="오른쪽 정렬"
              icon={AlignRight}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="양쪽 정렬"
              icon={AlignJustify}
            />
          </div>

          <div className="flex items-center gap-1 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => setIsLinkModalOpen(true)}
              isActive={editor.isActive('link')}
              title="링크 삽입 (Ctrl+K)"
              icon={LinkIcon}
            />
            <ToolbarButton
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href
                if (previousUrl) {
                  editor.chain().focus().unsetLink().run()
                } else {
                  setIsLinkModalOpen(true)
                }
              }}
              isActive={editor.isActive('link')}
              title="링크 제거"
              icon={LinkIcon}
              className="text-red-500"
            />
            <ToolbarButton
              onClick={() => setIsImageModalOpen(true)}
              title="이미지 삽입"
              icon={ImageIcon}
            />
            <ToolbarButton
              onClick={() => setIsYoutubeModalOpen(true)}
              title="유튜브 동영상 삽입"
              icon={YoutubeIcon}
            />
            <ToolbarButton
              onClick={() => setIsTableModalOpen(true)}
              title="표 삽입"
              icon={TableIcon}
            />
          </div>

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="인라인 코드"
              icon={CodeIcon}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="코드 블록"
              icon={Code2}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="인용구"
              icon={Quote}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="구분선"
              icon={Minus}
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="실행 취소 (Ctrl+Z)"
              icon={Undo}
              className={!editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="다시 실행 (Ctrl+Y)"
              icon={Redo}
              className={!editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <ToolbarButton
              onClick={toggleFullscreen}
              title={isFullscreen ? '전체 화면 종료 (ESC)' : '전체 화면 (F11 또는 Cmd+Enter)'}
              icon={isFullscreen ? Minimize2 : Maximize2}
            />
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-4 min-h-[300px] max-h-[calc(100%-100px)] overflow-y-auto">
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none focus:outline-none"
          />
        </div>

        {/* Character Count */}
        <div className="border-t px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span>
            {editor.storage.characterCount.characters()}자 / {editor.storage.characterCount.limit}자
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs">
              {editor.storage.characterCount.words()} 단어
            </span>
          </div>
        </div>
            size="sm"
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('highlight')}
            onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </div>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('taskList')}
            onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
          >
            <CheckSquare className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('codeBlock')}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-4 w-4" />
          </Toggle>
        </div>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <div className="flex items-center gap-1">
          <Popover open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={setLink}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">링크 추가</h4>
                <Input
                  placeholder="URL을 입력하세요"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLink()}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsLinkModalOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={addLink}>
                    적용
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">이미지 추가</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="image-url">이미지 URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addImage()}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsImageModalOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={addImage}>
                    추가
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={isYoutubeModalOpen} onOpenChange={setIsYoutubeModalOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <YoutubeIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">유튜브 동영상 추가</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="youtube-url">유튜브 URL</Label>
                    <Input
                      id="youtube-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addYoutubeVideo()}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsYoutubeModalOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={addYoutubeVideo}>
                    추가
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <TableIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">표 추가</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rows">행</Label>
                    <Input
                      id="rows"
                      type="number"
                      min="1"
                      max="10"
                      value={tableSize.rows}
                      onChange={(e) => setTableSize(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cols">열</Label>
                    <Input
                      id="cols"
                      type="number"
                      min="1"
                      max="10"
                      value={tableSize.cols}
                      onChange={(e) => setTableSize(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsTableModalOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={addTable}>
                    추가
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'justify' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>텍스트 색상</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-10 p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={setTextColor}>
                      적용
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>하이라이트 색상</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="h-10 w-10 p-1"
                    />
                    <Input
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={setTextHighlight}>
                      적용
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="h-6 w-px bg-border mx-1" />
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Bubble Menu (appears when text is selected) */}
      {editor && (
        <BubbleMenu 
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-1 bg-background border rounded-md shadow-lg"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={setLink}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
      
      {/* Editor Content */}
      <div className="prose dark:prose-invert max-w-none p-4 min-h-[200px] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <EditorContent editor={editor} />
      </div>
      
      {/* Status Bar */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
        <div>
          {editor?.storage.characterCount.words()} 단어 • {editor?.storage.characterCount.characters()} 글자
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            size="xs"
            pressed={editor?.isActive('code')}
            onPressedChange={() => editor?.chain().focus().toggleCode().run()}
          >
            <Code className="h-3 w-3" />
          </Toggle>
          <Toggle
            size="xs"
            pressed={editor?.isActive('bold')}
            onPressedChange={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3 w-3" />
          </Toggle>
          <Toggle
            size="xs"
            pressed={editor?.isActive('italic')}
            onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3 w-3" />
          </Toggle>
        {/* Link Modal */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">링크 추가</h3>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="URL을 입력하세요 (예: https://example.com)"
                className="w-full p-2 border rounded mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addLink()
                  if (e.key === 'Escape') setIsLinkModalOpen(false)
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  취소
                </button>
                <button
                  onClick={addLink}
                  disabled={!linkUrl}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">이미지 추가</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    이미지 URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2 border rounded"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    대체 텍스트
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="이미지 설명"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    제목 (선택사항)
                  </label>
                  <input
                    type="text"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    placeholder="이미지 제목"
                    className="w-full p-2 border rounded"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addImage()
                      if (e.key === 'Escape') setIsImageModalOpen(false)
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  취소
                </button>
                <button
                  onClick={addImage}
                  disabled={!imageUrl}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* YouTube Modal */}
        {isYoutubeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">유튜브 동영상 추가</h3>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="YouTube URL 또는 동영상 ID"
                className="w-full p-2 border rounded mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addYoutubeVideo()
                  if (e.key === 'Escape') setIsYoutubeModalOpen(false)
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsYoutubeModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  취소
                </button>
                <button
                  onClick={addYoutubeVideo}
                  disabled={!youtubeUrl}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Modal */}
        {isTableModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">표 삽입</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    행
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    열
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  취소
                </button>
                <button
                  onClick={addTable}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 모달들 */}
      {isLinkModalOpen && <LinkModal />}
      {isImageModalOpen && <ImageModal />}
      {isYoutubeModalOpen && <YoutubeModal />}
      {isTableModalOpen && <TableModal />}
    </div>
  )
  )
}

export default RichTextEditor
