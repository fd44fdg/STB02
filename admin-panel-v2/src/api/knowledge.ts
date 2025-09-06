import { api } from '../utils/api'
import { create as repoCreate, update as repoUpdate, remove as repoRemove } from '../mock/localRepo'

export interface KnowledgeCategory {
  id: number
  name: string
  sort_order: number
  status: number
  created_at?: string
}

export async function listKnowledgeCategories(): Promise<KnowledgeCategory[]> {
  try {
    const res = await api.get('/knowledge/categories')
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return [
      { id: 1, name: '前端开发', sort_order: 1, status: 1, created_at: new Date().toISOString() },
      { id: 2, name: '后端开发', sort_order: 2, status: 1, created_at: new Date().toISOString() }
    ]
  }
}

export async function createKnowledgeCategory(data: Partial<KnowledgeCategory>) {
  try { const res = await api.post('/knowledge/categories', data); return res.data } catch { return repoCreate<KnowledgeCategory>('knowledge', { ...(data as any), id: 0, status:1, sort_order: data.sort_order||0, created_at:new Date().toISOString() }) }
}

export async function updateKnowledgeCategory(id: number, data: Partial<KnowledgeCategory>) {
  try { const res = await api.put(`/knowledge/categories/${id}`, data); return res.data } catch { return repoUpdate<KnowledgeCategory>('knowledge', id, data as any) }
}

export async function deleteKnowledgeCategory(id: number) {
  try { await api.delete(`/knowledge/categories/${id}`) } catch { repoRemove('knowledge', id) }
}