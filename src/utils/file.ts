/**
 * ファイル操作ユーティリティ
 */

import fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
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

/**
 * パスがファイルかディレクトリかを判定
 */
export async function isFile(inputPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(inputPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Markdownファイルを収集
 * inputPathがファイルの場合はそのファイルを、ディレクトリの場合は配下の全*.mdファイルを返す
 */
export async function collectMarkdownFiles(inputPath: string): Promise<string[]> {
  let stat;
  try {
    stat = await fs.stat(inputPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Path does not exist: ${inputPath}`);
    } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      throw new Error(`Permission denied: ${inputPath}`);
    }
    throw error;
  }

  if (stat.isFile()) {
    // ファイルパスが指定された場合
    const ext = path.extname(inputPath).toLowerCase();
    if (ext !== '.md') {
      throw new Error(`Input file must be a Markdown file (.md): ${inputPath}`);
    }
    return [path.resolve(inputPath)];
  } else if (stat.isDirectory()) {
    // ディレクトリパスが指定された場合
    const pattern = path.join(inputPath, '**/*.md');
    const files = await glob(pattern);
    return files.map(f => path.resolve(f));
  } else {
    throw new Error(`Invalid input path: ${inputPath}`);
  }
}

/**
 * 一時ディレクトリを作成
 * @param prefix ディレクトリ名のプレフィックス
 * @returns 作成された一時ディレクトリのパス
 */
export async function createTempDir(prefix: string = 'md-specgen-'): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}`);
  await fs.ensureDir(tmpDir);
  return tmpDir;
}

/**
 * 一時ディレクトリを削除
 * @param dirPath 削除する一時ディレクトリのパス
 */
export async function removeTempDir(dirPath: string): Promise<void> {
  try {
    await fs.remove(dirPath);
  } catch (error) {
    console.warn(`警告: 一時ディレクトリの削除に失敗しました: ${dirPath}`, error);
  }
}
