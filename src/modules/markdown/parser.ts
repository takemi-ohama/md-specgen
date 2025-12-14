/**
 * Markdown解析モジュール
 *
 * Markdownテキストを解析してHTMLに変換する機能を提供します。
 * - markedライブラリを使用したMarkdown→HTML変換
 * - highlight.jsによるシンタックスハイライト
 */

import { marked } from 'marked';
import hljs from 'highlight.js';

/**
 * Markdownパーサーの設定オプション
 */
export interface MarkdownParserOptions {
  /** GitHub Flavored Markdown (GFM)を有効化 */
  gfm?: boolean;
  /** 改行を<br>に変換 */
  breaks?: boolean;
  /** シンタックスハイライトを有効化 */
  highlight?: boolean;
}

/**
 * Markdownパーサークラス
 * Marked.jsとHighlight.jsを統合したMarkdown解析機能を提供
 */
export class MarkdownParser {
  private options: Required<MarkdownParserOptions>;

  /**
   * @param options パーサーオプション
   */
  constructor(options: MarkdownParserOptions = {}) {
    this.options = {
      gfm: options.gfm ?? true,
      breaks: options.breaks ?? false,
      highlight: options.highlight ?? true,
    };

    this.configureMarked();
  }

  /**
   * Markedの設定を初期化
   */
  private configureMarked(): void {
    const options: any = {
      gfm: this.options.gfm,
      breaks: this.options.breaks,
    };

    // シンタックスハイライト設定
    if (this.options.highlight) {
      options.highlight = (code: string, lang: string) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (error) {
            console.warn(`シンタックスハイライトエラー: ${(error as Error).message}`);
          }
        }
        // 言語が指定されていない、または認識できない場合は自動検出
        return hljs.highlightAuto(code).value;
      };
    }

    marked.setOptions(options);
  }

  /**
   * MarkdownをHTMLに変換
   *
   * @param markdown Markdownテキスト
   * @returns HTMLテキスト
   */
  async parseMarkdown(markdown: string): Promise<string> {
    try {
      return await marked(markdown);
    } catch (error) {
      throw new Error(`Markdown解析エラー: ${(error as Error).message}`);
    }
  }

  /**
   * Markdownを同期的にHTMLに変換
   * 非推奨: できるだけ parseMarkdown() を使用してください
   *
   * @param markdown Markdownテキスト
   * @returns HTMLテキスト
   */
  parseMarkdownSync(markdown: string): string {
    try {
      return marked.parse(markdown) as string;
    } catch (error) {
      throw new Error(`Markdown解析エラー: ${(error as Error).message}`);
    }
  }
}

/**
 * MarkdownをHTMLに変換（シンプルな関数インターフェース）
 *
 * @param markdown Markdownテキスト
 * @param options パーサーオプション
 * @returns HTMLテキスト
 */
export async function parseMarkdown(
  markdown: string,
  options?: MarkdownParserOptions
): Promise<string> {
  const parser = new MarkdownParser(options);
  return parser.parseMarkdown(markdown);
}
