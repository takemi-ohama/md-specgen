/**
 * CLIコマンド定義
 *
 * md-specgenのコマンドライン操作を定義します。
 */

import { Command } from 'commander';
import path from 'path';
import { loadConfig, getDefaultConfig, mergeConfig, configFromCliArgs } from '../core/config.js';
import { generate } from '../core/generator.js';

/**
 * generateコマンド
 */
export function registerGenerateCommand(program: Command): void {
  program
    .command('generate')
    .alias('gen')
    .description('Markdownドキュメントを生成します')
    .option('-i, --input <dir>', '入力ディレクトリ（Markdownファイル）')
    .option('-o, --output <dir>', '出力ディレクトリ')
    .option('--images <dir>', '画像ディレクトリ')
    .option('-c, --config <file>', '設定ファイルパス（YAML or JSON）')
    .option('--pdf', 'PDFを生成する')
    .option('--no-pdf', 'PDFを生成しない')
    .option('--format <format>', 'PDF用紙サイズ（A4, A3, Letter, Legal）', 'A4')
    .option('--toc-level <level>', '目次の見出しレベル（1-6、デフォルト: 3）', '3')
    .option('--no-toc', '目次を生成しない')
    .option('--font <font>', 'PDFフォント名（例: "Noto Sans JP"）')
    .option('--skip-html', 'HTML生成をスキップ')
    .option('--skip-pdf', 'PDF生成をスキップ')
    .option('-v, --verbose', '詳細ログを出力')
    // LLMオプション
    .option('--llm', 'LLM機能を有効化')
    .option('--llm-provider <provider>', 'LLMプロバイダー（anthropic または bedrock）')
    .option('--llm-quality-check', '品質チェックを実行')
    .option('--llm-auto-index', 'インデックス自動生成')
    .option('--llm-auto-frontmatter', 'Frontmatter自動生成')
    .option('--llm-auto-image-alt', '画像alt属性自動生成')
    .action(async (options) => {
      try {
        // 設定を読み込み
        let config = getDefaultConfig();

        // 設定ファイルがある場合は読み込み
        if (options.config) {
          const configPath = path.resolve(options.config);
          config = await loadConfig(configPath);
        }

        // CLI引数で上書き
        const cliConfig = configFromCliArgs(options);
        config = mergeConfig(config, cliConfig);

        // 相対パスを絶対パスに変換
        config.inputDir = path.resolve(config.inputDir);
        config.outputDir = path.resolve(config.outputDir);
        if (config.imagesDir) {
          config.imagesDir = path.resolve(config.imagesDir);
        }

        // 生成実行
        const result = await generate({
          config,
          verbose: options.verbose,
          skipHtml: options.skipHtml,
          skipPdf: options.skipPdf,
        });

        console.log('\n✅ 生成が完了しました！');
        console.log(`   HTMLファイル数: ${result.htmlFiles.length}`);
        if (result.pdfFile) {
          console.log(`   PDFファイル: ${result.pdfFile}`);
        }
      } catch (error) {
        console.error('❌ エラーが発生しました:', (error as Error).message);
        process.exit(1);
      }
    });
}

/**
 * initコマンド（設定ファイル生成）
 */
export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('設定ファイルを生成します')
    .option('-f, --format <format>', '設定ファイル形式（json, yaml）', 'yaml')
    .action(async (options) => {
      try {
        const fs = await import('fs-extra');
        const yaml = await import('js-yaml');

        const config = getDefaultConfig();
        const format = options.format.toLowerCase();

        let filename: string;
        let content: string;

        if (format === 'json') {
          filename = 'md-specgen.config.json';
          content = JSON.stringify(config, null, 2);
        } else {
          filename = 'md-specgen.config.yaml';
          content = yaml.dump(config);
        }

        // ファイルが既に存在する場合は確認
        if (await fs.pathExists(filename)) {
          console.error(`❌ ${filename} は既に存在します`);
          process.exit(1);
        }

        await fs.writeFile(filename, content, 'utf-8');
        console.log(`✅ 設定ファイルを生成しました: ${filename}`);
      } catch (error) {
        console.error('❌ エラーが発生しました:', (error as Error).message);
        process.exit(1);
      }
    });
}
