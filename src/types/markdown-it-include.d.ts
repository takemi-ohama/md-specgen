declare module 'markdown-it-include' {
  import MarkdownIt from 'markdown-it';

  interface IncludeOptions {
    root?: string;
    bracesAreOptional?: boolean;
    includeRe?: RegExp;
    getRootDir?: () => string;
  }

  function markdownItInclude(md: MarkdownIt, options?: IncludeOptions): void;
  
  export = markdownItInclude;
}
