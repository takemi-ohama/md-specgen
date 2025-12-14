import type { LlmConfig } from '../../core/types.js';

/**
 * LLMメッセージ
 */
export interface LlmMessage {
  /** ロール: user または assistant */
  role: 'user' | 'assistant';
  /** メッセージ内容 */
  content: string;
}

/**
 * LLMレスポンス
 */
export interface LlmResponse {
  /** 生成されたテキスト */
  text: string;
  /** 使用したトークン数 */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * LLMクライアント基底インターフェース
 */
export interface LlmClient {
  /**
   * メッセージを送信してレスポンスを取得
   * @param messages メッセージリスト
   * @param systemPrompt システムプロンプト（オプション）
   * @param maxTokens 最大出力トークン数（デフォルト: 4096）
   * @returns レスポンス
   */
  sendMessage(
    messages: LlmMessage[],
    systemPrompt?: string,
    maxTokens?: number
  ): Promise<LlmResponse>;
}

/**
 * LLMクライアントファクトリー関数
 * @param config LLM設定
 * @returns LLMクライアント
 */
export async function createLlmClient(config: LlmConfig): Promise<LlmClient> {
  if (!config.enabled) {
    throw new Error('LLM機能が無効です。設定でenabledをtrueにしてください。');
  }

  switch (config.provider) {
    case 'anthropic': {
      const { AnthropicClient } = await import('./anthropic-client.js');
      return new AnthropicClient(config);
    }
    case 'bedrock': {
      const { BedrockClient } = await import('./bedrock-client.js');
      return new BedrockClient(config);
    }
    default:
      throw new Error(`未対応のLLMプロバイダー: ${config.provider as string}`);
  }
}
