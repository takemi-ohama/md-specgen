/**
 * ロギングユーティリティ
 */

import chalk from 'chalk';

/**
 * ログレベル
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Logger クラス
 */
export class Logger {
  private level: LogLevel;

  constructor(verbose: boolean = false) {
    this.level = verbose ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * ログレベルを設定
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * DEBUG ログ
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  /**
   * INFO ログ
   */
  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue(`[INFO] ${message}`), ...args);
    }
  }

  /**
   * SUCCESS ログ
   */
  success(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.green(`[SUCCESS] ${message}`), ...args);
    }
  }

  /**
   * WARN ログ
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(chalk.yellow(`[WARN] ${message}`), ...args);
    }
  }

  /**
   * ERROR ログ
   */
  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(chalk.red(`[ERROR] ${message}`), ...args);
    }
  }
}

/**
 * デフォルトロガーインスタンス
 */
let defaultLogger: Logger | null = null;

/**
 * デフォルトロガーを取得
 */
export function getLogger(verbose: boolean = false): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger(verbose);
  }
  return defaultLogger;
}

/**
 * デフォルトロガーを初期化
 */
export function initLogger(verbose: boolean = false): Logger {
  defaultLogger = new Logger(verbose);
  return defaultLogger;
}
