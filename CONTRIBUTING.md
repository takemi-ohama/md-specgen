# コントリビューションガイド

md-specgenへのコントリビューションをご検討いただき、ありがとうございます！
このドキュメントでは、プロジェクトへの貢献方法を説明します。

## 🤝 貢献方法

### バグ報告

バグを発見した場合は、以下の手順で報告してください：

1. [既存のIssue](https://github.com/takemi-ohama/md-specgen/issues)を確認し、同じ問題が報告されていないか確認
2. 新しいIssueを作成し、「バグ報告」テンプレートを使用
3. 以下の情報を含める：
   - 明確なタイトルと説明
   - 再現手順
   - 期待される動作と実際の動作
   - 環境情報（OS、Node.jsバージョン、md-specgenバージョン）
   - 可能であればスクリーンショットやエラーログ

### 機能リクエスト

新機能の提案は大歓迎です：

1. [既存のIssue](https://github.com/takemi-ohama/md-specgen/issues)で同様の提案がないか確認
2. 「機能リクエスト」テンプレートを使用してIssueを作成
3. 以下を明確に説明：
   - 解決したい課題
   - 提案する解決策
   - 代替案（あれば）

### プルリクエスト

コードの貢献手順：

1. **リポジトリをフォーク**
   ```bash
   gh repo fork takemi-ohama/md-specgen
   ```

2. **ブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   # または
   git checkout -b fix/your-bug-fix
   ```

3. **開発環境のセットアップ**
   ```bash
   npm install
   npm run build
   npm test
   ```

4. **変更を実装**
   - コードスタイルガイドに従う（下記参照）
   - 適切なテストを追加
   - ドキュメントを更新

5. **テストとリント**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

6. **コミット**
   ```bash
   git add .
   git commit -m "feat: 新機能の説明"
   ```

   コミットメッセージの規約：
   - `feat:` - 新機能
   - `fix:` - バグ修正
   - `docs:` - ドキュメント変更のみ
   - `style:` - コードの意味に影響しない変更
   - `refactor:` - リファクタリング
   - `test:` - テストの追加・修正
   - `chore:` - ビルドプロセスやツールの変更

7. **プッシュとPR作成**
   ```bash
   git push origin feature/your-feature-name
   ```

   その後、GitHubでPRを作成し、テンプレートに従って記入

## 📝 コードスタイルガイド

### TypeScript

- **フォーマット**: Prettierを使用（設定は`.prettierrc`）
- **リント**: ESLintを使用（設定は`.eslintrc.json`）
- **型**: 可能な限り明示的な型を使用、`any`は避ける

```typescript
// ✅ Good
export async function generatePdf(options: PdfOptions): Promise<string> {
  // ...
}

// ❌ Bad
export async function generatePdf(options: any): Promise<any> {
  // ...
}
```

### ファイル構造

```
src/
├── core/          # コアロジック
├── cli/           # CLIインターフェース
├── markdown/      # Markdownパーサー
├── html/          # HTML変換
├── pdf/           # PDF生成
├── image/         # 画像処理
├── llm/           # AI機能
└── utils/         # ユーティリティ
```

### テスト

- **単体テスト**: `tests/unit/` に配置
- **統合テスト**: `tests/integration/` に配置
- **カバレッジ**: 新機能は適切なテストでカバー

```typescript
// テストファイル例: tests/unit/markdown/parser.test.ts
describe('MarkdownParser', () => {
  describe('parse', () => {
    it('should parse markdown with frontmatter', () => {
      // テストコード
    });
  });
});
```

### ドキュメント

- **TSDoc**: 公開APIには必ずTSDocコメントを追加
- **README**: 新機能はREADMEに例を追加
- **CHANGELOG**: リリース時に更新

```typescript
/**
 * Markdownファイルを解析してHTMLに変換します
 *
 * @param content - Markdownコンテンツ
 * @param options - 変換オプション
 * @returns 変換されたHTML
 * @throws {ValidationError} 不正な入力の場合
 *
 * @example
 * ```typescript
 * const html = await parseMarkdown(content, { sanitize: true });
 * ```
 */
export async function parseMarkdown(
  content: string,
  options?: ParseOptions
): Promise<string> {
  // ...
}
```

## 🔍 開発のヒント

### ローカルでのテスト

```bash
# ビルド
npm run build

# ローカルのCLIをテスト
node dist/cli/index.js generate examples/basic/input.md

# ウォッチモード
npm run dev
```

### デバッグ

```bash
# デバッグログを有効化
DEBUG=md-specgen:* npm test
```

### パフォーマンステスト

```bash
# 大規模ファイルでのテスト
npm run test:performance
```

## 📋 レビュープロセス

1. PRが作成されると、自動的にCIが実行されます
2. すべてのテストがパスする必要があります
3. メンテナーがコードレビューを行います
4. 必要に応じて修正をお願いする場合があります
5. 承認後、メンテナーがマージします

## 🎯 優先事項

現在、特に以下の分野での貢献を歓迎しています：

- [ ] パフォーマンス最適化
- [ ] 追加のLLMプロバイダーサポート
- [ ] ドキュメント改善
- [ ] テストカバレッジ向上
- [ ] 国際化（i18n）対応
- [ ] プラグインシステムの拡張

## 📜 ライセンス

貢献されたコードは、プロジェクトと同じ[MITライセンス](LICENSE)の下で公開されます。

## 💬 質問・相談

- **質問**: [GitHub Discussions](https://github.com/takemi-ohama/md-specgen/discussions)を使用
- **バグ報告**: [GitHub Issues](https://github.com/takemi-ohama/md-specgen/issues)を使用
- **セキュリティ問題**: 公開Issueではなく、メンテナーに直接連絡してください

## 🙏 謝辞

md-specgenへの貢献を検討してくださり、本当にありがとうございます！
あなたの貢献が、このプロジェクトをより良いものにします。
