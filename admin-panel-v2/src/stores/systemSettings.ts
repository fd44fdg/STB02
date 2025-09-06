import { defineStore } from 'pinia'

export interface SystemSettingsState {
  siteName: string
  primary: string
  enableSignup: boolean
  maxUploadMB: number
  announcement: string
  updatedAt?: string
}

const KEY = 'sys_settings_v1'

function loadLocal(): SystemSettingsState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    siteName: '掌上刷题宝',
    primary: '#0F5EC7',
    enableSignup: true,
    maxUploadMB: 10,
    announcement: ''
  }
}

export const useSystemSettingsStore = defineStore('systemSettings', {
  state: (): { data: SystemSettingsState } => ({ data: loadLocal() }),
  getters: {
    primaryColor: (s) => s.data.primary
  },
  actions: {
    update(partial: Partial<SystemSettingsState>) {
      this.data = { ...this.data, ...partial, updatedAt: new Date().toISOString() }
      localStorage.setItem(KEY, JSON.stringify(this.data))
    },
    reset() {
      localStorage.removeItem(KEY)
      this.data = loadLocal()
    },
    exportForH5() {
      // 供 H5 直接读取的配置对象
      return {
        siteName: this.data.siteName,
        theme: { primary: this.data.primary },
        announcement: this.data.announcement,
        enableSignup: this.data.enableSignup,
        updatedAt: this.data.updatedAt
      }
    }
  }
})
