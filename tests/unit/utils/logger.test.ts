/**
 * ロギングユーティリティのテスト
 */

// consoleメソッドを先にモック化
const mockLog = jest.spyOn(console, 'log').mockImplementation();
const mockWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockError = jest.spyOn(console, 'error').mockImplementation();

// chalkをシンプルにモック
jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    gray: jest.fn((str: string) => str),
    blue: jest.fn((str: string) => str),
    green: jest.fn((str: string) => str),
    yellow: jest.fn((str: string) => str),
    red: jest.fn((str: string) => str),
  },
}));

import { Logger, LogLevel, getLogger, initLogger } from '../../../src/utils/logger';

describe('logger utils', () => {
  beforeEach(() => {
    mockLog.mockClear();
    mockWarn.mockClear();
    mockError.mockClear();
  });

  afterAll(() => {
    mockLog.mockRestore();
    mockWarn.mockRestore();
    mockError.mockRestore();
  });

  describe('Logger class', () => {
    it('デフォルトではINFOレベルで初期化される', () => {
      const logger = new Logger();
      logger.info('test');
      expect(mockLog).toHaveBeenCalled();
      expect(mockLog.mock.calls[0][0]).toContain('[INFO]');
    });

    it('verbose=trueの場合はDEBUGレベルで初期化される', () => {
      const logger = new Logger(true);
      logger.debug('test');
      expect(mockLog).toHaveBeenCalled();
      expect(mockLog.mock.calls[0][0]).toContain('[DEBUG]');
    });

    describe('setLevel', () => {
      it('ログレベルを変更できる', () => {
        const logger = new Logger();
        logger.setLevel(LogLevel.WARN);

        logger.info('should not appear');
        logger.warn('should appear');

        expect(mockLog).not.toHaveBeenCalled();
        expect(mockWarn).toHaveBeenCalled();
        expect(mockWarn.mock.calls[0][0]).toContain('[WARN]');
      });
    });

    describe('debug', () => {
      it('DEBUGレベルでログを出力する', () => {
        const logger = new Logger(true);
        logger.debug('debug message');

        expect(mockLog).toHaveBeenCalled();
      });

      it('INFOレベル以上では出力されない', () => {
        const logger = new Logger();
        logger.debug('should not appear');

        expect(mockLog).not.toHaveBeenCalled();
      });
    });

    describe('info', () => {
      it('INFOログを出力する', () => {
        const logger = new Logger();
        logger.info('info message');

        expect(mockLog).toHaveBeenCalled();
      });

      it('WARNレベル以上では出力されない', () => {
        const logger = new Logger();
        logger.setLevel(LogLevel.WARN);
        logger.info('should not appear');

        expect(mockLog).not.toHaveBeenCalled();
      });
    });

    describe('success', () => {
      it('SUCCESSログを出力する', () => {
        const logger = new Logger();
        logger.success('success message');

        expect(mockLog).toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('WARNログを出力する', () => {
        const logger = new Logger();
        logger.warn('warning message');

        expect(mockWarn).toHaveBeenCalled();
      });

      it('ERRORレベル以上では出力されない', () => {
        const logger = new Logger();
        logger.setLevel(LogLevel.ERROR);
        logger.warn('should not appear');

        expect(mockWarn).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('ERRORログを出力する', () => {
        const logger = new Logger();
        logger.error('error message');

        expect(mockError).toHaveBeenCalled();
      });

      it('SILENTレベルでは出力されない', () => {
        const logger = new Logger();
        logger.setLevel(LogLevel.SILENT);
        logger.error('should not appear');

        expect(mockError).not.toHaveBeenCalled();
      });
    });

    describe('additional arguments', () => {
      it('追加の引数を渡せる', () => {
        const logger = new Logger();
        const obj = { key: 'value' };
        logger.info('message', obj);

        expect(mockLog).toHaveBeenCalled();
        // logger.ts実装では、chalkの結果とargsが渡される
        expect(mockLog.mock.calls[0].length).toBe(2);
        expect(mockLog.mock.calls[0][1]).toBe(obj);
      });
    });
  });

  describe('getLogger', () => {
    it('シングルトンのロガーを取得できる', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();

      expect(logger1).toBe(logger2);
    });
  });

  describe('initLogger', () => {
    it('新しいロガーインスタンスを作成する', () => {
      const logger1 = initLogger();
      const logger2 = initLogger();

      // 新しいインスタンスが作成されるが、getLoggerは最後のインスタンスを返す
      expect(logger2).toBeDefined();
    });

    it('verbose設定でロガーを初期化できる', () => {
      const logger = initLogger(true);
      logger.debug('test');

      expect(mockLog).toHaveBeenCalled();
    });
  });
});
