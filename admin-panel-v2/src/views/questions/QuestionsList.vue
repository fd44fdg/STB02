<template>
  <div class="page-container">
    <div class="glass-panel filter-bar" style="padding:16px 16px 8px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
      <n-input v-model:value="query.keyword" placeholder="搜索题干" style="width:200px" clearable @keyup.enter="search" />
      <n-select v-model:value="filters.type" :options="typeOptions" placeholder="类型" style="width:120px" clearable />
      <n-select v-model:value="filters.difficulty" :options="difficultyOptions" placeholder="难度" style="width:120px" clearable />
      <n-input v-model:value="filters.category" placeholder="分类" style="width:140px" clearable />
      <n-select v-model:value="filters.status" :options="statusOptions" placeholder="状态" style="width:110px" clearable />
      <n-button @click="search" secondary>搜索</n-button>
      <n-button @click="resetFilters" quaternary>重置</n-button>
      <n-button @click="openCreate" type="primary" v-permission="['admin','editor']">新建</n-button>
      <n-button tertiary @click="exportRaw" v-permission="['admin','editor']">导出RAW</n-button>
      <n-button tertiary @click="exportH5" v-permission="['admin','editor']">导出H5</n-button>
      <n-upload v-permission="['admin','editor']" :show-file-list="false" accept=".json" @before-upload="beforeImport">
        <n-button dashed size="small">导入JSON</n-button>
      </n-upload>
    </div>
    <div class="glass-panel" style="margin-top:16px; padding:12px;">
      <div v-if="selectedIds.length" class="bulk-bar">
        <n-space size="small">
          <span style="font-size:12px;opacity:.8">已选 {{selectedIds.length}} 项</span>
          <n-button size="tiny" @click="bulkEnable" secondary>批量启用</n-button>
          <n-button size="tiny" @click="bulkDisable" tertiary>批量禁用</n-button>
          <n-button size="tiny" type="error" @click="bulkDelete" quaternary>批量删除</n-button>
          <n-button size="tiny" @click="clearSelection">清除选择</n-button>
        </n-space>
      </div>
      <n-data-table
        :columns="columns"
        :data="filtered"
        :loading="loading"
        size="small"
        :row-key="row=>row.id"
        type="selection"
        v-model:checked-row-keys="selectedIds"
      />
      <div style="display:flex; justify-content:flex-end; margin-top:8px;">
        <n-pagination v-model:page="page" v-model:page-size="limit" :item-count="total" show-size-picker :page-sizes="[5,10,20,50]" size="small" />
      </div>
    </div>

    <n-drawer v-model:show="showDrawer" :width="480">
      <n-drawer-content :title="drawerTitle">
        <n-form ref="formRef" :model="form" :rules="rules" label-width="90">
          <n-form-item label="题目" path="content">
            <n-input v-model:value="form.content" type="textarea" :rows="3" />
          </n-form-item>
          <n-form-item label="分类">
            <n-input v-model:value="form.category" placeholder="如 HTML / JS" />
          </n-form-item>
          <n-form-item label="类型" path="type">
            <n-select v-model:value="form.type" :options="typeOptions" @update:value="onTypeChange" />
          </n-form-item>
          <n-form-item v-if="form.type!=='fill'" label="选项" path="options">
            <div style="display:flex; flex-direction:column; gap:6px; width:100%;">
              <div v-for="(opt,i) in form.options" :key="i" style="display:flex; gap:6px;">
                <n-input v-model:value="form.options[i]" :placeholder="'选项 '+ String.fromCharCode(65+i)" />
                <n-button quaternary circle size="small" @click="removeOption(i)" v-if="form.options.length>2">✕</n-button>
              </div>
              <n-button text type="primary" size="small" @click="addOption">+ 添加选项</n-button>
            </div>
          </n-form-item>
          <n-form-item label="答案" :path="form.type==='fill' ? 'fillAnswer' : undefined">
            <!-- 单选 & 判断：使用 computed singleAnswer 包装 correctIndexes[0] -->
            <n-select v-if="form.type==='single' || form.type==='boolean'" v-model:value="singleAnswer" :options="answerSelectOptions" />
            <n-select v-else-if="form.type==='multiple'" multiple v-model:value="form.correctIndexes" :options="answerSelectOptions" />
            <n-input v-else v-model:value="form.fillAnswer" placeholder="填空答案" />
          </n-form-item>
          <n-form-item label="难度" path="difficulty">
            <n-select v-model:value="form.difficulty" :options="difficultyOptions" />
          </n-form-item>
          <n-form-item label="描述">
            <n-input v-model:value="form.description" type="textarea" :rows="2" placeholder="题目背景或补充说明" />
          </n-form-item>
          <n-form-item label="解析">
            <n-input v-model:value="form.explanation" type="textarea" :rows="3" placeholder="答案解析" />
          </n-form-item>
            <n-form-item label="代码示例">
              <n-input v-model:value="form.code_example" type="textarea" :rows="3" placeholder="可选代码片段" />
            </n-form-item>
          <n-form-item label="标签">
            <n-input v-model:value="tagsString" placeholder="用逗号分隔，如: 闭包,作用域" />
          </n-form-item>
          <n-form-item label="状态">
            <n-switch v-model:value="statusEnabled" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space>
            <n-button @click="showDrawer=false">取消</n-button>
            <n-button type="primary" :loading="saving" @click="submit">保存</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { useMessage, NButton, NSpace, NInput, NSelect, NDataTable, NDrawer, NDrawerContent, NForm, NFormItem, NSwitch, NPagination, NUpload, UploadFileInfo } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules, SelectOption } from 'naive-ui'
import type { QuestionBasic } from '../../api/questions'
import { listNormalized, createLocal, updateLocal, removeLocal, detectAndParse, importBulk } from '../../services/questionService'
import { exportSnapshot } from '../../services/questionService'

const message = useMessage()
const loading = ref(false)
const items = ref<QuestionBasic[]>([])
const query = ref({ keyword: '' })
// 重要说明：Naive UI 的 n-select 若绑定值为 '' (空字符串) 会视为“有值”且尝试匹配 label；
// 当 options 中不存在该值时，placeholder 不会渲染且 label 为空 => 视觉上出现“看不到文字”。
// 因此筛选条件初始应使用 null (或 undefined) 表示“未选择”，以确保 placeholder 正常显示。
const filters = ref<any>({ type: null, difficulty: null, category: '', status: null })
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const typeOptions: SelectOption[] = [
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '判断题', value: 'boolean' },
  { label: '填空题', value: 'fill' }
]
const difficultyOptions: SelectOption[] = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]
const statusOptions: SelectOption[] = [ { label:'启用', value:1 }, { label:'禁用', value:0 } ]
const booleanOptions: SelectOption[] = [ { label: '正确', value: 0 }, { label: '错误', value: 1 } ]

const filtered = computed(() => items.value)

const columns = computed<DataTableColumns<QuestionBasic>>(() => [
  { type: 'selection', multiple: true, width: 36 },
  { title: 'ID', key: 'id', width: 70 },
  { title: '题目', key: 'content', ellipsis: { tooltip: true } },
  { title: '类型', key: 'type', width: 90 },
  { title: '难度', key: 'difficulty', width: 90 },
  { title: '状态', key: 'status', width: 80, render: row => row.status ? '启用' : '禁用' },
  { title: '创建时间', key: 'created_at', width: 160 },
  { title: '操作', key: 'actions', width: 210, render: (row) => h(NSpace, { size: 4 }, {
      default: () => [
        h(NButton, { size: 'small', onClick: () => duplicateRow(row), tertiary: true, 'v-permission':['admin','editor'] as any }, { default: () => '复制' }),
        h(NButton, { size: 'small', onClick: () => openEdit(row), 'v-permission':['admin','editor'] as any }, { default: () => '编辑' }),
        h(NButton, { size: 'small', quaternary: true, type: row.status? 'warning':'success', onClick: () => toggleStatus(row), 'v-permission':['admin','editor'] as any }, { default: () => row.status? '禁用':'启用' }),
        h(NButton, { size: 'small', type: 'error', quaternary: true, onClick: () => onDelete(row), 'v-permission':['admin'] as any }, { default: () => '删除' })
      ]
    }) }
])
const selectedIds = ref<Array<number | string>>([])
function clearSelection(){ selectedIds.value = [] }
function bulkEnable(){ selectedIds.value.forEach(id=> updateLocal(Number(id), { status:1 })); exportSnapshot(); fetchList(); clearSelection(); message.success('已启用') }
function bulkDisable(){ selectedIds.value.forEach(id=> updateLocal(Number(id), { status:0 })); exportSnapshot(); fetchList(); clearSelection(); message.success('已禁用') }
function bulkDelete(){ selectedIds.value.forEach(id=> removeLocal(Number(id))); exportSnapshot(); fetchList(); clearSelection(); message.success('已删除') }

// Drawer form
const showDrawer = ref(false)
const formRef = ref<FormInst|null>(null)
const form = ref<any>({ id: 0, content: '', type: 'single', options: ['', ''], correctIndexes: [0], fillAnswer: '', difficulty: 'easy', status: 1, tagsArr: [] })
const statusEnabled = computed({ get: () => form.value.status === 1, set: v => form.value.status = v ? 1 : 0 })
const rules: FormRules = {
  content: { required: true, message: '请输入题目', trigger: 'blur' },
  type: { required: true, message: '请选择类型', trigger: 'change' },
  options: {
    validator: () => {
      if (form.value.type === 'fill') return true
      const opts = form.value.options || []
      if (opts.length < 2) return new Error('至少需要 2 个选项')
      if (opts.some((o:string)=> !o || !o.trim())) return new Error('选项内容不能为空')
      if (form.value.type === 'multiple' && (!Array.isArray(form.value.correctIndexes) || !form.value.correctIndexes.length)) {
        return new Error('多选题请至少选择 1 个正确答案')
      }
      return true
    },
    trigger: ['blur','change']
  },
  fillAnswer: {
    validator: () => {
      if (form.value.type !== 'fill') return true
      if (!form.value.fillAnswer || !String(form.value.fillAnswer).trim()) return new Error('填空题答案不能为空')
      return true
    },
    trigger: ['blur','change']
  }
}
const saving = ref(false)

const answerSelectOptions = computed<SelectOption[]>(() => (form.value.options || []).map((o:string, i:number) => ({ label: String.fromCharCode(65+i)+'. '+o, value: i })))
const singleAnswer = computed({
  get: () => form.value.correctIndexes?.[0] ?? 0,
  set: (v:number) => { form.value.correctIndexes = [v] }
})
const tagsString = computed({
  get: () => (form.value.tagsArr && form.value.tagsArr.length) ? form.value.tagsArr.join(',') : (form.value.tags || ''),
  set: (val:string) => { form.value.tagsArr = val.split(',').map(t=>t.trim()).filter(Boolean) }
})

function openCreate() {
  form.value = { id: 0, content: '', type: 'single', options: ['', ''], correctIndexes: [0], fillAnswer:'', difficulty: 'easy', status: 1, category:'', description:'', explanation:'', code_example:'', tagsArr: [] }
  showDrawer.value = true
}
function openEdit(row: QuestionBasic) {
  // row 可能已包含 correctIndexes / fillAnswer (迁移后)；若无则从 legacy correct_answer 推导
  const copy: any = { ...row }
  if(!Array.isArray(copy.options)) copy.options = ['','']
  if (copy.type === 'fill') {
    copy.fillAnswer = typeof copy.correct_answer === 'string' ? copy.correct_answer : (copy.fillAnswer||'')
  } else if (copy.type === 'multiple') {
    if (!Array.isArray(copy.correctIndexes)) {
      copy.correctIndexes = Array.isArray(copy.correct_answer)? copy.correct_answer : []
    }
  } else { // single / boolean
    if (!Array.isArray(copy.correctIndexes)) {
      const v = typeof copy.correct_answer === 'number' ? copy.correct_answer : 0
      copy.correctIndexes = [v]
    }
  }
  if (!copy.tagsArr) {
    copy.tagsArr = (copy.tags ? copy.tags.split(',').map((t:string)=>t.trim()).filter(Boolean): [])
  }
  form.value = copy
  showDrawer.value = true
}
const drawerTitle = computed(()=> form.value.id? '编辑题目':'新建题目')

function addOption(){ form.value.options.push(''); ensureIndexesValid() }
function removeOption(i:number){ form.value.options.splice(i,1); ensureIndexesValid() }
function onTypeChange(){
  if(form.value.type==='boolean'){
    form.value.options=['正确','错误']; form.value.correctIndexes=[0]; form.value.fillAnswer=''
  } else if(form.value.type==='fill') {
    form.value.options=[]; form.value.fillAnswer=''; form.value.correctIndexes=[]
  } else if(form.value.type==='multiple') {
    if(!Array.isArray(form.value.options) || form.value.options.length<2) form.value.options=['','']
    form.value.correctIndexes=[]
  } else { // single
    form.value.options=['','']; form.value.correctIndexes=[0]; form.value.fillAnswer=''
  }
}
function ensureIndexesValid(){
  if (!Array.isArray(form.value.correctIndexes)) return
  const max = (form.value.options||[]).length -1
  form.value.correctIndexes = form.value.correctIndexes.filter((i:number)=> i<=max)
  if ((form.value.type==='single'||form.value.type==='boolean') && form.value.correctIndexes.length>1) {
    form.value.correctIndexes = [form.value.correctIndexes[0]]
  }
  if ((form.value.type==='single'||form.value.type==='boolean') && form.value.correctIndexes.length===0) {
    form.value.correctIndexes=[0]
  }
}

async function submit(){
  await formRef.value?.validate()
  saving.value = true
  try {
  // Build legacy correct_answer for storage compatibility
  const payload: any = { ...form.value }
  if (payload.type==='fill') payload.correct_answer = payload.fillAnswer
  else if (payload.type==='multiple') payload.correct_answer = payload.correctIndexes
  else payload.correct_answer = payload.correctIndexes?.[0] ?? 0
  payload.tags = (payload.tagsArr && payload.tagsArr.length) ? payload.tagsArr.join(',') : (payload.tags || '')
  if(form.value.id){ await updateLocal(form.value.id, payload); message.success('更新成功') }
  else { const created = await createLocal(payload); form.value.id = created.id || Date.now(); message.success('创建成功') }
  exportSnapshot()
    showDrawer.value = false
  fetchList()
  } catch(e:any){ message.error(e.message||'保存失败') } finally { saving.value=false }
}

function search(){ fetchList() }
async function onDelete(row: QuestionBasic){ try { await removeLocal(row.id); message.success('已删除'); fetchList() } catch(e:any){ message.error(e.message||'删除失败') } }
function toggleStatus(row: QuestionBasic){ row.status = row.status?0:1; updateLocal(row.id,{ status: row.status }); exportSnapshot(); fetchList() }
function duplicateRow(row: QuestionBasic){
  const base: any = { ...row }
  delete base.id
  base.content = base.content + ' - 副本'
  if (base.type==='fill') base.correct_answer = base.fillAnswer || base.correct_answer || ''
  else if (base.type==='multiple') base.correct_answer = base.correctIndexes || base.correct_answer || []
  else base.correct_answer = (base.correctIndexes && base.correctIndexes[0]) ?? base.correct_answer ?? 0
  createLocal(base)
  exportSnapshot(); fetchList(); message.success('已复制')
}

watch([page, limit], ()=> fetchList())
function resetFilters(){
  filters.value = { type: null, difficulty: null, category: '', status: null }
  page.value = 1
  search()
}

function exportRaw(){
  const questions = JSON.parse(localStorage.getItem('repo_questions')||'[]')
  downloadJSON(questions, 'raw-questions.json')
}
async function exportH5(){
  const questions = JSON.parse(localStorage.getItem('repo_questions')||'[]')
  const mod = await import('../../utils/questionsExport')
  downloadJSON(mod.toH5Questions(questions), 'h5-questions.json')
}
function downloadJSON(data:any, name:string){
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href)
}
function beforeImport(options:{ file: UploadFileInfo }){
  const file = options.file.file as File
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const text = reader.result as string
      const json = JSON.parse(text)
      const list = detectAndParse(json)
      importBulk(list)
      message.success('导入成功 '+ list.length +' 条')
      fetchList()
    } catch(e:any){ message.error('导入失败: '+ (e.message||'')) }
  }
  reader.readAsText(file)
  return false
}

async function fetchList(){
  loading.value = true
  try {
    const res = listNormalized({ page: page.value, limit: limit.value, keyword: query.value.keyword, type: filters.value.type, difficulty: filters.value.difficulty, category: filters.value.category, status: filters.value.status })
    total.value = res.total
    items.value = res.items
  } finally { loading.value=false }
}

fetchList()
</script>
<style scoped>
/* 修复玻璃背景下选择器/输入文字被透明渐变覆盖导致不可见的问题 */
.filter-bar :deep(.n-base-selection-label),
.filter-bar :deep(.n-base-selection-input),
.filter-bar :deep(.n-input__input-el) {
  color: #1f1f1f !important;
  -webkit-text-fill-color: #1f1f1f !important;
}
.filter-bar :deep(.n-base-selection-placeholder),
.filter-bar :deep(.n-input__placeholder) {
  color: rgba(0,0,0,0.45) !important;
  -webkit-text-fill-color: rgba(0,0,0,0.45) !important;
}
/* 兼容可能存在的全局 gradient 文本样式（color:transparent + background-clip） */
.filter-bar :deep(.n-base-selection-label),
.filter-bar :deep(.n-input__input-el) {
  background: none !important;
  background-clip: border-box !important;
  -webkit-background-clip: border-box !important;
}
/* 再增加一层针对选择器容器的颜色兜底 */
.filter-bar :deep(.n-base-selection),
.filter-bar :deep(.n-base-selection-label__render-label),
.filter-bar :deep(.n-base-selection-label span) {
  color:#1f1f1f !important;
  -webkit-text-fill-color:#1f1f1f !important;
}
</style>
