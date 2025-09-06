const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import configuration and utilities
const config = require('./config');
const logger = require('./utils/logger');
const ApiError = require('./utils/ApiError');
const { sendSuccess, sendError } = require('./utils/responseHandler');

// Import production middleware
const { validate, schemas, rateLimits, securityHeaders } = require('./middleware/validation');
const { monitoring, healthCheckMiddleware, metricsMiddleware, requestTracker } = require('./middleware/monitoring');
const { globalErrorHandler } = require('./middleware/errorHandler');

// Import database
const { testConnection, initDatabase } = require('./config/database-adapter');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const questionRoutes = require('./routes/question');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const studyRoutes = require('./routes/study');
const knowledgeRoutes = require('./routes/knowledge');
const systemRoutes = require('./routes/system');
const searchRoutes = require('./routes/search');
let checkinRoutes = null;
if (process.env.NODE_ENV !== 'test') {
  checkinRoutes = require('./routes/checkin');
}
const statsRoutes = require('./routes/stats');
const articleRoutes = require('./routes/article');
const examRoutes = require('./routes/exam');
const bannerRoutes = require('./routes/banner');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = config.ports.backend;

// Instrument app.listen to help debug test server startup during e2e tests
// This logs when supertest or other code calls app.listen()
const _originalListen = app.listen.bind(app);
app.listen = (...args) => {
  console.log('[E2E-DEBUG] app.listen called with args:', args && args.length ? args : 'no-args');
  return _originalListen(...args);
};

// ========================================
// Production Security Middleware
// ========================================

// Security headers
app.use(securityHeaders);

// Trust proxy for production deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (config.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      logger.security('CORS violation attempt', { origin, allowedOrigins: config.cors.origins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  maxAge: config.cors.maxAge
}));

// ========================================
// Monitoring and Logging
// ========================================

// Request tracking for monitoring
app.use(requestTracker);

// Lightweight health check that never touches DB (for debugging hanging health)
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check endpoint (before rate limiting)
app.use(healthCheckMiddleware);

// Metrics endpoint (protected in production)
if (process.env.NODE_ENV !== 'production') {
  app.use(metricsMiddleware);
}

// ========================================
// Rate Limiting
// ========================================

if (process.env.NODE_ENV !== 'test') {
  // Global rate limiting
  app.use(rateLimits.api);

  // Specific rate limits for different endpoint types
  app.use('/api/v1/login', rateLimits.auth);           // deprecated alias
  app.use('/api/v1/register', rateLimits.auth);        // deprecated alias
  app.use('/api/v1/auth/login', rateLimits.auth);
  app.use('/api/v1/auth/register', rateLimits.auth);
  app.use('/api/v1/search', rateLimits.search);
}

// ========================================
// Request Parsing
// ========================================

// Body parsing with size limits
app.use(bodyParser.json({ 
  limit: config.upload.maxSize,
  verify: (req, res, buf) => {
    // Additional validation can be added here
    if (buf.length === 0) {
      logger.warn('Empty request body received', { path: req.path });
    }
  }
}));

app.use(bodyParser.urlencoded({ 
  extended: true, 
  limit: config.upload.maxSize,
  parameterLimit: 100 // Prevent parameter pollution
}));

// ========================================
// Static File Serving
// ========================================

// Secure static file serving
app.use('/static', express.static('public', {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

app.use('/static/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : '0',
  etag: true
}));

// ========================================
// API Routes with Validation
// ========================================

const apiPrefix = `${config.api.prefix}/${config.api.version}`;

// Authentication routes with validation
// New canonical path
app.use(`${apiPrefix}/auth`, authRoutes);
// Deprecated aliases for backward compatibility (login/register at root)
app.use(`${apiPrefix}`, authRoutes);

// Protected routes
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/questions`, questionRoutes);
app.use(`${apiPrefix}/study`, studyRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/admin/content`, contentRoutes);
app.use(`${apiPrefix}/knowledge`, knowledgeRoutes);
app.use(`${apiPrefix}/system`, systemRoutes);
app.use(`${apiPrefix}/search`, searchRoutes);
app.use(`${apiPrefix}/stats`, statsRoutes);
if (checkinRoutes) {
  app.use(`${apiPrefix}`, checkinRoutes);
}
app.use(`${apiPrefix}/articles`, articleRoutes);
app.use(`${apiPrefix}/exams`, examRoutes);
app.use(`${apiPrefix}/banners`, bannerRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);

// ========================================
// Root Endpoint
// ========================================

app.get('/', (req, res) => {
  const response = {
    name: '掌上刷题宝 API 服务器',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'running',
    timestamp: new Date().toISOString()
  };

  // Don't expose internal URLs in production
  if (process.env.NODE_ENV !== 'production') {
    response.docs = `${apiPrefix}/docs`;
    response.health = '/health';
    response.metrics = '/metrics';
  }

  sendSuccess(res, response);
});

// ========================================
// Error Handling
// ========================================

// 404 Handler
app.use('*', (req, res, next) => {
  logger.warn('404 Not Found', { 
    path: req.originalUrl, 
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next(new ApiError(404, '接口不存在'));
});

// Register centralized Global Error Handler
app.use(globalErrorHandler);

// ========================================
// Server Startup and Shutdown
// ========================================

async function startServer() {
  try {
    logger.info('Starting server initialization...');

    // Validate environment configuration
    if (process.env.NODE_ENV === 'production') {
      logger.info('Production environment detected - validating configuration');
      
      if (config.cors.origins.length === 0) {
        throw new Error('CORS_ORIGINS must be set in production');
      }
      
      logger.info('Production configuration validated');
    }

    // Initialize database
    logger.info('Initializing database connection...');
    await initDatabase();
    logger.info('Database initialized successfully');

    // Setup graceful shutdown
    monitoring.setupGracefulShutdown();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        pid: process.pid
      });

      console.log(`🚀 服务器已启动`);
      console.log(`📍 地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 健康检查: http://localhost:${PORT}/health`);
        console.log(`📊 监控指标: http://localhost:${PORT}/metrics`);
      }
    });

    // Configure server for production
    if (process.env.NODE_ENV === 'production') {
      server.keepAliveTimeout = 65000;
      server.headersTimeout = 66000;
    }

    return server;

  } catch (error) {
    logger.error('Server startup failed', { error: error.message, stack: error.stack });
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(error => {
    logger.error('Unhandled server startup error', { error: error.message });
    process.exit(1);
  });
}

module.exports = app;