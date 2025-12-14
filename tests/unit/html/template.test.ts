/**
 * HTMLテンプレートモジュールのテスト
 */

import fs from 'fs-extra';
import path from 'path';
import { applyTemplate, getDefaultTemplate, loadTemplate, TemplateData } from '../../../src/modules/html/template';

describe('applyTemplate', () => {
  describe('基本的なテンプレート適用', () => {
    it('タイトルとコンテンツを置換できる', () => {
      const template = '<!DOCTYPE html><html><head><title>{{TITLE}}</title></head><body>{{CONTENT}}</body></html>';
      const data: TemplateData = {
        title: 'テストタイトル',
        content: '<p>テストコンテンツ</p>',
      };
      const html = applyTemplate(data, template);

      expect(html).toContain('<title>テストタイトル</title>');
      expect(html).toContain('<p>テストコンテンツ</p>');
    });

    it('デフォルトテンプレートを使用できる', () => {
      const data: TemplateData = {
        title: 'テストタイトル',
        content: '<p>テストコンテンツ</p>',
      };
      const html = applyTemplate(data);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>テストタイトル</title>');
      expect(html).toContain('<p>テストコンテンツ</p>');
    });
  });

  describe('パンくずリスト', () => {
    it('パンくずリストを含めることができる', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
        breadcrumbs: [
          { title: 'ホーム', href: 'index.html' },
          { title: '現在のページ' },
        ],
      };
      const html = applyTemplate(data);

      expect(html).toContain('breadcrumb');
      expect(html).toContain('ホーム');
      expect(html).toContain('index.html');
      expect(html).toContain('現在のページ');
    });

    it('パンくずリストが空の場合は何も出力しない', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
        breadcrumbs: [],
      };
      const html = applyTemplate(data);

      // パンくずナビゲーション要素は出力されない
      expect(html).not.toContain('<nav class="breadcrumb">');
    });

    it('パンくずリストがundefinedの場合は何も出力しない', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
      };
      const html = applyTemplate(data);

      // パンくずナビゲーション要素は出力されない
      expect(html).not.toContain('<nav class="breadcrumb">');
    });

    it('パンくずリストのセパレーターが正しく挿入される', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
        breadcrumbs: [
          { title: 'A', href: 'a.html' },
          { title: 'B', href: 'b.html' },
          { title: 'C' },
        ],
      };
      const html = applyTemplate(data);

      expect(html).toContain('breadcrumb-separator');
    });
  });

  describe('フッター', () => {
    it('フッターテキストを含めることができる', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
        footerText: '© 2024 テスト株式会社',
      };
      const html = applyTemplate(data);

      expect(html).toContain('<footer>');
      expect(html).toContain('© 2024 テスト株式会社');
    });

    it('フッターテキストがない場合は何も出力しない', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
      };
      const html = applyTemplate(data);

      // デフォルトテンプレートの{{FOOTER}}プレースホルダーは残るが、
      // footer要素は追加されない
      expect(html).not.toContain('<footer>');
    });
  });

  describe('XSSセキュリティ', () => {
    it('タイトルの特殊文字をエスケープする', () => {
      const data: TemplateData = {
        title: '<script>alert("XSS")</script>',
        content: '<p>内容</p>',
      };
      const html = applyTemplate(data);

      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('パンくずリストの特殊文字をエスケープする', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
        breadcrumbs: [
          { title: '<script>alert("XSS")</script>', href: 'test.html' },
        ],
      };
      const html = applyTemplate(data);

      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('フッターテキストの特殊文字をエスケープする', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>内容</p>',
        footerText: '<script>alert("XSS")</script>',
      };
      const html = applyTemplate(data);

      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('コンテンツはエスケープしない（既にHTMLのため）', () => {
      const data: TemplateData = {
        title: 'テスト',
        content: '<p>正常な<strong>HTML</strong></p>',
      };
      const html = applyTemplate(data);

      expect(html).toContain('<p>正常な<strong>HTML</strong></p>');
    });
  });

  describe('複数のプレースホルダー', () => {
    it('同じプレースホルダーが複数ある場合は全て置換される', () => {
      const template = '<html><head><title>{{TITLE}}</title></head><body><h1>{{TITLE}}</h1>{{CONTENT}}</body></html>';
      const data: TemplateData = {
        title: 'テストタイトル',
        content: '<p>内容</p>',
      };
      const html = applyTemplate(data, template);

      // タイトルが2箇所に出現
      const titleMatches = html.match(/テストタイトル/g);
      expect(titleMatches).toHaveLength(2);
    });
  });
});

describe('getDefaultTemplate', () => {
  it('デフォルトテンプレートを取得できる', () => {
    const template = getDefaultTemplate();

    expect(template).toContain('<!DOCTYPE html>');
    expect(template).toContain('{{TITLE}}');
    expect(template).toContain('{{CONTENT}}');
    expect(template).toContain('{{BREADCRUMBS}}');
    expect(template).toContain('{{FOOTER}}');
  });

  it('NumPy風のスタイルを含む', () => {
    const template = getDefaultTemplate();

    expect(template).toContain('Open Sans');
    expect(template).toContain('--body-color');
    expect(template).toContain('--link-color');
  });
});

describe('loadTemplate', () => {
  const testDir = path.join(__dirname, '../../fixtures/templates');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  it('テンプレートファイルを読み込める', async () => {
    const templatePath = path.join(testDir, 'test-template.html');
    const templateContent = '<html><head><title>{{TITLE}}</title></head><body>{{CONTENT}}</body></html>';
    await fs.writeFile(templatePath, templateContent, 'utf-8');

    const template = await loadTemplate(templatePath);

    expect(template).toBe(templateContent);
  });

  it('存在しないファイルの場合はエラーを投げる', async () => {
    const templatePath = path.join(testDir, 'nonexistent.html');

    await expect(loadTemplate(templatePath)).rejects.toThrow('テンプレート読み込みエラー');
  });

  it('UTF-8でエンコードされたファイルを正しく読み込める', async () => {
    const templatePath = path.join(testDir, 'utf8-template.html');
    const templateContent = '<html><head><title>日本語タイトル</title></head></html>';
    await fs.writeFile(templatePath, templateContent, 'utf-8');

    const template = await loadTemplate(templatePath);

    expect(template).toContain('日本語タイトル');
  });
});
