/**
 * E2Eテスト: 全機能検証
 * 
 * PLAN01.mdで実装されたすべての機能をテストします:
 * - Phase 1: PDF単体出力
 * - Phase 2: PDF機能拡張（向き、マージン、ヘッダー・フッター）
 * - Phase 3: Markdown機能強化（カスタムコンテナ、markdown-it）
 * - Phase 4: PlantUMLサポート
 * - Phase 5: Watchモード（このテストでは生成機能のみ検証）
 */

import { generate } from '../../src/core/generator.js';
import { loadConfig } from '../../src/core/config.js';
import * as fs from 'fs';
import * as path from 'path';

describe('E2E Test: All Features', () => {
  const configPath = path.resolve(process.cwd(), 'tests/fixtures/e2e-test-config.json');
  const outputDir = path.resolve(process.cwd(), 'tests/output/e2e');
  const htmlFile = path.join(outputDir, 'e2e-test.html');
  const pdfFile = path.join(outputDir, 'document.pdf');

  beforeAll(async () => {
    // 出力ディレクトリをクリーンアップ
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }

    // すべてのテストで使用するファイルを事前に生成
    const config = await loadConfig(configPath);
    await generate({ config });
  }, 60000); // タイムアウト60秒（PlantUML変換に時間がかかる可能性がある）

  afterAll(() => {
    // テスト後のクリーンアップ（オプション）
    // 生成されたファイルを確認したい場合はコメントアウト
    // if (fs.existsSync(outputDir)) {
    //   fs.rmSync(outputDir, { recursive: true, force: true });
    // }
  });

  test('設定ファイルが読み込める', async () => {
    const config = await loadConfig(configPath);
    
    expect(config).toBeDefined();
    expect(config.inputDir).toBe('./tests/fixtures');
    expect(config.outputDir).toBe('./tests/output/e2e');
    expect(config.pdf?.enabled).toBe(true);
    expect(config.mermaid?.enabled).toBe(true);
    expect(config.plantuml?.enabled).toBe(true);
  });

  test('HTML/PDFファイルが生成される', () => {
    // HTMLファイルの存在確認
    expect(fs.existsSync(htmlFile)).toBe(true);

    // PDFファイルの存在確認
    expect(fs.existsSync(pdfFile)).toBe(true);
  });

  test('HTMLに基本的なMarkdown要素が含まれる', () => {
    if (!fs.existsSync(htmlFile)) {
      throw new Error('HTML file not found. Run the generation test first.');
    }

    const html = fs.readFileSync(htmlFile, 'utf-8');

    // 見出し
    expect(html).toContain('E2Eテスト: 全機能検証');
    expect(html).toContain('基本的なMarkdown要素');
    
    // テキストスタイル
    expect(html).toContain('<strong>太字</strong>');
    expect(html).toContain('<em>斜体</em>');
    
    // リスト
    expect(html).toContain('<li>項目1</li>');
    expect(html).toContain('<li>最初の項目</li>');
    
    // コードブロック（シンタックスハイライトされているため個別にチェック）
    expect(html).toContain('function');
    expect(html).toContain('hello');
    
    // テーブル
    expect(html).toContain('<table');
    expect(html).toContain('<th>機能</th>');
  });

  test('HTMLにカスタムコンテナが含まれる（Phase 3）', () => {
    if (!fs.existsSync(htmlFile)) {
      throw new Error('HTML file not found. Run the generation test first.');
    }

    const html = fs.readFileSync(htmlFile, 'utf-8');

    // カスタムコンテナの各タイプを確認
    expect(html).toContain('custom-container warning');
    expect(html).toContain('custom-container info');
    expect(html).toContain('custom-container tip');
    expect(html).toContain('custom-container danger');
    expect(html).toContain('custom-container note');
    expect(html).toContain('custom-container success');
    
    // コンテナのタイトル
    expect(html).toContain('警告');
    expect(html).toContain('情報');
    expect(html).toContain('ヒント');
  });

  test('HTMLにMermaidダイアグラムが画像として含まれる', () => {
    if (!fs.existsSync(htmlFile)) {
      throw new Error('HTML file not found. Run the generation test first.');
    }

    const html = fs.readFileSync(htmlFile, 'utf-8');

    // Mermaid SVG画像が埋め込まれていることを確認
    // SVGタグまたはdata:image/svg+xmlが含まれる
    expect(
      html.includes('<svg') || html.includes('data:image/svg+xml')
    ).toBe(true);
  });

  test('HTMLにPlantUMLダイアグラムが画像として含まれる（Phase 4）', () => {
    if (!fs.existsSync(htmlFile)) {
      throw new Error('HTML file not found. Run the generation test first.');
    }

    const html = fs.readFileSync(htmlFile, 'utf-8');

    // PlantUML画像が埋め込まれていることを確認
    // PlantUMLは設定でPNG形式なので、data:image/pngまたはPlantUML図のdivが含まれる
    expect(
      html.includes('plantuml-diagram') || 
      html.includes('data:image/png') ||
      html.includes('PlantUML Diagram')
    ).toBe(true);
  });

  test('PDFファイルが有効なPDFである（Phase 1 & 2）', () => {
    if (!fs.existsSync(pdfFile)) {
      throw new Error('PDF file not found. Run the generation test first.');
    }

    const pdfBuffer = fs.readFileSync(pdfFile);
    
    // PDFの基本的な検証
    // PDFファイルは"%PDF"で始まる
    expect(pdfBuffer.toString('utf-8', 0, 4)).toBe('%PDF');
    
    // ファイルサイズが0より大きい（中身のないPDFではない）
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  test('生成されたHTMLファイルのサイズが妥当である', () => {
    if (!fs.existsSync(htmlFile)) {
      throw new Error('HTML file not found. Run the generation test first.');
    }

    const stats = fs.statSync(htmlFile);
    
    // HTMLファイルサイズが10KB以上あることを確認
    // （画像埋め込みやダイアグラムがあるため）
    expect(stats.size).toBeGreaterThan(10000);
  });

  test('生成されたPDFファイルのサイズが妥当である', () => {
    if (!fs.existsSync(pdfFile)) {
      throw new Error('PDF file not found. Run the generation test first.');
    }

    const stats = fs.statSync(pdfFile);
    
    // PDFファイルサイズが50KB以上あることを確認
    // （ダイアグラムや複数ページがあるため）
    expect(stats.size).toBeGreaterThan(50000);
  });

  test('HTMLにリンクと引用が含まれる', () => {
    if (!fs.existsSync(htmlFile)) {
      throw new Error('HTML file not found. Run the generation test first.');
    }

    const html = fs.readFileSync(htmlFile, 'utf-8');

    // リンク
    expect(html).toContain('href="https://github.com/takemi-ohama/md-specgen"');
    expect(html).toContain('GitHub');
    
    // 引用
    expect(html).toContain('<blockquote');
    expect(html).toContain('PLAN01.mdの実装により');
  });

  test('HTMLに実装フェーズのまとめが含まれる', () => {
    if (!fs.existsSync(htmlFile)) {
      throw new Error('HTML file not found. Run the generation test first.');
    }

    const html = fs.readFileSync(htmlFile, 'utf-8');

    // 各フェーズの記述を確認
    expect(html).toContain('Phase 1: PDF単体出力バグ修正');
    expect(html).toContain('Phase 2: 基本PDF機能拡張');
    expect(html).toContain('Phase 3: Markdown機能強化');
    expect(html).toContain('Phase 4: PlantUMLサポート');
    expect(html).toContain('Phase 5: Watchモード');
    
    // 各フェーズの主要機能
    expect(html).toContain('一時ディレクトリ');
    expect(html).toContain('ページ向き設定');
    expect(html).toContain('markdown-it');
    expect(html).toContain('自動変換');
    expect(html).toContain('ファイル変更監視');
  });
});
