import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const baseURL = (import.meta as any).env?.VITE_API_BASE || '/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 15000
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
})

let showing401 = false

api.interceptors.response.use(
  (res) => {
    const body = res?.data
    // 统一处理 { success, data, message, code }
    if (body && typeof body === 'object') {
      if ('success' in body) {
        if (body.success) {
          return { ...res, data: body.data }
        }
        return Promise.reject(new Error(body.message || '请求失败'))
      }
      // 若返回直接是数组或对象没有 success，直接放行
    }
    return res
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status
    if (status === 401 && !showing401) {
      showing401 = true
      // 延迟避免同步路由冲突
      setTimeout(() => {
        localStorage.removeItem('token')
        if (location.pathname !== '/login') {
          const redirect = encodeURIComponent(location.pathname + location.search)
          window.location.href = `/login?redirect=${redirect}`
        }
        showing401 = false
      }, 50)
    }
    const msg = (error.response?.data as any)?.message || error.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)
