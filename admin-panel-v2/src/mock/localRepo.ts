// 简易本地集合存储，使用 localStorage 持久化，用于无后端时 CRUD。
interface BaseItem { id: number; [k: string]: any }

function load(name: string): BaseItem[] {
  try { const raw = localStorage.getItem('repo_' + name); if (raw) return JSON.parse(raw) } catch {}
  return []
}
function save(name: string, list: BaseItem[]) { localStorage.setItem('repo_' + name, JSON.stringify(list)) }

export function list<T extends BaseItem>(name: string): T[] { return load(name) as T[] }
export function create<T extends BaseItem>(name: string, data: Omit<T,'id'>): T {
  const list = load(name)
  const item: T = { id: Date.now(), ...(data as any) }
  list.unshift(item)
  save(name, list)
  return item
}
export function update<T extends BaseItem>(name: string, id: number, data: Partial<T>): T {
  const list = load(name)
  const idx = list.findIndex(i=>i.id===id)
  if (idx>-1) { list[idx] = { ...list[idx], ...data }; save(name,list); return list[idx] as T }
  throw new Error('未找到记录')
}
export function remove(name: string, id: number) {
  const list = load(name).filter(i=>i.id!==id)
  save(name, list)
}

export function overwrite<T extends BaseItem>(name: string, items: T[]) {
  save(name, items)
}

export function ensureSeed<T extends BaseItem>(name: string, seed: ()=>T[]) {
  const existing = load(name)
  if (!existing.length) {
    const seeded = seed()
    save(name, seeded)
    return seeded as T[]
  }
  return existing as T[]
}

