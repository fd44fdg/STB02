import { createClient } from '../../../shared/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from '@/store'
import { getToken } from '@/utils/auth'

const service = createClient({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000,
  getToken: () => getToken(),
  onUnauthorized: () => {
    ElMessageBox.confirm('您已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.dispatch('user/resetToken').then(() => {
        location.reload()
      })
    })
  }
})

// 请求拦截器（保持兼容：@shared/api 已处理 token 注入，这里只保留调试）
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    if (store.getters.token) {
      // 让每个请求携带自定义token 请根据实际情况自行修改
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 响应拦截器（保持兼容：@shared/api 已做标准化返回，这里只做 UI 提示与旧逻辑容错）
service.interceptors.response.use(
  /**
   * 如果您想获取http信息，例如headers或status
   * 请返回  response => response
  */

  /**
   * 通过自定义代码确定请求状态
   * 这里只是一个例子
   * 您也可以通过HTTP状态代码来判断状态
   */
  response => {
    const res = response.data

    // 支持新的success字段和旧的code字段
    const isSuccess = res.success === true || res.code === 200
    
    // 如果请求不成功，则判断为错误。
    if (!isSuccess) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 401: 未授权; 403: 访问被拒绝;
      if (res.code === 401 || res.code === 403) {
        // 重新登录
        ElMessageBox.confirm('您已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service