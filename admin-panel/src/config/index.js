// 管理后台配置
const env = process.env.NODE_ENV || 'development';

// 环境配置
const config = {
  // 开发环境配置
  development: {
    api: {
      baseUrl: 'http://localhost:3000/api/v1',
      timeout: 10000
    },
    debug: true,
    version: '0.1.0'
  },
  
  // 生产环境配置
  production: {
    api: {
      baseUrl: process.env.VUE_APP_API_BASE_URL || 'https://your-domain.com/api/v1',
      timeout: 15000
    },
    debug: false,
    version: '1.0.0'
  },
  
  // 测试环境配置
  test: {
    api: {
      baseUrl: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3001/api/v1',
      timeout: 5000
    },
    debug: true,
    version: '0.1.0'
  }
};

// 通用配置
const commonConfig = {
  // 应用信息
  app: {
    name: '掌上刷题宝管理后台',
    shortName: '刷题宝后台',
    copyright: '© 2025 掌上刷题宝'
  },
  
  // 本地存储键
  storage: {
    token: 'admin_token',
    userInfo: 'admin_user_info',
    settings: 'admin_settings',
    tabs: 'admin_tabs'
  },
  
  // 权限配置
  permissions: {
    // 超级管理员权限
    admin: ['*'],
    
    // 内容管理员权限
    content: [
      'question:view',
      'question:add',
      'question:edit',
      'question:delete',
      'article:view',
      'article:add',
      'article:edit',
      'article:delete'
    ],
    
    // 用户管理员权限
    user: [
      'user:view',
      'user:add',
      'user:edit',
      'user:delete'
    ]
  },
  
  // 默认设置
  defaults: {
    pageSize: 20,
    avatar: '/static/images/default-avatar.png',
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