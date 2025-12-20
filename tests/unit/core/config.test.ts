/**
 * 設定管理モジュールのテスト
 */

import fs from 'fs-extra';
import path from 'path';
import { loadConfig, getDefaultConfig, mergeConfig, configFromCliArgs, Config } from '../../../src/core/config';

describe('getDefaultConfig', () => {
  it('デフォルト設定を取得できる', () => {
    const config = getDefaultConfig();

    expect(config.inputDir).toBe('./markdown');
    expect(config.outputDir).toBe('./output');
    expect(config.imagesDir).toBe('./images');
  });

  it('HTML設定のデフォルト値を持つ', () => {
    const config = getDefaultConfig();

    expect(config.html?.breadcrumbs).toBe(true);
    expect(config.html?.footerText).toBe('');
  });

  it('PDF設定のデフォルト値を持つ', () => {
    const config = getDefaultConfig();

    expect(config.pdf?.enabled).toBe(false);
    expect(config.pdf?.format).toBe('A4');
    expect(config.pdf?.includeToc).toBe(true);
    expect(config.pdf?.includeCover).toBe(true);
  });

  it('Mermaid設定のデフォルト値を持つ', () => {
    const config = getDefaultConfig();

    expect(config.mermaid?.enabled).toBe(true);
    expect(config.mermaid?.theme).toBe('default');
  });

  it('画像埋め込み設定のデフォルト値を持つ', () => {
    const config = getDefaultConfig();

    expect(config.images?.embed).toBe(true);
  });

  it('LLM設定のデフォルト値を持つ', () => {
    const config = getDefaultConfig();

    expect(config.llm?.enabled).toBe(false);
    expect(config.llm?.provider).toBe('anthropic');
    expect(config.llm?.model).toBe('claude-3-5-sonnet-20241022');
    expect(config.llm?.qualityCheck).toBe(false);
    expect(config.llm?.autoIndex).toBe(false);
    expect(config.llm?.autoFrontmatter).toBe(false);
    expect(config.llm?.autoImageAlt).toBe(false);
  });

  it('独立したコピーを返す（元のデフォルトを変更しない）', () => {
    const config1 = getDefaultConfig();
    const config2 = getDefaultConfig();

    config1.inputDir = '/modified';

    expect(config2.inputDir).toBe('./markdown');
  });
});

describe('mergeConfig', () => {
  it('上書き設定で既定値を上書きできる', () => {
    const base = getDefaultConfig();
    const override = {
      inputDir: '/custom/input',
      outputDir: '/custom/output',
    };

    const merged = mergeConfig(base, override);

    expect(merged.inputDir).toBe('/custom/input');
    expect(merged.outputDir).toBe('/custom/output');
    expect(merged.imagesDir).toBe('./images'); // デフォルト値が残る
  });

  it('ネストされた設定をマージできる', () => {
    const base = getDefaultConfig();
    const override = {
      html: {
        breadcrumbs: false,
      },
    };

    const merged = mergeConfig(base, override);

    expect(merged.html?.breadcrumbs).toBe(false);
    expect(merged.html?.footerText).toBe(''); // デフォルト値が残る
  });

  it('PDF設定を部分的に上書きできる', () => {
    const base = getDefaultConfig();
    const override = {
      pdf: {
        enabled: true,
        format: 'Letter' as const,
      },
    };

    const merged = mergeConfig(base, override);

    expect(merged.pdf?.enabled).toBe(true);
    expect(merged.pdf?.format).toBe('Letter');
    expect(merged.pdf?.includeToc).toBe(true); // デフォルト値が残る
  });

  it('空の上書き設定でデフォルト設定を返す', () => {
    const base = getDefaultConfig();
    const override = {};

    const merged = mergeConfig(base, override);

    expect(merged.inputDir).toBe(base.inputDir);
    expect(merged.outputDir).toBe(base.outputDir);
  });
});

describe('loadConfig', () => {
  const testDir = path.join(__dirname, '../../fixtures/config');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  describe('JSON設定ファイル', () => {
    it('JSON設定ファイルを読み込める', async () => {
      const configPath = path.join(testDir, 'test.json');
      const configData = {
        inputDir: './docs',
        outputDir: './build',
        html: {
          breadcrumbs: false,
        },
      };
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');

      const config = await loadConfig(configPath);

      expect(config.inputDir).toBe('./docs');
      expect(config.outputDir).toBe('./build');
      expect(config.html?.breadcrumbs).toBe(false);
    });

    it('部分的なJSON設定をデフォルトとマージする', async () => {
      const configPath = path.join(testDir, 'partial.json');
      const configData = {
        inputDir: './custom',
      };
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');

      const config = await loadConfig(configPath);

      expect(config.inputDir).toBe('./custom');
      expect(config.outputDir).toBe('./output'); // デフォルト値
      expect(config.imagesDir).toBe('./images'); // デフォルト値
    });
  });

  describe('YAML設定ファイル', () => {
    it('YAML設定ファイル（.yaml）を読み込める', async () => {
      const configPath = path.join(testDir, 'test.yaml');
      const yamlContent = `
inputDir: ./docs
outputDir: ./build
html:
  breadcrumbs: false
  footerText: "© 2024 Test"
`;
      await fs.writeFile(configPath, yamlContent, 'utf-8');

      const config = await loadConfig(configPath);

      expect(config.inputDir).toBe('./docs');
      expect(config.outputDir).toBe('./build');
      expect(config.html?.breadcrumbs).toBe(false);
      expect(config.html?.footerText).toBe('© 2024 Test');
    });

    it('YAML設定ファイル（.yml）を読み込める', async () => {
      const configPath = path.join(testDir, 'test.yml');
      const yamlContent = `
inputDir: ./markdown
outputDir: ./output
`;
      await fs.writeFile(configPath, yamlContent, 'utf-8');

      const config = await loadConfig(configPath);

      expect(config.inputDir).toBe('./markdown');
      expect(config.outputDir).toBe('./output');
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しない設定ファイルの場合はエラーを投げる', async () => {
      const configPath = path.join(testDir, 'nonexistent.json');

      await expect(loadConfig(configPath)).rejects.toThrow('設定ファイルが見つかりません');
    });

    it('サポートされていない形式の場合はエラーを投げる', async () => {
      const configPath = path.join(testDir, 'invalid.txt');
      await fs.writeFile(configPath, 'invalid content', 'utf-8');

      await expect(loadConfig(configPath)).rejects.toThrow('サポートされていない設定ファイル形式');
    });

    it('不正なJSON形式の場合はエラーを投げる', async () => {
      const configPath = path.join(testDir, 'invalid.json');
      await fs.writeFile(configPath, '{ invalid json }', 'utf-8');

      await expect(loadConfig(configPath)).rejects.toThrow('設定ファイル読み込みエラー');
    });
  });

  describe('複雑な設定', () => {
    it('全ての設定項目を含むJSONを読み込める', async () => {
      const configPath = path.join(testDir, 'full.json');
      const configData = {
        inputDir: './markdown',
        outputDir: './output',
        imagesDir: './images',
        html: {
          breadcrumbs: true,
          footerText: 'Footer',
        },
        pdf: {
          enabled: true,
          format: 'A4',
          includeToc: true,
          includeCover: true,
          coverTitle: 'Document',
          coverSubtitle: 'Subtitle',
        },
        mermaid: {
          enabled: true,
          theme: 'dark',
        },
        images: {
          embed: true,
        },
        llm: {
          enabled: true,
          provider: 'bedrock',
          model: 'claude-3',
          awsRegion: 'us-west-2',
          qualityCheck: true,
          autoIndex: true,
          autoFrontmatter: true,
          autoImageAlt: true,
        },
      };
      await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');

      const config = await loadConfig(configPath);

      expect(config.llm?.enabled).toBe(true);
      expect(config.llm?.provider).toBe('bedrock');
      expect(config.llm?.awsRegion).toBe('us-west-2');
      expect(config.mermaid?.theme).toBe('dark');
      expect(config.pdf?.coverTitle).toBe('Document');
    });
  });
});

describe('configFromCliArgs', () => {
  it('CLI引数から設定を構築できる', () => {
    const args = {
      input: '/cli/input',
      output: '/cli/output',
      images: '/cli/images',
    };

    const config = configFromCliArgs(args);

    expect(config.inputDir).toBe('/cli/input');
    expect(config.outputDir).toBe('/cli/output');
    expect(config.imagesDir).toBe('/cli/images');
  });

  it('PDF関連の引数を処理できる', () => {
    const args = {
      pdf: true,
      format: 'Letter' as const,
    };

    const config = configFromCliArgs(args);

    expect(config.pdf?.enabled).toBe(true);
    expect(config.pdf?.format).toBe('Letter');
  });

  it('LLM関連の引数を処理できる', () => {
    const args = {
      llm: true,
      llmProvider: 'bedrock' as const,
      llmQualityCheck: true,
      llmAutoIndex: true,
      llmAutoFrontmatter: true,
      llmAutoImageAlt: true,
    };

    const config = configFromCliArgs(args);

    expect(config.llm?.enabled).toBe(true);
    expect(config.llm?.provider).toBe('bedrock');
    expect(config.llm?.qualityCheck).toBe(true);
    expect(config.llm?.autoIndex).toBe(true);
    expect(config.llm?.autoFrontmatter).toBe(true);
    expect(config.llm?.autoImageAlt).toBe(true);
  });

  it('空の引数オブジェクトで空の設定を返す', () => {
    const args = {};

    const config = configFromCliArgs(args);

    expect(Object.keys(config)).toHaveLength(0);
  });

  it('部分的な引数のみ処理する', () => {
    const args = {
      input: '/custom/input',
    };

    const config = configFromCliArgs(args);

    expect(config.inputDir).toBe('/custom/input');
    expect(config.outputDir).toBeUndefined();
  });
});
