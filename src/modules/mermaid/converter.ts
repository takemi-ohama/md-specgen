/**
 * Mermaid変換モジュール
 *
 * Mermaid記法をSVGに変換します。
 * Puppeteerを使用してブラウザ上でMermaidをレンダリングします。
 */

import { Browser } from 'puppeteer';
import { initBrowser, closeBrowser } from '../pdf/puppeteer.js';

/**
 * Mermaid変換オプション
 */
export interface MermaidConversionOptions {
  /** テーマ（default, dark, forest, neutral） */
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  /** 最大幅を使用するか */
  useMaxWidth?: boolean;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
}

/**
 * MermaidコードブロックをSVGに変換
 *
 * @param mermaidCode Mermaidコード
 * @param options 変換オプション
 * @returns SVG文字列
 */
export async function convertMermaidToSvg(
  mermaidCode: string,
  options: MermaidConversionOptions = {}
): Promise<string> {
  const browser = await initBrowser();
  const page = await browser.newPage();

  try {
    const theme = options.theme || 'default';
    const useMaxWidth = options.useMaxWidth ?? true;

    // MermaidをレンダリングするHTMLを作成
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: '${theme}',
      themeVariables: {
        fontFamily: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "IPAGothic", "IPAexGothic", "Meiryo", sans-serif'
      },
      flowchart: {
        useMaxWidth: ${useMaxWidth},
        htmlLabels: true
      },
      sequence: {
        useMaxWidth: ${useMaxWidth}
      }
    });
  </script>
</head>
<body>
  <div class="mermaid">
${mermaidCode}
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Mermaidのレンダリングを待つ
    const timeout = options.timeout || 2000;
    await new Promise((resolve) => setTimeout(resolve, timeout));

    // SVGを取得
    const svgContent = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      return svg ? svg.outerHTML : null;
    });

    if (!svgContent) {
      throw new Error('Mermaid SVGの生成に失敗しました');
    }

    return svgContent;
  } catch (error) {
    throw new Error(`Mermaid変換エラー: ${(error as Error).message}`);
  } finally {
    await page.close();
  }
}

/**
 * HTML内のMermaidコードブロックをSVGに置換
 *
 * @param html HTMLコンテンツ
 * @param options 変換オプション
 * @returns SVGに置換されたHTML
 */
export async function replaceMermaidDiagrams(
  html: string,
  options: MermaidConversionOptions = {}
): Promise<string> {
  // HTMLエスケープされたMermaidコードブロックを抽出
  const mermaidRegex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;
  const matches: Array<{ fullMatch: string; code: string }> = [];
  let match;

  while ((match = mermaidRegex.exec(html)) !== null) {
    matches.push({
      fullMatch: match[0],
      code: match[1]
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim(),
    });
  }

  if (matches.length === 0) {
    return html;
  }

  console.log(`Mermaid図を${matches.length}個見つけました。SVGに変換中...`);

  let result = html;

  for (const mermaidMatch of matches) {
    try {
      const svgContent = await convertMermaidToSvg(mermaidMatch.code, options);

      // SVGをHTMLに埋め込む
      result = result.replace(
        mermaidMatch.fullMatch,
        `<div class="mermaid-svg" style="text-align: center; margin: 1rem 0;">${svgContent}</div>`
      );
    } catch (error) {
      console.warn(`Mermaid図の変換に失敗: ${(error as Error).message}`);

      // エラー時はプレースホルダーを表示
      result = result.replace(
        mermaidMatch.fullMatch,
        '<div class="mermaid-placeholder" style="background: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-radius: 4px; margin: 1rem 0;"><p><em>【Mermaid図】レンダリングに失敗しました</em></p></div>'
      );
    }
  }

  return result;
}
