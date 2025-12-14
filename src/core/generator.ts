/**
 * メインジェネレーターモジュール
 *
 * Markdown→HTML→PDFの変換処理を統合的に実行します。
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { Config } from './config.js';
import { convertToHtml, generateBreadcrumbs } from '../modules/html/converter.js';
import { generateIndexPage, IndexEntry } from '../modules/html/index-page.js';
import { loadTemplate } from '../modules/html/template.js';
import { convertToPdf } from '../modules/pdf/converter.js';
import { extractHeadings, generateToc, addHeadingIds } from '../modules/pdf/toc.js';
import { replaceMermaidDiagrams } from '../modules/mermaid/converter.js';
import { embedImages } from '../modules/image/embed.js';
import { parseFrontmatter } from '../modules/markdown/frontmatter.js';

/**
 * 生成オプション
 */
export interface GenerateOptions {
  /** 設定オブジェクト */
  config: Config;
  /** 詳細ログを出力するか */
  verbose?: boolean;
  /** HTML生成をスキップ */
  skipHtml?: boolean;
  /** PDF生成をスキップ */
  skipPdf?: boolean;
}

/**
 * 生成結果
 */
export interface GenerateResult {
  /** 生成されたHTMLファイルのパスリスト */
  htmlFiles: string[];
  /** 生成されたPDFファイルのパス */
  pdfFile?: string;
  /** 処理したMarkdownファイル数 */
  markdownCount: number;
}

/**
 * ディレクトリを再帰的に作成
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dirname = path.dirname(filePath);
  await fs.ensureDir(dirname);
}

/**
 * MarkdownファイルをHTMLに変換
 */
async function processMarkdownFile(
  filePath: string,
  relativePath: string,
  config: Config,
  template?: string
): Promise<string> {
  console.log(`処理中: ${relativePath}`);

  const fileContent = await fs.readFile(filePath, 'utf-8');

  // パンくずリストを生成
  const breadcrumbs = config.html?.breadcrumbs
    ? generateBreadcrumbs(relativePath, 'ホーム')
    : undefined;

  // HTMLに変換
  const result = await convertToHtml(fileContent, {
    template,
    breadcrumbs,
    footerText: config.html?.footerText,
  });

  // 出力パス
  const outputPath = path.join(config.outputDir, 'html', relativePath.replace(/\.md$/, '.html'));
  await ensureDirectoryExists(outputPath);

  // ファイルを保存
  await fs.writeFile(outputPath, result.html, 'utf-8');
  console.log(`生成完了: ${outputPath}`);

  return outputPath;
}

/**
 * ディレクトリツリーからインデックスエントリーを構築
 */
async function buildIndexEntries(inputDir: string, baseDir: string): Promise<IndexEntry[]> {
  const entries: IndexEntry[] = [];
  const items = await fs.readdir(inputDir);

  for (const item of items) {
    if (item.startsWith('.')) continue;

    const fullPath = path.join(inputDir, item);
    const stat = await fs.stat(fullPath);
    const relativePath = path.relative(baseDir, fullPath);

    if (stat.isDirectory()) {
      const children = await buildIndexEntries(fullPath, baseDir);
      entries.push({
        name: item,
        path: relativePath + '/index.html',
        title: item,
        isDirectory: true,
        children,
      });
    } else if (item.endsWith('.md')) {
      // Frontmatterからタイトルを取得
      const content = await fs.readFile(fullPath, 'utf-8');
      const { data } = parseFrontmatter(content);
      const title = data.title || item.replace(/\.md$/, '');

      entries.push({
        name: item,
        path: relativePath.replace(/\.md$/, '.html'),
        title,
        isDirectory: false,
      });
    }
  }

  return entries;
}

/**
 * インデックスページを生成
 */
async function generateIndex(config: Config, template?: string): Promise<void> {
  const entries = await buildIndexEntries(config.inputDir, config.inputDir);

  const indexHtml = generateIndexPage(entries, {
    title: 'ドキュメント一覧',
    description: '',
    template,
    footerText: config.html?.footerText,
    treeView: true,
  });

  const indexPath = path.join(config.outputDir, 'html', 'index.html');
  await ensureDirectoryExists(indexPath);
  await fs.writeFile(indexPath, indexHtml, 'utf-8');

  console.log(`インデックスページ生成: ${indexPath}`);
}

/**
 * 統合PDFを生成
 */
async function generatePdf(config: Config, htmlFiles: string[]): Promise<string> {
  if (!config.pdf?.enabled) {
    throw new Error('PDF生成が無効化されています');
  }

  // 全HTMLファイルを結合
  const contentParts: string[] = [];

  for (const htmlFile of htmlFiles) {
    const content = await fs.readFile(htmlFile, 'utf-8');

    // <article>タグ内のコンテンツを抽出
    const articleMatch = content.match(/<article>([\s\S]*?)<\/article>/);
    if (articleMatch) {
      contentParts.push(`<section class="document-section">\n${articleMatch[1]}\n</section>\n`);
      contentParts.push('<div class="page-break"></div>\n');
    }
  }

  let combinedContent = contentParts.join('\n');

  // 画像を埋め込み
  if (config.images?.embed && config.imagesDir) {
    console.log('画像をBase64エンコードしています...');
    combinedContent = await embedImages(combinedContent, {
      imagesDir: config.imagesDir,
    });
  }

  // Mermaid図を変換
  if (config.mermaid?.enabled) {
    console.log('Mermaid図をSVGに変換しています...');
    combinedContent = await replaceMermaidDiagrams(combinedContent, {
      theme: config.mermaid.theme,
    });
  }

  // 目次を生成
  let tocHtml = '';
  if (config.pdf?.includeToc) {
    console.log('目次を生成しています...');
    const headings = extractHeadings(combinedContent);
    tocHtml = generateToc(headings);
    combinedContent = addHeadingIds(combinedContent, headings);
  }

  // 完全なHTMLドキュメントを生成
  const today = new Date().toLocaleDateString('ja-JP');
  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${config.pdf?.coverTitle || 'ドキュメント'}</title>
    <style>
        /* PDF用スタイル（省略版） */
        @page {
            size: ${config.pdf?.format || 'A4'};
            margin: 25mm 20mm;
        }
        body { font-family: sans-serif; font-size: 11pt; line-height: 1.7; }
        .page-break { page-break-after: always; }
        h1 { font-size: 22pt; border-bottom: 2px solid #ddd; }
        h2 { font-size: 18pt; border-bottom: 1px solid #ddd; }
        h3 { font-size: 14pt; }
    </style>
</head>
<body>
    ${tocHtml}
    ${combinedContent}
</body>
</html>`;

  // 一時HTMLファイルを保存
  const tempHtmlPath = path.join(config.outputDir, 'temp-combined.html');
  await fs.writeFile(tempHtmlPath, fullHtml, 'utf-8');

  // PDFに変換
  const pdfPath = path.join(config.outputDir, 'document.pdf');
  await convertToPdf(tempHtmlPath, pdfPath, {
    format: config.pdf?.format,
  });

  // 一時ファイルを削除
  await fs.remove(tempHtmlPath);

  return pdfPath;
}

/**
 * メイン生成関数
 */
export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const { config, verbose = false, skipHtml = false, skipPdf = false } = options;

  console.log('===== ドキュメント生成開始 =====');
  console.log(`入力: ${config.inputDir}`);
  console.log(`出力: ${config.outputDir}`);

  const result: GenerateResult = {
    htmlFiles: [],
    markdownCount: 0,
  };

  // HTML生成
  if (!skipHtml) {
    // 出力ディレクトリをクリア
    const htmlDir = path.join(config.outputDir, 'html');
    await fs.remove(htmlDir);
    await fs.ensureDir(htmlDir);

    // テンプレートを読み込み
    let template: string | undefined;
    if (config.html?.template) {
      template = await loadTemplate(config.html.template);
    }

    // Markdownファイルを検索
    const pattern = path.join(config.inputDir, '**/*.md');
    const markdownFiles = await glob(pattern);

    result.markdownCount = markdownFiles.length;

    // 各ファイルを処理
    for (const file of markdownFiles) {
      const relativePath = path.relative(config.inputDir, file);
      const htmlFile = await processMarkdownFile(file, relativePath, config, template);
      result.htmlFiles.push(htmlFile);
    }

    // インデックスページを生成
    await generateIndex(config, template);

    console.log(`✅ HTML生成完了（${result.markdownCount}ファイル）`);
  }

  // PDF生成
  if (!skipPdf && config.pdf?.enabled) {
    console.log('PDF生成を開始します...');
    result.pdfFile = await generatePdf(config, result.htmlFiles);
    console.log(`✅ PDF生成完了: ${result.pdfFile}`);
  }

  console.log('===== 生成完了 =====');

  return result;
}
