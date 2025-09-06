import { api } from '../utils/api'
import { list as repoList, create as repoCreate, update as repoUpdate, remove as repoRemove, ensureSeed } from '../mock/localRepo'

// 通过环境变量控制是否允许本地离线回退（统一走后端时设为 false）
const offlineFallbackEnabled = (import.meta as any).env?.VITE_OFFLINE_FALLBACK !== 'false'
function warnFallback(action: string, error: unknown) {
  console.warn(`[offline-fallback] ${action} 失败，改用本地存储。设置 VITE_OFFLINE_FALLBACK=false 可禁用回退。`, error)
}

export interface Banner {
  id: number
  title: string
  image_url: string
  link_url?: string | null
  sort_order: number
  is_visible: boolean
  created_at?: string
  updated_at?: string
}

export type BannerInput = Omit<Banner, 'id' | 'created_at' | 'updated_at'>

export async function listBanners(): Promise<Banner[]> {
  try {
    const res = await api.get('/banners/admin')
    return Array.isArray(res.data) ? res.data : []
  } catch {
    if (!offlineFallbackEnabled) throw new Error('获取轮播图失败（已禁用离线回退）')
    warnFallback('listBanners', 'network-error')
    return ensureSeed<Banner>('banners', () => ([
      { id: Date.now(), title: '示例轮播图', image_url: 'https://via.placeholder.com/600x300?text=Banner', link_url: '', sort_order: 0, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]))
  }
}

export async function createBanner(data: BannerInput): Promise<Banner> {
  try {
    const res = await api.post('/banners/admin', data)
    return res.data
  } catch {
  if (!offlineFallbackEnabled) throw new Error('创建轮播图失败（已禁用离线回退）')
  warnFallback('createBanner', 'network-error')
  return repoCreate<Banner>('banners', { ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
  }
}

export async function updateBanner(id: number, data: Partial<BannerInput>): Promise<Banner> {
  try {
    const res = await api.put(`/banners/admin/${id}`, data)
    return res.data
  } catch {
  if (!offlineFallbackEnabled) throw new Error('更新轮播图失败（已禁用离线回退）')
  warnFallback('updateBanner', 'network-error')
  return repoUpdate<Banner>('banners', id, { ...data, updated_at: new Date().toISOString() } as any)
  }
}

export async function deleteBanner(id: number): Promise<void> {
  try { await api.delete(`/banners/admin/${id}`) } catch {
    if (!offlineFallbackEnabled) throw new Error('删除轮播图失败（已禁用离线回退）')
    warnFallback('deleteBanner', 'network-error')
    repoRemove('banners', id)
  }
}

