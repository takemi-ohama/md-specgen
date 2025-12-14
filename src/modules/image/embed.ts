/**
 * 画像埋め込みモジュール
 *
 * 画像をBase64エンコードしてHTMLに埋め込みます。
 */

import fs from 'fs-extra';
import path from 'path';
import { validateImagePath } from './security.js';

/**
 * 画像埋め込みオプション
 */
export interface ImageEmbedOptions {
  /** 画像ディレクトリ（絶対パス） */
  imagesDir: string;
  /** パス検証を有効化（デフォルト: true） */
  validatePaths?: boolean;
}

/**
 * 画像ファイルをBase64エンコード
 *
 * @param imagePath 画像ファイルパス（絶対パス）
 * @returns Base64エンコードされたData URI
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();

    // MIME typeを決定
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.gif') {
      mimeType = 'image/gif';
    } else if (ext === '.svg') {
      mimeType = 'image/svg+xml';
    } else if (ext === '.webp') {
      mimeType = 'image/webp';
    }

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    throw new Error(`画像の読み込みに失敗: ${imagePath} - ${(error as Error).message}`);
  }
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

/**
 * HTML内の画像パスをBase64に変換
 *
 * @param html HTMLコンテンツ
 * @param options 埋め込みオプション
 * @returns Base64画像を埋め込んだHTML
 */
export async function embedImages(html: string, options: ImageEmbedOptions): Promise<string> {
  const { imagesDir, validatePaths = true } = options;
  const imagesDirResolved = path.resolve(imagesDir);

  let result = html;

  // Markdown記法の画像を<img>タグに変換
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let markdownMatch;

  const markdownReplacements: Array<{ match: string; replacement: string }> = [];

  while ((markdownMatch = markdownImageRegex.exec(html)) !== null) {
    const alt = markdownMatch[1];
    const imagePath = markdownMatch[2];

    try {
      // パス検証
      const resolvedPath = validatePaths
        ? validateImagePath(imagePath, imagesDirResolved)
        : path.resolve(imagesDir, path.basename(imagePath));

      const base64Src = await imageToBase64(resolvedPath);
      const safeAlt = escapeHtml(alt);

      markdownReplacements.push({
        match: markdownMatch[0],
        replacement: `<img src="${base64Src}" alt="${safeAlt}" style="max-width: 100%; height: auto;" />`,
      });
    } catch (error) {
      console.warn(`画像の埋め込みに失敗: ${imagePath} - ${(error as Error).message}`);
    }
  }

  // Markdown記法を置換
  for (const { match, replacement } of markdownReplacements) {
    result = result.replace(match, replacement);
  }

  // 既存の<img>タグのパスを変換
  const imgTagRegex = /<img([^>]*?)src="([^"]+)"([^>]*)>/g;
  let imgMatch;

  const imgReplacements: Array<{ match: string; replacement: string }> = [];

  while ((imgMatch = imgTagRegex.exec(result)) !== null) {
    const before = imgMatch[1];
    const imagePath = imgMatch[2];
    const after = imgMatch[3];

    // Data URIはスキップ
    if (imagePath.startsWith('data:')) {
      continue;
    }

    // HTTPSはスキップ
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      continue;
    }

    try {
      // パス検証
      const resolvedPath = validatePaths
        ? validateImagePath(imagePath, imagesDirResolved)
        : path.resolve(imagesDir, path.basename(imagePath));

      const base64Src = await imageToBase64(resolvedPath);

      imgReplacements.push({
        match: imgMatch[0],
        replacement: `<img${before}src="${base64Src}"${after}>`,
      });
    } catch (error) {
      console.warn(`画像の埋め込みに失敗: ${imagePath} - ${(error as Error).message}`);
    }
  }

  // <img>タグを置換
  for (const { match, replacement } of imgReplacements) {
    result = result.replace(match, replacement);
  }

  return result;
}
