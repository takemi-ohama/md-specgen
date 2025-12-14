import Anthropic from '@anthropic-ai/sdk';
import type { LlmClient, LlmMessage, LlmResponse } from './client.js';
import type { LlmConfig } from '../../core/types.js';

/**
 * Anthropic Claude APIクライアント
 */
export class AnthropicClient implements LlmClient {
  private client: Anthropic;
  private model: string;

  constructor(config: LlmConfig) {
    // APIキーの取得（設定または環境変数から）
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Anthropic APIキーが見つかりません。設定にapiKeyを指定するか、環境変数ANTHROPIC_API_KEYを設定してください。'
      );
    }

    this.client = new Anthropic({
      apiKey,
    });

    this.model = config.model || 'claude-3-5-sonnet-20241022';
  }

  async sendMessage(
    messages: LlmMessage[],
    systemPrompt?: string,
    maxTokens: number = 4096
  ): Promise<LlmResponse> {
    try {
      // Anthropic APIの形式に変換
      const anthropicMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // API呼び出し
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: anthropicMessages,
        ...(systemPrompt && { system: systemPrompt }),
      });

      // レスポンスの抽出
      const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

      return {
        text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API呼び出しエラー: ${error.message}`);
      }
      throw new Error('Anthropic API呼び出しエラー（不明なエラー）');
    }
  }
}
