import type { LlmClient } from './client.js';

/**
 * 品質チェック結果
 */
export interface QualityCheckResult {
  /** チェック対象ファイルパス */
  filePath: string;
  /** 問題が見つかったか */
  hasIssues: boolean;
  /** 見出し構造の問題 */
  headingIssues: string[];
  /** リンク切れの問題 */
  linkIssues: string[];
  /** 改善提案 */
  suggestions: string[];
  /** 全体的な評価コメント */
  overallComment: string;
}

/**
 * Markdown品質チェック
 * @param client LLMクライアント
 * @param filePath ファイルパス
 * @param content Markdownコンテンツ
 * @returns 品質チェック結果
 */
export async function checkMarkdownQuality(
  client: LlmClient,
  filePath: string,
  content: string
): Promise<QualityCheckResult> {
  const systemPrompt = `あなたは技術文書のレビュー専門家です。
Markdownドキュメントの品質をチェックし、以下の観点で評価してください：

1. 見出し構造の妥当性
   - 階層が適切か（h1→h2→h3の順序）
   - 見出しの内容が明確か

2. リンクの問題
   - 相対リンクが存在するか確認
   - 外部リンクの記述形式が適切か

3. 全体的な改善提案
   - 読みやすさの向上
   - 構造の改善
   - 追加すべき情報

結果はJSON形式で出力してください。
{
  "headingIssues": ["問題点1", "問題点2"],
  "linkIssues": ["問題点1", "問題点2"],
  "suggestions": ["改善案1", "改善案2"],
  "overallComment": "全体評価コメント"
}`;

  const userMessage = `以下のMarkdownファイルをレビューしてください：

ファイル名: ${filePath}

\`\`\`markdown
${content}
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
      2048
    );

    // JSONレスポンスのパース
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // パースできない場合はテキストから手動で抽出
      return {
        filePath,
        hasIssues: false,
        headingIssues: [],
        linkIssues: [],
        suggestions: [],
        overallComment: response.text,
      };
    }

    const result = JSON.parse(jsonMatch[0]) as {
      headingIssues: string[];
      linkIssues: string[];
      suggestions: string[];
      overallComment: string;
    };

    const hasIssues =
      result.headingIssues.length > 0 ||
      result.linkIssues.length > 0 ||
      result.suggestions.length > 0;

    return {
      filePath,
      hasIssues,
      headingIssues: result.headingIssues || [],
      linkIssues: result.linkIssues || [],
      suggestions: result.suggestions || [],
      overallComment: result.overallComment || '',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`品質チェックエラー: ${error.message}`);
    }
    throw new Error('品質チェックエラー（不明なエラー）');
  }
}

/**
 * 複数のMarkdownファイルを一括チェック
 * @param client LLMクライアント
 * @param files ファイルパスとコンテンツのマップ
 * @returns 品質チェック結果の配列
 */
export async function checkMultipleMarkdownFiles(
  client: LlmClient,
  files: Map<string, string>
): Promise<QualityCheckResult[]> {
  const results: QualityCheckResult[] = [];

  for (const [filePath, content] of files.entries()) {
    const result = await checkMarkdownQuality(client, filePath, content);
    results.push(result);
  }

  return results;
}
