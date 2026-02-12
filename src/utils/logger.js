/**
 * Logger Utility
 * Centralized logging system
 */

const { config } = require('../config');

/**
 * Log Levels
 */
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format Log Message
 */
const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    ...meta,
  };

  return JSON.stringify(logEntry);
};

/**
 * Logger Class
 */
class Logger {
  constructor() {
    this.isDevelopment = config.server.env === 'development';
  }

  log(level, message, meta = {}) {
    const logMessage = this.isDevelopment
      ? this.formatDevLog(level, message, meta)
      : formatLog(level, message, meta);

    console.log(logMessage);
  }

  formatDevLog(level, message, meta) {
    const timestamp = new Date().toLocaleString('vi-VN');
    const levelColors = {
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      INFO: '\x1b[36m',    // Cyan
      DEBUG: '\x1b[35m',   // Magenta
    };
    const resetColor = '\x1b[0m';
    const color = levelColors[level] || resetColor;

    let logStr = `${color}[${timestamp}] [${level}]${resetColor} ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logStr += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logStr;
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (this.isDevelopment) {
      this.log(LOG_LEVELS.DEBUG, message, meta);
    }
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = { logger, LOG_LEVELS };
