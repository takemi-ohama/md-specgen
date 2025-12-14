/**
 * 画像セキュリティモジュール
 *
 * 画像パスのセキュリティチェック（パストラバーサル攻撃の防止）を行います。
 */

import path from 'path';

/**
 * 画像パスのセキュリティチェック
 *
 * パストラバーサル攻撃を防ぐため、画像パスが指定されたディレクトリ配下であることを検証します。
 *
 * @param imagePath 画像パス（相対パスまたは絶対パス）
 * @param allowedDir 許可されたディレクトリ（絶対パス）
 * @returns 検証済みの絶対パス
 * @throws {Error} パスが許可されたディレクトリ外の場合
 */
export function validateImagePath(imagePath: string, allowedDir: string): string {
  // allowedDirを正規化
  const allowedDirResolved = path.resolve(allowedDir);

  // 画像パスから不正な文字を除去
  let sanitizedPath = imagePath;

  // 先頭のスラッシュや/specs-images/などのプレフィックスを除去
  sanitizedPath = sanitizedPath.replace(/^\/+/, '');
  sanitizedPath = sanitizedPath.replace(/^specs-images\//, '');

  // ファイル名のみを抽出（パストラバーサル防止）
  const filename = path.basename(sanitizedPath);

  // 許可されたディレクトリ内のパスを構築
  const resolvedPath = path.resolve(allowedDir, filename);

  // パスが許可されたディレクトリ配下にあるかチェック
  if (!resolvedPath.startsWith(allowedDirResolved + path.sep)) {
    throw new Error(`不正な画像パス: ${imagePath}（許可されたディレクトリ外のアクセス試行）`);
  }

  return resolvedPath;
}

/**
 * 画像ファイル拡張子が許可されているかチェック
 *
 * @param filename ファイル名
 * @param allowedExtensions 許可する拡張子リスト（デフォルト: 一般的な画像形式）
 * @returns 許可されている場合true
 */
export function isAllowedImageExtension(
  filename: string,
  allowedExtensions: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
): boolean {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * 画像パスのサニタイズ
 *
 * @param imagePath 画像パス
 * @returns サニタイズされたパス
 */
export function sanitizeImagePath(imagePath: string): string {
  // 先頭のスラッシュやプレフィックスを除去
  let sanitized = imagePath.replace(/^\/+/, '');
  sanitized = sanitized.replace(/^specs-images\//, '');

  // ファイル名のみを抽出
  return path.basename(sanitized);
}
