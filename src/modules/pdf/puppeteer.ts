/**
 * Puppeteer操作モジュール
 *
 * Puppeteerブラウザインスタンスの初期化と終了処理を管理します。
 */

import puppeteer, { Browser } from 'puppeteer';

/**
 * Puppeteer起動オプション
 */
export interface PuppeteerOptions {
  /** ヘッドレスモード */
  headless?: boolean;
  /** 追加の起動引数 */
  args?: string[];
  /** タイムアウト（ミリ秒） */
  timeout?: number;
}

/**
 * ブラウザインスタンス管理クラス
 * シングルトンパターンで実装し、複数回の初期化を防ぎます
 */
export class PuppeteerManager {
  private static instance: PuppeteerManager | null = null;
  private browser: Browser | null = null;

  private constructor() {}

  /**
   * PuppeteerManagerのインスタンスを取得
   */
  static getInstance(): PuppeteerManager {
    if (!PuppeteerManager.instance) {
      PuppeteerManager.instance = new PuppeteerManager();
    }
    return PuppeteerManager.instance;
  }

  /**
   * ブラウザを初期化
   *
   * @param options Puppeteerオプション
   * @returns Browserインスタンス
   */
  async initBrowser(options: PuppeteerOptions = {}): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const defaultArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
    const args = options.args ? [...defaultArgs, ...options.args] : defaultArgs;

    this.browser = await puppeteer.launch({
      headless: options.headless ?? true,
      args,
      timeout: options.timeout,
    });

    return this.browser;
  }

  /**
   * ブラウザを終了
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 現在のブラウザインスタンスを取得
   *
   * @returns Browserインスタンス（初期化されていない場合はnull）
   */
  getBrowser(): Browser | null {
    return this.browser;
  }

  /**
   * ブラウザが初期化されているかチェック
   *
   * @returns 初期化されている場合true
   */
  isInitialized(): boolean {
    return this.browser !== null;
  }
}

/**
 * ブラウザを初期化（ヘルパー関数）
 *
 * @param options Puppeteerオプション
 * @returns Browserインスタンス
 */
export async function initBrowser(options?: PuppeteerOptions): Promise<Browser> {
  const manager = PuppeteerManager.getInstance();
  return manager.initBrowser(options);
}

/**
 * ブラウザを終了（ヘルパー関数）
 */
export async function closeBrowser(): Promise<void> {
  const manager = PuppeteerManager.getInstance();
  await manager.closeBrowser();
}

/**
 * 現在のブラウザインスタンスを取得（ヘルパー関数）
 *
 * @returns Browserインスタンス
 */
export function getBrowser(): Browser | null {
  const manager = PuppeteerManager.getInstance();
  return manager.getBrowser();
}
