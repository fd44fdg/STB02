import { overwrite, list as repoList, create as repoCreate, update as repoUpdate, remove as repoRemove } from '../mock/localRepo'
import { toH5Questions } from '../utils/questionsExport'
import type { QuestionBasic } from '../api/questions'
import { runImportStrategies } from './importStrategies'

// Internal normalized extensions (backward compatible augmentation of QuestionBasic)
export interface NormalizedQuestion extends QuestionBasic {
  variant?: 'choice' | 'fill'
  correctIndexes?: number[] // for choice types
  fillAnswer?: string       // for fill variant
  tagsArr?: string[]        // cached array form of tags
}

const STORAGE_KEY = 'repo_questions'
const META_KEY = 'repo_questions_meta'
const SCHEMA_VERSION = 2

interface RepoMeta { schema: number; migratedAt: string }

function loadMeta(): RepoMeta { try { const raw = localStorage.getItem(META_KEY); if(raw) return JSON.parse(raw) } catch {} return { schema: 0, migratedAt: '' } }
function saveMeta(meta: RepoMeta){ localStorage.setItem(META_KEY, JSON.stringify(meta)) }

function loadRaw(): NormalizedQuestion[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) } catch {}
  return []
}

function saveRaw(list: NormalizedQuestion[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }

export function migrateStoredQuestions(): NormalizedQuestion[] {
  let changed = false
  const meta = loadMeta()
  const list = loadRaw().map(q => {
    const nq: NormalizedQuestion = { ...q }
    if (!nq.variant) {
      nq.variant = q.type === 'fill' ? 'fill' : 'choice'
      changed = true
    }
    if (nq.variant === 'choice' && !nq.correctIndexes) {
      // derive from legacy correct_answer
      if (Array.isArray(q.correct_answer)) nq.correctIndexes = q.correct_answer as number[]
      else if (typeof q.correct_answer === 'number') nq.correctIndexes = [q.correct_answer]
      else nq.correctIndexes = []
      changed = true
    }
    if (nq.variant === 'fill' && !nq.fillAnswer) {
      if (typeof q.correct_answer === 'string') nq.fillAnswer = q.correct_answer
      changed = true
    }
    if (typeof nq.tags === 'string' && !nq.tagsArr) {
      nq.tagsArr = nq.tags.split(',').map(t=>t.trim()).filter(Boolean)
      changed = true
    }
    return nq
  })
  if (changed) {
    saveRaw(list)
    saveMeta({ schema: SCHEMA_VERSION, migratedAt: new Date().toISOString() })
  } else if (meta.schema !== SCHEMA_VERSION) {
    // bump schema even if no object changed
    saveMeta({ schema: SCHEMA_VERSION, migratedAt: new Date().toISOString() })
  }
  return list
}

export interface ListParams { page?:number; limit?:number; keyword?:string; type?:string; difficulty?:string; category?:string; status?:number }

export function listNormalized(params: ListParams){
  const all = migrateStoredQuestions()
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

export function createLocal(data: Partial<QuestionBasic>): QuestionBasic {
  const created = repoCreate<QuestionBasic>('questions', { ...(data as any), created_at: new Date().toISOString(), status: (data.status ?? 1) })
  exportSnapshot()
  return created
}

export function updateLocal(id:number, data: Partial<QuestionBasic>): QuestionBasic {
  const updated = repoUpdate<QuestionBasic>('questions', id, { ...data, updated_at: new Date().toISOString() } as any)
  exportSnapshot()
  return updated
}

export function removeLocal(id:number){ repoRemove('questions', id); exportSnapshot() }

export function importBulk(list: QuestionBasic[]){
  // prepend new items
  const existing = repoList<QuestionBasic>('questions')
  overwrite('questions', [...list, ...existing])
  exportSnapshot()
}

export function detectAndParse(json: any): QuestionBasic[] { return runImportStrategies(json) }

export function exportSnapshot(){
  try {
    const last = JSON.parse(localStorage.getItem('last_export_payload')||'{}')
  const questions = migrateStoredQuestions()
  last.questions = questions
  // Normalize for export: convert new fields into legacy shape if needed handled inside toH5Questions
  try { last.h5Questions = toH5Questions(questions as any) } catch {}
    last.generatedAt = new Date().toISOString()
    localStorage.setItem('last_export_payload', JSON.stringify(last))
  } catch {}
}
