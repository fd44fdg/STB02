import { defineStore } from 'pinia'
import { api } from '../utils/api'

export interface UserProfile {
  id: number
  username: string
  nickname?: string
  avatar?: string
  roles: string[]
}

interface State {
  token: string | null
  profile: UserProfile | null
  loading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    token: localStorage.getItem('token'),
    profile: null,
    loading: false
  }),
  getters: {
    isLogged: (s) => !!s.token,
    roles: (s) => s.profile?.roles || [],
    nickname: (s) => s.profile?.nickname || s.profile?.username || '未登录',
    avatar: (s) => s.profile?.avatar || '/default-avatar.svg'
  },
  actions: {
    async login(username: string, password: string) {
      this.loading = true
      try {
        // 支持 mock 账号
        if (username === 'admin' && password === 'admin123') {
          const mock = 'mock-token-' + Date.now()
          this.token = mock
          localStorage.setItem('token', mock)
          return
        }
        const res = await api.post('/auth/login', { username, password })
        const token = (res as any).data?.token || (res as any).token || ''
        if (!token) throw new Error('未获取到登录 token')
        this.token = token
        localStorage.setItem('token', token)
      } finally {
        this.loading = false
      }
    },
    async fetchProfile(force = false) {
      if (!this.token) return null
      if (this.profile && !force) return this.profile
      try {
        // mock token 直接返回本地 profile
        if (this.token?.startsWith('mock-token')) {
          this.profile = {
            id: 0,
            username: 'admin',
            nickname: '管理员(Mock)',
            avatar: '',
            roles: ['admin']
          }
          return this.profile
        }
        const res = await api.get('/auth/verify')
        const data = (res as any).data || res
        // 后端 500/结构异常 fallback
        if (!data || typeof data !== 'object' || data.success === false) {
          throw new Error('INVALID_PROFILE')
        }
        const roles = data.roles && Array.isArray(data.roles) ? data.roles : (data.role ? [data.role] : ['admin'])
        this.profile = {
          id: data.id || 0,
          username: data.username || 'admin',
          nickname: data.nickname,
          avatar: data.avatar,
          roles
        }
        return this.profile
      } catch (e: any) {
        // 后端未实现或 500，做 graceful fallback，但不强制登出
        if (e?.message === 'Network Error' || e?.message === 'INVALID_PROFILE' || /500/.test(e?.message || '')) {
          this.profile = {
            id: 0,
            username: 'admin',
            nickname: '管理员',
            avatar: '',
            roles: ['admin']
          }
          return this.profile
        }
        // 其它认为 token 失效
        this.logout()
        throw e
      }
    },
    hasRole(role: string) {
      return this.roles.includes(role)
    },
    logout() {
      this.token = null
      this.profile = null
      localStorage.removeItem('token')
    }
  }
})
