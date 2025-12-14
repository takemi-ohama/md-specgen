/**
 * セキュリティユーティリティのテスト
 */

import { sanitizeFilePath, isSafePath, escapeHtml, isSafeFilename, encodeFilename } from '../../../src/utils/security';

describe('security utils', () => {
  describe('sanitizeFilePath', () => {
    it('正常なパスはそのまま返す', () => {
      const result = sanitizeFilePath('test.md', '/base/dir');
      expect(result).toContain('test.md');
    });

    it('パストラバーサルを検出してエラーを投げる', () => {
      expect(() => {
        sanitizeFilePath('../../../etc/passwd', '/base/dir');
      }).toThrow('Path traversal detected');
    });
  });

  describe('isSafePath', () => {
    it('安全なパスの場合trueを返す', () => {
      expect(isSafePath('test.md', '/base/dir')).toBe(true);
    });

    it('危険なパスの場合falseを返す', () => {
      expect(isSafePath('../../../etc/passwd', '/base/dir')).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('HTMLの特殊文字をエスケープする', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('通常のテキストはそのまま返す', () => {
      expect(escapeHtml('normal text')).toBe('normal text');
    });
  });

  describe('isSafeFilename', () => {
    it('安全なファイル名の場合trueを返す', () => {
      expect(isSafeFilename('document.md')).toBe(true);
      expect(isSafeFilename('my-file_123.txt')).toBe(true);
    });

    it('危険なファイル名の場合falseを返す', () => {
      expect(isSafeFilename('../test.md')).toBe(false);
      expect(isSafeFilename('path/to/file.md')).toBe(false);
      expect(isSafeFilename('file\0.md')).toBe(false);
    });
  });

  describe('encodeFilename', () => {
    it('ファイル名をURLエンコードする', () => {
      expect(encodeFilename('test file.md')).toBe('test%20file.md');
      expect(encodeFilename('ファイル.md')).toBe('%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB.md');
    });

    it('特殊文字を含むファイル名を正しくエンコードする', () => {
      expect(encodeFilename('test&file.md')).toBe('test%26file.md');
      expect(encodeFilename('test#file.md')).toBe('test%23file.md');
    });

    it('通常のASCII文字はそのままエンコードする', () => {
      expect(encodeFilename('test-file_123.md')).toBe('test-file_123.md');
    });
  });
});
