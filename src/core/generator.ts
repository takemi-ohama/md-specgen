/**
 * メインジェネレーターモジュール
 *
 * Markdown→HTML→PDFの変換処理を統合的に実行します。
 */

import fs from 'fs-extra';
import path from 'path';
import { Config } from './config.js';
import { convertToHtml, generateBreadcrumbs } from '../modules/html/converter.js';
import { generateIndexPage, IndexEntry } from '../modules/html/index-page.js';
import { loadTemplate } from '../modules/html/template.js';
import { convertToPdf } from '../modules/pdf/converter.js';
import { extractHeadings, generateToc, addHeadingIds } from '../modules/pdf/toc.js';
import { collectMarkdownFiles, isFile, createTempDir, removeTempDir } from '../utils/file.js';
import { replaceMermaidDiagrams } from '../modules/mermaid/converter.js';
import { closeBrowser } from '../modules/pdf/puppeteer.js';
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

  // 出力パス（outputDirに直接出力）
  const outputPath = path.join(config.outputDir, relativePath.replace(/\.md$/, '.html'));
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

  const indexPath = path.join(config.outputDir, 'index.html');
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
    const tocLevel = config.pdf?.tocLevel || 3;
    const headings = extractHeadings(combinedContent, tocLevel);
    tocHtml = generateToc(headings);
    combinedContent = addHeadingIds(combinedContent, headings);
  }

  // 完全なHTMLドキュメントを生成
  const fontName = config.pdf?.font || 'Noto Sans JP';
  const fontNameEncoded = fontName.replace(/\s+/g, '+');
  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${config.pdf?.coverTitle || 'ドキュメント'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${fontNameEncoded}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* PDF用スタイル */
        @page {
            size: ${config.pdf?.format || 'A4'};
            margin: 25mm 20mm;
        }

        /* 日本語フォント設定 */
        body {
            font-family: "${fontName}", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
            font-size: 10pt;
            line-height: 1.7;
            color: #333;
        }

        .page-break { page-break-after: always; }

        /* 見出しスタイル */
        h1 {
            font-size: 20pt;
            font-weight: 600;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 0.3em;
            margin-top: 1.5em;
            color: #1e40af;
        }
        h2 {
            font-size: 16pt;
            font-weight: 600;
            border-bottom: 1px solid #93c5fd;
            padding-bottom: 0.2em;
            margin-top: 1.3em;
            color: #1e3a8a;
        }
        h3 {
            font-size: 13pt;
            font-weight: 600;
            margin-top: 1.2em;
            color: #1e3a8a;
        }
        h4 {
            font-size: 11pt;
            font-weight: 600;
            margin-top: 1em;
        }

        /* テーブルスタイル */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            font-size: 9pt;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 0.5em 0.75em;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #e0e7ff;
            font-weight: 600;
            color: #1e3a8a;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        tr:hover {
            background-color: #f1f5f9;
        }

        /* コードスタイル */
        pre {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 0.75em;
            overflow-x: auto;
            font-size: 8.5pt;
            line-height: 1.5;
        }
        code {
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 0.9em;
        }
        :not(pre) > code {
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 3px;
            padding: 0.1em 0.3em;
        }

        /* リストスタイル */
        ul, ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
        }
        li {
            margin-bottom: 0.3em;
        }

        /* 引用スタイル */
        blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1em;
            margin: 1em 0;
            color: #4b5563;
            font-style: italic;
        }

        /* Mermaid図スタイル（拡大禁止、縮小のみ） */
        .mermaid-svg {
            text-align: center;
            margin: 1em 0;
            overflow: visible;
        }
        .mermaid-svg svg {
            /* 元のサイズを維持、拡大しない */
            height: auto;
        }

        /* 水平線 */
        hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 1.5em 0;
        }

        /* 段落 */
        p {
            margin: 0.5em 0;
        }

        /* 強調 */
        strong {
            font-weight: 600;
            color: #1e293b;
        }

        /* 目次スタイル */
        .toc {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 1em;
            margin-bottom: 2em;
        }
        .toc h2 {
            margin-top: 0;
            font-size: 14pt;
        }
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        .toc li {
            margin: 0.3em 0;
        }
        .toc a {
            color: #2563eb;
            text-decoration: none;
        }
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
  const { skipHtml = false, skipPdf = false } = options;
  let config = options.config;

  console.log('===== ドキュメント生成開始 =====');
  console.log(`入力: ${config.inputDir}`);
  console.log(`出力: ${config.outputDir}`);

  const result: GenerateResult = {
    htmlFiles: [],
    markdownCount: 0,
  };

  // PDF単体出力の場合は一時ディレクトリを使用
  const useTempDir = skipHtml && !skipPdf && config.pdf?.enabled;
  let tempDir: string | undefined;
  let originalOutputDir: string | undefined;

  try {
    if (useTempDir) {
      // 一時ディレクトリを作成
      tempDir = await createTempDir();
      originalOutputDir = config.outputDir;
      // configのコピーを作成して一時ディレクトリを設定（元のconfigを変更しない）
      config = { ...config, outputDir: tempDir };
      console.log(`一時ディレクトリを作成しました: ${tempDir}`);
    }

    // HTML生成
    if (!skipHtml || useTempDir) {
      // 出力ディレクトリをクリア
      await fs.remove(config.outputDir);
      await fs.ensureDir(config.outputDir);

      // テンプレートを読み込み
      let template: string | undefined;
      if (config.html?.template) {
        template = await loadTemplate(config.html.template);
      }

      // Markdownファイルを収集（ディレクトリまたはファイルパス対応）
      const markdownFiles = await collectMarkdownFiles(config.inputDir);

      // ファイル名でソート（数値プレフィックスを考慮した自然ソート）
      markdownFiles.sort((a, b) => {
        const nameA = path.basename(a);
        const nameB = path.basename(b);

        // 数値プレフィックスを抽出（例: "00-", "01-"）
        const numA = nameA.match(/^(\d+)-/);
        const numB = nameB.match(/^(\d+)-/);

        if (numA && numB) {
          const diff = parseInt(numA[1], 10) - parseInt(numB[1], 10);
          if (diff !== 0) return diff;
        }

        // 数値が同じか、数値プレフィックスがない場合はアルファベット順
        return nameA.localeCompare(nameB);
      });

      result.markdownCount = markdownFiles.length;

      // 入力パスがディレクトリかファイルかを判定
      const inputIsFile = await isFile(config.inputDir);

      // 各ファイルを処理
      for (const file of markdownFiles) {
        // 入力がファイルの場合は、そのファイル自体を基準にする
        const baseDir = inputIsFile ? path.dirname(config.inputDir) : config.inputDir;
        const relativePath = path.relative(baseDir, file);
        const htmlFile = await processMarkdownFile(file, relativePath, config, template);
        result.htmlFiles.push(htmlFile);
      }

      // インデックスページを生成（ディレクトリ入力の場合のみ）
      if (!inputIsFile && !useTempDir) {
        await generateIndex(config, template);
      }

      console.log(`✅ HTML生成完了（${result.markdownCount}ファイル）`);
    }

    // PDF生成
    if (!skipPdf && config.pdf?.enabled) {
      console.log('PDF生成を開始します...');
      const pdfPath = await generatePdf(config, result.htmlFiles);

      // PDF単体出力の場合は、元の出力先にPDFをコピー
      if (useTempDir && originalOutputDir) {
        await fs.ensureDir(originalOutputDir);
        const finalPdfPath = path.join(originalOutputDir, 'document.pdf');
        await fs.copy(pdfPath, finalPdfPath);
        result.pdfFile = finalPdfPath;
        console.log(`✅ PDF生成完了: ${finalPdfPath}`);
      } else {
        result.pdfFile = pdfPath;
        console.log(`✅ PDF生成完了: ${pdfPath}`);
      }
    }

    // Puppeteerブラウザを終了（Mermaid変換で使用した場合）
    await closeBrowser();

    console.log('===== 生成完了 =====');

    return result;
  } finally {
    // 一時ディレクトリをクリーンアップ
    if (tempDir) {
      console.log(`一時ディレクトリを削除しています: ${tempDir}`);
      await removeTempDir(tempDir);
    }
  }
}
