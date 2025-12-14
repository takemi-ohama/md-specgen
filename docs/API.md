# md-specgen API リファレンス

このドキュメントでは、`md-specgen`パッケージの公開APIについて詳細に説明します。

## 目次

- [コア機能](#コア機能)
- [設定管理](#設定管理)
- [Markdown処理](#markdown処理)
- [HTML生成](#html生成)
- [PDF生成](#pdf生成)
- [Mermaid処理](#mermaid処理)
- [画像処理](#画像処理)
- [LLM機能](#llm機能)
- [型定義](#型定義)

---

## コア機能

### `generate(options: Config): Promise<GenerateResult>`

メインの生成関数です。設定に基づいてMarkdownファイルをHTML/PDFに変換します。

**引数:**
- `options` (`Config`): 設定オブジェクト

**戻り値:**
- `Promise<GenerateResult>`: 生成結果

**使用例:**

```typescript
import { generate, loadConfig } from 'md-specgen';

const config = await loadConfig('./md-specgen.config.json');
const result = await generate(config);

console.log(`生成されたファイル数: ${result.filesGenerated}`);
```

---

## 設定管理

### `loadConfig(configPath: string): Promise<Config>`

設定ファイル（JSON/YAML）を読み込み、デフォルト設定とマージします。

**引数:**
- `configPath` (`string`): 設定ファイルパス

**戻り値:**
- `Promise<Config>`: マージされた設定オブジェクト

**使用例:**

```typescript
import { loadConfig } from 'md-specgen';

const config = await loadConfig('./md-specgen.config.json');
```

### `getDefaultConfig(): Config`

デフォルト設定を取得します。

**戻り値:**
- `Config`: デフォルト設定オブジェクト

**使用例:**

```typescript
import { getDefaultConfig } from 'md-specgen';

const defaultConfig = getDefaultConfig();
console.log(defaultConfig.inputDir); // './markdown'
```

### `mergeConfig(base: Config, override: Partial<Config>): Config`

2つの設定オブジェクトをマージします。

**引数:**
- `base` (`Config`): ベース設定
- `override` (`Partial<Config>`): 上書き設定

**戻り値:**
- `Config`: マージされた設定

**使用例:**

```typescript
import { getDefaultConfig, mergeConfig } from 'md-specgen';

const base = getDefaultConfig();
const custom = { inputDir: './docs', outputDir: './build' };
const merged = mergeConfig(base, custom);
```

### `configFromCliArgs(args: any): Partial<Config>`

CLI引数から設定オブジェクトを構築します。

**引数:**
- `args` (`any`): CLI引数オブジェクト

**戻り値:**
- `Partial<Config>`: 設定オブジェクト

---

## Markdown処理

### `parseMarkdown(markdown: string, options?: MarkdownParserOptions): Promise<string>`

Markdown文字列をHTMLに変換します。

**引数:**
- `markdown` (`string`): Markdownテキスト
- `options` (`MarkdownParserOptions`, オプション): パーサーオプション

**戻り値:**
- `Promise<string>`: 変換されたHTML

**使用例:**

```typescript
import { parseMarkdown } from 'md-specgen';

const markdown = '# Hello\n\nThis is **bold** text.';
const html = await parseMarkdown(markdown);
console.log(html); // '<h1>Hello</h1>\n<p>This is <strong>bold</strong> text.</p>'
```

### `MarkdownParser`

Markdownパーサークラスです。

**コンストラクタ:**

```typescript
new MarkdownParser(options?: MarkdownParserOptions)
```

**メソッド:**

#### `parseMarkdown(markdown: string): Promise<string>`

Markdown文字列をHTMLに変換します。

### `parseFrontmatter(markdown: string): ParsedFrontmatter`

MarkdownからFrontmatterを解析します。

**引数:**
- `markdown` (`string`): Markdownテキスト

**戻り値:**
- `ParsedFrontmatter`: `{ data, content }`

**使用例:**

```typescript
import { parseFrontmatter } from 'md-specgen';

const markdown = `---
title: Hello
author: John
---

Content here.`;

const { data, content } = parseFrontmatter(markdown);
console.log(data.title); // 'Hello'
console.log(content); // 'Content here.'
```

### `hasFrontmatter(markdown: string): boolean`

MarkdownにFrontmatterが含まれているか確認します。

### `stripFrontmatter(markdown: string): string`

MarkdownからFrontmatterを除去します。

---

## HTML生成

### `convertToHtml(markdown: string, options?: HtmlConversionOptions): Promise<HtmlConversionResult>`

MarkdownをHTMLに変換し、テンプレートを適用します。

**引数:**
- `markdown` (`string`): Markdownテキスト
- `options` (`HtmlConversionOptions`, オプション): 変換オプション

**戻り値:**
- `Promise<HtmlConversionResult>`: `{ html, title, frontmatter }`

**使用例:**

```typescript
import { convertToHtml } from 'md-specgen';

const markdown = '# My Document\n\nContent here.';
const result = await convertToHtml(markdown, {
  breadcrumbs: [
    { title: 'Home', href: 'index.html' },
    { title: 'Current' }
  ],
  footerText: '© 2024 My Company'
});

console.log(result.title); // 'My Document'
console.log(result.html); // 完全なHTMLドキュメント
```

### `generateBreadcrumbs(relativePath: string, rootTitle?: string): Array<{ title: string; href?: string }>`

ファイルパスからパンくずリストを生成します。

**引数:**
- `relativePath` (`string`): ファイル相対パス（例: "section1/subsection/file.md"）
- `rootTitle` (`string`, オプション): ルートタイトル（デフォルト: "ホーム"）

**戻り値:**
- `Array<{ title: string; href?: string }>`: パンくずリスト

**使用例:**

```typescript
import { generateBreadcrumbs } from 'md-specgen';

const breadcrumbs = generateBreadcrumbs('section1/subsection/file.md', '要件定義書');
// [
//   { title: '要件定義書', href: 'index.html' },
//   { title: 'section1', href: 'section1/index.html' },
//   { title: 'subsection', href: 'section1/subsection/index.html' },
//   { title: 'file', href: undefined }
// ]
```

### `loadTemplate(templatePath: string): Promise<string>`

HTMLテンプレートファイルを読み込みます。

### `applyTemplate(data: TemplateData, customTemplate?: string): string`

テンプレートにデータを適用します。

**引数:**
- `data` (`TemplateData`): テンプレートデータ
- `customTemplate` (`string`, オプション): カスタムテンプレート

**戻り値:**
- `string`: 完成したHTML

### `getDefaultTemplate(): string`

デフォルトのHTMLテンプレートを取得します。

### `generateIndexPage(entries: IndexEntry[], options?: IndexPageOptions): string`

インデックスページ（目次）HTMLを生成します。

---

## PDF生成

### `convertToPdf(html: string, options?: PdfConversionOptions): Promise<Buffer>`

HTMLをPDFに変換します。

**引数:**
- `html` (`string`): HTMLコンテンツ
- `options` (`PdfConversionOptions`, オプション): PDF変換オプション

**戻り値:**
- `Promise<Buffer>`: PDFバイナリデータ

**使用例:**

```typescript
import { convertToPdf } from 'md-specgen';
import fs from 'fs-extra';

const html = '<html><body><h1>Hello PDF</h1></body></html>';
const pdfBuffer = await convertToPdf(html, {
  format: 'A4',
  margin: {
    top: '1cm',
    right: '1cm',
    bottom: '1cm',
    left: '1cm'
  }
});

await fs.writeFile('output.pdf', pdfBuffer);
```

### `convertMultipleHtmlsToPdf(htmls: string[], options?: PdfConversionOptions): Promise<Buffer>`

複数のHTMLファイルを1つのPDFに結合します。

### `extractHeadings(html: string): Heading[]`

HTMLから見出しを抽出します。

### `generateToc(headings: Heading[], options?: TocOptions): string`

見出しから目次HTMLを生成します。

### `addHeadingIds(html: string): string`

HTMLの見出しにIDを追加します。

### Puppeteer管理

#### `initBrowser(options?: PuppeteerOptions): Promise<Browser>`

Puppeteerブラウザを初期化します。

#### `closeBrowser(): Promise<void>`

Puppeteerブラウザを閉じます。

#### `getBrowser(): Browser | null`

現在のブラウザインスタンスを取得します。

---

## Mermaid処理

### `convertMermaidToSvg(mermaidCode: string, options?: MermaidConversionOptions): Promise<string>`

Mermaidコードをdiv要素+SVGに変換します。

**引数:**
- `mermaidCode` (`string`): Mermaidダイアグラムコード
- `options` (`MermaidConversionOptions`, オプション): 変換オプション

**戻り値:**
- `Promise<string>`: SVG文字列

**使用例:**

```typescript
import { convertMermaidToSvg } from 'md-specgen';

const mermaidCode = `
graph TD
  A[Start] --> B[Process]
  B --> C[End]
`;

const svg = await convertMermaidToSvg(mermaidCode, {
  theme: 'dark'
});
```

### `replaceMermaidDiagrams(html: string, options?: MermaidConversionOptions): Promise<string>`

HTML内のMermaidコードブロックをSVGに置換します。

---

## 画像処理

### `imageToBase64(imagePath: string): Promise<string>`

画像ファイルをBase64 Data URIに変換します。

**引数:**
- `imagePath` (`string`): 画像ファイルパス（絶対パス）

**戻り値:**
- `Promise<string>`: Base64エンコードされたData URI

**使用例:**

```typescript
import { imageToBase64 } from 'md-specgen';

const dataUri = await imageToBase64('/path/to/image.png');
// 'data:image/png;base64,iVBORw0KGgo...'
```

### `embedImages(html: string, options: ImageEmbedOptions): Promise<string>`

HTML内の画像パスをBase64に変換します。

**引数:**
- `html` (`string`): HTMLコンテンツ
- `options` (`ImageEmbedOptions`): 埋め込みオプション

**戻り値:**
- `Promise<string>`: Base64画像を埋め込んだHTML

**使用例:**

```typescript
import { embedImages } from 'md-specgen';

const html = '<img src="logo.png" alt="Logo" />';
const result = await embedImages(html, {
  imagesDir: '/path/to/images',
  validatePaths: true
});
```

### セキュリティ関数

#### `validateImagePath(imagePath: string, allowedDir: string): string`

画像パスが許可されたディレクトリ内にあるか検証します（パストラバーサル攻撃を防ぐ）。

#### `isAllowedImageExtension(filename: string, allowedExtensions?: string[]): boolean`

画像ファイル拡張子が許可されているかチェックします。

#### `sanitizeImagePath(imagePath: string): string`

画像パスをサニタイズします。

---

## LLM機能

### `createLlmClient(provider: 'anthropic' | 'bedrock', options: any): LlmClient`

LLMクライアントを作成します。

**引数:**
- `provider` (`'anthropic' | 'bedrock'`): LLMプロバイダー
- `options` (`any`): プロバイダー固有のオプション

**戻り値:**
- `LlmClient`: LLMクライアントインスタンス

**使用例:**

```typescript
import { createLlmClient } from 'md-specgen';

const client = createLlmClient('anthropic', {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022'
});
```

### `checkMarkdownQuality(markdown: string, client: LlmClient): Promise<QualityCheckResult>`

Markdownドキュメントの品質をチェックします。

**引数:**
- `markdown` (`string`): Markdownテキスト
- `client` (`LlmClient`): LLMクライアント

**戻り値:**
- `Promise<QualityCheckResult>`: 品質チェック結果

### `checkMultipleMarkdownFiles(files: Map<string, string>, client: LlmClient): Promise<Map<string, QualityCheckResult>>`

複数のMarkdownファイルの品質をチェックします。

### `generateFrontmatter(markdown: string, client: LlmClient): Promise<FrontmatterData>`

MarkdownからFrontmatterを自動生成します。

**引数:**
- `markdown` (`string`): Markdownテキスト
- `client` (`LlmClient`): LLMクライアント

**戻り値:**
- `Promise<FrontmatterData>`: 生成されたFrontmatterデータ

### `generateTocSuggestion(markdownFiles: Map<string, string>, client: LlmClient): Promise<TocSuggestion>`

ドキュメント全体の目次構造を提案します。

### `generateImageAlt(imagePath: string, client: LlmClient): Promise<string>`

画像のalt属性テキストを自動生成します。

---

## 型定義

### `Config`

設定オブジェクトの型定義です。

```typescript
interface Config {
  inputDir: string;
  outputDir: string;
  imagesDir?: string;
  html?: {
    template?: string;
    breadcrumbs?: boolean;
    footerText?: string;
  };
  pdf?: {
    enabled?: boolean;
    format?: 'A4' | 'A3' | 'Letter' | 'Legal';
    includeToc?: boolean;
    includeCover?: boolean;
    coverTitle?: string;
    coverSubtitle?: string;
  };
  mermaid?: {
    enabled?: boolean;
    theme?: 'default' | 'dark' | 'forest' | 'neutral';
  };
  images?: {
    embed?: boolean;
  };
  llm?: {
    enabled?: boolean;
    provider?: 'anthropic' | 'bedrock';
    model?: string;
    awsRegion?: string;
    apiKey?: string;
    qualityCheck?: boolean;
    autoIndex?: boolean;
    autoFrontmatter?: boolean;
    autoImageAlt?: boolean;
  };
}
```

### `HtmlConversionOptions`

HTML変換オプションの型定義です。

```typescript
interface HtmlConversionOptions {
  template?: string;
  title?: string;
  breadcrumbs?: Array<{ title: string; href?: string }>;
  includeHeader?: boolean;
  includeFooter?: boolean;
  footerText?: string;
}
```

### `HtmlConversionResult`

HTML変換結果の型定義です。

```typescript
interface HtmlConversionResult {
  html: string;
  title: string;
  frontmatter: Record<string, any>;
}
```

### `TemplateData`

テンプレートデータの型定義です。

```typescript
interface TemplateData {
  title: string;
  content: string;
  breadcrumbs?: Array<{ title: string; href?: string }>;
  frontmatter?: Record<string, any>;
  includeHeader?: boolean;
  includeFooter?: boolean;
  footerText?: string;
}
```

### `ImageEmbedOptions`

画像埋め込みオプションの型定義です。

```typescript
interface ImageEmbedOptions {
  imagesDir: string;
  validatePaths?: boolean;
}
```

### `PdfConversionOptions`

PDF変換オプションの型定義です。

```typescript
interface PdfConversionOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
}
```

### `MermaidConversionOptions`

Mermaid変換オプションの型定義です。

```typescript
interface MermaidConversionOptions {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  width?: number;
  height?: number;
}
```

### `ParsedFrontmatter`

解析済みFrontmatterの型定義です。

```typescript
interface ParsedFrontmatter {
  data: FrontmatterData;
  content: string;
}

type FrontmatterData = Record<string, any>;
```

### `QualityCheckResult`

品質チェック結果の型定義です。

```typescript
interface QualityCheckResult {
  score: number; // 0-100
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }>;
  suggestions: string[];
}
```

---

## 使用例

### 基本的な使用

```typescript
import { generate, loadConfig } from 'md-specgen';

// 設定ファイルから実行
const config = await loadConfig('./md-specgen.config.json');
await generate(config);
```

### カスタム設定で実行

```typescript
import { generate, getDefaultConfig } from 'md-specgen';

const config = {
  ...getDefaultConfig(),
  inputDir: './my-docs',
  outputDir: './my-build',
  pdf: {
    enabled: true,
    format: 'A4' as const,
  },
};

await generate(config);
```

### MarkdownをHTMLに変換

```typescript
import { convertToHtml } from 'md-specgen';

const markdown = `
# Hello World

This is a **test** document.

- Item 1
- Item 2
`;

const result = await convertToHtml(markdown);
console.log(result.html);
```

### LLM機能を使用

```typescript
import { createLlmClient, checkMarkdownQuality } from 'md-specgen';

const client = createLlmClient('anthropic', {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022',
});

const markdown = `# My Document\n\nContent here...`;
const quality = await checkMarkdownQuality(markdown, client);

console.log(`品質スコア: ${quality.score}`);
quality.issues.forEach(issue => {
  console.log(`[${issue.severity}] ${issue.message}`);
});
```

---

## エラーハンドリング

全ての非同期関数は、エラー発生時に `Error` オブジェクトをスローします。

```typescript
import { loadConfig, generate } from 'md-specgen';

try {
  const config = await loadConfig('./config.json');
  await generate(config);
} catch (error) {
  console.error('エラーが発生しました:', error.message);
}
```

---

## サポート

詳細については、以下を参照してください:

- [README.md](../README.md)
- [GitHub Issues](https://github.com/takemi-ohama/md-specgen/issues)
- [GitHub Discussions](https://github.com/takemi-ohama/md-specgen/discussions)
