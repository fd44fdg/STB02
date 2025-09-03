// 小程序API请求工具
import config from '../config/index.js'

class Request {
  constructor() {
    this.baseUrl = config.api.baseUrl
    this.timeout = config.api.timeout
  }

  // 通用请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      // 显示加载中
      if (options.loading !== false) {
        uni.showLoading({
          title: options.loadingText || '请求中...',
          mask: true
        })
      }

      // 获取token
      const token = uni.getStorageSync(config.storage.token)
      
      // 设置请求头
      const header = {
        'Content-Type': 'application/json',
        ...options.header
      }
      
      if (token) {
        header.Authorization = `Bearer ${token}`
      }

      uni.request({
        url: this.baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: header,
        timeout: options.timeout || this.timeout,
        success: (res) => {
          // 隐藏加载中
          if (options.loading !== false) {
            uni.hideLoading()
          }

          // 标准化响应结构
          const status = res.statusCode || 0
          const data = res.data
          const normalized = (data && typeof data === 'object')
            ? (data.success === true
                ? { success: true, code: data.code || 200, data: data.data, message: data.message || '' }
                : (data.data !== undefined && (data.code === 200 || status === 200))
                  ? { success: true, code: 200, data: data.data, message: data.message || '' }
                  : { success: false, code: data.code || status, data: data.data, message: data.message || '请求失败' }
              )
            : { success: false, code: status, data: null, message: '网络错误或无响应' }

          if (normalized.success) {
            resolve(normalized)
          } else if (status === 401 || normalized.code === 401) {
            // 未授权，清除登录信息并跳转登录页
            this.handleUnauthorized()
            reject(new Error('登录已过期，请重新登录'))
          } else if (status && status !== 200) {
            // HTTP错误
            this.handleHttpError(status, reject)
          } else {
            // 业务错误
            this.handleBusinessError(normalized, reject)
          }
            // 未授权，清除登录信息并跳转登录页
            this.handleUnauthorized()
            reject(new Error('登录已过期，请重新登录'))
          } else {
            // HTTP错误
            this.handleHttpError(res.statusCode, reject)
          }
        },
        fail: (error) => {
          // 隐藏加载中
          if (options.loading !== false) {
            uni.hideLoading()
          }

          // 网络错误处理
          this.handleNetworkError(error, reject)
        }
      })
    })
  }

  // 处理业务错误
  handleBusinessError(data, reject) {
    const message = data.message || '请求失败'
    
    if (!data.silent) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    }
    
    reject(new Error(message))
  }

  // 处理HTTP错误
  handleHttpError(statusCode, reject) {
    let message = '请求失败'
    
    switch (statusCode) {
      case 400:
        message = '请求参数错误'
        break
      case 401:
        message = '未授权访问'
        break
      case 403:
        message = '禁止访问'
        break
      case 404:
        message = '请求的资源不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
      case 502:
        message = '网关错误'
        break
      case 503:
        message = '服务不可用'
        break
      default:
        message = `请求失败(${statusCode})`
    }

    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
    
    reject(new Error(message))
  }

  // 处理网络错误
  handleNetworkError(error, reject) {
    let message = '网络连接失败'
    
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        message = '请求超时，请检查网络'
      } else if (error.errMsg.includes('fail')) {
        message = '网络连接失败，请检查网络'
      }
    }

    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
    
    reject(new Error(message))
  }

  // 处理未授权
  handleUnauthorized() {
    // 清除登录信息
    uni.removeStorageSync(config.storage.token)
    uni.removeStorageSync(config.storage.userInfo)
    
    // 更新全局数据
    const app = getApp()
    app.globalData.token = null
    app.globalData.userInfo = null
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/auth/login'
    })
  }

  // GET请求
  get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    })
  }

  // POST请求
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  // PUT请求
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  // DELETE请求
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }

  // 上传文件
  uploadFile(url, filePath, name = 'file', formData = {}) {
    return new Promise((resolve, reject) => {
      uni.showLoading({
        title: '上传中...',
        mask: true
      })

      const token = uni.getStorageSync(config.storage.token)
      const header = {}
      
      if (token) {
        header.Authorization = `Bearer ${token}`
      }

      uni.uploadFile({
        url: this.baseUrl + url,
        filePath: filePath,
        name: name,
        formData: formData,
        header: header,
        success: (res) => {
          uni.hideLoading()
          
          try {
            const data = JSON.parse(res.data)
            if (data.success) {
              resolve(data)
            } else {
              uni.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              })
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
            reject(error)
          }
        },
        fail: (error) => {
          uni.hideLoading()
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }
}

// 创建实例
const request = new Request()

export default request