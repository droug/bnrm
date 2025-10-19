/**
 * Development-only logger
 * 
 * Logs are only output in development mode to prevent information leakage
 * and improve production performance.
 * 
 * @example
 * ```typescript
 * import { log } from '@/lib/logger';
 * 
 * log('User logged in:', userId);
 * log.error('Failed to fetch data:', error);
 * log.warn('Deprecated feature used');
 * ```
 */

const isDev = import.meta.env.DEV;

export const log = {
  /**
   * Standard log - only in development
   */
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Error log - only in development
   */
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
  },

  /**
   * Warning log - only in development
   */
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },

  /**
   * Info log - only in development
   */
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },

  /**
   * Debug log - only in development
   */
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
};

// Default export for backward compatibility
export default log.log;
