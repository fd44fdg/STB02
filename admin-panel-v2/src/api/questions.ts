import { api } from '../utils/api'
import { create as repoCreate, update as repoUpdate, remove as repoRemove, list as repoList } from '../mock/localRepo'

export interface QuestionBasic {
  id: number
  content: string            // 题干 (H5 映射到 title)
  type: 'single' | 'multiple' | 'boolean' | 'fill'
  options?: string[]
  correct_answer: number | number[] | string
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  tags?: string               // 逗号分隔标签
  description?: string        // 题目说明 (H5 description)
  explanation?: string        // 答案解析 (H5 explanation)
  code_example?: string       // 代码示例 (H5 codeExample)
  status: number
  created_at?: string
  updated_at?: string
}

export interface QuestionQuery {
  page?: number
  limit?: number
  keyword?: string
  type?: string
  difficulty?: string
  category?: string
  status?: number
}

export async function listQuestions(params: QuestionQuery = {}): Promise<{ items: QuestionBasic[]; total: number }> {
  try {
    const res = await api.get('/questions', { params })
    if (Array.isArray(res.data?.items)) {
      return { items: res.data.items, total: res.data.total || res.data.items.length }
    }
    if (Array.isArray(res.data)) {
      return { items: res.data, total: res.data.length }
    }
  } catch {
    // ignore -> fallback local
  }
  // local fallback with pagination & filtering
  let all = repoList<QuestionBasic>('questions')
  if (!all.length) {
    // seed a sample
    all = [
      { id: Date.now(), content: '下列哪项是 HTML5 新增语义化元素？', type: 'single', options: ['<div>','<section>','<span>','<font>'], correct_answer: 1, difficulty: 'easy', category: 'HTML', tags: 'HTML5,语义化', status: 1, description:'基础语义化测试', explanation:'<section> 是语义化元素', created_at: new Date().toISOString() }
    ]
  }
  const { keyword, type, difficulty, category, status } = params
  let filtered = all.filter(q => {
    if (keyword && !q.content.toLowerCase().includes(keyword.toLowerCase())) return false
    if (type && q.type !== type) return false
    if (difficulty && q.difficulty !== difficulty) return false
    if (category && q.category !== category) return false
    if (typeof status === 'number' && q.status !== status) return false
    return true
  })
  const total = filtered.length
  const page = params.page || 1
  const limit = params.limit || 10
  const start = (page - 1) * limit
  const items = filtered.slice(start, start + limit)
  return { items, total }
}

export async function createQuestion(data: Partial<QuestionBasic>) {
  try { const res = await api.post('/questions', data); return res.data } catch { return repoCreate<QuestionBasic>('questions', { ...(data as any), created_at:new Date().toISOString(), status: (data.status ?? 1) as any }) }
}

export async function updateQuestion(id: number, data: Partial<QuestionBasic>) {
  try { const res = await api.put(`/questions/${id}`, data); return res.data } catch { return repoUpdate<QuestionBasic>('questions', id, data as any) }
}

export async function deleteQuestion(id: number) {
  try { await api.delete(`/questions/${id}`) } catch { repoRemove('questions', id) }
}