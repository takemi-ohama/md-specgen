/**
 * Markdown解析モジュール
 *
 * Markdownテキストを解析してHTMLに変換する機能を提供します。
 * - markdown-itライブラリを使用したMarkdown→HTML変換
 * - highlight.jsによるシンタックスハイライト
 * - カスタムコンテナ（:::warning, :::info, :::tip）
 * - ファイルインクルード機能
 */

import MarkdownIt from 'markdown-it';
import markdownItContainer from 'markdown-it-container';
import markdownItInclude from 'markdown-it-include';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js';
import * as path from 'path';
import * as fs from 'fs';

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
  /** カスタムコンテナを有効化 */
  containers?: boolean;
  /** ファイルインクルードを有効化 */
  include?: boolean;
  /** インクルード時の基準ディレクトリ */
  includeBasePath?: string;
}

/**
 * Markdownパーサークラス
 * markdown-itとHighlight.jsを統合したMarkdown解析機能を提供
 */
export class MarkdownParser {
  private options: Required<Omit<MarkdownParserOptions, 'includeBasePath'>> & { includeBasePath?: string };
  private md: MarkdownIt;

  /**
   * @param options パーサーオプション
   */
  constructor(options: MarkdownParserOptions = {}) {
    this.options = {
      gfm: options.gfm ?? true,
      breaks: options.breaks ?? true,
      highlight: options.highlight ?? true,
      containers: options.containers ?? true,
      include: options.include ?? true,
      includeBasePath: options.includeBasePath,
    };

    this.md = this.configureMarkdownIt();
  }

  /**
   * markdown-itの設定を初期化
   */
  private configureMarkdownIt(): MarkdownIt {
    const md = new MarkdownIt({
      html: true, // HTML タグを許可
      linkify: true, // URLを自動的にリンク化
      typographer: true, // 引用符などをタイポグラフィに変換
      breaks: this.options.breaks,
      // シンタックスハイライト設定
      highlight: this.options.highlight ? (str: string, lang: string) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (error) {
            console.warn(`シンタックスハイライトエラー: ${(error as Error).message}`);
          }
        }
        // 言語が指定されていない、または認識できない場合は自動検出
        return hljs.highlightAuto(str).value;
      } : undefined,
    });

    // アンカー機能を追加
    md.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink(),
      level: [1, 2, 3, 4, 5, 6],
    });

    // カスタムコンテナを追加
    if (this.options.containers) {
      this.addCustomContainers(md);
    }

    // ファイルインクルード機能を追加
    if (this.options.include && this.options.includeBasePath) {
      md.use(markdownItInclude, {
        root: this.options.includeBasePath,
        bracesAreOptional: false,
        // セキュリティ: パストラバーサル攻撃を防止
        includeRe: /^[^.\/\\].*$/,
        // ファイル読み込みのカスタムハンドラー
        getRootDir: () => this.options.includeBasePath || process.cwd(),
      });
    }

    return md;
  }

  /**
   * カスタムコンテナを追加
   */
  private addCustomContainers(md: MarkdownIt): void {
    // コンテナタイプの定義
    const containerTypes = [
      { name: 'warning', defaultTitle: '警告' },
      { name: 'info', defaultTitle: '情報' },
      { name: 'tip', defaultTitle: 'ヒント' },
      { name: 'danger', defaultTitle: '危険' },
      { name: 'note', defaultTitle: '注意' },
      { name: 'success', defaultTitle: '成功' },
    ];

    // 各コンテナタイプを登録
    containerTypes.forEach(({ name, defaultTitle }) => {
      (md.use as any)(markdownItContainer, name, {
        validate: (params: string) => {
          return params.trim().startsWith(name);
        },
        render: (tokens: any[], idx: number) => {
          const token = tokens[idx];
          
          if (token.nesting === 1) {
            // opening tag
            const info = token.info.trim().slice(name.length).trim();
            const title = info || defaultTitle;
            return `<div class="custom-container ${name}">\n<p class="custom-container-title">${md.utils.escapeHtml(title)}</p>\n`;
          } else {
            // closing tag
            return '</div>\n';
          }
        },
      });
    });
  }

  /**
   * MarkdownをHTMLに変換
   *
   * @param markdown Markdownテキスト
   * @returns HTMLテキスト
   */
  async parseMarkdown(markdown: string): Promise<string> {
    try {
      return this.md.render(markdown);
    } catch (error) {
      throw new Error(`Markdown解析エラー: ${(error as Error).message}`);
    }
  }

  /**
   * Markdownを同期的にHTMLに変換
   *
   * @param markdown Markdownテキスト
   * @returns HTMLテキスト
   */
  parseMarkdownSync(markdown: string): string {
    try {
      return this.md.render(markdown);
    } catch (error) {
      throw new Error(`Markdown解析エラー: ${(error as Error).message}`);
    }
  }

  /**
   * インクルード基準パスを設定
   * ファイルインクルード機能で使用する基準ディレクトリを変更
   *
   * @param basePath 基準ディレクトリのパス
   */
  setIncludeBasePath(basePath: string): void {
    this.options.includeBasePath = basePath;
    // markdown-itインスタンスを再構成
    this.md = this.configureMarkdownIt();
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

/**
 * カスタムコンテナ用のCSSスタイル
 * HTMLコンバーターで利用可能
 */
export const CONTAINER_STYLES = `
.custom-container {
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  border-left: 4px solid;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.custom-container-title {
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-size: 1.1em;
}

.custom-container.warning {
  border-left-color: #ff9800;
  background-color: #fff3e0;
}

.custom-container.warning .custom-container-title {
  color: #e65100;
}

.custom-container.info {
  border-left-color: #2196f3;
  background-color: #e3f2fd;
}

.custom-container.info .custom-container-title {
  color: #0d47a1;
}

.custom-container.tip {
  border-left-color: #4caf50;
  background-color: #e8f5e9;
}

.custom-container.tip .custom-container-title {
  color: #1b5e20;
}

.custom-container.danger {
  border-left-color: #f44336;
  background-color: #ffebee;
}

.custom-container.danger .custom-container-title {
  color: #b71c1c;
}

.custom-container.note {
  border-left-color: #9e9e9e;
  background-color: #f5f5f5;
}

.custom-container.note .custom-container-title {
  color: #424242;
}

.custom-container.success {
  border-left-color: #4caf50;
  background-color: #e8f5e9;
}

.custom-container.success .custom-container-title {
  color: #1b5e20;
}
`;
