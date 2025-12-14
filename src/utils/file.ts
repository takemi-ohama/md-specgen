/**
 * ファイル操作ユーティリティ
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

/**
 * ディレクトリを再帰的に作成
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * ファイルを読み込み
 */
export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * ファイルを書き込み
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * ファイルをコピー
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

/**
 * ディレクトリ内のファイルをglobパターンで検索
 */
export async function findFiles(pattern: string, cwd: string): Promise<string[]> {
  return await glob(pattern, { cwd, absolute: true });
}

/**
 * ファイルの存在確認
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * ディレクトリの存在確認
 */
export async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 相対パスを絶対パスに変換
 */
export function resolveAbsolutePath(
  relativePath: string,
  basePath: string = process.cwd()
): string {
  return path.resolve(basePath, relativePath);
}

/**
 * ファイル拡張子を取得
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * ファイル名（拡張子なし）を取得
 */
export function getBasename(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * ディレクトリパスを取得
 */
export function getDirname(filePath: string): string {
  return path.dirname(filePath);
}
