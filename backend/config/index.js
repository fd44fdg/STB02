const path = require('path');

const useSqlite = process.env.USE_SQLITE === 'true';

const dbConfig = {
  sqlite: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/local.db')
  },
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'shuati_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    dialect: 'mysql',
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};

module.exports = {
  // 端口配置
  ports: {
    backend: process.env.PORT || 3000,
    admin: process.env.ADMIN_PORT || 8080
  },

  // 数据库配置
  database: useSqlite ? dbConfig.sqlite : dbConfig.mysql,

  // CORS配置
  cors: {
    origins: process.env.CORS_ORIGINS ?
      process.env.CORS_ORIGINS.split(',') :
      ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:8081']
  },

  // API配置
  api: {
    prefix: '/api',
    version: 'v1'
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '7d'
  },

  // 文件上传配置
  upload: {
    maxSize: '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadDir: path.join(__dirname, '../public/uploads')
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
