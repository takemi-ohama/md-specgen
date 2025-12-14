/**
 * Frontmatter解析モジュール
 *
 * Markdownファイルの先頭にあるYAML形式のメタデータ（Frontmatter）を解析します。
 * gray-matterライブラリを使用して実装されています。
 */

import matter from 'gray-matter';

/**
 * Frontmatterデータの型定義
 */
export interface FrontmatterData {
  /** ドキュメントタイトル */
  title?: string;
  /** 説明文 */
  description?: string;
  /** 著者 */
  author?: string;
  /** 作成日時 */
  date?: string;
  /** タグ */
  tags?: string[];
  /** カスタムフィールド */
  [key: string]: any;
}

/**
 * Frontmatter解析結果
 */
export interface ParsedFrontmatter {
  /** Frontmatterデータ */
  data: FrontmatterData;
  /** Frontmatter以外のMarkdownコンテンツ */
  content: string;
  /** 元のMarkdownテキスト */
  orig: string | Buffer;
}

/**
 * Frontmatterを解析
 *
 * @param markdown Markdownテキスト（Frontmatter含む）
 * @returns 解析結果
 *
 * @example
 * ```typescript
 * const markdown = `---
 * title: ドキュメントタイトル
 * author: 著者名
 * ---
 *
 * # 本文
 * `;
 *
 * const result = parseFrontmatter(markdown);
 * console.log(result.data.title); // "ドキュメントタイトル"
 * console.log(result.content);    // "# 本文\n"
 * ```
 */
export function parseFrontmatter(markdown: string): ParsedFrontmatter {
  try {
    const result = matter(markdown);

    return {
      data: result.data as FrontmatterData,
      content: result.content,
      orig: result.orig,
    };
  } catch (error) {
    throw new Error(`Frontmatter解析エラー: ${(error as Error).message}`);
  }
}

/**
 * Frontmatterが存在するかチェック
 *
 * @param markdown Markdownテキスト
 * @returns Frontmatterが存在する場合true
 */
export function hasFrontmatter(markdown: string): boolean {
  return markdown.trimStart().startsWith('---');
}

/**
 * Frontmatterを除去したMarkdownを取得
 *
 * @param markdown Markdownテキスト
 * @returns Frontmatterを除去したMarkdown
 */
export function stripFrontmatter(markdown: string): string {
  const { content } = parseFrontmatter(markdown);
  return content;
}
