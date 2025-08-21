// app.js
import config from './src/config/index.js'

App({
  globalData: {
    userInfo: null,
    token: null,
    systemInfo: null,
    config: config
  },

  onLaunch() {
    console.log('掌上刷题宝小程序启动')
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // 检查更新
    this.checkForUpdate()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误:', msg)
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
        console.log('系统信息:', res)
      }
    })
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync(config.storage.token)
    const userInfo = wx.getStorageSync(config.storage.userInfo)
    
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      console.log('用户已登录')
    } else {
      console.log('用户未登录')
    }
  },

  // 检查小程序更新
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新结果:', res.hasUpdate)
      })
      
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      
      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: '更新失败',
          content: '新版本下载失败，请检查网络后重试',
          showCancel: false
        })
      })
    }
  },

  // 全局方法：显示加载中
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    })
  },

  // 全局方法：隐藏加载中
  hideLoading() {
    wx.hideLoading()
  },

  // 全局方法：显示提示
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    })
  },

  // 全局方法：显示确认对话框
  showModal(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  },

  // 全局方法：登录
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            this.getUserInfo(res.code)
              .then(resolve)
              .catch(reject)
          } else {
            reject(new Error('登录失败：' + res.errMsg))
          }
        },
        fail: reject
      })
    })
  },

  // 获取用户信息
  getUserInfo(code) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.api.baseUrl}/auth/wechat-login`,
        method: 'POST',
        data: { code },
        success: (res) => {
          if (res.data.success) {
            const { token, userInfo } = res.data.data
            
            // 保存到本地存储
            wx.setStorageSync(config.storage.token, token)
            wx.setStorageSync(config.storage.userInfo, userInfo)
            
            // 保存到全局数据
            this.globalData.token = token
            this.globalData.userInfo = userInfo
            
            resolve({ token, userInfo })
          } else {
            reject(new Error(res.data.message))
          }
        },
        fail: reject
      })
    })
  },

  // 全局方法：退出登录
  logout() {
    // 清除本地存储
    wx.removeStorageSync(config.storage.token)
    wx.removeStorageSync(config.storage.userInfo)
    
    // 清除全局数据
    this.globalData.token = null
    this.globalData.userInfo = null
    
    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/user/login'
    })
  }
})