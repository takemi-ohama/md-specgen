/**
 * HTMLテンプレートモジュール
 *
 * HTMLテンプレートの読み込みと適用を行います。
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * テンプレートデータの型定義
 */
export interface TemplateData {
  /** ドキュメントタイトル */
  title: string;
  /** HTMLコンテンツ */
  content: string;
  /** パンくずリスト */
  breadcrumbs?: Array<{ title: string; href?: string }>;
  /** Frontmatterデータ */
  frontmatter?: Record<string, any>;
  /** ヘッダーを含める */
  includeHeader?: boolean;
  /** フッターを含める */
  includeFooter?: boolean;
  /** フッターテキスト */
  footerText?: string;
}

/**
 * デフォルトのHTMLテンプレート（NumPy風）
 *
 * プレースホルダー:
 * - {{TITLE}}: ドキュメントタイトル
 * - {{CONTENT}}: HTMLコンテンツ
 * - {{BREADCRUMBS}}: パンくずリストHTML
 * - {{FOOTER_TEXT}}: フッターテキスト
 */
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <style>
        /* NumPy風スタイル */
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

        :root {
            --body-color: rgb(34, 40, 50);
            --link-color: #0d6efd;
            --link-hover-color: #0a58ca;
            --heading-color: rgb(18, 24, 34);
            --body-bg: #ffffff;
            --sidebar-bg: #f8f9fa;
            --code-bg: #f8f9fa;
            --border-color: #dee2e6;
            --font-family-base: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            --font-family-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
            --font-family-code: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        }

        body {
            font-family: var(--font-family-base);
            color: var(--body-color);
            background-color: var(--body-bg);
            font-size: 16px;
            line-height: 1.65;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 960px;
            margin: 0 auto;
            padding: 2rem;
        }

        .breadcrumb {
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
            color: var(--body-color);
        }

        .breadcrumb a {
            color: var(--link-color);
            text-decoration: none;
        }

        .breadcrumb a:hover {
            text-decoration: underline;
        }

        .breadcrumb-separator {
            margin: 0 0.5rem;
            color: var(--border-color);
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-family-heading);
            font-weight: 600;
            color: var(--heading-color);
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        h1 {
            font-size: 2.625rem;
            margin-top: 0;
            padding-bottom: 0.3rem;
            border-bottom: 1px solid var(--border-color);
        }

        h2 {
            font-size: 2rem;
            padding-bottom: 0.3rem;
            border-bottom: 1px solid var(--border-color);
        }

        h3 {
            font-size: 1.5rem;
        }

        p {
            margin-bottom: 1rem;
        }

        a {
            color: var(--link-color);
            text-decoration: none;
        }

        a:hover {
            color: var(--link-hover-color);
            text-decoration: underline;
        }

        pre {
            background-color: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.25rem;
            padding: 1rem;
            overflow-x: auto;
        }

        code {
            font-family: var(--font-family-code);
            font-size: 0.875em;
        }

        :not(pre) > code {
            background-color: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 0.25rem;
            padding: 0.125rem 0.375rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }

        th, td {
            border: 1px solid var(--border-color);
            padding: 0.75rem;
            text-align: left;
        }

        th {
            background-color: var(--sidebar-bg);
            font-weight: 600;
        }

        tr:nth-child(even) {
            background-color: var(--sidebar-bg);
        }

        blockquote {
            border-left: 4px solid var(--link-color);
            padding-left: 1rem;
            margin-left: 0;
            margin-bottom: 1rem;
            font-style: italic;
        }

        ul, ol {
            margin-bottom: 1rem;
            padding-left: 2rem;
        }

        li {
            margin-bottom: 0.5rem;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
            font-size: 0.875rem;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        {{BREADCRUMBS}}

        <article>
            {{CONTENT}}
        </article>

        {{FOOTER}}
    </div>
</body>
</html>`;

/**
 * HTMLテンプレートファイルを読み込む
 *
 * @param templatePath テンプレートファイルパス
 * @returns テンプレートHTML
 */
export async function loadTemplate(templatePath: string): Promise<string> {
  try {
    const template = await fs.readFile(templatePath, 'utf-8');
    return template;
  } catch (error) {
    throw new Error(`テンプレート読み込みエラー: ${(error as Error).message}`);
  }
}

/**
 * パンくずリストのHTMLを生成
 *
 * @param breadcrumbs パンくずリストデータ
 * @returns パンくずリストHTML
 */
function renderBreadcrumbs(breadcrumbs?: Array<{ title: string; href?: string }>): string {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return '';
  }

  const items = breadcrumbs.map((crumb, index) => {
    const separator = index > 0 ? '<span class="breadcrumb-separator">/</span>' : '';
    const link = crumb.href
      ? `<a href="${escapeHtml(crumb.href)}">${escapeHtml(crumb.title)}</a>`
      : escapeHtml(crumb.title);
    return `${separator}${link}`;
  });

  return `
        <nav class="breadcrumb">
            ${items.join('\n            ')}
        </nav>
  `;
}

/**
 * フッターHTMLを生成
 *
 * @param footerText フッターテキスト
 * @returns フッターHTML
 */
function renderFooter(footerText?: string): string {
  if (!footerText) {
    return '';
  }

  return `
        <footer>
            <p>${escapeHtml(footerText)}</p>
        </footer>
  `;
}

/**
 * HTMLエスケープ
 * XSS攻撃を防ぐため、特殊文字をエスケープします。
 *
 * @param text エスケープするテキスト
 * @returns エスケープされたテキスト
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * テンプレートにデータを適用
 *
 * @param data テンプレートデータ
 * @param customTemplate カスタムテンプレート（省略時はデフォルト）
 * @returns 完成したHTML
 */
export function applyTemplate(data: TemplateData, customTemplate?: string): string {
  const template = customTemplate || DEFAULT_TEMPLATE;

  // パンくずリストとフッターをレンダリング
  const breadcrumbsHtml = data.breadcrumbs ? renderBreadcrumbs(data.breadcrumbs) : '';
  const footerHtml = data.footerText ? renderFooter(data.footerText) : '';

  // プレースホルダーを置換
  let html = template
    .replace(/\{\{TITLE\}\}/g, escapeHtml(data.title))
    .replace(/\{\{CONTENT\}\}/g, data.content) // contentは既にHTML
    .replace(/\{\{BREADCRUMBS\}\}/g, breadcrumbsHtml)
    .replace(/\{\{FOOTER\}\}/g, footerHtml);

  // フッターテキストのプレースホルダーも置換（下位互換性）
  if (data.footerText) {
    html = html.replace(/\{\{FOOTER_TEXT\}\}/g, escapeHtml(data.footerText));
  }

  return html;
}

/**
 * デフォルトテンプレートを取得
 *
 * @returns デフォルトテンプレート
 */
export function getDefaultTemplate(): string {
  return DEFAULT_TEMPLATE;
}
