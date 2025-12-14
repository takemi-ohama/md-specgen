# md-specgen プロジェクト概要

## プロジェクトの目的
md-specgenは、Markdown形式のドキュメントをHTML/PDF形式に変換し、AI機能で品質向上を支援する柔軟なドキュメント生成ツールです。

## 主な機能
- Markdown → HTML 変換
- HTML → PDF 変換
- Mermaid図の処理
- LLM統合（Claude API / AWS Bedrock）による品質向上機能

## 技術スタック
- **言語**: TypeScript 5.7.2
- **ランタイム**: Node.js >= 18.0.0
- **テストフレームワーク**: Jest 29.7.0
- **ビルドツール**: TypeScript Compiler (tsc)
- **リンター**: ESLint + @typescript-eslint
- **フォーマッター**: Prettier

## 主な依存関係
- `@anthropic-ai/sdk`: Claude API クライアント
- `@aws-sdk/client-bedrock-runtime`: AWS Bedrock クライアント
- `marked`: Markdown パーサー
- `puppeteer`: PDF生成用
- `mermaid`: 図の生成
- `commander`: CLI フレームワーク
- `chalk`, `ora`: CLI UI
- `gray-matter`: Frontmatter パーサー
- `fs-extra`, `glob`: ファイル操作

## プロジェクト状態
- **フェーズ1**: 完了（プロジェクト基盤構築）
- **フェーズ2**: 完了（コア機能の実装）
- **フェーズ3**: 実装中（LLM統合機能）
- **フェーズ4**: 未実施（テストとドキュメント）
- **フェーズ5**: 未実施（リリース準備）

## エントリーポイント
- **CLI**: `dist/cli/index.js` (`md-specgen` コマンド)
- **ライブラリ**: `dist/index.js`

## ディレクトリ構造
```
src/
├── cli/            # CLIインターフェース
├── core/           # コア型定義・設定
├── modules/        # 機能モジュール
│   ├── markdown/   # Markdown処理
│   ├── html/       # HTML生成
│   ├── pdf/        # PDF生成
│   ├── mermaid/    # Mermaid図処理
│   ├── image/      # 画像処理
│   └── llm/        # LLM統合
├── templates/      # HTMLテンプレート
└── utils/          # ユーティリティ
```
