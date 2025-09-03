const winston = require('winston');
const path = require('path');

// Production-grade logger with proper error handling and security
class ProductionLogger {
  constructor() {
    this.logger = this.createLogger();
  }

  createLogger() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logDir = process.env.LOG_FILE_PATH ? path.dirname(process.env.LOG_FILE_PATH) : path.join(__dirname, '../logs');
    
    // Create log format that doesn't leak sensitive data
    const productionFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        // Sanitize meta to remove sensitive data
        const sanitizedMeta = this.sanitizeMeta(meta);
        
        let logEntry = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(sanitizedMeta).length > 0) {
          logEntry += ` ${JSON.stringify(sanitizedMeta)}`;
        }
        
        if (stack && process.env.NODE_ENV !== 'production') {
          logEntry += `\n${stack}`;
        }
        
        return logEntry;
      })
    );

    const transports = [
      // Console output for development
      new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          productionFormat
        )
      })
    ];

    // File transports for production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        // Application logs
        new winston.transports.File({
          filename: process.env.LOG_FILE_PATH || path.join(logDir, 'app.log'),
          level: 'info',
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 10,
          format: productionFormat
        }),
        
        // Error logs
        new winston.transports.File({
          filename: process.env.LOG_ERROR_FILE || path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 100 * 1024 * 1024,
          maxFiles: 5,
          format: productionFormat
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      // Don't exit on handled exceptions
      exitOnError: false,
      
      // Handle uncaught exceptions and rejections
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'exceptions.log')
        })
      ],
      
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'rejections.log')
        })
      ]
    });
  }

  // Remove sensitive data from logs
  sanitizeMeta(meta) {
    const sensitiveKeys = [
      'password', 'token', 'authorization', 'cookie', 'session',
      'secret', 'key', 'pass', 'pwd', 'auth', 'jwt', 'bearer',
      'x-api-key', 'api-key', 'private'
    ];

    const sanitized = { ...meta };
    
    const sanitizeValue = (obj, path = '') => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      for (const key in obj) {
        const lowerKey = key.toLowerCase();
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if key contains sensitive information
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeValue(obj[key], currentPath);
        }
      }
      
      return obj;
    };

    return sanitizeValue(sanitized);
  }

  // Security audit log
  security(message, meta = {}) {
    this.logger.warn(`[SECURITY] ${message}`, {
      type: 'security',
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Database operation logs
  database(operation, table, meta = {}) {
    this.logger.info(`[DB] ${operation} on ${table}`, {
      type: 'database',
      operation,
      table,
      ...meta
    });
  }

  // API request logs
  api(method, path, statusCode, responseTime, meta = {}) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.logger[level](`[API] ${method} ${path} ${statusCode} ${responseTime}ms`, {
      type: 'api',
      method,
      path,
      statusCode,
      responseTime,
      ...meta
    });
  }

  // Performance monitoring
  performance(metric, value, meta = {}) {
    this.logger.info(`[PERF] ${metric}: ${value}`, {
      type: 'performance',
      metric,
      value,
      ...meta
    });
  }

  // Business logic logs
  business(event, meta = {}) {
    this.logger.info(`[BUSINESS] ${event}`, {
      type: 'business',
      event,
      ...meta
    });
  }

  // Standard logging methods
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

// Create singleton instance
const logger = new ProductionLogger();

module.exports = logger;