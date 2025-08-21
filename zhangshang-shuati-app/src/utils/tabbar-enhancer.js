/**
 * 现代化导航栏增强器
 * 负责动态设置导航项的数据属性，实现状态变化效果
 */

class TabBarEnhancer {
  constructor() {
    this.tabBarItems = null;
    this.currentPath = '';
    this.iconMap = {
      'home': '⚡',
      'practice': '🧠', 
      'exam': '🎯',
      'profile': '✨'
    };
    
    this.init();
  }

  // 初始化增强器
  init() {
    // 在页面加载后设置
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.setupTabBarItems();
        this.detectCurrentPage();
        this.updateCurrentState();
      }, 200);
      
      // 监听路由变化
      this.listenToRouteChanges();
    }
  }

  // 设置导航项的数据属性
  setupTabBarItems() {
    try {
      // H5环境下的tabbar选择器
      this.tabBarItems = document.querySelectorAll('.uni-tabbar-item');
      
      if (this.tabBarItems && this.tabBarItems.length > 0) {
        this.tabBarItems.forEach((item, index) => {
          // 根据索引设置对应的页面路径属性
          const pathMap = ['home', 'practice', 'exam', 'profile'];
          const pagePath = pathMap[index];
          
          if (pagePath) {
            item.setAttribute('data-path', pagePath);
            
            // 添加点击事件监听
            item.addEventListener('click', () => {
              this.handleTabClick(pagePath);
            });
          }
        });
        
        console.log('✅ TabBar增强器已初始化，共', this.tabBarItems.length, '个导航项');
      }
    } catch (error) {
      console.log('TabBar增强器初始化失败:', error);
    }
  }

  // 监听路由变化
  listenToRouteChanges() {
    if (typeof window !== 'undefined') {
      // 监听hashchange事件
      window.addEventListener('hashchange', () => {
        setTimeout(() => {
          this.detectCurrentPage();
          this.updateCurrentState();
        }, 100);
      });
      
      // 监听自定义路由事件
      window.addEventListener('uni-route-change', () => {
        setTimeout(() => {
          this.detectCurrentPage();
          this.updateCurrentState();
        }, 100);
      });
    }
  }

  // 检测当前页面
  detectCurrentPage() {
    try {
      const hash = window.location.hash;
      let pageType = '';
      
      if (hash.includes('home') || hash === '#/' || hash === '') {
        pageType = 'home';
      } else if (hash.includes('practice')) {
        pageType = 'practice';
      } else if (hash.includes('exam')) {
        pageType = 'exam';
      } else if (hash.includes('profile')) {
        pageType = 'profile';
      }
      
      if (pageType && pageType !== this.currentPath) {
        this.currentPath = pageType;
        console.log('🎯 检测到页面变化:', pageType);
      }
    } catch (error) {
      console.log('检测页面失败:', error);
    }
  }

  // 处理标签点击
  handleTabClick(pagePath) {
    this.currentPath = pagePath;
    console.log('🔥 TabBar点击:', pagePath);
    
    setTimeout(() => {
      this.updateCurrentState();
    }, 50);
    
    // 触发自定义事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tabbar-change', {
        detail: { path: pagePath }
      }));
    }
  }

  // 更新当前状态
  updateCurrentState() {
    if (!this.tabBarItems || !this.currentPath) {
      return;
    }
    
    console.log('🔄 更新TabBar状态:', this.currentPath);
    
    this.tabBarItems.forEach((item, index) => {
      const itemPath = item.getAttribute('data-path');
      
      // 移除所有激活状态
      item.classList.remove('uni-tabbar-item-active');
      
      // 添加当前激活状态
      if (itemPath === this.currentPath) {
        item.classList.add('uni-tabbar-item-active');
        console.log(`✅ 激活第${index + 1}个导航项:`, itemPath);
      }
    });
    
    // 强制重新渲染
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        // 触发重绘
        document.body.offsetHeight;
      });
    }
  }

  // 手动设置当前页面
  setCurrentPage(pagePath) {
    this.currentPath = pagePath;
    this.updateCurrentState();
  }

  // 获取当前页面路径
  getCurrentPage() {
    return this.currentPath;
  }

  // 刷新增强器
  refresh() {
    setTimeout(() => {
      this.setupTabBarItems();
      this.updateCurrentState();
    }, 50);
  }
}

// 创建全局实例
let tabBarEnhancer = null;

// 导出增强器功能
export const initTabBarEnhancer = () => {
  if (!tabBarEnhancer) {
    tabBarEnhancer = new TabBarEnhancer();
  }
  return tabBarEnhancer;
};

export const getTabBarEnhancer = () => {
  return tabBarEnhancer || initTabBarEnhancer();
};

// 页面切换时的更新函数
export const updateTabBarState = (pagePath) => {
  const enhancer = getTabBarEnhancer();
  if (enhancer) {
    enhancer.setCurrentPage(pagePath);
  }
};

// 自动检测当前页面并更新状态
export const autoDetectCurrentPage = () => {
  try {
    // 获取当前页面路径
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const route = currentPage.route || '';
      
      // 解析页面类型
      let pageType = '';
      if (route.includes('home')) pageType = 'home';
      else if (route.includes('practice')) pageType = 'practice';
      else if (route.includes('exam')) pageType = 'exam';
      else if (route.includes('profile')) pageType = 'profile';
      
      if (pageType) {
        updateTabBarState(pageType);
      }
    }
  } catch (error) {
    console.log('自动检测页面失败:', error);
  }
};

// 默认导出
export default {
  initTabBarEnhancer,
  getTabBarEnhancer,
  updateTabBarState,
  autoDetectCurrentPage
};