const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// Production-grade input validation and security middleware
class ValidationMiddleware {
  
  // SQL injection prevention patterns
  static SQL_INJECTION_PATTERNS = [
    /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b|\bexec\b)/i,
    /(\bor\b\s+\b1\s*=\s*1\b|\band\b\s+\b1\s*=\s*1\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bxp_|\bsp_)/i
  ];

  // XSS prevention patterns
  static XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*=[\s]*['"]?[^'"]*javascript:/gi
  ];

  // Comprehensive input sanitization
  static sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') return input;
    
    let sanitized = input;
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // SQL injection prevention
    if (!options.allowSQL) {
      for (const pattern of this.SQL_INJECTION_PATTERNS) {
        if (pattern.test(sanitized)) {
          logger.security('SQL injection attempt detected', { input: input.substring(0, 100) });
          throw new ApiError(400, '输入包含非法字符');
        }
      }
    }
    
    // XSS prevention
    if (!options.allowHTML) {
      for (const pattern of this.XSS_PATTERNS) {
        if (pattern.test(sanitized)) {
          logger.security('XSS attempt detected', { input: input.substring(0, 100) });
          throw new ApiError(400, '输入包含非法字符');
        }
      }
      
      // Basic HTML entity encoding
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    return sanitized;
  }

  // Create validation middleware from Joi schema
  static validate(schema, options = {}) {
    return (req, res, next) => {
      const { body, query, params } = req;
      const data = { ...body, ...query, ...params };
      
      try {
        // Sanitize all string inputs
        const sanitizedData = this.sanitizeObject(data, options);
        
        // Validate with Joi
        const { error, value } = schema.validate(sanitizedData, {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: false
        });
        
        if (error) {
          const errorMessage = error.details.map(detail => detail.message).join(', ');
          logger.warn('Validation error', { error: errorMessage, path: req.path });
          return next(new ApiError(400, `参数验证失败: ${errorMessage}`));
        }
        
        // Replace original data with validated and sanitized data
        req.body = value.body || req.body;
        req.query = value.query || req.query;
        req.params = value.params || req.params;
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Recursively sanitize object
  static sanitizeObject(obj, options = {}) {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.sanitizeInput(obj, options) : obj;
    }
    
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.sanitizeObject(obj[key], options);
      }
    }
    
    return sanitized;
  }

  // Common validation schemas
  static schemas = {
    // User authentication
    login: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(6).max(128).required()
    }),

    register: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
      nickname: Joi.string().max(50).optional()
    }),

    // User profile
    updateProfile: Joi.object({
      nickname: Joi.string().max(50).optional(),
      bio: Joi.string().max(500).optional(),
      avatar: Joi.string().uri().optional()
    }),

    // Question management
    createQuestion: Joi.object({
      title: Joi.string().max(200).required(),
      content: Joi.string().max(5000).required(),
      category_id: Joi.number().integer().positive().required(),
      difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
      type: Joi.string().valid('single', 'multiple', 'judge', 'fill').required(),
      options: Joi.array().items(Joi.string().max(500)).min(2).max(6).optional(),
      correct_answer: Joi.string().max(1000).required(),
      explanation: Joi.string().max(2000).optional(),
      tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
    }),

    // Article content
    createArticle: Joi.object({
      title: Joi.string().max(200).required(),
      content: Joi.string().max(50000).required(),
      categoryId: Joi.number().integer().positive().required(),
      summary: Joi.string().max(500).optional(),
      cover: Joi.string().uri().optional(),
      tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
    }),

    // Pagination
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    // ID parameter
    id: Joi.object({
      id: Joi.number().integer().positive().required()
    })
  };
}

// Enhanced rate limiting for different endpoints
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.security('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      next(new ApiError(429, options.message.error));
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Specific rate limits for different endpoint types
const rateLimits = {
  // Authentication endpoints - very strict
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: '登录尝试过于频繁，请15分钟后再试' }
  }),

  // API endpoints - moderate
  api: createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50
  }),

  // File upload - strict
  upload: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 uploads per hour
  }),

  // Search endpoints - moderate
  search: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20 // 20 searches per minute
  })
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  ValidationMiddleware,
  validate: ValidationMiddleware.validate.bind(ValidationMiddleware),
  schemas: ValidationMiddleware.schemas,
  rateLimits,
  securityHeaders
};