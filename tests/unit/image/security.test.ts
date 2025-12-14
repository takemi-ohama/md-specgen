/**
 * 画像セキュリティモジュールのテスト
 */

import path from 'path';
import { validateImagePath, isAllowedImageExtension, sanitizeImagePath } from '../../../src/modules/image/security';

describe('validateImagePath', () => {
  const allowedDir = '/var/www/images';

  describe('正常なパス', () => {
    it('単純なファイル名を検証できる', () => {
      const result = validateImagePath('image.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'image.png'));
    });

    it('相対パスからファイル名を抽出して検証する', () => {
      const result = validateImagePath('subdir/image.png', allowedDir);

      // ファイル名のみが使われる（パストラバーサル防止）
      expect(result).toBe(path.join(allowedDir, 'image.png'));
    });

    it('/specs-images/プレフィックスを除去する', () => {
      const result = validateImagePath('/specs-images/image.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'image.png'));
    });

    it('先頭のスラッシュを除去する', () => {
      const result = validateImagePath('/image.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'image.png'));
    });

    it('複数のスラッシュを除去する', () => {
      const result = validateImagePath('///image.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'image.png'));
    });
  });

  describe('パストラバーサル攻撃の防止', () => {
    it('../を含むパスはファイル名のみ抽出される', () => {
      const result = validateImagePath('../../../etc/passwd', allowedDir);

      // ファイル名のみが使われる
      expect(result).toBe(path.join(allowedDir, 'passwd'));
    });

    it('..を含むパスはファイル名のみ抽出される', () => {
      const result = validateImagePath('../../secret/file.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'file.png'));
    });

    it('絶対パスでも許可ディレクトリ内に制限される', () => {
      const result = validateImagePath('/var/www/images/safe.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'safe.png'));
    });
  });

  describe('特殊なケース', () => {
    it('ファイル名にスペースが含まれる場合', () => {
      const result = validateImagePath('my image.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'my image.png'));
    });

    it('ファイル名に日本語が含まれる場合', () => {
      const result = validateImagePath('画像.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, '画像.png'));
    });

    it('長いパスでもファイル名のみ抽出される', () => {
      const result = validateImagePath('a/b/c/d/e/f/g/image.png', allowedDir);

      expect(result).toBe(path.join(allowedDir, 'image.png'));
    });
  });
});

describe('isAllowedImageExtension', () => {
  describe('デフォルトの許可拡張子', () => {
    it('.pngを許可する', () => {
      expect(isAllowedImageExtension('image.png')).toBe(true);
    });

    it('.jpgを許可する', () => {
      expect(isAllowedImageExtension('image.jpg')).toBe(true);
    });

    it('.jpegを許可する', () => {
      expect(isAllowedImageExtension('image.jpeg')).toBe(true);
    });

    it('.gifを許可する', () => {
      expect(isAllowedImageExtension('image.gif')).toBe(true);
    });

    it('.svgを許可する', () => {
      expect(isAllowedImageExtension('image.svg')).toBe(true);
    });

    it('.webpを許可する', () => {
      expect(isAllowedImageExtension('image.webp')).toBe(true);
    });

    it('大文字の拡張子も許可する', () => {
      expect(isAllowedImageExtension('image.PNG')).toBe(true);
      expect(isAllowedImageExtension('image.JPG')).toBe(true);
    });

    it('許可されていない拡張子を拒否する', () => {
      expect(isAllowedImageExtension('script.js')).toBe(false);
      expect(isAllowedImageExtension('document.pdf')).toBe(false);
      expect(isAllowedImageExtension('archive.zip')).toBe(false);
      expect(isAllowedImageExtension('executable.exe')).toBe(false);
    });

    it('拡張子がない場合は拒否する', () => {
      expect(isAllowedImageExtension('noextension')).toBe(false);
    });
  });

  describe('カスタム許可拡張子', () => {
    it('カスタムリストで検証できる', () => {
      const customExtensions = ['.png', '.jpg'];

      expect(isAllowedImageExtension('image.png', customExtensions)).toBe(true);
      expect(isAllowedImageExtension('image.jpg', customExtensions)).toBe(true);
      expect(isAllowedImageExtension('image.gif', customExtensions)).toBe(false);
    });

    it('空のリストで全て拒否できる', () => {
      expect(isAllowedImageExtension('image.png', [])).toBe(false);
    });
  });

  describe('パスを含むファイル名', () => {
    it('パスを含むファイル名でも拡張子をチェックできる', () => {
      expect(isAllowedImageExtension('path/to/image.png')).toBe(true);
      expect(isAllowedImageExtension('path/to/script.js')).toBe(false);
    });
  });
});

describe('sanitizeImagePath', () => {
  it('単純なファイル名をそのまま返す', () => {
    expect(sanitizeImagePath('image.png')).toBe('image.png');
  });

  it('先頭のスラッシュを除去する', () => {
    expect(sanitizeImagePath('/image.png')).toBe('image.png');
  });

  it('複数のスラッシュを除去する', () => {
    expect(sanitizeImagePath('///image.png')).toBe('image.png');
  });

  it('/specs-images/プレフィックスを除去する', () => {
    expect(sanitizeImagePath('/specs-images/image.png')).toBe('image.png');
  });

  it('相対パスからファイル名のみ抽出する', () => {
    expect(sanitizeImagePath('subdir/image.png')).toBe('image.png');
  });

  it('パストラバーサルを含むパスからファイル名のみ抽出する', () => {
    expect(sanitizeImagePath('../../../etc/passwd')).toBe('passwd');
  });

  it('複雑なパスからファイル名のみ抽出する', () => {
    expect(sanitizeImagePath('/specs-images/../../subdir/image.png')).toBe('image.png');
  });

  it('ファイル名にスペースが含まれる場合も処理できる', () => {
    expect(sanitizeImagePath('/path/to/my image.png')).toBe('my image.png');
  });

  it('ファイル名に日本語が含まれる場合も処理できる', () => {
    expect(sanitizeImagePath('/パス/to/画像.png')).toBe('画像.png');
  });

  it('拡張子がないファイル名も処理できる', () => {
    expect(sanitizeImagePath('/path/to/filename')).toBe('filename');
  });
});
