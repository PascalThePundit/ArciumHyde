/**
 * Simple logger implementation for the SDK
 */
export const logger = {
  debug: (message: string, meta?: any) => {
    if (process.env['NODE_ENV'] === 'development' || process.env['DEBUG'] === 'true') {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  },

  info: (message: string, meta?: any) => {
    console.info(`[INFO] ${message}`, meta || '');
  },

  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },

  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta || '');
  }
};
