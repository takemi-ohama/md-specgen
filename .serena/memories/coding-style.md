# コーディングスタイルと規約

## TypeScript設定
- **Target**: ES2022
- **Module**: ES2022 (ESM)
- **Strict Mode**: 有効
- 厳格な型チェックを実施（`strict: true`）

## コードスタイル
### Prettier設定
- **セミコロン**: 使用する（`semi: true`）
- **引用符**: シングルクォート（`singleQuote: true`）
- **行幅**: 100文字（`printWidth: 100`）
- **インデント**: スペース2個（`tabWidth: 2`）
- **タブ**: 使用しない（`useTabs: false`）
- **末尾カンマ**: ES5準拠（`trailingComma: "es5"`）

### ESLint設定
- TypeScript推奨ルールセットを使用
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: error
- `no-console`: off（CLIツールのため）

## 命名規則
- **インターフェース**: PascalCase（例: `LlmConfig`, `MarkdownFile`）
- **変数・関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **ファイル名**: kebab-case（例: `auto-gen.ts`, `quality.ts`）

## コメント
- **日本語**でコメントを記述
- インターフェースのプロパティには JSDoc コメントを使用
- 複雑なロジックには説明コメントを追加

## エクスポート
- 名前付きエクスポートを使用（`export interface`, `export function`）
- デフォルトエクスポートは避ける

## エラーハンドリング
- カスタムエラークラスを定義（必要に応じて）
- エラーメッセージは日本語で記述
- ログ出力には `src/utils/logger.ts` を使用

## 非同期処理
- `async/await` を使用
- Promise チェーンは避ける
