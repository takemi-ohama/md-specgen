# md-specgen

A flexible Markdown documentation generator with HTML/PDF output and AI-powered enhancements.

## プロジェクトステータス

**フェーズ1完了** - プロジェクト基盤構築が完了しました。

### 完了済み

✅ プロジェクト初期化
✅ TypeScript/ESLint/Prettier設定
✅ ディレクトリ構造構築
✅ コア型定義作成
✅ ユーティリティ関数実装
✅ テストフレームワーク設定
✅ Git初期化とLICENSE作成
✅ 依存関係インストール

### 次のステップ

フェーズ2: コア機能の実装（Markdown→HTML、HTML→PDF変換）

## 開発環境

- Node.js >= 18.0.0
- TypeScript 5.7.2
- Jest (テストフレームワーク)

## 開発コマンド

```bash
# ビルド
npm run build

# 開発モード（watch）
npm run dev

# テスト実行
npm test

# テストカバレッジ
npm test:coverage

# Lint
npm run lint

# Lint自動修正
npm run lint:fix

# フォーマット
npm run format
```

## ディレクトリ構造

```
md-specgen/
├── src/                    # ソースコード
│   ├── cli/                # CLIインターフェース
│   ├── core/               # コアエンジン
│   ├── modules/            # 機能モジュール
│   │   ├── markdown/       # Markdown処理
│   │   ├── html/           # HTML生成
│   │   ├── pdf/            # PDF生成
│   │   ├── mermaid/        # Mermaid処理
│   │   ├── image/          # 画像処理
│   │   └── llm/            # LLM統合
│   ├── templates/          # HTMLテンプレート
│   └── utils/              # ユーティリティ
├── tests/                  # テスト
│   ├── unit/               # ユニットテスト
│   ├── integration/        # 統合テスト
│   ├── e2e/                # E2Eテスト
│   └── fixtures/           # テスト用データ
├── examples/               # サンプルプロジェクト
└── docs/                   # ドキュメント
```

## ライセンス

MIT License - Copyright (c) 2025 takemi-ohama

## 貢献

貢献を歓迎します！詳細は CONTRIBUTING.md（今後作成予定）をご覧ください。

## 開発計画

詳細な実装計画は以下のドキュメントを参照してください：

- フェーズ1: 設計とセットアップ（完了）
- フェーズ2: コア機能の実装（予定）
- フェーズ3: LLM活用機能の実装（予定）
- フェーズ4: テストとドキュメント（予定）
- フェーズ5: リリース準備（予定）
