#!/usr/bin/env node

/**
 * md-specgen CLI エントリーポイント
 *
 * Markdownドキュメント生成ツールのコマンドラインインターフェース
 */

import { Command } from 'commander';
import { registerGenerateCommand, registerInitCommand } from './commands.js';

// パッケージ情報を読み込み
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');

async function getVersion(): Promise<string> {
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch {
    return '1.0.0';
  }
}

async function main() {
  const version = await getVersion();

  const program = new Command();

  program
    .name('md-specgen')
    .description('Markdownドキュメント生成ツール（HTML/PDF出力対応）')
    .version(version);

  // コマンドを登録
  registerGenerateCommand(program);
  registerInitCommand(program);

  // デフォルトコマンド（引数なしの場合はヘルプを表示）
  if (process.argv.length === 2) {
    program.help();
  }

  // コマンドを実行
  await program.parseAsync(process.argv);
}

// 実行
main().catch((error) => {
  console.error('予期しないエラーが発生しました:', error);
  process.exit(1);
});
