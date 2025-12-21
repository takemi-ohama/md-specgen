/**
 * ファイル監視モジュール
 *
 * Markdownファイルの変更を監視し、自動的に再生成します。
 */

import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import { Config } from '../../core/config.js';
import { generate } from '../../core/generator.js';

/**
 * Watch設定
 */
export interface WatchOptions {
  /** 設定オブジェクト */
  config: Config;
  /** 詳細ログを出力するか */
  verbose?: boolean;
  /** デバウンス時間（ミリ秒） */
  debounceMs?: number;
}

/**
 * Watcherインスタンス
 */
export class MarkdownWatcher {
  private watcher?: FSWatcher;
  private config: Config;
  private verbose: boolean;
  private debounceMs: number;
  private regenerateTimer?: NodeJS.Timeout;
  private isRegenerating = false;

  constructor(options: WatchOptions) {
    this.config = options.config;
    this.verbose = options.verbose ?? false;
    this.debounceMs = options.debounceMs ?? 300;
  }

  /**
   * 監視を開始
   */
  async start(): Promise<void> {
    console.log('📂 ファイル監視を開始しています...');
    console.log(`   監視対象: ${this.config.inputDir}`);

    // 初回生成
    console.log('\n🚀 初回生成を実行中...');
    await this.regenerate();

    // 監視するパスとパターン
    const watchPaths = [
      path.join(this.config.inputDir, '**/*.md'),
    ];

    // 画像ディレクトリも監視
    if (this.config.imagesDir) {
      watchPaths.push(
        path.join(this.config.imagesDir, '**/*.{png,jpg,jpeg,gif,svg,webp}')
      );
    }

    // Chokidarで監視開始
    this.watcher = chokidar.watch(watchPaths, {
      ignored: [
        /(^|[\/\\])\../,  // 隠しファイルを除外
        /node_modules/,   // node_modulesを除外
        this.config.outputDir, // 出力ディレクトリを除外
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    });

    // イベントハンドラを登録
    this.watcher
      .on('add', (filePath) => this.onFileChange('追加', filePath))
      .on('change', (filePath) => this.onFileChange('変更', filePath))
      .on('unlink', (filePath) => this.onFileChange('削除', filePath))
      .on('error', (error) => this.onError(error))
      .on('ready', () => this.onReady());
  }

  /**
   * 監視を停止
   */
  async stop(): Promise<void> {
    if (this.regenerateTimer) {
      clearTimeout(this.regenerateTimer);
      this.regenerateTimer = undefined;
    }

    if (this.watcher) {
      console.log('\n👋 ファイル監視を停止しています...');
      await this.watcher.close();
      this.watcher = undefined;
      console.log('✅ 監視を停止しました');
    }
  }

  /**
   * ファイル変更時の処理
   */
  private onFileChange(eventType: string, filePath: string): void {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`\n📝 ${eventType}: ${relativePath}`);

    // デバウンス処理
    if (this.regenerateTimer) {
      clearTimeout(this.regenerateTimer);
    }

    this.regenerateTimer = setTimeout(() => {
      this.regenerate().catch((error: unknown) => {
        console.error('❌ 再生成エラー:', error);
      });
    }, this.debounceMs);
  }

  /**
   * 再生成を実行
   */
  private async regenerate(): Promise<void> {
    if (this.isRegenerating) {
      if (this.verbose) {
        console.log('⏳ 既に再生成中のため、スキップします');
      }
      return;
    }

    try {
      this.isRegenerating = true;
      const startTime = Date.now();

      console.log('🔄 再生成を開始...');
      await generate({
        config: this.config,
        verbose: this.verbose,
      });

      const duration = Date.now() - startTime;
      console.log(`✅ 再生成完了 (${duration}ms)`);
      console.log('👀 変更を監視中... (Ctrl+C で終了)');
    } catch (error) {
      console.error('❌ 再生成に失敗しました:', error);
      throw error;
    } finally {
      this.isRegenerating = false;
    }
  }

  /**
   * エラーハンドラ
   */
  private onError(error: unknown): void {
    console.error('❌ ファイル監視エラー:', error);
  }

  /**
   * 監視準備完了時の処理
   */
  private onReady(): void {
    console.log('\n✅ ファイル監視の準備が完了しました');
    console.log('👀 変更を監視中... (Ctrl+C で終了)\n');
  }
}

/**
 * Watch modeを開始
 */
export async function startWatchMode(options: WatchOptions): Promise<MarkdownWatcher> {
  const watcher = new MarkdownWatcher(options);
  await watcher.start();
  return watcher;
}

/**
 * グレースフルシャットダウンのセットアップ
 */
export function setupGracefulShutdown(watcher: MarkdownWatcher): void {
  const shutdown = async (signal: string) => {
    console.log(`\n\n📡 ${signal} を受信しました`);
    await watcher.stop();
    process.exit(0);
  };

  // シグナルハンドラを登録
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // エラー時のクリーンアップ
  process.on('uncaughtException', async (error) => {
    console.error('❌ 予期しないエラー:', error);
    await watcher.stop();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    console.error('❌ 未処理のPromise拒否:', reason);
    await watcher.stop();
    process.exit(1);
  });
}
