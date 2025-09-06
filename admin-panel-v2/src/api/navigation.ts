import { api } from '../utils/api'
import { create as repoCreate, update as repoUpdate, remove as repoRemove } from '../mock/localRepo'

export interface NavigationCategory {
  id: number
  name: string
  icon?: string
  sort_order: number
  status: number
  created_at?: string
}

export async function listNavigationCategories(): Promise<NavigationCategory[]> {
  try {
    const res = await api.get('/navigation/categories')
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return [
      { id: 1, name: '前端开发', icon: 'Home', sort_order: 1, status: 1, created_at: new Date().toISOString() },
      { id: 2, name: '后端开发', icon: 'Apps', sort_order: 2, status: 1, created_at: new Date().toISOString() },
      { id: 3, name: '数据库', icon: 'Book', sort_order: 3, status: 0, created_at: new Date().toISOString() }
    ]
  }
}

export async function createNavigationCategory(data: Partial<NavigationCategory>) {
  try { const res = await api.post('/navigation/categories', data); return res.data } catch { return repoCreate<NavigationCategory>('navigation', { ...(data as any), status:1, sort_order:data.sort_order||0, created_at:new Date().toISOString() }) }
}

export async function updateNavigationCategory(id: number, data: Partial<NavigationCategory>) {
  try { const res = await api.put(`/navigation/categories/${id}`, data); return res.data } catch { return repoUpdate<NavigationCategory>('navigation', id, data as any) }
}

export async function deleteNavigationCategory(id: number) {
  try { await api.delete(`/navigation/categories/${id}`) } catch { repoRemove('navigation', id) }
}