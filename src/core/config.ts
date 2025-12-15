/**
 * 設定管理モジュール
 *
 * 設定ファイルの読み込み、デフォルト設定の取得、マージを行います。
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

/**
 * 設定オブジェクトの型定義
 */
export interface Config {
  /** 入力ディレクトリ（Markdownファイルが格納されている） */
  inputDir: string;
  /** 出力ディレクトリ（HTML/PDFを出力） */
  outputDir: string;
  /** 画像ディレクトリ */
  imagesDir?: string;
  /** HTML出力設定 */
  html?: {
    /** HTMLテンプレートファイルパス */
    template?: string;
    /** パンくずリストを表示するか */
    breadcrumbs?: boolean;
    /** フッターテキスト */
    footerText?: string;
  };
  /** PDF出力設定 */
  pdf?: {
    /** PDFを生成するか */
    enabled?: boolean;
    /** 用紙サイズ */
    format?: 'A4' | 'A3' | 'Letter' | 'Legal';
    /** 目次を含めるか */
    includeToc?: boolean;
    /** 目次の見出しレベル（1-6、デフォルト: 3） */
    tocLevel?: number;
    /** 表紙を含めるか */
    includeCover?: boolean;
    /** 表紙タイトル */
    coverTitle?: string;
    /** 表紙サブタイトル */
    coverSubtitle?: string;
    /** フォント名 */
    font?: string;
  };
  /** Mermaid設定 */
  mermaid?: {
    /** Mermaid図を変換するか */
    enabled?: boolean;
    /** テーマ */
    theme?: 'default' | 'dark' | 'forest' | 'neutral';
  };
  /** 画像埋め込み設定 */
  images?: {
    /** 画像をBase64で埋め込むか */
    embed?: boolean;
  };
  /** LLM設定 */
  llm?: {
    /** LLM機能を有効化 */
    enabled?: boolean;
    /** プロバイダー */
    provider?: 'anthropic' | 'bedrock';
    /** モデル名 */
    model?: string;
    /** AWSリージョン（Bedrock使用時） */
    awsRegion?: string;
    /** APIキー（Anthropic使用時） */
    apiKey?: string;
    /** 品質チェック機能 */
    qualityCheck?: boolean;
    /** 自動インデックス生成 */
    autoIndex?: boolean;
    /** 自動Frontmatter生成 */
    autoFrontmatter?: boolean;
    /** 自動画像alt属性生成 */
    autoImageAlt?: boolean;
  };
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: Config = {
  inputDir: './markdown',
  outputDir: './output',
  imagesDir: './images',
  html: {
    breadcrumbs: true,
    footerText: '',
  },
  pdf: {
    enabled: false,
    format: 'A4',
    includeToc: true,
    tocLevel: 3,
    includeCover: true,
    font: 'Noto Sans JP',
  },
  mermaid: {
    enabled: true,
    theme: 'default',
  },
  images: {
    embed: true,
  },
  llm: {
    enabled: false,
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    qualityCheck: false,
    autoIndex: false,
    autoFrontmatter: false,
    autoImageAlt: false,
  },
};

/**
 * 設定ファイルを読み込む
 *
 * @param configPath 設定ファイルパス（YAML or JSON）
 * @returns 設定オブジェクト
 */
export async function loadConfig(configPath: string): Promise<Config> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const ext = path.extname(configPath).toLowerCase();

    let config: Partial<Config>;

    if (ext === '.json') {
      config = JSON.parse(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      config = yaml.load(content) as Partial<Config>;
    } else {
      throw new Error('サポートされていない設定ファイル形式です（.json, .yaml, .ymlのみ対応）');
    }

    return mergeConfig(DEFAULT_CONFIG, config);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`設定ファイルが見つかりません: ${configPath}`);
    }
    throw new Error(`設定ファイル読み込みエラー: ${(error as Error).message}`);
  }
}

/**
 * デフォルト設定を取得
 *
 * @returns デフォルト設定オブジェクト
 */
export function getDefaultConfig(): Config {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/**
 * 設定をマージ
 *
 * @param base ベース設定
 * @param override 上書き設定
 * @returns マージされた設定
 */
export function mergeConfig(base: Config, override: Partial<Config>): Config {
  return {
    inputDir: override.inputDir ?? base.inputDir,
    outputDir: override.outputDir ?? base.outputDir,
    imagesDir: override.imagesDir ?? base.imagesDir,
    html: {
      ...base.html,
      ...override.html,
    },
    pdf: {
      ...base.pdf,
      ...override.pdf,
    },
    mermaid: {
      ...base.mermaid,
      ...override.mermaid,
    },
    images: {
      ...base.images,
      ...override.images,
    },
    llm: {
      ...base.llm,
      ...override.llm,
    },
  };
}

/**
 * CLI引数から設定を構築
 *
 * @param args CLI引数オブジェクト
 * @returns 設定オブジェクト
 */
export function configFromCliArgs(args: any): Partial<Config> {
  const config: Partial<Config> = {};

  if (args.input) config.inputDir = args.input;
  if (args.output) config.outputDir = args.output;
  if (args.images) config.imagesDir = args.images;

  if (args.pdf !== undefined) {
    config.pdf = { ...config.pdf, enabled: args.pdf };
  }

  if (args.format) {
    config.pdf = { ...config.pdf, format: args.format };
  }

  if (args.tocLevel) {
    const level = parseInt(args.tocLevel, 10);
    if (level >= 1 && level <= 6) {
      config.pdf = { ...config.pdf, tocLevel: level };
    }
  }

  // --no-toc オプションの処理
  if (args.toc === false) {
    config.pdf = { ...config.pdf, includeToc: false };
  }

  // --font オプションの処理
  if (args.font) {
    config.pdf = { ...config.pdf, font: args.font };
  }

  // LLMオプションの処理
  if (
    args.llm !== undefined ||
    args.llmProvider ||
    args.llmQualityCheck ||
    args.llmAutoIndex ||
    args.llmAutoFrontmatter ||
    args.llmAutoImageAlt
  ) {
    config.llm = {
      enabled: args.llm || false,
      provider: args.llmProvider || 'anthropic',
      model: '',
      qualityCheck: args.llmQualityCheck || false,
      autoIndex: args.llmAutoIndex || false,
      autoFrontmatter: args.llmAutoFrontmatter || false,
      autoImageAlt: args.llmAutoImageAlt || false,
    };
  }

  return config;
}
