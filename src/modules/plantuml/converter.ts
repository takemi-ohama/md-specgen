/**
 * PlantUML変換モジュール
 *
 * PlantUML記法をPNG/SVGに変換します。
 * PlantUML公式サーバーAPIを使用して変換を行います。
 */

import plantumlEncoder from 'plantuml-encoder';

/**
 * PlantUML変換オプション
 */
export interface PlantUMLConversionOptions {
  /** PlantUMLサーバーURL */
  server?: string;
  /** 画像フォーマット（png or svg） */
  format?: 'png' | 'svg';
  /** タイムアウト（ミリ秒） */
  timeout?: number;
}

/**
 * PlantUMLコードを画像URLに変換
 *
 * @param plantUMLCode PlantUMLコード
 * @param options 変換オプション
 * @returns 画像URL
 */
export async function getPlantUMLImageUrl(
  plantUMLCode: string,
  options: PlantUMLConversionOptions = {}
): Promise<string> {
  const server = options.server || 'https://www.plantuml.com/plantuml';
  const format = options.format || 'png';

  // PlantUMLコードをエンコード
  const encoded = plantumlEncoder.encode(plantUMLCode);

  // サーバーURLを構築（末尾のスラッシュを削除）
  const baseUrl = server.replace(/\/$/, '');
  return `${baseUrl}/${format}/${encoded}`;
}

/**
 * PlantUMLコードを画像データに変換
 *
 * @param plantUMLCode PlantUMLコード
 * @param options 変換オプション
 * @returns 画像データ（Buffer）
 */
export async function convertPlantUMLToImage(
  plantUMLCode: string,
  options: PlantUMLConversionOptions = {}
): Promise<Buffer> {
  const imageUrl = await getPlantUMLImageUrl(plantUMLCode, options);
  const timeout = options.timeout || 30000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`PlantUMLサーバーエラー: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(`PlantUML変換タイムアウト（${timeout}ms）`);
    }
    throw new Error(`PlantUML変換エラー: ${(error as Error).message}`);
  }
}

/**
 * PlantUMLコードをSVG文字列に変換
 *
 * @param plantUMLCode PlantUMLコード
 * @param options 変換オプション
 * @returns SVG文字列
 */
export async function convertPlantUMLToSvg(
  plantUMLCode: string,
  options: PlantUMLConversionOptions = {}
): Promise<string> {
  const imageBuffer = await convertPlantUMLToImage(plantUMLCode, {
    ...options,
    format: 'svg',
  });
  return imageBuffer.toString('utf-8');
}

/**
 * PlantUMLコードをBase64エンコードされたデータURLに変換
 *
 * @param plantUMLCode PlantUMLコード
 * @param options 変換オプション
 * @returns データURL
 */
export async function convertPlantUMLToDataUrl(
  plantUMLCode: string,
  options: PlantUMLConversionOptions = {}
): Promise<string> {
  const format = options.format || 'png';
  const imageBuffer = await convertPlantUMLToImage(plantUMLCode, options);

  if (format === 'svg') {
    // SVGの場合はUTF-8テキストとして扱う
    const svgContent = imageBuffer.toString('utf-8');
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  } else {
    // PNGの場合はBase64エンコード
    const base64 = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  }
}

/**
 * HTML内のPlantUMLコードブロックを画像に置換
 *
 * @param html HTMLコンテンツ
 * @param options 変換オプション
 * @returns 画像に置換されたHTML
 */
export async function replacePlantUMLDiagrams(
  html: string,
  options: PlantUMLConversionOptions = {}
): Promise<string> {
  // HTMLエスケープされたPlantUMLコードブロックを抽出
  const plantUMLRegex = /<pre><code class="language-plantuml">([\s\S]*?)<\/code><\/pre>/g;
  const matches: Array<{ fullMatch: string; code: string }> = [];
  let match;

  while ((match = plantUMLRegex.exec(html)) !== null) {
    let decodedCode = match[1]
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    // シンタックスハイライトのHTMLタグを除去
    decodedCode = decodedCode.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
    decodedCode = decodedCode.trim();
    
    matches.push({
      fullMatch: match[0],
      code: decodedCode,
    });
  }

  if (matches.length === 0) {
    return html;
  }

  console.log(`PlantUML図を${matches.length}個見つけました。画像に変換中...`);

  let result = html;

  for (const plantUMLMatch of matches) {
    try {
      const dataUrl = await convertPlantUMLToDataUrl(plantUMLMatch.code, options);

      // 画像をHTMLに埋め込む
      result = result.replace(
        plantUMLMatch.fullMatch,
        `<div class="plantuml-diagram" style="text-align: center; margin: 1rem 0;">
  <img src="${dataUrl}" alt="PlantUML Diagram" style="max-width: 100%; height: auto;" />
</div>`
      );
    } catch (error) {
      console.warn(`PlantUML図の変換に失敗: ${(error as Error).message}`);

      // エラー時はプレースホルダーを表示
      result = result.replace(
        plantUMLMatch.fullMatch,
        '<div class="plantuml-placeholder" style="background: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-radius: 4px; margin: 1rem 0;"><p><em>【PlantUML図】レンダリングに失敗しました</em></p></div>'
      );
    }
  }

  return result;
}
