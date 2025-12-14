# LLMモジュールのアーキテクチャ

## 概要
LLMモジュールは、Claude API（Anthropic）またはAWS Bedrock Claude APIを使用して、Markdown品質向上やコンテンツ自動生成を行います。

## モジュール構成

### src/modules/llm/client.ts
- **LlmClient**: 基底クラス/インターフェース
- **createLlmClient()**: プロバイダーに応じたクライアント生成ファクトリー関数

### src/modules/llm/anthropic-client.ts
- **AnthropicClient**: Claude API直接呼び出し
- `@anthropic-ai/sdk` を使用
- 環境変数 `ANTHROPIC_API_KEY` から認証

### src/modules/llm/bedrock-client.ts
- **BedrockClient**: AWS Bedrock Claude API
- `@aws-sdk/client-bedrock-runtime` を使用
- `~/.aws/credentials` または環境変数から認証

### src/modules/llm/quality.ts
- **checkMarkdownQuality()**: Markdown品質チェック
  - 見出し構造の検証
  - リンク切れ検出
  - 改善提案の生成

### src/modules/llm/auto-gen.ts
- **generateFrontmatter()**: Frontmatter自動生成
- **generateTocSuggestion()**: 目次構成提案
- **generateImageAlt()**: 画像alt属性自動生成

### src/modules/llm/cache.ts
- **LlmCache**: API呼び出し結果のキャッシュ
- ファイルベースのキャッシュ（オプション）
- キャッシュ有効期限管理

## CLI統合
src/cli/index.tsに追加されるオプション：
- `--llm`: LLM機能を有効化
- `--llm-provider <provider>`: `anthropic` または `bedrock`
- `--llm-quality-check`: 品質チェック実行
- `--llm-auto-index`: インデックス自動生成
- `--llm-auto-frontmatter`: Frontmatter自動生成
- `--llm-auto-image-alt`: 画像alt自動生成

## LlmConfig型定義
```typescript
export interface LlmConfig {
  enabled: boolean;
  provider: 'anthropic' | 'bedrock';
  model: string;
  awsRegion?: string;
  apiKey?: string;
  qualityCheck?: boolean;
  autoIndex?: boolean;
  autoFrontmatter?: boolean;
  autoImageAlt?: boolean;
}
```

## 設計原則
- **デフォルトOFF**: LLM機能はオプション機能
- **エラーハンドリング**: API呼び出しエラーを適切にハンドル
- **レート制限対策**: リトライロジックを実装
- **コスト意識**: 不要なAPI呼び出しを避ける
- **キャッシュ活用**: 同じ内容のチェックは結果を再利用
