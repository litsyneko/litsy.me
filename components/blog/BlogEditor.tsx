'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Eye, Code as CodeIcon, RotateCw } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { markdownToHtml, htmlToMarkdown } from '@/lib/utils/markdown';

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  isMarkdown?: boolean;
  onModeChange?: (isMarkdown: boolean) => void;
}

export function BlogEditor({
  content,
  onChange,
  placeholder = '내용을 작성하세요...',
  className = '',
  isMarkdown: externalIsMarkdown = false,
  onModeChange,
}: BlogEditorProps) {
  const [isMarkdown, setIsMarkdown] = useState(externalIsMarkdown);
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Initialize content based on the current mode
  useEffect(() => {
    if (isMarkdown) {
      setMarkdownContent(content);
      // Convert markdown to HTML for preview
      const convert = async () => {
        setIsConverting(true);
        try {
          const html = await markdownToHtml(content);
          setHtmlContent(html);
        } catch (error) {
          console.error('Error converting markdown to HTML:', error);
          setHtmlContent(content);
        } finally {
          setIsConverting(false);
        }
      };
      convert();
    } else {
      setHtmlContent(content);
      // Convert HTML to markdown when switching to markdown mode
      const convert = async () => {
        setIsConverting(true);
        try {
          const md = await htmlToMarkdown(content);
          setMarkdownContent(md);
        } catch (error) {
          console.error('Error converting HTML to markdown:', error);
          setMarkdownContent(content);
        } finally {
          setIsConverting(false);
        }
      };
      convert();
    }
  }, [isMarkdown, content]);

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    onChange(value);
    
    // Update HTML preview asynchronously
    const updatePreview = async () => {
      try {
        const html = await markdownToHtml(value);
        setHtmlContent(html);
      } catch (error) {
        console.error('Error updating markdown preview:', error);
      }
    };
    updatePreview();
  };

  const handleHtmlChange = (value: string) => {
    setHtmlContent(value);
    onChange(value);
  };

  const toggleMode = () => {
    const newMode = !isMarkdown;
    setIsMarkdown(newMode);
    onModeChange?.(newMode);
    
    // Convert content when switching modes
    if (newMode) {
      // HTML to Markdown
      const convert = async () => {
        setIsConverting(true);
        try {
          const md = await htmlToMarkdown(htmlContent);
          setMarkdownContent(md);
          onChange(md);
        } catch (error) {
          console.error('Error converting HTML to markdown:', error);
        } finally {
          setIsConverting(false);
        }
      };
      convert();
    } else {
      // Markdown to HTML
      const convert = async () => {
        setIsConverting(true);
        try {
          const html = await markdownToHtml(markdownContent);
          setHtmlContent(html);
          onChange(html);
        } catch (error) {
          console.error('Error converting markdown to HTML:', error);
        } finally {
          setIsConverting(false);
        }
      };
      convert();
    }
  };

  if (isConverting) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <RotateCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">변환 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">에디터 모드</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMode}
          className="text-xs"
        >
          {isMarkdown ? 'WYSIWYG 에디터로 전환' : '마크다운 에디터로 전환'}
        </Button>
      </div>

      {isMarkdown ? (
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">
              <CodeIcon className="h-4 w-4 mr-1" />
              마크다운 편집
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-1" />
              미리보기
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-0">
            <div className="border rounded-md overflow-hidden">
              <textarea
                value={markdownContent}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-[300px] p-4 font-mono text-sm focus:outline-none dark:bg-background"
                spellCheck="false"
              />
              <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                {markdownContent.length}자 • {markdownContent.split(/\s+/).filter(Boolean).length} 단어
              </div>
            </div>
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            <div 
              className="prose dark:prose-invert max-w-none p-4 border rounded-md min-h-[300px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-muted-foreground">미리보기가 여기에 표시됩니다.</p>' }}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <RichTextEditor
          content={htmlContent}
          onChange={handleHtmlChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default BlogEditor;
