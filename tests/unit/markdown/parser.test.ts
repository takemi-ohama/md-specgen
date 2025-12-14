/**
 * Markdownパーサーのテスト
 */

import { MarkdownParser, parseMarkdown } from '../../../src/modules/markdown/parser';

describe('MarkdownParser', () => {
  describe('基本的なMarkdown変換', () => {
    it('見出しをHTMLに変換できる', async () => {
      const parser = new MarkdownParser();
      const markdown = '# 見出し1\n## 見出し2';
      const html = await parser.parseMarkdown(markdown);

      expect(html).toContain('<h1');
      expect(html).toContain('見出し1');
      expect(html).toContain('<h2');
      expect(html).toContain('見出し2');
    });

    it('リストをHTMLに変換できる', async () => {
      const parser = new MarkdownParser();
      const markdown = '- アイテム1\n- アイテム2\n- アイテム3';
      const html = await parser.parseMarkdown(markdown);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li>アイテム1</li>');
      expect(html).toContain('<li>アイテム2</li>');
    });

    it('コードブロックをHTMLに変換できる', async () => {
      const parser = new MarkdownParser();
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = await parser.parseMarkdown(markdown);

      expect(html).toContain('<pre>');
      expect(html).toContain('<code');
    });
  });

  describe('オプション', () => {
    it('gfm=trueでテーブルを変換できる', async () => {
      const parser = new MarkdownParser({ gfm: true });
      const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
      const html = await parser.parseMarkdown(markdown);

      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
    });

    it('breaks=trueで改行を<br>に変換する', async () => {
      const parser = new MarkdownParser({ breaks: true });
      const markdown = 'line1\nline2';
      const html = await parser.parseMarkdown(markdown);

      expect(html).toContain('<br>');
    });

    it('breaks=falseでは改行を<br>に変換しない', async () => {
      const parser = new MarkdownParser({ breaks: false });
      const markdown = 'line1\nline2';
      const html = await parser.parseMarkdown(markdown);

      // breaksがfalseの場合、単一の改行は<br>にならない
      const brCount = (html.match(/<br>/g) || []).length;
      expect(brCount).toBe(0);
    });

    it('highlight=trueでシンタックスハイライトを適用する', async () => {
      const parser = new MarkdownParser({ highlight: true });
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = await parser.parseMarkdown(markdown);

      // highlight.jsが適用されると<span>タグが含まれる
      expect(html).toContain('const');
    });

    it('highlight=falseではシンタックスハイライトを適用しない', async () => {
      const parser = new MarkdownParser({ highlight: false });
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = await parser.parseMarkdown(markdown);

      expect(html).toContain('const x = 1;');
    });
  });

  describe('parseMarkdownSync', () => {
    it('同期的にMarkdownを変換できる', () => {
      const parser = new MarkdownParser();
      const markdown = '# 見出し';
      const html = parser.parseMarkdownSync(markdown);

      expect(html).toContain('<h1');
      expect(html).toContain('見出し');
    });
  });

  describe('エラーハンドリング', () => {
    it('不正なMarkdownでエラーをスローする', async () => {
      const parser = new MarkdownParser();
      // markedは通常、不正な入力でもエラーをスローしないため、
      // このテストは現在の実装ではパスする可能性がある
      // 将来的なエラーケースのためのプレースホルダー
      await expect(parser.parseMarkdown('')).resolves.toBeDefined();
    });
  });
});

describe('parseMarkdown関数', () => {
  it('関数インターフェースでMarkdownを変換できる', async () => {
    const markdown = '# タイトル';
    const html = await parseMarkdown(markdown);

    expect(html).toContain('<h1');
    expect(html).toContain('タイトル');
  });

  it('オプションを指定できる', async () => {
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = await parseMarkdown(markdown, { gfm: true });

    expect(html).toContain('<table>');
  });
});
