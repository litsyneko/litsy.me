"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Minus,
  Image as ImageIcon, Link as LinkIcon, Unlink, Redo, Undo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Table as TableIcon, Highlighter, Underline as UnderlineIcon,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Palette, Type
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  editable?: boolean;
}

const RichTextEditor = ({ content, onUpdate, editable = true }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlock,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editable: editable,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert min-h-[200px] max-w-none p-4 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm",
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt("URL");

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor-container">
      {editable && (
        <div className="border border-white/20 rounded-t-xl bg-white/5 backdrop-blur-sm overflow-x-auto">
          {/* Text Formatting Group */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-white/10">
            <div className="flex items-center gap-1 mr-2">
              <Type className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mr-1">글자</span>
            </div>
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('bold') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="굵게"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('italic') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="기울임"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('underline') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="밑줄"
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('strike') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="취소선"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              disabled={!editor.can().chain().focus().toggleHighlight().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('highlight') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="형광펜"
            >
              <Highlighter className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('code') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="코드"
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>

          {/* Paragraph & Lists Group */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-white/10">
            <div className="flex items-center gap-1 mr-2">
              <span className="text-xs text-muted-foreground mr-1">단락</span>
            </div>
            <Button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={!editor.can().chain().focus().toggleBulletList().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('bulletList') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="글머리 기호"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={!editor.can().chain().focus().toggleOrderedList().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('orderedList') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="번호 매기기"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={!editor.can().chain().focus().toggleBlockquote().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('blockquote') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="인용구"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 h-auto rounded-md hover:bg-white/10"
              variant="ghost"
              size="sm"
              title="구분선"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Alignment Group */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-white/10">
            <div className="flex items-center gap-1 mr-2">
              <span className="text-xs text-muted-foreground mr-1">정렬</span>
            </div>
            <Button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 h-auto rounded-md ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="왼쪽 정렬"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 h-auto rounded-md ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="가운데 정렬"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 h-auto rounded-md ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="오른쪽 정렬"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 h-auto rounded-md ${editor.isActive({ textAlign: 'justify' }) ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="양쪽 정렬"
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>

          {/* Insert & Advanced Group */}
          <div className="flex flex-wrap gap-1 p-2">
            <div className="flex items-center gap-1 mr-2">
              <span className="text-xs text-muted-foreground mr-1">삽입</span>
            </div>
            <Button
              onClick={addImage}
              className="p-2 h-auto rounded-md hover:bg-white/10"
              variant="ghost"
              size="sm"
              title="이미지 삽입"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={setLink}
              className={`p-2 h-auto rounded-md ${editor.isActive('link') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="링크 삽입"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive("link")}
              className="p-2 h-auto rounded-md hover:bg-white/10"
              variant="ghost"
              size="sm"
              title="링크 제거"
            >
              <Unlink className="w-4 h-4" />
            </Button>
            <Button
              onClick={addTable}
              className="p-2 h-auto rounded-md hover:bg-white/10"
              variant="ghost"
              size="sm"
              title="표 삽입"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={addCodeBlock}
              className={`p-2 h-auto rounded-md ${editor.isActive('codeBlock') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="코드 블록"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              disabled={!editor.can().chain().focus().toggleSubscript().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('subscript') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="아래 첨자"
            >
              <SubscriptIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              disabled={!editor.can().chain().focus().toggleSuperscript().run()}
              className={`p-2 h-auto rounded-md ${editor.isActive('superscript') ? 'bg-primary/20' : 'hover:bg-white/10'}`}
              variant="ghost"
              size="sm"
              title="위 첨자"
            >
              <SuperscriptIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-2 h-auto rounded-md hover:bg-white/10"
              variant="ghost"
              size="sm"
              title="실행 취소"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-2 h-auto rounded-md hover:bg-white/10"
              variant="ghost"
              size="sm"
              title="다시 실행"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
