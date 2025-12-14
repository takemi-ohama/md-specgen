/**
 * HTML変換モジュール
 *
 * MarkdownをHTMLに変換し、テンプレートを適用します。
 */

import { parseMarkdown } from '../markdown/parser.js';
import { parseFrontmatter } from '../markdown/frontmatter.js';
import { applyTemplate, TemplateData } from './template.js';

/**
 * HTML変換オプション
 */
export interface HtmlConversionOptions {
  /** テンプレートHTML（省略時はデフォルトテンプレート） */
  template?: string;
  /** ドキュメントタイトル（Frontmatterから自動取得されない場合に使用） */
  title?: string;
  /** パンくずリスト */
  breadcrumbs?: Array<{ title: string; href?: string }>;
  /** ヘッダーを含める */
  includeHeader?: boolean;
  /** フッターを含める */
  includeFooter?: boolean;
  /** フッターテキスト */
  footerText?: string;
}

/**
 * HTML変換結果
 */
export interface HtmlConversionResult {
  /** 生成されたHTML */
  html: string;
  /** ドキュメントタイトル */
  title: string;
  /** Frontmatterデータ */
  frontmatter: Record<string, any>;
}

/**
 * MarkdownをHTMLに変換
 *
 * @param markdown Markdownテキスト
 * @param options 変換オプション
 * @returns 変換結果
 */
export async function convertToHtml(
  markdown: string,
  options: HtmlConversionOptions = {}
): Promise<HtmlConversionResult> {
  // Frontmatterを解析
  const { data: frontmatter, content } = parseFrontmatter(markdown);

  // MarkdownをHTMLに変換
  const htmlContent = await parseMarkdown(content);

  // タイトルを決定（優先度: オプション > Frontmatter > 最初のH1 > デフォルト）
  let title = options.title || frontmatter.title || '';
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1];
    } else {
      title = 'ドキュメント';
    }
  }

  // テンプレートデータを準備
  const templateData: TemplateData = {
    title,
    content: htmlContent,
    breadcrumbs: options.breadcrumbs || [],
    frontmatter,
    includeHeader: options.includeHeader ?? true,
    includeFooter: options.includeFooter ?? true,
    footerText: options.footerText,
  };

  // テンプレートを適用
  const html = applyTemplate(templateData, options.template);

  return {
    html,
    title,
    frontmatter,
  };
}

/**
 * ファイル相対パスからパンくずリストを生成
 *
 * @param relativePath ファイル相対パス（例: "section1/subsection/file.md"）
 * @param rootTitle ルートタイトル（例: "要件定義書"）
 * @returns パンくずリスト
 */
export function generateBreadcrumbs(
  relativePath: string,
  rootTitle: string = 'ホーム'
): Array<{ title: string; href?: string }> {
  const breadcrumbs: Array<{ title: string; href?: string }> = [
    { title: rootTitle, href: 'index.html' },
  ];

  // パスを分割（拡張子を除去）
  const pathSegments = relativePath.replace(/\.md$/, '').split('/');

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    if (index < pathSegments.length - 1) {
      // ディレクトリ部分
      currentPath += segment + '/';
      breadcrumbs.push({
        title: segment,
        href: currentPath + 'index.html',
      });
    } else {
      // ファイル名部分（リンクなし）
      breadcrumbs.push({
        title: segment,
        href: undefined,
      });
    }
  });

  return breadcrumbs;
}
