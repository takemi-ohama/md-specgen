/**
 * md-specgen メインエントリーポイント
 *
 * プログラムから利用するための主要な機能と型定義をエクスポートします。
 */

// コア機能
export { generate } from './core/generator.js';
export type { GenerateOptions, GenerateResult } from './core/generator.js';

export { loadConfig, getDefaultConfig, mergeConfig, configFromCliArgs } from './core/config.js';
export type { Config } from './core/config.js';

// Markdown処理
export { MarkdownParser, parseMarkdown } from './modules/markdown/parser.js';
export type { MarkdownParserOptions } from './modules/markdown/parser.js';

export {
  parseFrontmatter,
  hasFrontmatter,
  stripFrontmatter,
} from './modules/markdown/frontmatter.js';
export type { FrontmatterData, ParsedFrontmatter } from './modules/markdown/frontmatter.js';

// HTML生成
export { convertToHtml, generateBreadcrumbs } from './modules/html/converter.js';
export type { HtmlConversionOptions, HtmlConversionResult } from './modules/html/converter.js';

export { loadTemplate, applyTemplate, getDefaultTemplate } from './modules/html/template.js';
export type { TemplateData } from './modules/html/template.js';

export { generateIndexPage } from './modules/html/index-page.js';
export type { IndexEntry, IndexPageOptions } from './modules/html/index-page.js';

// PDF生成
export { convertToPdf, convertMultipleHtmlsToPdf } from './modules/pdf/converter.js';
export type { PdfConversionOptions } from './modules/pdf/converter.js';

export { extractHeadings, generateToc, addHeadingIds } from './modules/pdf/toc.js';
export type { Heading, TocOptions } from './modules/pdf/toc.js';

export {
  PuppeteerManager,
  initBrowser,
  closeBrowser,
  getBrowser,
} from './modules/pdf/puppeteer.js';
export type { PuppeteerOptions } from './modules/pdf/puppeteer.js';

// Mermaid処理
export { convertMermaidToSvg, replaceMermaidDiagrams } from './modules/mermaid/converter.js';
export type { MermaidConversionOptions } from './modules/mermaid/converter.js';

// 画像処理
export { imageToBase64, embedImages } from './modules/image/embed.js';
export type { ImageEmbedOptions } from './modules/image/embed.js';

export {
  validateImagePath,
  isAllowedImageExtension,
  sanitizeImagePath,
} from './modules/image/security.js';

// LLM機能
export {
  LlmClient,
  LlmMessage,
  LlmResponse,
  createLlmClient,
  AnthropicClient,
  BedrockClient,
  QualityCheckResult,
  checkMarkdownQuality,
  checkMultipleMarkdownFiles,
  generateFrontmatter,
  generateTocSuggestion,
  generateImageAlt,
  TocSuggestion,
  TocItem,
  LlmCache,
} from './modules/llm/index.js';
