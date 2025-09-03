import axios from 'axios'

let baseURL = ''
let tokenGetter = () => null
let unauthorizedHandler = () => {}

export function setBaseURL(url) {
  baseURL = url
}

export function setTokenGetter(fn) {
  tokenGetter = typeof fn === 'function' ? fn : () => null
}

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : () => {}
}

export function createClient(options = {}) {
  const instance = axios.create({
    baseURL: options.baseURL || baseURL,
    timeout: options.timeout || 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use((config) => {
    const token = (options.getToken || tokenGetter)()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  instance.interceptors.response.use(
    (response) => {
      const data = response.data
      // 标准化响应
      if (typeof data === 'object' && data !== null) {
        if (data.success === true) return data
        // 旧风格容错
        if (data.code === 200 && data.data !== undefined) {
          return { success: true, code: 200, data: data.data, message: data.message || '' }
        }
      }
      return Promise.reject({ success: false, code: response.status, message: data?.message || '请求失败', data })
    },
    (error) => {
      const status = error?.response?.status
      const message = error?.response?.data?.message || error.message || '请求失败'

      if (status === 401) {
        try { (options.onUnauthorized || unauthorizedHandler)() } catch (_) {}
      }

      return Promise.reject({ success: false, code: status || 0, message })
    }
  )

  return instance
}
