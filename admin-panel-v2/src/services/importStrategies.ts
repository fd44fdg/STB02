import type { QuestionBasic } from '../api/questions'

export interface ImportStrategy {
  detect(data: any[]): boolean
  transform(data: any[]): QuestionBasic[]
  name: string
}

// Strategy: H5 format (title, options objects)
const h5Strategy: ImportStrategy = {
  name: 'h5-json',
  detect(list){
    if(!Array.isArray(list) || !list.length) return false
    const first = list[0]
    return !!first.title && !first.content
  },
  transform(list){
    return list.map((h:any, idx:number)=> ({
      id: h.id || Date.now()+idx,
      content: h.title,
      type: h.type === 'fill' ? 'fill':'single',
      options: (h.options||[]).map((o:any)=> o.text),
      correct_answer: inferCorrect(h),
      difficulty: h.difficulty===3?'hard': h.difficulty===2?'medium':'easy',
      category: h.category||'',
      tags: (h.tags||[]).join(','),
      description: h.description||'',
      explanation: h.explanation||'',
      code_example: h.codeExample||'',
      status: 1,
      created_at: new Date().toISOString()
    }))
  }
}

// Fallback raw (already QuestionBasic array)
const rawStrategy: ImportStrategy = {
  name: 'raw-array',
  detect(list){
    if(!Array.isArray(list) || !list.length) return false
    const f = list[0]
    return !!f.content && typeof f.type === 'string'
  },
  transform(list){ return list as QuestionBasic[] }
}

const strategies: ImportStrategy[] = [h5Strategy, rawStrategy]

export function runImportStrategies(json:any): QuestionBasic[] {
  if(!Array.isArray(json)) return []
  for(const s of strategies){
    try { if (s.detect(json)) return s.transform(json) } catch { /* ignore strategy failures */ }
  }
  return []
}

function inferCorrect(h:any){
  if (h.type==='fill') return h.correctAnswer || ''
  const opts = h.options||[]
  if (typeof h.correctAnswer === 'string') {
    const match = h.correctAnswer.match(/^([A-Z])/)
    if (match) return match[1].charCodeAt(0)-65
  }
  const idx = opts.findIndex((o:any)=> o.isCorrect)
  return idx>=0? idx : 0
}
