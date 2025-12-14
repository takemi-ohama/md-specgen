/**
 * ファイル操作ユーティリティのテスト
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {
  ensureDir,
  readFile,
  writeFile,
  copyFile,
  findFiles,
  fileExists,
  dirExists,
  resolveAbsolutePath,
  getExtension,
  getBasename,
  getDirname,
} from '../../../src/utils/file';

describe('file utils', () => {
  let tmpDir: string;

  beforeEach(async () => {
    // 各テストの前に一時ディレクトリを作成
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-specgen-test-'));
  });

  afterEach(async () => {
    // 各テストの後に一時ディレクトリを削除
    await fs.remove(tmpDir);
  });

  describe('ensureDir', () => {
    it('ディレクトリを作成できる', async () => {
      const testDir = path.join(tmpDir, 'test-dir');
      await ensureDir(testDir);
      const exists = await dirExists(testDir);
      expect(exists).toBe(true);
    });

    it('既存ディレクトリの場合もエラーにならない', async () => {
      const testDir = path.join(tmpDir, 'existing-dir');
      await fs.mkdir(testDir);
      await expect(ensureDir(testDir)).resolves.not.toThrow();
    });
  });

  describe('readFile and writeFile', () => {
    it('ファイルの書き込みと読み込みができる', async () => {
      const testFile = path.join(tmpDir, 'test.txt');
      const content = 'テスト内容';

      await writeFile(testFile, content);
      const readContent = await readFile(testFile);

      expect(readContent).toBe(content);
    });

    it('UTF-8で書き込みと読み込みができる', async () => {
      const testFile = path.join(tmpDir, 'japanese.txt');
      const content = 'これは日本語のテストです。';

      await writeFile(testFile, content);
      const readContent = await readFile(testFile);

      expect(readContent).toBe(content);
    });
  });

  describe('copyFile', () => {
    it('ファイルをコピーできる', async () => {
      const srcFile = path.join(tmpDir, 'source.txt');
      const destFile = path.join(tmpDir, 'dest.txt');
      const content = 'コピー元の内容';

      await writeFile(srcFile, content);
      await copyFile(srcFile, destFile);

      const destContent = await readFile(destFile);
      expect(destContent).toBe(content);
    });
  });

  describe('findFiles', () => {
    it('globパターンでファイルを検索できる', async () => {
      // テストファイルを作成
      await writeFile(path.join(tmpDir, 'file1.md'), '');
      await writeFile(path.join(tmpDir, 'file2.md'), '');
      await writeFile(path.join(tmpDir, 'file3.txt'), '');

      const mdFiles = await findFiles('*.md', tmpDir);
      expect(mdFiles).toHaveLength(2);
      expect(mdFiles.every(f => f.endsWith('.md'))).toBe(true);
    });

    it('絶対パスで結果を返す', async () => {
      await writeFile(path.join(tmpDir, 'test.md'), '');
      const files = await findFiles('*.md', tmpDir);

      expect(files.length).toBeGreaterThan(0);
      expect(path.isAbsolute(files[0])).toBe(true);
    });
  });

  describe('fileExists', () => {
    it('存在するファイルの場合trueを返す', async () => {
      const testFile = path.join(tmpDir, 'exists.txt');
      await writeFile(testFile, '');

      const exists = await fileExists(testFile);
      expect(exists).toBe(true);
    });

    it('存在しないファイルの場合falseを返す', async () => {
      const testFile = path.join(tmpDir, 'not-exists.txt');
      const exists = await fileExists(testFile);
      expect(exists).toBe(false);
    });
  });

  describe('dirExists', () => {
    it('存在するディレクトリの場合trueを返す', async () => {
      const testDir = path.join(tmpDir, 'test-dir');
      await fs.mkdir(testDir);

      const exists = await dirExists(testDir);
      expect(exists).toBe(true);
    });

    it('存在しないディレクトリの場合falseを返す', async () => {
      const testDir = path.join(tmpDir, 'not-exists-dir');
      const exists = await dirExists(testDir);
      expect(exists).toBe(false);
    });

    it('ファイルパスの場合falseを返す', async () => {
      const testFile = path.join(tmpDir, 'file.txt');
      await writeFile(testFile, '');

      const exists = await dirExists(testFile);
      expect(exists).toBe(false);
    });
  });

  describe('resolveAbsolutePath', () => {
    it('相対パスを絶対パスに変換できる', () => {
      const basePath = '/base/dir';
      const relativePath = 'sub/file.txt';

      const absolutePath = resolveAbsolutePath(relativePath, basePath);
      expect(path.isAbsolute(absolutePath)).toBe(true);
      expect(absolutePath).toContain('sub/file.txt');
    });

    it('basePathを省略した場合はprocess.cwd()を使用する', () => {
      const relativePath = 'file.txt';
      const absolutePath = resolveAbsolutePath(relativePath);

      expect(path.isAbsolute(absolutePath)).toBe(true);
    });
  });

  describe('getExtension', () => {
    it('ファイル拡張子を取得できる', () => {
      expect(getExtension('test.md')).toBe('.md');
      expect(getExtension('test.txt')).toBe('.txt');
      expect(getExtension('path/to/file.html')).toBe('.html');
    });

    it('拡張子がない場合は空文字を返す', () => {
      expect(getExtension('noextension')).toBe('');
    });
  });

  describe('getBasename', () => {
    it('ファイル名（拡張子なし）を取得できる', () => {
      expect(getBasename('test.md')).toBe('test');
      expect(getBasename('path/to/file.html')).toBe('file');
    });

    it('拡張子がない場合はファイル名をそのまま返す', () => {
      expect(getBasename('noextension')).toBe('noextension');
    });
  });

  describe('getDirname', () => {
    it('ディレクトリパスを取得できる', () => {
      expect(getDirname('/path/to/file.txt')).toBe('/path/to');
      expect(getDirname('relative/path/file.txt')).toBe('relative/path');
    });

    it('ルートディレクトリの場合', () => {
      expect(getDirname('/file.txt')).toBe('/');
    });
  });
});
