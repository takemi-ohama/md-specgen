/**
 * セキュリティユーティリティ
 */

import * as path from 'path';

/**
 * パストラバーサル攻撃を防止するため、ファイルパスをサニタイズ
 *
 * @param filePath ファイルパス
 * @param baseDir ベースディレクトリ
 * @returns サニタイズされたパス
 * @throws エラー: ベースディレクトリ外へのアクセスを検出した場合
 */
export function sanitizeFilePath(filePath: string, baseDir: string): string {
  const normalized = path.normalize(filePath);
  const resolved = path.resolve(baseDir, normalized);

  // ベースディレクトリ外へのアクセスを検出
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error(`Invalid file path: ${filePath}. Path traversal detected.`);
  }

  return resolved;
}

/**
 * 安全なパスかどうか確認
 *
 * @param filePath ファイルパス
 * @param baseDir ベースディレクトリ
 * @returns 安全な場合true
 */
export function isSafePath(filePath: string, baseDir: string): boolean {
  try {
    sanitizeFilePath(filePath, baseDir);
    return true;
  } catch {
    return false;
  }
}

/**
 * HTMLエスケープ
 * XSS対策のため、HTMLの特殊文字をエスケープ
 *
 * @param text エスケープするテキスト
 * @returns エスケープされたテキスト
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * URLエンコード（ファイル名用）
 *
 * @param filename ファイル名
 * @returns エンコードされたファイル名
 */
export function encodeFilename(filename: string): string {
  return encodeURIComponent(filename);
}

/**
 * 安全なファイル名かどうか確認
 * 不正な文字（../, /, \, null byte等）を含まないかチェック
 *
 * @param filename ファイル名
 * @returns 安全な場合true
 */
export function isSafeFilename(filename: string): boolean {
  // 不正な文字を含むかチェック
  const unsafePattern = /(\.\.)|([\\/])|(\0)/;
  return !unsafePattern.test(filename);
}
