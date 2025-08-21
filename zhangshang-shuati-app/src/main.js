import Vue from 'vue'
import App from './App'
import userStore from './store/user'
import { initTabBarEnhancer, autoDetectCurrentPage } from './utils/tabbar-enhancer'

// 全局错误处理
Vue.config.errorHandler = function(err, vm, info) {
  console.error('Vue全局错误:', err, info);
  
  // 在开发环境下显示错误提示
  if (process.env.NODE_ENV === 'development') {
    uni.showModal({
      title: '应用错误',
      content: `${err.message || err}\n${info || ''}`,
      showCancel: false
    });
  } else {
    // 生产环境可以上报错误到服务器
    uni.showToast({
      title: '应用发生错误，请稍后再试',
      icon: 'none'
    });
  }
};

// 捕获Promise未处理的rejection（仅在H5环境下）
// #ifdef H5
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise错误:', event.reason);
});

// 捕获全局JS错误（仅在H5环境下）
window.onerror = function(message, source, lineno, colno, error) {
  console.error('全局JS错误:', message, source, lineno, colno, error);
  return true;
};
// #endif

// 添加全局导航拦截器
const whiteList = ['/pages/auth/login', '/pages/auth/register', '/pages/legal/user-agreement', '/pages/legal/privacy-policy']

// 页面跳转前检查登录状态
uni.addInterceptor('navigateTo', {
  invoke(e) {
    console.log('跳转页面:', e.url)
    return e
  },
  fail(err) {
    console.error('页面跳转失败:', err)
  }
})

// TabBar页面跳转前检查登录状态
uni.addInterceptor('switchTab', {
  invoke(e) {
    console.log('切换TabBar:', e.url)
    return e
  },
  fail(err) {
    console.error('TabBar切换失败:', err)
  }
})

Vue.config.productionTip = false

App.mpType = 'app'

// 挂载用户状态到全局
Vue.prototype.$user = userStore;

// 初始化应用
const app = new Vue({
  ...App
})

// 初始化用户信息
userStore.initUserInfo().catch(err => {
  console.warn('初始化用户信息失败:', err);
});

// 初始化TabBar增强器
// #ifdef H5
try {
  const enhancer = initTabBarEnhancer();
  
  // 监听页面切换
  const originalSwitchTab = uni.switchTab;
  uni.switchTab = function(options) {
    const result = originalSwitchTab.call(this, options);
    setTimeout(() => {
      autoDetectCurrentPage();
      // 通知增强器更新状态
      if (enhancer) {
        enhancer.detectCurrentPage();
        enhancer.updateCurrentState();
      }
    }, 150);
    return result;
  };
  
  // 监听navigateTo页面跳转
  const originalNavigateTo = uni.navigateTo;
  uni.navigateTo = function(options) {
    const result = originalNavigateTo.call(this, options);
    setTimeout(() => {
      if (enhancer) {
        enhancer.detectCurrentPage();
        enhancer.updateCurrentState();
      }
    }, 150);
    return result;
  };
  
  // 页面加载完成后再次检查状态
  setTimeout(() => {
    if (enhancer) {
      enhancer.detectCurrentPage();
      enhancer.updateCurrentState();
    }
  }, 500);
  
  console.log('✅ TabBar增强器初始化成功');
} catch (error) {
  console.warn('TabBar增强器初始化失败:', error);
}
// #endif

app.$mount()
