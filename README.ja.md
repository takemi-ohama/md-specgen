# md-specgen

[![npm version](https://img.shields.io/npm/v/md-specgen.svg)](https://www.npmjs.com/package/md-specgen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A flexible Markdown documentation generator with HTML/PDF output and AI-powered enhancements.

## 特徴

- 📝 **Markdown to HTML/PDF**: Markdownファイルを美しいHTMLやPDFドキュメントに変換
- 🎨 **NumPy風スタイル**: 読みやすく洗練されたデフォルトテンプレート
- 📄 **高度なPDFオプション**: ページ向き、カスタムマージン、ヘッダー・フッター
- 📦 **カスタムコンテナ**: 警告、情報、ヒントなどの視覚的な強調表示 (:::warning, :::info, :::tip など)
- 📊 **Mermaid対応**: Mermaidダイアグラムを自動的にSVG画像化
- 🎯 **PlantUML対応**: PlantUMLダイアグラムを公式サーバー経由でPNG/SVGに変換
- 👀 **Watchモード**: ファイル変更を監視して自動再生成
- 🖼️ **画像埋め込み**: Base64エンコードで画像を埋め込み、単一ファイル出力が可能
- 📎 **ファイルインクルード**: 外部ファイルをMarkdownに埋め込み
- 🔗 **自動アンカー**: markdown-it-anchorによる見出しへの自動アンカーリンク
- 🔒 **セキュリティ**: パストラバーサル攻撃を防ぐ画像パス検証
- 🤖 **AI機能** (オプション): Claude APIを使った品質チェックや自動生成機能
- ⚙️ **柔軟な設定**: JSON/YAML設定ファイルでカスタマイズ可能

## インストール

### NPMから

```bash
npm install -g md-specgen
```

### ローカルプロジェクトに追加

```bash
npm install --save-dev md-specgen
```

## クイックスタート

### CLI使用例

最もシンプルな使い方:

```bash
# Markdownディレクトリを指定してHTML生成
md-specgen --input ./docs --output ./output

# または、単一のMarkdownファイルから生成
md-specgen --input ./docs/README.md --output ./output
```

画像を含む場合:

```bash
md-specgen --input ./docs --output ./output --images ./images
```

PDF生成を含む場合:

```bash
md-specgen --input ./docs --output ./output --pdf --format A4
```

### 設定ファイルを使用

プロジェクトルートに`md-specgen.config.json`を作成:

```json
{
  "inputDir": "./docs",
  "outputDir": "./output",
  "imagesDir": "./images",
  "html": {
    "breadcrumbs": true,
    "footerText": "© 2024 My Company"
  },
  "pdf": {
    "enabled": true,
    "format": "A4",
    "orientation": "portrait",
    "margin": {
      "top": "30mm",
      "bottom": "30mm",
      "left": "25mm",
      "right": "25mm"
    },
    "displayHeaderFooter": true,
    "headerTemplate": "<div style=\"font-size: 9px; text-align: center; width: 100%;\"><span class=\"title\"></span></div>",
    "footerTemplate": "<div style=\"font-size: 9px; text-align: center; width: 100%; color: #666;\"><span class=\"pageNumber\"></span> / <span class=\"totalPages\"></span></div>",
    "includeToc": true,
    "includeCover": true,
    "coverTitle": "プロジェクト要件定義書",
    "coverSubtitle": "Version 1.0"
  },
  "mermaid": {
    "enabled": true,
    "theme": "default"
  },
  "images": {
    "embed": true
  }
}
```

設定ファイルを指定して実行:

```bash
md-specgen --config md-specgen.config.json
```

## CLIオプション

| オプション | 説明 | デフォルト |
|-----------|------|----------|
| `--input, -i` | Markdownファイルのディレクトリまたはファイルパス | `./markdown` |
| `--output, -o` | 出力先ディレクトリ | `./output` |
| `--images` | 画像ディレクトリ | `./images` |
| `--config, -c` | 設定ファイルパス | - |
| `--pdf` | PDF出力を有効化 | `false` |
| `--format` | PDF用紙サイズ (A4/A3/Letter/Legal) | `A4` |
| `--watch, -w` | ファイル変更を監視して自動再生成 | `false` |
| `--llm` | LLM機能を有効化 | `false` |
| `--llm-provider` | LLMプロバイダー (anthropic/bedrock) | `anthropic` |
| `--llm-quality-check` | LLMによる品質チェック | `false` |
| `--llm-auto-index` | 自動インデックス生成 | `false` |
| `--llm-auto-frontmatter` | 自動Frontmatter生成 | `false` |
| `--llm-auto-image-alt` | 自動画像alt属性生成 | `false` |

## プログラマブルAPI

TypeScript/JavaScriptから使用する場合:

```typescript
import { generate, loadConfig, getDefaultConfig } from 'md-specgen';

// 設定ファイルから実行
const config = await loadConfig('./md-specgen.config.json');
await generate(config);

// コード内で設定を構築
const customConfig = {
  inputDir: './docs',
  outputDir: './build',
  imagesDir: './images',
  html: {
    breadcrumbs: true,
    footerText: '© 2024 Example Corp'
  },
  pdf: {
    enabled: true,
    format: 'A4' as const,
  }
};
await generate(customConfig);

// デフォルト設定を取得してカスタマイズ
const defaultConfig = getDefaultConfig();
const myConfig = {
  ...defaultConfig,
  inputDir: './my-docs',
  outputDir: './my-output',
};
await generate(myConfig);
```

## 設定ファイル

JSON形式（`md-specgen.config.json`）またはYAML形式（`md-specgen.config.yaml`）がサポートされています。

### JSON例

```json
{
  "inputDir": "./markdown",
  "outputDir": "./output",
  "imagesDir": "./images",
  "html": {
    "template": "./custom-template.html",
    "breadcrumbs": true,
    "footerText": "© 2024 My Company"
  },
  "pdf": {
    "enabled": false,
    "format": "A4",
    "includeToc": true,
    "includeCover": true,
    "coverTitle": "Document Title",
    "coverSubtitle": "Subtitle"
  },
  "mermaid": {
    "enabled": true,
    "theme": "default"
  },
  "images": {
    "embed": true
  },
  "llm": {
    "enabled": false,
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "apiKey": "your-api-key",
    "qualityCheck": false,
    "autoIndex": false,
    "autoFrontmatter": false,
    "autoImageAlt": false
  }
}
```

### YAML例

```yaml
inputDir: ./markdown
outputDir: ./output
imagesDir: ./images

html:
  breadcrumbs: true
  footerText: "© 2024 My Company"

pdf:
  enabled: false
  format: A4
  includeToc: true
  includeCover: true

mermaid:
  enabled: true
  theme: default

images:
  embed: true
```

## LLM機能（オプション）

Claude APIを使用した高度な機能を利用できます。

### 環境変数設定

```bash
# Anthropic API使用時
export ANTHROPIC_API_KEY="your-api-key"

# AWS Bedrock使用時
export AWS_REGION="us-west-2"
```

### LLM機能一覧

- **品質チェック**: ドキュメントの品質、一貫性、完全性をチェック
- **自動インデックス**: ドキュメントの目次を自動生成
- **自動Frontmatter**: メタデータを自動生成
- **自動画像alt属性**: 画像の代替テキストを自動生成（アクセシビリティ向上）

```bash
# LLM機能を全て有効化
md-specgen --input ./docs --output ./output \
  --llm \
  --llm-quality-check \
  --llm-auto-index \
  --llm-auto-frontmatter \
  --llm-auto-image-alt
```

## ディレクトリ構造

```
md-specgen/
├── src/                    # ソースコード
│   ├── cli/                # CLIインターフェース
│   ├── core/               # コアエンジン
│   │   ├── config.ts       # 設定管理
│   │   ├── generator.ts    # メインジェネレーター
│   │   └── types.ts        # 型定義
│   ├── modules/            # 機能モジュール
│   │   ├── markdown/       # Markdown処理
│   │   ├── html/           # HTML生成
│   │   ├── pdf/            # PDF生成
│   │   ├── mermaid/        # Mermaid処理
│   │   ├── image/          # 画像処理
│   │   └── llm/            # LLM統合
│   └── utils/              # ユーティリティ
├── tests/                  # テスト
│   ├── unit/               # ユニットテスト
│   ├── integration/        # 統合テスト
│   └── fixtures/           # テスト用データ
├── examples/               # サンプルプロジェクト
└── docs/                   # ドキュメント
    └── API.md              # API詳細ドキュメント
```

## 開発

### 開発環境

- Node.js >= 18.0.0
- TypeScript 5.7.2
- Jest (テストフレームワーク)

### 開発コマンド

```bash
# 依存関係インストール
npm install

# ビルド
npm run build

# 開発モード（watch）
npm run dev

# テスト実行
npm test

# テストカバレッジ
npm run test:coverage

# Lint
npm run lint

# Lint自動修正
npm run lint:fix

# フォーマット
npm run format
```

### テスト

```bash
# 全テスト実行
npm test

# カバレッジレポート生成
npm run test:coverage

# 特定のテストファイルのみ実行
npm test -- tests/unit/html/converter.test.ts
```

## サンプルプロジェクト

`examples/basic/`ディレクトリにサンプルプロジェクトがあります。

```bash
cd examples/basic
md-specgen --config md-specgen.config.json
```

## API詳細

詳細なAPI仕様は [docs/API.md](./docs/API.md) を参照してください。

## ライセンス

MIT License - Copyright (c) 2025 takemi-ohama

詳細は [LICENSE](./LICENSE) ファイルを参照してください。

## 謝辞

このプロジェクトは、以下の優れたプロジェクトからインスピレーションを得て、アイデアを取り入れています:

- [vscode-markdown-pdf](https://github.com/yzane/vscode-markdown-pdf) by yzane
  - PDFヘッダー・フッターのカスタマイズ
  - ページ向きとマージン設定
  - 拡張markdown-itプラグインサポート

Markdownエコシステムへの貢献に感謝します。

## 貢献

貢献を歓迎します！以下の手順でお願いします:

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 貢献ガイドライン

- コードスタイルは既存のコードに合わせてください
- 新機能には必ずテストを追加してください
- コミットメッセージは明確に記述してください
- ドキュメントの更新も忘れずに

## サポート

- 🐛 バグ報告: [GitHub Issues](https://github.com/takemi-ohama/md-specgen/issues)
- 💬 質問・議論: [GitHub Discussions](https://github.com/takemi-ohama/md-specgen/discussions)
- 📧 メール: [takemi.ohama@example.com](mailto:takemi.ohama@example.com)

## 変更履歴

### v2.0.0 (2025-01-XX)

- **新機能**: Watchモード - ファイル変更を監視して自動再生成（`--watch`オプション）
- **改善**: 自動再生成による開発ワークフローの向上
- **改善**: Watchモードのグレースフルシャットダウン対応

### v1.4.0 (2025-01-XX)

- **破壊的変更**: より良いプラグインエコシステムサポートのため、`marked`から`markdown-it`に移行
- **新機能**: カスタムコンテナサポート（:::warning, :::info, :::tip, :::danger, :::note, :::success）
- **新機能**: markdown-it-includeによるファイルインクルード機能
- **新機能**: markdown-it-anchorによる自動見出しアンカー
- **新機能**: PlantUMLダイアグラムサポート（公式サーバー経由でPNG/SVG出力）
- **改善**: Markdown処理機能の強化
- **改善**: markdown-itプラグインシステムによる拡張性の向上

### v1.3.0 (2025-01-XX)

- **新機能**: 高度なPDFオプション - ページ向き（portrait/landscape）
- **新機能**: カスタムPDFマージン（上下左右）
- **新機能**: PDFヘッダー・フッターのテンプレート対応
- **改善**: より柔軟なPDFカスタマイズオプション

### v1.0.0 (2025-01-XX)

- 初回リリース
- Markdown to HTML/PDF変換
- Mermaid図の自動画像化
- 画像Base64埋め込み
- LLM機能（オプション）
- CLI/プログラマブルAPI

## 関連プロジェクト

- [marked](https://github.com/markedjs/marked) - Markdownパーサー
- [puppeteer](https://github.com/puppeteer/puppeteer) - PDF生成
- [mermaid](https://github.com/mermaid-js/mermaid) - ダイアグラム生成

## Credits

このプロジェクトは以下のオープンソースプロジェクトを使用しています:

- TypeScript
- Jest
- ESLint
- Prettier
- その他多数（package.jsonを参照）

---

Made with ❤️ by [takemi-ohama](https://github.com/takemi-ohama)
