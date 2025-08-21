/**
 * 全局加载状态管理器
 * 用于统一处理数据加载状态和用户体验
 */

class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
    this.globalLoading = false;
  }

  /**
   * 显示加载状态
   * @param {string} key 加载状态的唯一标识
   * @param {Object} options 加载选项
   */
  show(key = 'default', options = {}) {
    const config = {
      title: '加载中...',
      mask: true,
      showToast: true,
      ...options
    };

    this.loadingStates.set(key, config);
    
    if (config.showToast && !this.globalLoading) {
      uni.showLoading({
        title: config.title,
        mask: config.mask
      });
      this.globalLoading = true;
    }
  }

  /**
   * 隐藏加载状态
   * @param {string} key 加载状态的唯一标识
   */
  hide(key = 'default') {
    this.loadingStates.delete(key);
    
    // 如果没有其他加载状态，隐藏全局加载
    if (this.loadingStates.size === 0 && this.globalLoading) {
      uni.hideLoading();
      this.globalLoading = false;
    }
  }

  /**
   * 隐藏所有加载状态
   */
  hideAll() {
    this.loadingStates.clear();
    if (this.globalLoading) {
      uni.hideLoading();
      this.globalLoading = false;
    }
  }

  /**
   * 检查是否有加载状态
   * @param {string} key 可选的特定加载状态标识
   * @returns {boolean}
   */
  isLoading(key) {
    if (key) {
      return this.loadingStates.has(key);
    }
    return this.loadingStates.size > 0;
  }

  /**
   * 包装异步函数，自动处理加载状态
   * @param {Function} asyncFn 异步函数
   * @param {Object} options 加载选项
   * @returns {Function} 包装后的函数
   */
  wrap(asyncFn, options = {}) {
    const key = options.key || 'default';
    
    return async (...args) => {
      try {
        this.show(key, options);
        const result = await asyncFn(...args);
        return result;
      } catch (error) {
        // 处理错误
        if (options.showError !== false) {
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none',
            duration: 2000
          });
        }
        throw error;
      } finally {
        this.hide(key);
      }
    };
  }
}

// 创建全局实例
const loadingManager = new LoadingManager();

// 导出便捷方法
export const showLoading = (key, options) => loadingManager.show(key, options);
export const hideLoading = (key) => loadingManager.hide(key);
export const hideAllLoading = () => loadingManager.hideAll();
export const isLoading = (key) => loadingManager.isLoading(key);
export const wrapLoading = (asyncFn, options) => loadingManager.wrap(asyncFn, options);

export default loadingManager;