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
    // A4横幅(210mm) - マージン(40mm) = 170mm ≈ 500px を最大幅とする（4ボックスが上限）
    const maxWidth = 500;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; }
    .mermaid { max-width: ${maxWidth}px; }
    .mermaid svg { max-width: 100%; height: auto; }
  </style>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: '${theme}',
      maxTextSize: 50000,
      themeVariables: {
        fontFamily: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif',
        fontSize: '10px',
        nodeBorder: '1px'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        nodeSpacing: 15,
        rankSpacing: 25,
        curve: 'basis',
        padding: 6,
        defaultRenderer: 'dagre-wrapper',
        wrappingWidth: 100
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 5,
        diagramMarginY: 5,
        actorMargin: 20,
        width: 80,
        height: 40,
        boxMargin: 3,
        boxTextMargin: 2,
        noteMargin: 3,
        messageMargin: 15,
        mirrorActors: false,
        showSequenceNumbers: false
      },
      er: {
        useMaxWidth: true,
        fontSize: 9
      },
      gantt: {
        useMaxWidth: true,
        fontSize: 9
      },
      pie: {
        useMaxWidth: true
      },
      class: {
        useMaxWidth: true
      },
      state: {
        useMaxWidth: true
      }
    });
  </script>
</head>
<body>
  <div class="mermaid" style="max-width: ${maxWidth}px;">
${mermaidCode}
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Mermaidのレンダリングを待つ
    const timeout = options.timeout || 2000;
    await new Promise((resolve) => setTimeout(resolve, timeout));

    // SVGを取得し、横幅を制限（拡大はしない、縮小のみ）
    const svgContent = await page.evaluate((maxW: number) => {
      const svg = document.querySelector('svg');
      if (!svg) return null;

      // SVGの現在のサイズを取得
      const width = svg.getAttribute('width');
      const height = svg.getAttribute('height');
      const viewBox = svg.getAttribute('viewBox');

      // 幅が数値の場合、最大幅を超えていたらスケール調整（縮小のみ）
      if (width && height) {
        const widthNum = parseFloat(width);
        const heightNum = parseFloat(height);
        if (widthNum > maxW) {
          const scale = maxW / widthNum;
          const newHeight = heightNum * scale;
          svg.setAttribute('width', String(maxW));
          svg.setAttribute('height', String(newHeight));
          // viewBoxがなければ追加
          if (!viewBox) {
            svg.setAttribute('viewBox', '0 0 ' + widthNum + ' ' + heightNum);
          }
        }
        // 元のサイズを保持（拡大防止）- width/heightをそのまま維持
      }

      // 拡大防止のスタイル（縮小のみ許可）
      svg.style.maxWidth = svg.getAttribute('width') + 'px';
      svg.style.height = 'auto';

      return svg.outerHTML;
    }, maxWidth);

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
    // HTMLエンティティのデコード（&amp;を最初に処理して二重エスケープに対応）
    let decodedCode = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    // シンタックスハイライトのすべてのHTMLタグを除去
    decodedCode = decodedCode.replace(/<[^>]+>/g, '');
    decodedCode = decodedCode.trim();
    
    matches.push({
      fullMatch: match[0],
      code: decodedCode,
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
