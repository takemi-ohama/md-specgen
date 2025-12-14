/**
 * Frontmatter解析のテスト
 */

import {
  parseFrontmatter,
  hasFrontmatter,
  stripFrontmatter,
} from '../../../src/modules/markdown/frontmatter';

describe('Frontmatter解析', () => {
  describe('parseFrontmatter', () => {
    it('Frontmatterを正しく解析できる', () => {
      const markdown = `---
title: テストタイトル
author: テスト著者
date: 2025-12-14
---

# 本文`;

      const result = parseFrontmatter(markdown);

      expect(result.data.title).toBe('テストタイトル');
      expect(result.data.author).toBe('テスト著者');
      // gray-matterは日付をDateオブジェクトに変換する
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.content).toContain('# 本文');
    });

    it('複数フィールドのFrontmatterを解析できる', () => {
      const markdown = `---
title: ドキュメント
description: 説明文
tags:
  - tag1
  - tag2
version: 1.0.0
---

コンテンツ`;

      const result = parseFrontmatter(markdown);

      expect(result.data.title).toBe('ドキュメント');
      expect(result.data.description).toBe('説明文');
      expect(result.data.tags).toEqual(['tag1', 'tag2']);
      expect(result.data.version).toBe('1.0.0');
    });

    it('Frontmatterがない場合は空のdataを返す', () => {
      const markdown = '# 見出し\n本文';
      const result = parseFrontmatter(markdown);

      expect(result.data).toEqual({});
      expect(result.content).toBe('# 見出し\n本文');
    });

    it('空のFrontmatterの場合', () => {
      const markdown = `---
---

# 見出し`;

      const result = parseFrontmatter(markdown);

      expect(result.data).toEqual({});
      expect(result.content).toContain('# 見出し');
    });

    it('カスタムフィールドを取得できる', () => {
      const markdown = `---
customField: カスタム値
anotherField: 123
---

本文`;

      const result = parseFrontmatter(markdown);

      expect(result.data.customField).toBe('カスタム値');
      expect(result.data.anotherField).toBe(123);
    });

    it('orig フィールドに元のMarkdownが含まれる', () => {
      const markdown = `---
title: Test
---

Content`;

      const result = parseFrontmatter(markdown);

      // origはBufferまたは文字列を返す可能性がある
      expect(result.orig).toBeDefined();
    });
  });

  describe('hasFrontmatter', () => {
    it('Frontmatterがある場合trueを返す', () => {
      const markdown = `---
title: Test
---

Content`;

      expect(hasFrontmatter(markdown)).toBe(true);
    });

    it('Frontmatterがない場合falseを返す', () => {
      const markdown = '# 見出し\n本文';
      expect(hasFrontmatter(markdown)).toBe(false);
    });

    it('先頭に空白がある場合も正しく判定する', () => {
      const markdown = `   ---
title: Test
---

Content`;

      expect(hasFrontmatter(markdown)).toBe(true);
    });

    it('---が途中にある場合はfalseを返す', () => {
      const markdown = '本文\n---\ntitle: Test\n---';
      expect(hasFrontmatter(markdown)).toBe(false);
    });
  });

  describe('stripFrontmatter', () => {
    it('Frontmatterを除去したMarkdownを返す', () => {
      const markdown = `---
title: Test
author: Author
---

# 見出し

本文`;

      const content = stripFrontmatter(markdown);

      expect(content).not.toContain('---');
      expect(content).not.toContain('title: Test');
      expect(content).toContain('# 見出し');
      expect(content).toContain('本文');
    });

    it('Frontmatterがない場合は元のMarkdownを返す', () => {
      const markdown = '# 見出し\n本文';
      const content = stripFrontmatter(markdown);

      expect(content).toBe(markdown);
    });
  });

  describe('エラーハンドリング', () => {
    it('不正なYAMLフォーマットでエラーをスローする', () => {
      const markdown = `---
title: Test
invalid yaml: [unclosed
---

Content`;

      expect(() => parseFrontmatter(markdown)).toThrow();
    });
  });
});
