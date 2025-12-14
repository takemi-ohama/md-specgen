/**
 * インデックスページ生成モジュール
 *
 * ディレクトリ構造から自動的にインデックスページ（目次）を生成します。
 */

import { applyTemplate, TemplateData } from './template.js';

/**
 * インデックスページエントリー
 */
export interface IndexEntry {
  /** ファイル名またはディレクトリ名 */
  name: string;
  /** 相対パス */
  path: string;
  /** タイトル（Frontmatterから取得、または名前から生成） */
  title: string;
  /** ディレクトリの場合true */
  isDirectory: boolean;
  /** 子エントリー（ディレクトリの場合） */
  children?: IndexEntry[];
}

/**
 * インデックスページ生成オプション
 */
export interface IndexPageOptions {
  /** ページタイトル */
  title?: string;
  /** 説明文 */
  description?: string;
  /** テンプレートHTML */
  template?: string;
  /** フッターテキスト */
  footerText?: string;
  /** ツリー表示するか（false の場合はフラットリスト） */
  treeView?: boolean;
}

/**
 * インデックスページのHTMLを生成
 *
 * @param entries インデックスエントリー
 * @param options 生成オプション
 * @returns 生成されたHTML
 */
export function generateIndexPage(entries: IndexEntry[], options: IndexPageOptions = {}): string {
  const title = options.title || 'ドキュメント一覧';
  const description = options.description || '';
  const treeView = options.treeView ?? true;

  // コンテンツHTML生成
  let contentHtml = `<h1>${escapeHtml(title)}</h1>\n`;
  if (description) {
    contentHtml += `<p>${escapeHtml(description)}</p>\n`;
  }

  if (treeView) {
    contentHtml += renderTree(entries);
  } else {
    contentHtml += renderFlatList(entries);
  }

  // テンプレートデータを準備
  const templateData: TemplateData = {
    title,
    content: contentHtml,
    includeHeader: true,
    includeFooter: !!options.footerText,
    footerText: options.footerText,
  };

  // テンプレートを適用
  return applyTemplate(templateData, options.template);
}

/**
 * ツリー形式でエントリーをレンダリング
 *
 * @param entries エントリーリスト
 * @param level 階層レベル
 * @returns HTML
 */
function renderTree(entries: IndexEntry[], level: number = 0): string {
  if (!entries || entries.length === 0) {
    return '';
  }

  let html = '<ul>\n';

  for (const entry of entries) {
    html += '  <li>';

    if (entry.isDirectory) {
      html += `<strong>${escapeHtml(entry.title)}</strong>`;
      if (entry.children && entry.children.length > 0) {
        html += '\n' + renderTree(entry.children, level + 1);
      }
    } else {
      html += `<a href="${escapeHtml(entry.path)}">${escapeHtml(entry.title)}</a>`;
    }

    html += '</li>\n';
  }

  html += '</ul>\n';
  return html;
}

/**
 * フラットリスト形式でエントリーをレンダリング
 *
 * @param entries エントリーリスト
 * @returns HTML
 */
function renderFlatList(entries: IndexEntry[]): string {
  let html = '<ul>\n';

  function addEntries(items: IndexEntry[], prefix: string = '') {
    for (const entry of items) {
      if (entry.isDirectory) {
        if (entry.children && entry.children.length > 0) {
          const newPrefix = prefix ? `${prefix} / ${entry.title}` : entry.title;
          addEntries(entry.children, newPrefix);
        }
      } else {
        const displayTitle = prefix ? `${prefix} / ${entry.title}` : entry.title;
        html += `  <li><a href="${escapeHtml(entry.path)}">${escapeHtml(displayTitle)}</a></li>\n`;
      }
    }
  }

  addEntries(entries);
  html += '</ul>\n';
  return html;
}

/**
 * HTMLエスケープ
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
