declare module 'marked-highlight' {
  import { MarkedExtension } from 'marked';

  interface MarkedHighlightOptions {
    highlight: (code: string, lang: string) => string;
    langPrefix?: string;
  }

  function markedHighlight(options: MarkedHighlightOptions): MarkedExtension;
  
  export = markedHighlight;
}
