import type { QuestionBasic } from '../api/questions'

// 将后台内部格式问题数组转换为 H5 需要的格式
export function toH5Questions(list: QuestionBasic[]) {
  return list.map(q => {
    const type = q.type === 'fill' ? 'fill' : 'choice' // 其它都暂归 choice
    const difficultyMap: Record<string, number> = { easy:1, medium:2, hard:3 }
    const options = (q.options || []).map((text, idx) => ({
      text,
      isCorrect: isOptionCorrect(q, idx)
    }))
    return {
      id: q.id,
      title: q.content,
      description: q.description || '',
      type,
      category: q.category || '',
      difficulty: difficultyMap[q.difficulty] || 1,
      codeExample: q.code_example || '',
      options,
      correctAnswer: buildCorrectAnswer(q),
      explanation: q.explanation || '',
      tags: (q.tags ? q.tags.split(',').map(t=>t.trim()).filter(Boolean) : [])
    }
  })
}

function isOptionCorrect(q: any, idx: number) {
  if (Array.isArray(q.correctIndexes)) return q.correctIndexes.includes(idx)
  if (q.type === 'single' || q.type === 'boolean') return q.correct_answer === idx
  if (q.type === 'multiple' && Array.isArray(q.correct_answer)) return q.correct_answer.includes(idx)
  return false
}

function buildCorrectAnswer(q: any) {
  if (q.type === 'fill') return q.fillAnswer ?? q.correct_answer ?? ''
  const opts = q.options || []
  const indexes: number[] = Array.isArray(q.correctIndexes)
    ? q.correctIndexes
    : (Array.isArray(q.correct_answer) ? q.correct_answer : (typeof q.correct_answer === 'number' ? [q.correct_answer] : []))
  if (q.type === 'multiple') {
    return indexes.map(i => letter(i) + '. ' + (opts[i]||'')).join(' | ')
  }
  if (indexes.length) {
    const i = indexes[0]
    return letter(i) + '. ' + (opts[i]||'')
  }
  return ''
}

function letter(i:number){ return String.fromCharCode(65+i) }
