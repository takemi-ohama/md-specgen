# Markdown-PDF機能取り込み開発計画（改訂版）

## 概要

VSCode Extension「Markdown-PDF」(by yzane)の優れた機能をmd-specgenに取り込むための開発計画です。

**参考リンク:**
- Marketplace: https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf
- GitHub: https://github.com/yzane/vscode-markdown-pdf

## 現状分析

### md-specgenの既存機能

✅ **既に実装済み:**
- PDF生成（Puppeteerベース）
- Mermaid図の自動変換
- 目次生成（`includeToc`, `tocLevel`）
- カスタムフォント指定（`font`オプション）
- ページサイズ設定（A4/A3/Letter/Legal）
- 画像Base64埋め込み
- シンタックスハイライト（highlight.js）
- HTML出力
- カスタムスタイルシート対応

### Markdown-PDFの特徴的機能

以下の機能がMarkdown-PDFに存在し、md-specgenにはまだ実装されていません：

## 取り込むべき機能（優先度順）

### 🔴 高優先度

#### 1. PDF単体出力時のバグ修正
**現状の問題:** 
- HTML出力なしでPDF単体を出力しようとすると、中身のないPDFが生成される
- 原因: PDF生成時にHTMLファイルが存在しない

**実装計画:**
- `--pdf`オプション使用時に`--no-html`相当の動作をする場合、一時ディレクトリを使用
- 処理フロー:
  1. 一時ディレクトリ（`os.tmpdir()`使用）を作成
  2. 一時ディレクトリにHTMLファイルを生成
  3. 一時HTMLファイルからPDFを生成
  4. 最終的な出力先にPDFをコピー
  5. 一時ディレクトリを削除（エラー時も確実に削除）

**対象ファイル:**
- `src/core/generator.ts`: PDF単体出力時のロジックを修正
- `src/utils/file.ts`: 一時ディレクトリ管理関数を追加（必要に応じて）

**テスト計画:**
- PDF単体出力の結果が正常なPDFであることを確認
- エラー発生時も一時ディレクトリが削除されることを確認
- 既存のHTML+PDF同時出力は影響を受けないことを確認

---

#### 2. ページ向き（Orientation）設定
**現状:** 未実装
**Markdown-PDF:** `portrait`（縦）/ `landscape`（横）の切り替えが可能

**実装計画:**
- `pdf.orientation`設定を追加（`'portrait' | 'landscape'`）
- デフォルト: `'portrait'`
- Puppeteerの`page.pdf()`オプションに`landscape`パラメータを追加

**対象ファイル:**
- `src/core/config.ts`: Config型定義に`orientation`を追加
- `src/modules/pdf/converter.ts`: PDF生成時のオプションに反映

---

#### 3. マージン（Margin）の詳細設定
**現状:** Puppeteerのデフォルトマージンを使用
**Markdown-PDF:** 上下左右のマージンを個別に指定可能

**実装計画:**
- `pdf.margin`設定を追加
  ```typescript
  margin?: {
    top?: string;     // 例: "1cm", "10mm"
    bottom?: string;
    left?: string;
    right?: string;
  }
  ```
- デフォルト値を設定（例: top/bottom: "1cm", left/right: "1cm"）

**対象ファイル:**
- `src/core/config.ts`: margin設定を追加
- `src/modules/pdf/converter.ts`: Puppeteerのmarginオプションに反映

---

#### 4. ヘッダー・フッターのカスタマイズ
**現状:** 未実装
**Markdown-PDF:** HTMLテンプレートでヘッダー・フッターをカスタマイズ可能

**実装計画:**
- `pdf.header`と`pdf.footer`設定を追加
  ```typescript
  pdf?: {
    displayHeaderFooter?: boolean;
    headerTemplate?: string;  // HTMLテンプレート
    footerTemplate?: string;  // HTMLテンプレート
  }
  ```
- テンプレート変数のサポート:
  - `<span class="date"></span>` - 日付
  - `<span class="title"></span>` - タイトル
  - `<span class="pageNumber"></span>` - ページ番号
  - `<span class="totalPages"></span>` - 総ページ数

**対象ファイル:**
- `src/core/config.ts`: ヘッダー・フッター設定を追加
- `src/modules/pdf/converter.ts`: Puppeteerの`displayHeaderFooter`、`headerTemplate`、`footerTemplate`に対応

---

### 🟡 中優先度

#### 5. markdown-it-container サポート
**現状:** 未実装
**Markdown-PDF:** カスタムコンテナ（警告、注意書きなど）に対応

**実装計画:**
- `markdown-it-container`プラグインを導入
- デフォルトコンテナを定義（例: `:::warning`, `:::info`, `:::tip`）

**対象ファイル:**
- `package.json`: `markdown-it-container`を追加
- `src/modules/markdown/parser.ts`: コンテナプラグインを統合
- `src/modules/html/template.ts`: コンテナ用CSSスタイルを追加

---

#### 6. markdown-it-include サポート
**現状:** 未実装
**Markdown-PDF:** 他のMarkdownファイルをインクルード可能

**実装計画:**
- `markdown-it-include`プラグインを導入
- セキュリティ考慮: インクルードパスの検証を実装

**対象ファイル:**
- `package.json`: `markdown-it-include`を追加
- `src/modules/markdown/parser.ts`: includeプラグインを統合
- `src/utils/security.ts`: パス検証ロジックを拡張

---

#### 7. PlantUML サポート
**現状:** Mermaidのみ対応
**Markdown-PDF:** PlantUML図のレンダリングに対応

**実装計画:**
- PlantUMLコードブロックを検出
- PlantUML公式サーバー（https://www.plantuml.com/plantuml/）またはローカルJARを使用
- オプション設定を追加:
  ```typescript
  plantuml?: {
    enabled?: boolean;
    server?: string;  // デフォルト: 公式サーバー
  }
  ```

**対象ファイル:**
- `src/core/config.ts`: PlantUML設定を追加
- `src/modules/plantuml/converter.ts` (新規): PlantUML変換機能
- `src/modules/markdown/parser.ts`: PlantUMLコードブロックの検出と変換

---

### 🟢 低優先度（将来的な検討事項）

#### 8. 自動変換（convertOnSave）
**現状:** 未実装
**Markdown-PDF:** ファイル保存時に自動変換

**検討事項:**
- CLIツールとしての性質上、watch機能として実装
- `--watch`オプションでファイル変更を監視し、自動再生成
- Node.jsの`fs.watch`または`chokidar`を使用

---

## 実装スケジュール（推奨）

### フェーズ1: PDF出力バグ修正（v1.2.0）
1. PDF単体出力時のバグ修正（一時ディレクトリ使用）

**期間:** 2-3日
**テスト重点:** PDF単体出力の正常動作、一時ファイルの確実な削除、既存機能の非破壊

---

### フェーズ2: 基本PDF機能拡張（v1.3.0）
2. ページ向き設定
3. マージン詳細設定
4. ヘッダー・フッターカスタマイズ

**期間:** 1-2週間
**テスト重点:** Puppeteerのオプション互換性、既存機能の非破壊

---

### フェーズ3: Markdown機能強化（v1.4.0）
5. markdown-it-container
6. markdown-it-include

**期間:** 1-2週間
**テスト重点:** セキュリティ（includeパス検証）、既存Markdown互換性

---

### フェーズ4: 図表機能拡張（v1.5.0）
7. PlantUMLサポート

**期間:** 1週間
**テスト重点:** 外部サービス依存性、エラーハンドリング

---

### フェーズ5: 開発者体験向上（v2.0.0）
8. Watch機能（自動再生成）

**期間:** 1週間
**テスト重点:** ファイル監視の安定性、リソース管理

---

## テスト計画

### ユニットテスト追加
- `tests/unit/pdf/tmp-directory.test.ts` - 一時ディレクトリ管理
- `tests/unit/pdf/pdf-only-output.test.ts` - PDF単体出力
- `tests/unit/pdf/margin.test.ts` - マージン設定
- `tests/unit/pdf/orientation.test.ts` - ページ向き
- `tests/unit/pdf/header-footer.test.ts` - ヘッダー・フッター
- `tests/unit/markdown/containers.test.ts` - カスタムコンテナ
- `tests/unit/plantuml/converter.test.ts` - PlantUML変換

### 統合テスト
- PDF単体出力の結果検証
- 既存機能との互換性確認

---

## ドキュメント更新

### README.md更新項目
1. **Features**セクションに新機能を追加
2. **謝辞セクション**を新設:
   ```markdown
   ## Acknowledgments

   This project was inspired by and incorporates ideas from the following excellent projects:

   - [vscode-markdown-pdf](https://github.com/yzane/vscode-markdown-pdf) by yzane
     - PDF header/footer customization
     - Page orientation and margin settings
     - Extended markdown-it plugins support

   We are grateful for their contributions to the Markdown ecosystem.
   ```
3. 新オプションのドキュメント追加

### その他ドキュメント
- `CHANGELOG.md`: 各バージョンで追加された機能を記録
- `docs/API.md`: 新しい設定オプションのAPI仕様

---

## 互換性とマイグレーション

### 後方互換性の維持
- 既存の設定ファイルはそのまま動作
- 新オプションはすべてオプショナル（デフォルト値あり）
- 既存のCLIオプションは変更なし

### 非推奨化予定なし
現時点で非推奨化する機能はありません。

---

## リスクと懸念事項

1. **依存関係の増加**
   - markdown-itプラグインの追加により依存パッケージが増加
   - → 必要最小限に抑え、オプショナル依存として検討

2. **PlantUML外部サービス依存**
   - 公式サーバーのダウンタイムリスク
   - → ローカルJARオプションも提供

3. **一時ディレクトリのクリーンアップ**
   - エラー発生時の一時ファイル残留リスク
   - → try-finally構文で確実にクリーンアップ

4. **セキュリティ**
   - markdown-it-includeのパストラバーサル対策必須
   - → 厳格なパス検証、ホワイトリスト方式

---

## 削除された項目（要件変更による）

以下の機能は当初計画に含まれていましたが、要件見直しにより削除されました：

- ❌ PNG/JPEG出力サポート
- ❌ markdown-it-checkbox サポート
- ❌ 複数フォーマット同時出力

---

## まとめ

Markdown-PDFの優れた機能を段階的に取り込むことで、md-specgenをより強力で柔軟なツールに進化させます。

**最優先事項**は、現在のPDF単体出力のバグ修正です。これにより、ユーザーが期待通りにPDFを生成できるようになります。

その後、高優先度の機能（ページ向き、マージン、ヘッダー・フッター）を実装し、ユーザーからの要望に応えます。

各フェーズで十分なテストとドキュメント整備を行い、品質を維持しながら機能拡張を実現します。
