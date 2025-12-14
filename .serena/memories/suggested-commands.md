# 推奨コマンド

## 開発コマンド

### ビルド
```bash
npm run build          # TypeScriptをコンパイル
npm run dev            # Watch モードでビルド
npm run clean          # dist/ ディレクトリを削除
```

### テスト
```bash
npm test               # 全テストを実行
npm run test:watch     # Watch モードでテスト
npm run test:coverage  # カバレッジレポートを生成
```

### コード品質
```bash
npm run lint           # ESLint でコードをチェック
npm run lint:fix       # ESLint で自動修正
npm run format         # Prettier でコードをフォーマット
```

### リリース準備
```bash
npm run prepublishOnly # リリース前の全チェック（lint + test + build）
```

## CLIコマンド例

### ビルド後の実行
```bash
# HTML生成
node dist/cli/index.js build <input-dir> -o <output-dir>

# PDF生成（HTML生成後）
node dist/cli/index.js build <input-dir> -o <output-dir> --pdf

# LLM機能を有効化
node dist/cli/index.js build <input-dir> -o <output-dir> --llm --llm-provider anthropic

# 品質チェックのみ
node dist/cli/index.js build <input-dir> --llm --llm-quality-check
```

## 開発時のワークフロー

### 新機能実装時
1. `npm run dev` でWatch モードを起動
2. コードを編集
3. `npm run lint:fix` で自動修正
4. `npm run format` でフォーマット
5. `npm test` でテスト実行
6. `npm run build` で最終ビルド確認

### タスク完了時のチェックリスト
- [ ] `npm run lint` でエラーなし
- [ ] `npm run format` で全ファイルをフォーマット
- [ ] `npm test` で全テストが成功
- [ ] `npm run build` でビルドが成功
- [ ] 新機能にはテストを追加

## システムコマンド（Linux）
```bash
ls -la                 # ファイル一覧（詳細）
cd <directory>         # ディレクトリ移動
pwd                    # カレントディレクトリ表示
grep -r <pattern> .    # 再帰的検索
find . -name <name>    # ファイル検索
git status             # Git ステータス確認
git log --oneline -10  # 最近のコミット履歴
```
