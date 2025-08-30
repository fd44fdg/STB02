// 移动端应用配置
const env = process.env.NODE_ENV || 'development';

// 基础配置
const config = {
  // 开发环境配置
  development: {
    api: {
      baseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api/v1',
      timeout: process.env.VUE_APP_API_TIMEOUT || 10000
    },
    debug: process.env.VUE_APP_DEBUG === 'true',
    version: process.env.VUE_APP_VERSION || '0.1.0'
  },
  
  // 生产环境配置
  production: {
    api: {
      baseUrl: process.env.VUE_APP_API_BASE_URL || 'https://your-domain.com/api/v1',
      timeout: process.env.VUE_APP_API_TIMEOUT || 15000
    },
    debug: process.env.VUE_APP_DEBUG === 'true',
    version: process.env.VUE_APP_VERSION || '1.0.0'
  },
  
  // 测试环境配置
  test: {
    api: {
      baseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3001/api/v1',
      timeout: process.env.VUE_APP_API_TIMEOUT || 5000
    },
    debug: process.env.VUE_APP_DEBUG === 'true',
    version: process.env.VUE_APP_VERSION || '0.1.0'
  }
};

// 通用配置
const commonConfig = {
  // 应用信息
  app: {
    name: '掌上刷题宝',
    slogan: '随时随地，轻松刷题',
    copyright: '© 2025 掌上刷题宝'
  },
  
  // 缓存键
  storage: {
    token: 'zs_token',
    userInfo: 'zs_user_info',
    settings: 'zs_settings',
    searchHistory: 'zs_search_history'
  },
  
  // 默认设置
  defaults: {
    pageSize: 10,
    avatar: '/static/images/avatar-placeholder.png',
    theme: 'light'
  }
};

// 合并环境配置和通用配置
const currentConfig = {
  ...commonConfig,
  ...config[env],
  env
};

export default currentConfig;