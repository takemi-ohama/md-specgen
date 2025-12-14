# md-specgen Basic Example

このディレクトリには、md-specgenの基本的な使い方を示すサンプルプロジェクトが含まれています。

## ディレクトリ構成

```
basic/
├── docs/                      # Markdownソースファイル
│   └── sample.md              # サンプルドキュメント
├── images/                    # 画像ファイル
│   └── sample.png             # サンプル画像
├── md-specgen.config.json     # 設定ファイル
└── README.md                  # このファイル
```

## 使い方

### 1. md-specgenをインストール

まず、md-specgenをインストールします:

```bash
npm install -g md-specgen
```

### 2. ドキュメント生成

このディレクトリで以下のコマンドを実行します:

```bash
md-specgen --config md-specgen.config.json
```

または、パラメータを直接指定:

```bash
md-specgen --input ./docs --output ./output --images ./images
```

### 3. 生成結果の確認

`output/` ディレクトリに以下のファイルが生成されます:

- `sample.html` - 変換されたHTMLファイル（画像がBase64で埋め込まれています）

生成されたHTMLをブラウザで開いて確認してください:

```bash
# macOS
open output/sample.html

# Linux
xdg-open output/sample.html

# Windows
start output/sample.html
```

## 設定ファイルの説明

`md-specgen.config.json` には以下の設定が含まれています:

- **inputDir**: Markdownファイルのディレクトリ (`./docs`)
- **outputDir**: 出力先ディレクトリ (`./output`)
- **imagesDir**: 画像ディレクトリ (`./images`)
- **html.breadcrumbs**: パンくずリストを表示 (`true`)
- **html.footerText**: フッターテキスト
- **mermaid.enabled**: Mermaid図の変換を有効化 (`true`)
- **images.embed**: 画像をBase64で埋め込む (`true`)

## サンプルドキュメントの内容

`docs/sample.md` には以下の要素が含まれています:

- **Frontmatter**: タイトル、著者、日付などのメタデータ
- **見出し**: レベル1-3の見出し
- **リスト**: 順序付き・順序なしリスト
- **強調**: 太字、イタリック、取り消し線
- **コードブロック**: JavaScriptとPythonのコード例
- **引用**: ブロック引用
- **テーブル**: マークダウンテーブル
- **リンク**: 外部リンク
- **画像**: 埋め込み画像
- **Mermaid図**: フローチャート

## PDF出力を試す

PDF出力を有効にするには、設定ファイルの `pdf.enabled` を `true` に変更します:

```json
{
  "pdf": {
    "enabled": true,
    "format": "A4",
    "includeToc": true,
    "includeCover": true
  }
}
```

そして再度生成コマンドを実行します:

```bash
md-specgen --config md-specgen.config.json
```

`output/sample.pdf` が生成されます。

## カスタマイズ

### テンプレートのカスタマイズ

独自のHTMLテンプレートを使用する場合:

1. `custom-template.html` を作成
2. 設定ファイルに追加:

```json
{
  "html": {
    "template": "./custom-template.html"
  }
}
```

### フッターテキストの変更

```json
{
  "html": {
    "footerText": "© 2024 あなたの会社名"
  }
}
```

### Mermaidテーマの変更

```json
{
  "mermaid": {
    "theme": "dark"
  }
}
```

利用可能なテーマ: `default`, `dark`, `forest`, `neutral`

## トラブルシューティング

### 画像が表示されない

- `imagesDir` のパスが正しいか確認してください
- 画像ファイルが存在するか確認してください
- 画像のファイル名がMarkdown内の記述と一致しているか確認してください

### Mermaid図が表示されない

- `mermaid.enabled` が `true` になっているか確認してください
- Mermaid記法が正しいか確認してください

## 次のステップ

- [メインREADME](../../README.md) でより詳細な機能を確認
- [API Documentation](../../docs/API.md) でプログラマブルAPIを学習
- 独自のMarkdownドキュメントで試してみる

## サポート

質問や問題がある場合は、以下をご利用ください:

- [GitHub Issues](https://github.com/takemi-ohama/md-specgen/issues)
- [GitHub Discussions](https://github.com/takemi-ohama/md-specgen/discussions)
