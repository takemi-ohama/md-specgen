import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import type { LlmClient, LlmMessage, LlmResponse } from './client.js';
import type { LlmConfig } from '../../core/types.js';

/**
 * AWS Bedrock Claude APIクライアント
 */
export class BedrockClient implements LlmClient {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(config: LlmConfig) {
    // AWS リージョンの取得
    const region = config.awsRegion || process.env.AWS_REGION || 'us-east-1';

    this.client = new BedrockRuntimeClient({
      region,
      // AWS認証情報は自動的に~/.aws/credentialsまたは環境変数から取得される
    });

    // モデルIDの設定（Bedrockの場合はフルIDが必要）
    this.modelId = config.model || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
  }

  async sendMessage(
    messages: LlmMessage[],
    systemPrompt?: string,
    maxTokens: number = 4096
  ): Promise<LlmResponse> {
    try {
      // Bedrock Claude APIの形式に変換
      const bedrockMessages = messages.map((msg) => ({
        role: msg.role,
        content: [
          {
            type: 'text',
            text: msg.content,
          },
        ],
      }));

      // リクエストボディの構築
      const requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        messages: bedrockMessages,
        ...(systemPrompt && {
          system: [
            {
              type: 'text',
              text: systemPrompt,
            },
          ],
        }),
      };

      // API呼び出し
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      });

      const response = await this.client.send(command);

      // レスポンスのパース
      if (!response.body) {
        throw new Error('Bedrock APIからのレスポンスが空です');
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // レスポンスの抽出
      const text = responseBody.content?.[0]?.type === 'text' ? responseBody.content[0].text : '';

      return {
        text,
        usage: {
          inputTokens: responseBody.usage?.input_tokens || 0,
          outputTokens: responseBody.usage?.output_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Bedrock API呼び出しエラー: ${error.message}`);
      }
      throw new Error('Bedrock API呼び出しエラー（不明なエラー）');
    }
  }
}
