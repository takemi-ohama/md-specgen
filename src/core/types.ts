/**
 * コア型定義
 */

/**
 * PDF設定
 */
export interface PdfConfig {
  /** ページサイズ (例: 'A4', 'Letter') */
  pageSize: string;
  /** マージン設定 */
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  /** フォント名 (例: 'IPAGothic') */
  font?: string;
  /** ヘッダー・フッター設定 */
  headerFooter?: {
    displayHeader: boolean;
    displayFooter: boolean;
  };
}

/**
 * LLM設定
 */
export interface LlmConfig {
  /** LLM機能を有効化 */
  enabled: boolean;
  /** プロバイダー: 'anthropic' または 'bedrock' */
  provider: 'anthropic' | 'bedrock';
  /** モデル名 (例: 'claude-3-5-sonnet-20241022', 'anthropic.claude-3-5-sonnet-20241022-v2:0') */
  model: string;
  /** AWS リージョン (Bedrock使用時のみ) */
  awsRegion?: string;
  /** APIキー (Anthropic使用時のみ) */
  apiKey?: string;
  /** 品質チェック機能 */
  qualityCheck?: boolean;
  /** 自動インデックス生成 */
  autoIndex?: boolean;
  /** 自動Frontmatter生成 */
  autoFrontmatter?: boolean;
  /** 自動画像alt属性生成 */
  autoImageAlt?: boolean;
}

/**
 * 全体設定
 */
export interface Config {
  /** 入力Markdownディレクトリ */
  inputDir: string;
  /** 出力ディレクトリ */
  outputDir: string;
  /** 画像ディレクトリ */
  imagesDir?: string;
  /** 出力フォーマット: 'html', 'pdf', 'both' */
  format: 'html' | 'pdf' | 'both';
  /** スタイルテンプレート: 'numpy', 'gitbook', 'custom' */
  style: string;
  /** PDF設定 */
  pdf?: PdfConfig;
  /** LLM設定 */
  llm?: LlmConfig;
  /** 詳細ログ出力 */
  verbose?: boolean;
}

/**
 * Frontmatter定義
 */
export interface Frontmatter {
  /** タイトル */
  title?: string;
  /** 順序 */
  order?: number;
  /** 説明 */
  description?: string;
  /** 著者 */
  author?: string;
  /** 日付 */
  date?: string;
  /** タグ */
  tags?: string[];
  /** カスタムフィールド */
  [key: string]: unknown;
}

/**
 * Markdownファイル
 */
export interface MarkdownFile {
  /** ファイルパス */
  path: string;
  /** Frontmatter */
  frontmatter: Frontmatter;
  /** Markdownコンテンツ（Frontmatter除く） */
  content: string;
  /** 生のMarkdown（Frontmatter含む） */
  rawContent: string;
}

/**
 * HTMLファイル
 */
export interface HtmlFile {
  /** 元のMarkdownファイルパス */
  markdownPath: string;
  /** HTMLファイルパス */
  htmlPath: string;
  /** HTMLコンテンツ */
  content: string;
  /** Frontmatter */
  frontmatter: Frontmatter;
}

/**
 * ページ情報（インデックス生成用）
 */
export interface PageInfo {
  /** タイトル */
  title: string;
  /** 相対URL */
  url: string;
  /** 順序 */
  order: number;
  /** 説明 */
  description?: string;
}
