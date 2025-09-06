import { api } from '../utils/api'
import { list as repoList, create as repoCreate, update as repoUpdate, remove as repoRemove, ensureSeed } from '../mock/localRepo'

export interface UserEntity { id:number; username:string; nickname?:string; roles:string[]; status:number; created_at?:string }
export interface UserQuery { page?:number; pageSize?:number; keyword?:string }

function localAll(): UserEntity[] {
  return ensureSeed<UserEntity>('users', () => ([
    { id: Date.now(), username:'admin', nickname:'管理员', roles:['admin'], status:1, created_at:new Date().toISOString() },
    { id: Date.now()+1, username:'editor01', nickname:'编辑一号', roles:['editor'], status:1, created_at:new Date().toISOString() }
  ]))
}

export async function listUsers(query: UserQuery = {}): Promise<{ items:UserEntity[]; total:number }> {
  try {
    const res = await api.get('/admin/users', { params: query })
    if (res.data && Array.isArray(res.data.items)) return res.data
    if (Array.isArray(res.data)) return { items: res.data, total: res.data.length }
  } catch {}
  const page = query.page || 1
  const pageSize = query.pageSize || 10
  let arr = localAll()
  if (query.keyword) {
    const kw = query.keyword.toLowerCase()
    arr = arr.filter(u => (u.username + (u.nickname||'')).toLowerCase().includes(kw))
  }
  const total = arr.length
  const start = (page-1)*pageSize
  return { items: arr.slice(start, start+pageSize), total }
}

export async function createUser(data: Partial<UserEntity>): Promise<UserEntity> {
  try { const res = await api.post('/admin/users', data); return res.data }
  catch { return repoCreate<UserEntity>('users', { ...(data as any), status:data.status??1, created_at:new Date().toISOString() }) }
}
export async function updateUser(id:number, data: Partial<UserEntity>): Promise<UserEntity> {
  try { const res = await api.put(`/admin/users/${id}`, data); return res.data }
  catch { return repoUpdate<UserEntity>('users', id, data as any) }
}
export async function deleteUser(id:number): Promise<void> { try { await api.delete(`/admin/users/${id}`) } catch { repoRemove('users', id) } }
