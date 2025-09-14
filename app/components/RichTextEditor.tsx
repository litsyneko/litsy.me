"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Minus, Image as ImageIcon, Link as LinkIcon, Unlink, Redo, Undo } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  editable?: boolean;
}

const RichTextEditor = ({ content, onUpdate, editable = true }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true, // For pasting images directly, consider server-side upload for production
      }),
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

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor-container">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border border-white/20 rounded-t-xl bg-white/5 backdrop-blur-sm">
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={!editor.can().chain().focus().toggleBlockquote().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            onClick={addImage}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={setLink}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Unlink className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 h-auto rounded-md hover:bg-white/10"
            variant="ghost"
            size="sm"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
