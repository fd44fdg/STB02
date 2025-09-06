const path = require('path');
const dotenv = require('dotenv');
// Load environment variables from backend/.env by default
try {
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // ignore
}

// Production environment validation
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['JWT_SECRET', 'DB_PASSWORD', 'DB_HOST', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missingVars.join(', ')}`);
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
}

const useSqlite = process.env.USE_SQLITE === 'true';

const dbConfig = {
  sqlite: {
    dialect: 'sqlite3',
    storage: path.join(__dirname, '../database/local.db'),
    client: 'sqlite3'
  },
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'shuati_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DB_PASSWORD must be set in production');
      }
      return '';
    })(),
    dialect: 'mysql',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || (process.env.NODE_ENV === 'production' ? 50 : 20),
      min: parseInt(process.env.DB_POOL_MIN) || (process.env.NODE_ENV === 'production' ? 10 : 5),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT) || 60000,
      idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
      // Production-specific settings
      evict: 60000,
      handleDisconnects: true,
      acquireTimeoutMillis: 60000
    }
  }
};

module.exports = {
  // 端口配置 - 与 docker-compose.yml 保持一致
  ports: {
    backend: process.env.PORT || 3000,  // 修复：与Docker配置一致
    admin: process.env.ADMIN_PORT || 8080
  },

  // 数据库配置
  database: useSqlite ? dbConfig.sqlite : dbConfig.mysql,

  // CORS配置 - Production-safe
  cors: {
    origins: process.env.CORS_ORIGINS ?
      process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) :
      (process.env.NODE_ENV === 'production' ?
        [] : // No default origins in production - must be explicitly set
        [
          'http://localhost:8080','http://127.0.0.1:8080',
          'http://localhost:3000','http://127.0.0.1:3000', 'http://localhost:3001','http://127.0.0.1:3001',
          'http://localhost:8081','http://localhost:8083','http://localhost:8084','http://localhost:8085','http://localhost:8086',
          'http://localhost:8090','http://127.0.0.1:8090'
        ]
      ),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
  },

  // API配置
  api: {
    prefix: '/api',
    version: 'v1'
  },

  // JWT配置 - Production-hardened
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production environment');
      }
      console.warn('⚠️  Using default JWT secret in development. Set JWT_SECRET in production!');
      return 'dev-only-secret-key-not-for-production-use';
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || (process.env.NODE_ENV === 'production' ? '24h' : '7d'),
    algorithm: 'HS256',
    issuer: 'shuati-app',
    audience: 'shuati-users'
  },

  // 文件上传配置 - Production-secure
  upload: {
    maxSize: process.env.UPLOAD_MAX_SIZE || (process.env.NODE_ENV === 'production' ? '5mb' : '10mb'),
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES ? 
      process.env.UPLOAD_ALLOWED_TYPES.split(',').map(type => type.trim()) :
      ['image/jpeg', 'image/png', 'image/webp'],
    uploadDir: path.join(__dirname, '../public/uploads'),
    // Additional security settings
    preserveExtension: false,
    generateUniqueFilename: true,
    scanForMalware: process.env.NODE_ENV === 'production'
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 
      (process.env.NODE_ENV === 'production' ? 50 : 100),
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // 微信小程序配置
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || ''
  },

  // 环境配置
  env: process.env.NODE_ENV || 'development',

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(__dirname, '../logs/app.log')
  }
};
