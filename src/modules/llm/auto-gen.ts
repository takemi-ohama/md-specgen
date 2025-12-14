import type { LlmClient } from './client.js';
import type { Frontmatter } from '../../core/types.js';

/**
 * Frontmatter自動生成
 * @param client LLMクライアント
 * @param content Markdownコンテンツ
 * @param filePath ファイルパス
 * @returns 生成されたFrontmatter
 */
export async function generateFrontmatter(
  client: LlmClient,
  content: string,
  filePath: string
): Promise<Partial<Frontmatter>> {
  const systemPrompt = `あなたは技術文書のメタデータ生成の専門家です。
MarkdownドキュメントからFrontmatterを自動生成してください。

以下の項目を生成してください：
- title: ドキュメントのタイトル
- description: ドキュメントの概要（1-2文）
- keywords: 関連するキーワード（配列）
- author: 著者名（記載があれば、なければ省略）

結果はJSON形式で出力してください。
{
  "title": "タイトル",
  "description": "概要",
  "keywords": ["キーワード1", "キーワード2"]
}`;

  const userMessage = `以下のMarkdownファイルからFrontmatterを生成してください：

ファイル名: ${filePath}

\`\`\`markdown
${content.slice(0, 2000)}
\`\`\``;

  try {
    const response = await client.sendMessage(
      [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      systemPrompt,
      1024
    );

    // JSONレスポンスのパース
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {};
    }

    const result = JSON.parse(jsonMatch[0]) as Partial<Frontmatter>;
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Frontmatter生成エラー: ${error.message}`);
    }
    throw new Error('Frontmatter生成エラー（不明なエラー）');
  }
}

/**
 * 目次構成提案
 */
export interface TocSuggestion {
  /** 提案される目次構造 */
  structure: TocItem[];
  /** 提案理由 */
  reasoning: string;
}

/**
 * 目次アイテム
 */
export interface TocItem {
  /** 見出しレベル */
  level: number;
  /** 見出しテキスト */
  title: string;
  /** 説明（オプション） */
  description?: string;
}

/**
 * 目次構成提案
 * @param client LLMクライアント
 * @param contents 複数のMarkdownコンテンツ
 * @returns 目次構成提案
 */
export async function generateTocSuggestion(
  client: LlmClient,
  contents: Map<string, string>
): Promise<TocSuggestion> {
  const systemPrompt = `あなたは技術文書の構成の専門家です。
複数のMarkdownドキュメントから、最適な目次構成を提案してください。

以下の点を考慮してください：
- 論理的な順序
- 読者の理解しやすさ
- ドキュメント間の関連性

結果はJSON形式で出力してください。
{
  "structure": [
    {"level": 1, "title": "タイトル1", "description": "説明"},
    {"level": 2, "title": "タイトル2"}
  ],
  "reasoning": "提案理由"
}`;

  // コンテンツのサマリーを作成（トークン数削減のため）
  const summaries = Array.from(contents.entries())
    .map(([path, content]) => {
      const firstLines = content.split('\n').slice(0, 10).join('\n');
      return `### ${path}\n${firstLines}`;
    })
    .join('\n\n');

  const userMessage = `以下のMarkdownファイル群から目次構成を提案してください：

${summaries}`;

  try {
    const response = await client.sendMessage(
      [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      systemPrompt,
      2048
    );

    // JSONレスポンスのパース
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        structure: [],
        reasoning: response.text,
      };
    }

    const result = JSON.parse(jsonMatch[0]) as TocSuggestion;
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`目次構成提案エラー: ${error.message}`);
    }
    throw new Error('目次構成提案エラー（不明なエラー）');
  }
}

/**
 * 画像alt属性自動生成
 * @param client LLMクライアント
 * @param imagePath 画像パス
 * @param context 画像の前後のコンテキスト
 * @returns 生成されたalt属性
 */
export async function generateImageAlt(
  client: LlmClient,
  imagePath: string,
  context: string
): Promise<string> {
  const systemPrompt = `あなたはアクセシビリティの専門家です。
画像のパスと前後のコンテキストから、適切なalt属性を生成してください。

alt属性は以下の点を満たす必要があります：
- 簡潔で明確
- 画像の内容を正確に説明
- スクリーンリーダーで読み上げられることを意識
- 日本語で記述

結果はテキストのみで出力してください（JSON不要）。`;

  const userMessage = `以下の画像のalt属性を生成してください：

画像パス: ${imagePath}

前後のコンテキスト:
${context}`;

  try {
    const response = await client.sendMessage(
      [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      systemPrompt,
      256
    );

    // レスポンステキストをクリーンアップ
    const alt = response.text.trim().replace(/^["']|["']$/g, '');
    return alt;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`画像alt生成エラー: ${error.message}`);
    }
    throw new Error('画像alt生成エラー（不明なエラー）');
  }
}
