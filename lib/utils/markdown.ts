import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import markedHighlight from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark-dimmed.css';

// Type declarations for JSDOM
const { window } = new JSDOM('<!DOCTYPE html>');
const { document } = window;

// Add type for the global DOMPurify
declare global {
  // eslint-disable-next-line no-var
  var DOMPurify: typeof import('isomorphic-dompurify');
}

// Initialize DOMPurify if not already initialized
if (!global.DOMPurify) {
  global.DOMPurify = DOMPurify;
}

declare global {
  // eslint-disable-next-line no-var
  var DOMPurify: typeof import('isomorphic-dompurify');
}

// Initialize DOMPurify
if (!global.DOMPurify) {
  global.DOMPurify = DOMPurify;
}

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
  })
);

// Set marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  smartypants: true,
});

/**
 * Convert markdown to HTML with syntax highlighting
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return '';
  
  try {
    // Convert markdown to HTML
    const html = marked.parse(markdown) as string;
    
    // Ensure we have a valid HTML string
    if (typeof html !== 'string') {
      throw new Error('Failed to parse markdown');
    }
    
    // Sanitize HTML to prevent XSS
    const cleanHtml = global.DOMPurify.sanitize(html, {
      ADD_ATTR: ['target', 'rel', 'noreferrer noopener'],
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr', 'pre', 'code', 'blockquote',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'strong', 'em', 'del', 'a', 'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'section', 'article', 'aside', 'header', 'footer',
        'sup', 'sub', 'small', 'mark', 'kbd', 'abbr', 'cite', 'q', 's', 'u', 'i', 'b', 'samp', 'var', 'time',
      ],
      ALLOWED_ATTR: [
        'class', 'id', 'style', 'title', 'alt', 'href', 'target', 'rel',
        'src', 'width', 'height', 'align', 'border', 'cellspacing', 'cellpadding',
        'colspan', 'rowspan', 'data-*',
      ],
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
    });
    
    // Add responsive container for tables
    const dom = new JSDOM(cleanHtml);
    const doc = dom.window.document;
    
    // Wrap tables in a responsive container
    const tables = doc.querySelectorAll('table');
    tables.forEach((table: HTMLTableElement) => {
      const wrapper = doc.createElement('div');
      wrapper.className = 'table-container overflow-x-auto my-4';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
    
    // Add classes to various elements for styling
    const elements = {
      'h1': 'text-3xl font-bold mt-8 mb-4 pb-2 border-b',
      'h2': 'text-2xl font-bold mt-6 mb-3 pb-2 border-b',
      'h3': 'text-xl font-bold mt-5 mb-2',
      'h4': 'text-lg font-bold mt-4 mb-2',
      'h5': 'text-base font-bold mt-3 mb-2',
      'p': 'my-4 leading-relaxed',
      'ul': 'list-disc pl-6 my-4 space-y-1',
      'ol': 'list-decimal pl-6 my-4 space-y-1',
      'li': 'my-1',
      'blockquote': 'border-l-4 border-gray-300 pl-4 py-1 my-4 text-gray-700 dark:text-gray-300',
      'pre': 'bg-gray-100 dark:bg-gray-800 rounded-md p-4 my-4 overflow-x-auto',
      'code': 'bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono',
      'a': 'text-blue-600 dark:text-blue-400 hover:underline',
      'table': 'min-w-full border-collapse my-4',
      'th': 'border dark:border-gray-700 px-4 py-2 text-left bg-gray-100 dark:bg-gray-800',
      'td': 'border dark:border-gray-700 px-4 py-2',
      'img': 'my-4 rounded-lg max-w-full h-auto',
    };
    
    // Add classes to elements
    Object.entries(elements).forEach(([selector, className]) => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((el: Element) => {
        const currentClass = el.getAttribute('class') || '';
        el.setAttribute('class', `${currentClass} ${className}`.trim());
      });
    });
    
    // Add rel="noopener noreferrer" to external links
    const links = doc.querySelectorAll('a[href^="http"]');
    links.forEach((link: HTMLAnchorElement) => {
      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
      if (!link.getAttribute('rel')) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Return original markdown if conversion fails
  }
}

/**
 * Convert HTML to markdown
 * This is a simplified version and may not handle all cases perfectly
 */
export async function htmlToMarkdown(html: string): Promise<string> {
  if (!html) return '';
  
  try {
    // Simple conversion - in a real app, you might want to use a more robust library
  // like turndown or html-to-md
  const dom = new JSDOM(html);
  const doc = dom.window.document;
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach((script: Element) => script.remove());
    
    // Simple conversion rules with proper typing
    type Replacement = string | ((...args: string[]) => string);
    interface ReplacementRule {
      pattern: string | RegExp;
      replace: Replacement;
    }
    
    const rules: ReplacementRule[] = [
      // Headers
      { pattern: /<h1[^>]*>(.*?)<\/h1>/g, replace: '# $1\n\n' },
      { pattern: /<h2[^>]*>(.*?)<\/h2>/g, replace: '## $1\n\n' },
      { pattern: /<h3[^>]*>(.*?)<\/h3>/g, replace: '### $1\n\n' },
      { pattern: /<h[4-6][^>]*>(.*?)<\/h[4-6]>/g, replace: '#### $1\n\n' },
      
      // Text formatting
      { pattern: /<strong[^>]*>(.*?)<\/strong>/g, replace: '**$1**' },
      { pattern: /<b[^>]*>(.*?)<\/b>/g, replace: '**$1**' },
      { pattern: /<em[^>]*>(.*?)<\/em>/g, replace: '*$1*' },
      { pattern: /<i[^>]*>(.*?)<\/i>/g, replace: '*$1*' },
      { pattern: /<del[^>]*>(.*?)<\/del>/g, replace: '~~$1~~' },
      { pattern: /<u[^>]*>(.*?)<\/u>/g, replace: '__$1__' },
      
      // Links and images
      { pattern: /<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/g, replace: '[$2]($1)' },
      { pattern: /<img[^>]*src=["'](.*?)["'][^>]*alt=["'](.*?)["'][^>]*>/g, replace: '![$2]($1)' },
      { pattern: /<img[^>]*src=["'](.*?)["'][^>]*>/g, replace: '![]($1)' },
      
      // Lists
      { pattern: /<li[^>]*>(.*?)<\/li>/g, replace: (match: string, p1: string) => {
        const content = p1.trim().replace(/<[^>]*>/g, '');
        return `- ${content}\n`;
      }},
      
      // Blockquotes
      { pattern: /<blockquote[^>]*>(.*?)<\/blockquote>/gs, replace: (match: string, p1: string) => {
        const content = p1.trim().replace(/^<p[^>]*>|</p>$/g, '');
        return `> ${content}\n\n`;
      }},
      
      // Code blocks
      { pattern: /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, replace: '```\n$1\n```\n\n' },
      { pattern: /<code[^>]*>(.*?)<\/code>/g, replace: '`$1`' },
      
      // Horizontal rule
      { pattern: /<hr[^>]*>/g, replace: '---\n\n' },
      
      // Tables (simplified)
      { pattern: /<table[^>]*>([\s\S]*?)<\/table>/g, replace: (match: string, p1: string) => {
        // This is a very simplified table conversion
        const rows = p1.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
        if (rows.length === 0) return '';
        
        let markdown = '';
        const headerCells = rows[0].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || [];
        const headers = headerCells.map(cell => {
          return cell.replace(/<[^>]*>/g, '').trim();
        });
        
        // Add header row
        markdown += headers.join(' | ') + '\n';
        markdown += headers.map(() => '---').join(' | ') + '\n';
        
        // Add data rows
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || [];
          const row = cells.map(cell => {
            return cell.replace(/<[^>]*>/g, '').trim();
          });
          markdown += row.join(' | ') + '\n';
        }
        
        return markdown + '\n';
      }},
      
      // Remove all other HTML tags
      { pattern: /<[^>]*>/g, replace: '' },
      
      // Clean up multiple newlines
      { pattern: /\n{3,}/g, replace: '\n\n' },
      { pattern: /^\s*\n/gm, replace: '' },
    ];
    
    let markdown = doc.body.innerHTML;
    
    // Apply all conversion rules
    for (const { pattern, replace } of rules) {
      if (typeof replace === 'string') {
        markdown = markdown.replace(new RegExp(pattern as string, 'g'), replace);
      } else if (typeof replace === 'function') {
        // Handle function replacements
        markdown = markdown.replace(new RegExp(pattern as string, 'g'), (match: string, ...args: string[]) => {
          // Create a safe replacement function that handles the match
          const safeReplace = (m: string, ...a: string[]) => {
            try {
              return replace(m, ...a);
            } catch (e) {
              console.error('Error in replacement function:', e);
              return m;
            }
          };
          
          // Extract groups from the match
          const groups = new RegExp(pattern as string).exec(match);
          return groups ? safeReplace(match, ...groups.slice(1)) : match;
        });
      }
    }
    
    return markdown.trim();
  } catch (error) {
    console.error('Error converting HTML to markdown:', error);
    return html; // Return original HTML if conversion fails
  }
}

/**
 * Generate a table of contents from markdown
 */
export function generateToc(markdown: string): { id: string; text: string; level: number }[] {
  if (!markdown) return [];
  
  const toc: { id: string; text: string; level: number }[] = [];
  const lines = markdown.split('\n');
  
  const headingRegex = /^(#{1,6})\s+(.+)/;
  
  for (const line of lines) {
    const match = line.match(headingRegex);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      toc.push({ id, text, level });
    }
  }
  
  return toc;
}

/**
 * Extract the first paragraph from markdown
 */
export function extractFirstParagraph(markdown: string, maxLength: number = 200): string {
  if (!markdown) return '';
  
  // Remove code blocks first to avoid extracting code
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, '');
  
  // Find the first paragraph
  const match = withoutCodeBlocks.match(/^([^\n]{1,}?)(?=\n\s*\n|$)/);
  
  if (match) {
    let text = match[1].trim();
    
    // Remove markdown formatting
    text = text
      .replace(/^#+\s*/g, '') // Headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1') // Italic
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/`([^`]+)`/g, '$1') // Inline code
      .replace(/~~([^~]+)~~/g, '$1') // Strikethrough
      .replace(/<[^>]*>/g, '') // HTML tags
      .replace(/\s+/g, ' ') // Multiple spaces
      .trim();
    
    // Truncate if needed
    if (text.length > maxLength) {
      text = text.substring(0, maxLength).trim() + '...';
    }
    
    return text;
  }
  
  return '';
}
