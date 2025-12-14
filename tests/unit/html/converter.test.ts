/**
 * HTML変換モジュールのテスト
 */

import { convertToHtml, generateBreadcrumbs } from '../../../src/modules/html/converter';

describe('convertToHtml', () => {
  describe('基本的なHTML変換', () => {
    it('シンプルなMarkdownをHTMLに変換できる', async () => {
      const markdown = '# テストタイトル\n\nテスト内容です。';
      const result = await convertToHtml(markdown);

      expect(result.html).toContain('<h1');
      expect(result.html).toContain('テストタイトル');
      expect(result.html).toContain('テスト内容です');
      expect(result.title).toBe('テストタイトル');
    });

    it('コードブロックを含むMarkdownを変換できる', async () => {
      const markdown = '# サンプル\n\n```javascript\nconst x = 1;\n```';
      const result = await convertToHtml(markdown);

      expect(result.html).toContain('<pre>');
      expect(result.html).toContain('<code');
    });

    it('リストを含むMarkdownを変換できる', async () => {
      const markdown = '# リスト\n\n- アイテム1\n- アイテム2';
      const result = await convertToHtml(markdown);

      expect(result.html).toContain('<ul>');
      expect(result.html).toContain('アイテム1');
      expect(result.html).toContain('アイテム2');
    });
  });

  describe('Frontmatter処理', () => {
    it('Frontmatterからタイトルを取得できる', async () => {
      const markdown = `---
title: Frontmatterタイトル
author: テスト太郎
---

# 本文見出し

内容です。`;
      const result = await convertToHtml(markdown);

      expect(result.title).toBe('Frontmatterタイトル');
      expect(result.frontmatter.title).toBe('Frontmatterタイトル');
      expect(result.frontmatter.author).toBe('テスト太郎');
    });

    it('Frontmatterがない場合は本文のH1からタイトルを取得', async () => {
      const markdown = '# H1タイトル\n\n内容です。';
      const result = await convertToHtml(markdown);

      expect(result.title).toBe('H1タイトル');
    });

    it('タイトルが見つからない場合はデフォルトタイトルを使用', async () => {
      const markdown = '段落のみの内容です。';
      const result = await convertToHtml(markdown);

      expect(result.title).toBe('ドキュメント');
    });
  });

  describe('オプション', () => {
    it('オプションでタイトルを上書きできる', async () => {
      const markdown = `---
title: Frontmatterタイトル
---

# H1タイトル`;
      const result = await convertToHtml(markdown, {
        title: 'オプションタイトル',
      });

      expect(result.title).toBe('オプションタイトル');
    });

    it('パンくずリストを含めることができる', async () => {
      const markdown = '# テスト';
      const breadcrumbs = [
        { title: 'ホーム', href: 'index.html' },
        { title: 'セクション1', href: 'section1.html' },
        { title: '現在のページ' },
      ];
      const result = await convertToHtml(markdown, { breadcrumbs });

      expect(result.html).toContain('breadcrumb');
      expect(result.html).toContain('ホーム');
      expect(result.html).toContain('セクション1');
      expect(result.html).toContain('現在のページ');
    });

    it('フッターテキストを含めることができる', async () => {
      const markdown = '# テスト';
      const result = await convertToHtml(markdown, {
        footerText: '© 2024 テスト株式会社',
      });

      expect(result.html).toContain('footer');
      expect(result.html).toContain('© 2024 テスト株式会社');
    });

    it('カスタムテンプレートを使用できる', async () => {
      const markdown = '# テスト';
      const customTemplate = `<!DOCTYPE html>
<html>
<head><title>{{TITLE}}</title></head>
<body>
  <div class="custom">{{CONTENT}}</div>
</body>
</html>`;
      const result = await convertToHtml(markdown, {
        template: customTemplate,
      });

      expect(result.html).toContain('<div class="custom">');
      expect(result.html).toContain('テスト');
    });
  });
});

describe('generateBreadcrumbs', () => {
  it('単一ファイルのパスからパンくずリストを生成できる', () => {
    const breadcrumbs = generateBreadcrumbs('file.md');

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ title: 'ホーム', href: 'index.html' });
    expect(breadcrumbs[1]).toEqual({ title: 'file', href: undefined });
  });

  it('ネストされたパスからパンくずリストを生成できる', () => {
    const breadcrumbs = generateBreadcrumbs('section1/subsection/file.md');

    expect(breadcrumbs).toHaveLength(4);
    expect(breadcrumbs[0]).toEqual({ title: 'ホーム', href: 'index.html' });
    expect(breadcrumbs[1]).toEqual({
      title: 'section1',
      href: 'section1/index.html',
    });
    expect(breadcrumbs[2]).toEqual({
      title: 'subsection',
      href: 'section1/subsection/index.html',
    });
    expect(breadcrumbs[3]).toEqual({ title: 'file', href: undefined });
  });

  it('カスタムルートタイトルを使用できる', () => {
    const breadcrumbs = generateBreadcrumbs('file.md', '要件定義書');

    expect(breadcrumbs[0]).toEqual({ title: '要件定義書', href: 'index.html' });
  });

  it('.md拡張子を除去する', () => {
    const breadcrumbs = generateBreadcrumbs('section/document.md');

    expect(breadcrumbs[2].title).toBe('document');
  });

  it('拡張子がない場合も正しく処理する', () => {
    const breadcrumbs = generateBreadcrumbs('section/document');

    expect(breadcrumbs[2].title).toBe('document');
  });
});
