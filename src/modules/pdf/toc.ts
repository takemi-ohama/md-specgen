/**
 * PDF目次生成モジュール
 *
 * HTMLコンテンツから見出しを抽出し、目次を生成します。
 */

/**
 * 見出し情報
 */
export interface Heading {
  /** 見出しレベル（1-6） */
  level: number;
  /** 見出しテキスト */
  text: string;
  /** アンカーID */
  id: string;
}

/**
 * 目次生成オプション
 */
export interface TocOptions {
  /** 最大見出しレベル（デフォルト: 3） */
  maxLevel?: number;
  /** 目次タイトル */
  title?: string;
  /** ページブレークを追加するか */
  includePageBreak?: boolean;
}

/**
 * HTMLから見出しを抽出
 *
 * @param html HTMLコンテンツ
 * @param maxLevel 最大見出しレベル
 * @returns 見出しリスト
 */
export function extractHeadings(html: string, maxLevel: number = 3): Heading[] {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  const headings: Heading[] = [];
  let match;
  let counter = 0;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const rawText = match[2];

    // HTMLタグを除去してテキストを取得
    const text = rawText.replace(/<[^>]+>/g, '').trim();

    // 最大レベルをチェック
    if (level > maxLevel) {
      continue;
    }

    // 特定のタイトルをスキップ
    if (text === '要件定義書' || text === '目次') {
      continue;
    }

    if (text) {
      headings.push({
        level,
        text,
        id: `heading-${counter++}`,
      });
    }
  }

  return headings;
}

/**
 * 目次HTMLを生成
 *
 * @param headings 見出しリスト
 * @param options 生成オプション
 * @returns 目次HTML
 */
export function generateToc(headings: Heading[], options: TocOptions = {}): string {
  const title = options.title || '目次';
  const includePageBreak = options.includePageBreak ?? true;

  let tocHtml = '<div class="table-of-contents">\n';
  tocHtml += `<h1>${escapeHtml(title)}</h1>\n`;
  tocHtml += '<ul>\n';

  headings.forEach((heading) => {
    const indent = '  '.repeat(heading.level - 1);
    tocHtml += `${indent}<li class="toc-level-${heading.level}">`;
    tocHtml += `<a href="#${heading.id}">${escapeHtml(heading.text)}</a>`;
    tocHtml += '</li>\n';
  });

  tocHtml += '</ul>\n</div>\n';

  if (includePageBreak) {
    tocHtml += '<div class="page-break"></div>\n';
  }

  return tocHtml;
}

/**
 * HTMLコンテンツに見出しIDを追加
 *
 * @param html HTMLコンテンツ
 * @param headings 見出しリスト（extractHeadings()で取得したもの）
 * @returns ID付き見出しを含むHTML
 */
export function addHeadingIds(html: string, headings: Heading[]): string {
  let result = html;
  let counter = 0;

  result = result.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();

    // 特定のタイトルをスキップ
    if (cleanText === '要件定義書' || cleanText === '目次') {
      return match;
    }

    if (cleanText && counter < headings.length) {
      const heading = headings[counter++];
      return `<h${level} id="${heading.id}">${text}</h${level}>`;
    }

    return match;
  });

  return result;
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
