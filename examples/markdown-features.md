# Markdown拡張機能のデモ

このドキュメントは、md-specgenで利用可能な拡張Markdown機能を紹介します。

## カスタムコンテナ

カスタムコンテナを使用すると、重要な情報を視覚的に強調できます。

### 情報コンテナ

::: info
これは情報コンテナです。一般的な情報やヒントを表示するのに適しています。
:::

::: info カスタムタイトル
タイトルをカスタマイズすることもできます。
:::

### 警告コンテナ

::: warning
警告！この操作は慎重に行う必要があります。
:::

::: warning 注意事項
データを削除する前に必ずバックアップを取ってください。
:::

### ヒントコンテナ

::: tip
プロのヒント：ショートカットキーを使うと作業が効率化されます。
:::

### 危険コンテナ

::: danger
危険！この操作は元に戻すことができません。
:::

::: danger 重要な警告
本番環境では絶対にこのコマンドを実行しないでください。
:::

### 注意コンテナ

::: note
注：このバージョンは実験的な機能を含んでいます。
:::

### 成功コンテナ

::: success
成功！設定が正常に保存されました。
:::

## シンタックスハイライト

コードブロックにはシンタックスハイライトが適用されます。

### TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}

const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};

console.log(greetUser(user));
```

### Python

```python
def calculate_factorial(n):
    """階乗を計算する関数"""
    if n == 0 or n == 1:
        return 1
    return n * calculate_factorial(n - 1)

# 使用例
result = calculate_factorial(5)
print(f"5の階乗は {result} です")
```

### Bash

```bash
#!/bin/bash

# ファイルをバックアップ
backup_file() {
    local file=$1
    local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$file" "$backup"
    echo "バックアップを作成しました: $backup"
}

backup_file "important-data.txt"
```

## 表組み

| 機能 | 説明 | ステータス |
|------|------|-----------|
| カスタムコンテナ | 情報を視覚的に強調 | ✅ 実装済み |
| シンタックスハイライト | コードの色分け表示 | ✅ 実装済み |
| ファイルインクルード | 外部ファイルの埋め込み | ✅ 実装済み |
| PlantUML | UMLダイアグラム生成 | 🔜 予定 |

## リストと引用

### 番号付きリスト

1. 最初のステップ
   - サブ項目A
   - サブ項目B
2. 次のステップ
3. 最後のステップ

### 引用

> これは引用文です。重要な情報や参照を表示するのに使用します。
> 
> 複数行にわたる引用も可能です。

## リンクと画像

- [公式ドキュメント](https://github.com/takemi-ohama/md-specgen)
- [マークダウンガイド](https://www.markdownguide.org/)

## 複雑な例

::: warning 開発環境セットアップ
開発を開始する前に、以下の手順を完了してください：

1. Node.js 18以上をインストール
2. 依存関係をインストール：
   ```bash
   npm install
   ```
3. ビルドを実行：
   ```bash
   npm run build
   ```

::: tip
初回ビルドには時間がかかる場合があります。
:::
:::

## まとめ

::: success
これらの機能を組み合わせることで、美しく読みやすいドキュメントを作成できます！
:::
