/**
 * PDF変換モジュール
 *
 * HTMLファイルをPDFに変換します。
 * Puppeteerを使用して実装されています。
 */

import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';
import { pathToFileURL } from 'url';
import path from 'path';

/**
 * PDF変換オプション
 */
export interface PdfConversionOptions {
  /** 用紙サイズ（デフォルト: A4） */
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  /** ページ向き（デフォルト: portrait） */
  orientation?: 'portrait' | 'landscape';
  /** 背景を印刷するか */
  printBackground?: boolean;
  /** ヘッダー/フッターを表示するか */
  displayHeaderFooter?: boolean;
  /** ヘッダーテンプレート */
  headerTemplate?: string;
  /** フッターテンプレート */
  footerTemplate?: string;
  /** マージン設定 */
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  /** ページ範囲 */
  pageRanges?: string;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
}

/**
 * PDFページサイズのプリセット
 */
const PAGE_SIZE_PRESETS = {
  A4: { width: '210mm', height: '297mm' },
  A3: { width: '297mm', height: '420mm' },
  Letter: { width: '8.5in', height: '11in' },
  Legal: { width: '8.5in', height: '14in' },
};

/**
 * HTMLファイルをPDFに変換
 *
 * @param htmlPath HTMLファイルパス（絶対パス）
 * @param outputPath PDF出力パス（絶対パス）
 * @param options 変換オプション
 */
export async function convertToPdf(
  htmlPath: string,
  outputPath: string,
  options: PdfConversionOptions = {}
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // HTMLファイルを読み込み
    const fileUrl = pathToFileURL(path.resolve(htmlPath)).href;
    await page.goto(fileUrl, {
      waitUntil: 'load',
      timeout: options.timeout || 30000,
    });

    // PDF生成オプションを構築
    const pdfOptions: PDFOptions = {
      path: outputPath,
      format: options.format || 'A4',
      landscape: options.orientation === 'landscape',
      printBackground: options.printBackground ?? true,
      displayHeaderFooter: options.displayHeaderFooter ?? false,
      preferCSSPageSize: true,
      margin: options.margin || {
        top: '25mm',
        right: '20mm',
        bottom: '25mm',
        left: '20mm',
      },
    };

    // ヘッダー/フッターテンプレートを設定
    if (options.headerTemplate) {
      pdfOptions.headerTemplate = options.headerTemplate;
    }
    if (options.footerTemplate) {
      pdfOptions.footerTemplate = options.footerTemplate;
    }

    // ページ範囲を設定
    if (options.pageRanges) {
      pdfOptions.pageRanges = options.pageRanges;
    }

    // PDFを生成
    await page.pdf(pdfOptions);

    console.log(`✅ PDFファイルを生成しました: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

/**
 * 複数のHTMLファイルを結合してPDFに変換
 *
 * @param htmlPaths HTMLファイルパスの配列
 * @param outputPath PDF出力パス
 * @param options 変換オプション
 */
export async function convertMultipleHtmlsToPdf(
  htmlPaths: string[],
  outputPath: string,
  options: PdfConversionOptions = {}
): Promise<void> {
  // TODO: 複数HTMLの結合処理を実装
  // 現在は最初のHTMLのみを変換
  if (htmlPaths.length === 0) {
    throw new Error('HTMLファイルが指定されていません');
  }

  await convertToPdf(htmlPaths[0], outputPath, options);
}
