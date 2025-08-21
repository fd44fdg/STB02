import Vue from 'vue';
import { getUserInfo, login, logout } from '@/api/auth';

// 使用Vue.observable创建响应式状态（Vue 2兼容）
const state = Vue.observable({
  token: uni.getStorageSync('token') || '',
  userInfo: uni.getStorageSync('userInfo') || null,
  isLogin: !!uni.getStorageSync('token')
});

// 导出状态和方法
export default {
  // 获取状态
  get state() {
    return state;
  },
  
  // 获取用户信息
  getUserInfo() {
    return state.userInfo;
  },
  
  // 获取登录状态
  isLoggedIn() {
    return state.isLogin;
  },
  
  // 获取token
  getToken() {
    return state.token;
  },
  
  // 设置用户信息
  setUserInfo(userInfo) {
    state.userInfo = userInfo;
    uni.setStorageSync('userInfo', userInfo);
  },
  
  // 设置token
  setToken(token) {
    state.token = token;
    state.isLogin = !!token;
    uni.setStorageSync('token', token);
  },
  
  // 清除用户信息
  clearUserInfo() {
    state.token = '';
    state.userInfo = null;
    state.isLogin = false;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  },
  
  // 登录
  async login(loginData) {
    try {
      const res = await login(loginData);
      const { token, user } = res.data;
      
      this.setToken(token);
      this.setUserInfo(user);
      
      return Promise.resolve(res);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  // 登出
  async logout() {
    try {
      await logout();
      this.clearUserInfo();
      return Promise.resolve({ success: true });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  // 初始化用户信息
  async initUserInfo() {
    if (this.isLoggedIn() && !this.getUserInfo()) {
      try {
        const res = await getUserInfo();
        this.setUserInfo(res.data);
        return Promise.resolve(res.data);
      } catch (error) {
        // 获取用户信息失败，可能是token过期
        this.clearUserInfo();
        return Promise.reject(error);
      }
    }
    return Promise.resolve(this.getUserInfo());
  }
}; 