import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { fileExists } from '../../utils/file.js';

/**
 * キャッシュエントリ
 */
interface CacheEntry {
  /** キャッシュされたレスポンス */
  response: string;
  /** キャッシュ作成日時（UNIX timestamp） */
  timestamp: number;
  /** 使用したトークン数 */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * LLMキャッシュ
 * API呼び出し結果をファイルベースでキャッシュ
 */
export class LlmCache {
  private cacheDir: string;
  private ttl: number; // Time To Live（秒単位）

  /**
   * @param cacheDir キャッシュディレクトリ
   * @param ttl キャッシュ有効期限（秒、デフォルト: 24時間）
   */
  constructor(cacheDir: string, ttl: number = 86400) {
    this.cacheDir = cacheDir;
    this.ttl = ttl;
  }

  /**
   * キャッシュディレクトリを初期化
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`キャッシュディレクトリの作成に失敗: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * キャッシュキーを生成
   * @param input 入力文字列（プロンプトなど）
   * @returns キャッシュキー（SHA256ハッシュ）
   */
  private generateKey(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  /**
   * キャッシュファイルパスを取得
   * @param key キャッシュキー
   * @returns ファイルパス
   */
  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  /**
   * キャッシュから取得
   * @param input 入力文字列
   * @returns キャッシュされたレスポンス（存在しない/期限切れの場合はnull）
   */
  async get(input: string): Promise<string | null> {
    const key = this.generateKey(input);
    const filePath = this.getCacheFilePath(key);

    try {
      // ファイル存在チェック
      if (!(await fileExists(filePath))) {
        return null;
      }

      // キャッシュファイルを読み込み
      const data = await fs.readFile(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(data);

      // 有効期限チェック
      const now = Math.floor(Date.now() / 1000);
      if (now - entry.timestamp > this.ttl) {
        // 期限切れの場合は削除
        await fs.unlink(filePath);
        return null;
      }

      return entry.response;
    } catch (error) {
      // エラーが発生した場合はnullを返す（キャッシュミス扱い）
      return null;
    }
  }

  /**
   * キャッシュに保存
   * @param input 入力文字列
   * @param response レスポンス
   * @param usage 使用トークン数（オプション）
   */
  async set(
    input: string,
    response: string,
    usage?: { inputTokens: number; outputTokens: number }
  ): Promise<void> {
    const key = this.generateKey(input);
    const filePath = this.getCacheFilePath(key);

    const entry: CacheEntry = {
      response,
      timestamp: Math.floor(Date.now() / 1000),
      usage,
    };

    try {
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8');
    } catch (error) {
      // キャッシュ保存エラーは無視（本質的な処理ではないため）
      console.warn(
        `キャッシュ保存エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  }

  /**
   * 期限切れキャッシュをクリーンアップ
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Math.floor(Date.now() / 1000);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.cacheDir, file);
        try {
          const data = await fs.readFile(filePath, 'utf-8');
          const entry: CacheEntry = JSON.parse(data);

          // 有効期限チェック
          if (now - entry.timestamp > this.ttl) {
            await fs.unlink(filePath);
          }
        } catch {
          // 読み込みエラーの場合は削除
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.warn(
        `キャッシュクリーンアップエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  }

  /**
   * 全キャッシュをクリア
   */
  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.warn(
        `キャッシュクリアエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  }
}
