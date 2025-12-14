/**
 * 画像埋め込みモジュールのテスト
 */

import fs from 'fs-extra';
import path from 'path';
import { imageToBase64, embedImages } from '../../../src/modules/image/embed';

describe('imageToBase64', () => {
  const testDir = path.join(__dirname, '../../fixtures/images');

  beforeAll(async () => {
    await fs.ensureDir(testDir);

    // テスト用のダミー画像を作成
    // 1x1のPNG画像（最小サイズ）
    const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    await fs.writeFile(path.join(testDir, 'test.png'), pngData);

    // JPEGダミー画像
    const jpegData = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AR//Z', 'base64');
    await fs.writeFile(path.join(testDir, 'test.jpg'), jpegData);
    await fs.writeFile(path.join(testDir, 'test.jpeg'), jpegData);

    // SVGダミー画像
    const svgData = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
    await fs.writeFile(path.join(testDir, 'test.svg'), svgData, 'utf-8');
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  describe('基本的な変換', () => {
    it('PNG画像をBase64に変換できる', async () => {
      const imagePath = path.join(testDir, 'test.png');
      const base64 = await imageToBase64(imagePath);

      expect(base64).toMatch(/^data:image\/png;base64,/);
    });

    it('JPEG画像をBase64に変換できる', async () => {
      const imagePath = path.join(testDir, 'test.jpg');
      const base64 = await imageToBase64(imagePath);

      expect(base64).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('.jpeg拡張子でもJPEG MIMEタイプを使用', async () => {
      const imagePath = path.join(testDir, 'test.jpeg');
      const base64 = await imageToBase64(imagePath);

      expect(base64).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('SVG画像をBase64に変換できる', async () => {
      const imagePath = path.join(testDir, 'test.svg');
      const base64 = await imageToBase64(imagePath);

      expect(base64).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないファイルの場合はエラーを投げる', async () => {
      const imagePath = path.join(testDir, 'nonexistent.png');

      await expect(imageToBase64(imagePath)).rejects.toThrow('画像の読み込みに失敗');
    });
  });
});

describe('embedImages', () => {
  const testDir = path.join(__dirname, '../../fixtures/images');

  beforeAll(async () => {
    await fs.ensureDir(testDir);

    const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    await fs.writeFile(path.join(testDir, 'test.png'), pngData);
    await fs.writeFile(path.join(testDir, 'sample.png'), pngData);
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  describe('Markdown記法の画像', () => {
    it('Markdown記法の画像を<img>タグに変換できる', async () => {
      const html = '![テスト画像](test.png)';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      expect(result).toContain('<img src="data:image/png;base64,');
      expect(result).toContain('alt="テスト画像"');
      expect(result).toContain('max-width: 100%');
      expect(result).not.toContain('![');
    });

    it('複数のMarkdown画像を変換できる', async () => {
      const html = '![画像1](test.png)\n\n![画像2](sample.png)';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      expect(result).toContain('alt="画像1"');
      expect(result).toContain('alt="画像2"');
      const matches = result.match(/data:image\/png;base64,/g);
      expect(matches).toHaveLength(2);
    });

    it('alt属性のHTML特殊文字をエスケープする', async () => {
      const html = '![<script>alert("XSS")</script>](test.png)';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      expect(result).toContain('alt="&lt;script&gt;');
      expect(result).not.toContain('<script>alert');
    });
  });

  describe('<img>タグの変換', () => {
    it('<img>タグの相対パスをBase64に変換できる', async () => {
      const html = '<img src="test.png" alt="テスト" />';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      expect(result).toContain('src="data:image/png;base64,');
      expect(result).toContain('alt="テスト"');
    });

    it('複数の<img>タグを変換できる', async () => {
      const html = '<img src="test.png" /><img src="sample.png" />';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      const matches = result.match(/data:image\/png;base64,/g);
      expect(matches).toHaveLength(2);
    });

    it('<img>タグの属性を保持する', async () => {
      const html = '<img src="test.png" alt="テスト" class="image" />';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      expect(result).toContain('alt="テスト"');
      expect(result).toContain('class="image"');
    });

    it('Data URI形式の画像はスキップする', async () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const html = `<img src="${dataUri}" />`;
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      // Data URIはそのまま
      expect(result).toBe(html);
    });

    it('HTTPSの画像URLはスキップする', async () => {
      const html = '<img src="https://example.com/image.png" />';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      // URLはそのまま
      expect(result).toBe(html);
    });

    it('HTTPの画像URLはスキップする', async () => {
      const html = '<img src="http://example.com/image.png" />';
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      // URLはそのまま
      expect(result).toBe(html);
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しない画像はスキップして処理を継続する', async () => {
      const html = '![存在しない](nonexistent.png) ![存在する](test.png)';

      // console.warnをモック
      const originalWarn = console.warn;
      const mockWarn = jest.fn();
      console.warn = mockWarn;

      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      console.warn = originalWarn;

      // 警告が出力される
      expect(mockWarn).toHaveBeenCalled();

      // 存在する画像は変換される
      expect(result).toContain('alt="存在する"');
      expect(result).toContain('data:image/png;base64,');
    });
  });

  describe('混在コンテンツ', () => {
    it('MarkdownとHTMLの画像を同時に変換できる', async () => {
      const html = `
<p>![Markdown画像](test.png)</p>
<img src="sample.png" alt="HTML画像" />
`;
      const result = await embedImages(html, {
        imagesDir: testDir,
        validatePaths: false,
      });

      expect(result).toContain('alt="Markdown画像"');
      expect(result).toContain('alt="HTML画像"');
      const matches = result.match(/data:image\/png;base64,/g);
      expect(matches).toHaveLength(2);
    });
  });
});
