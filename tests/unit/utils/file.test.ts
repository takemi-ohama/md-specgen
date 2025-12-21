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
  isFile,
  collectMarkdownFiles,
  createTempDir,
  removeTempDir,
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

  describe('isFile', () => {
    it('ファイルの場合はtrueを返す', async () => {
      const testFile = path.join(tmpDir, 'test.txt');
      await writeFile(testFile, 'test');

      const result = await isFile(testFile);
      expect(result).toBe(true);
    });

    it('ディレクトリの場合はfalseを返す', async () => {
      const testDir = path.join(tmpDir, 'test-dir');
      await fs.mkdir(testDir);

      const result = await isFile(testDir);
      expect(result).toBe(false);
    });

    it('存在しないパスの場合はfalseを返す', async () => {
      const testPath = path.join(tmpDir, 'not-exists');
      const result = await isFile(testPath);
      expect(result).toBe(false);
    });
  });

  describe('collectMarkdownFiles', () => {
    it('ファイルパスを指定した場合はそのファイルを返す', async () => {
      const mdFile = path.join(tmpDir, 'test.md');
      await writeFile(mdFile, '# Test');

      const files = await collectMarkdownFiles(mdFile);
      expect(files).toHaveLength(1);
      expect(files[0]).toBe(path.resolve(mdFile));
    });

    it('ディレクトリパスを指定した場合は配下の全*.mdファイルを返す', async () => {
      // テストファイルを作成
      const subDir = path.join(tmpDir, 'sub');
      await fs.mkdir(subDir);
      await writeFile(path.join(tmpDir, 'file1.md'), '');
      await writeFile(path.join(tmpDir, 'file2.md'), '');
      await writeFile(path.join(subDir, 'file3.md'), '');
      await writeFile(path.join(tmpDir, 'file.txt'), '');

      const files = await collectMarkdownFiles(tmpDir);
      expect(files).toHaveLength(3);
      expect(files.every(f => f.endsWith('.md'))).toBe(true);
    });

    it('.mdファイル以外を指定した場合はエラーを投げる', async () => {
      const txtFile = path.join(tmpDir, 'test.txt');
      await writeFile(txtFile, 'test');

      await expect(collectMarkdownFiles(txtFile)).rejects.toThrow(
        'Input file must be a Markdown file (.md)'
      );
    });

    it('存在しないパスを指定した場合はエラーを投げる', async () => {
      const notExistPath = path.join(tmpDir, 'not-exist.md');

      await expect(collectMarkdownFiles(notExistPath)).rejects.toThrow(
        'Path does not exist'
      );
    });

    it('大文字小文字を区別せず.mdファイルを認識する', async () => {
      const mdFileUpper = path.join(tmpDir, 'test.MD');
      await writeFile(mdFileUpper, '# Test');

      const files = await collectMarkdownFiles(mdFileUpper);
      expect(files).toHaveLength(1);
      expect(files[0]).toBe(path.resolve(mdFileUpper));
    });

    it('混合ケースの拡張子も認識する', async () => {
      const mdFileMixed = path.join(tmpDir, 'test.Md');
      await writeFile(mdFileMixed, '# Test');

      const files = await collectMarkdownFiles(mdFileMixed);
      expect(files).toHaveLength(1);
      expect(files[0]).toBe(path.resolve(mdFileMixed));
    });

    it('権限エラーの場合は適切なエラーメッセージを返す', async () => {
      // Note: This test requires Unix-like OS and may need to be skipped on Windows
      if (process.platform === 'win32') {
        return; // Skip on Windows
      }

      const restrictedDir = path.join(tmpDir, 'restricted');
      await fs.mkdir(restrictedDir);
      const restrictedFile = path.join(restrictedDir, 'test.md');
      await writeFile(restrictedFile, '# Test');
      
      // Remove read permissions from directory
      await fs.chmod(restrictedDir, 0o000);

      try {
        await expect(collectMarkdownFiles(restrictedFile)).rejects.toThrow(
          'Permission denied'
        );
      } finally {
        // Restore permissions for cleanup
        await fs.chmod(restrictedDir, 0o755);
      }
    });
  });

  describe('createTempDir', () => {
    it('一時ディレクトリを作成できる', async () => {
      const tempDir = await createTempDir();

      // ディレクトリが存在するか確認
      const exists = await dirExists(tempDir);
      expect(exists).toBe(true);

      // OS一時ディレクトリ配下にあることを確認
      expect(tempDir).toContain(os.tmpdir());

      // クリーンアップ
      await removeTempDir(tempDir);
    });

    it('カスタムプレフィックスを使用できる', async () => {
      const prefix = 'test-prefix-';
      const tempDir = await createTempDir(prefix);

      // fs.mkdtempはプレフィックス＋ランダムサフィックスを生成するため、パス全体にプレフィックスが含まれることを確認
      expect(tempDir).toContain(prefix);

      // クリーンアップ
      await removeTempDir(tempDir);
    });

    it('複数回呼び出すと異なるディレクトリを作成する', async () => {
      const tempDir1 = await createTempDir();
      const tempDir2 = await createTempDir();

      expect(tempDir1).not.toBe(tempDir2);

      // クリーンアップ
      await removeTempDir(tempDir1);
      await removeTempDir(tempDir2);
    });
  });

  describe('removeTempDir', () => {
    it('一時ディレクトリを削除できる', async () => {
      const tempDir = await createTempDir();
      await writeFile(path.join(tempDir, 'test.txt'), 'test');

      await removeTempDir(tempDir);

      const exists = await dirExists(tempDir);
      expect(exists).toBe(false);
    });

    it('存在しないディレクトリを削除してもエラーにならない', async () => {
      const notExistPath = path.join(tmpDir, 'not-exist-temp');

      // エラーを投げずに完了することを期待
      await expect(removeTempDir(notExistPath)).resolves.toBeUndefined();
    });

    it('ファイルを含むディレクトリを削除できる', async () => {
      const tempDir = await createTempDir();
      const subDir = path.join(tempDir, 'sub');
      await fs.mkdir(subDir);
      await writeFile(path.join(tempDir, 'file1.txt'), 'test1');
      await writeFile(path.join(subDir, 'file2.txt'), 'test2');

      await removeTempDir(tempDir);

      const exists = await dirExists(tempDir);
      expect(exists).toBe(false);
    });
  });
});
