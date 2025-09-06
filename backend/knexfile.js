// knexfile.js
require('dotenv').config({ path: './.env' });
const path = require('path');

// 读取现有配置，避免重复定义
const config = require('./config');

const BASE_PATH = path.join(__dirname, 'database');

module.exports = {
  development: {
    client: config.database.client || (config.database.dialect === 'mysql' ? 'mysql2' : 'sqlite3'),
    connection: config.database.dialect === 'sqlite3' 
      ? { filename: config.database.storage }
      : {
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
      },
    migrations: {
      directory: path.join(BASE_PATH, 'migrations'),
    },
    seeds: {
      directory: path.join(BASE_PATH, 'seeds'),
    },
    useNullAsDefault: config.database.dialect === 'sqlite',
  },

  // 你可以为 testing 和 production 添加类似配置
  // 例如，testing 环境可以连接到一个专用的测试数据库
  testing: (function() {
    // If tests should use a real DB (e.g. MySQL), enable via USE_REAL_DB_FOR_TEST
    if (process.env.USE_REAL_DB_FOR_TEST === 'true') {
      return {
        client: config.database.client || (config.database.dialect === 'mysql' ? 'mysql2' : 'sqlite3'),
        connection: config.database.dialect === 'sqlite3' ? { filename: config.database.storage } : {
          host: config.database.host,
          port: config.database.port,
          user: config.database.user,
          password: config.database.password,
          database: config.database.name
        },
        migrations: {
          directory: path.join(BASE_PATH, 'migrations')
        },
        seeds: {
          directory: path.join(BASE_PATH, 'seeds')
        },
        useNullAsDefault: config.database.dialect === 'sqlite'
      }
    }
    return {
      client: 'sqlite3',
      connection: { filename: path.join(BASE_PATH, 'test.db') },
      migrations: {
        directory: path.join(BASE_PATH, 'migrations'),
      },
      seeds: {
        directory: path.join(BASE_PATH, 'seeds'),
      },
      useNullAsDefault: true,
    }
  })(),

  production: {
    // ... 类似配置
  },

  // test environment mirrors sqlite for isolation
  test: {
    client: 'sqlite3',
    connection: { filename: path.join(BASE_PATH, 'test.db') },
    migrations: {
      directory: path.join(BASE_PATH, 'migrations'),
    },
    seeds: {
      directory: path.join(BASE_PATH, 'seeds'),
    },
    useNullAsDefault: true,
  }
};
