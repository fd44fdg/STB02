const path = require('path')

module.exports = {
  // 完全禁用 source map 生成（生产和开发环境）
  productionSourceMap: false,
  
  transpileDependencies: ['@dcloudio/uni-ui'],
  
  // 完全禁用 CSS source map
  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false,
    loaderOptions: {
      scss: {
        prependData: `@import "@/uni.scss";`
      }
    }
  },
  
  // 开发服务器配置
  devServer: {
    port: 8083,
    host: '0.0.0.0',
    https: false,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },
  
  // 构建优化和 webpack 配置
  configureWebpack: {
    // 彻底禁用所有 source map
    devtool: false,
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'common/vendor',
            test: /[\\\\/]node_modules[\\\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  
  // 链式操作配置
  chainWebpack: config => {
    // 彻底禁用 source map
    config.devtool(false)
    
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')
    
    // 移除 preload 插件
    config.plugins.delete('preload')
  },
  
  // 并行处理
  parallel: require('os').cpus().length > 1,
  
  // 第三方插件选项
  pluginOptions: {
    // uni-app 插件选项
    'uni-app': {
      // 自定义配置
    }
  }
}