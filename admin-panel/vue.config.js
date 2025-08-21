const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  // 基础路径
  publicPath: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  
  // 输出目录
  outputDir: 'dist',
  
  // 静态资源目录
  assetsDir: 'static',
  
  // 生产环境配置
  productionSourceMap: false,
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // 别名配置
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  
  // CSS 配置
  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false
  }
})