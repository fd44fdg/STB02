<template>
  <div class="page-container">
    <div class="glass-panel" style="padding:16px 16px 8px;">
      <n-space>
        <n-input v-model:value="keyword" placeholder="搜索导航分类" style="width:220px" clearable @keyup.enter="reload" />
        <n-button type="primary" @click="reload">搜索</n-button>
        <n-button secondary @click="openCreate">新建</n-button>
      </n-space>
    </div>
    <div class="glass-panel" style="margin-top:16px; padding:12px;">
      <n-data-table :columns="columns" :data="filtered" :loading="loading" :row-key="r=>r.id" size="small" />
    </div>
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="max-width:480px;">
      <n-form ref="formRef" :model="form" label-width="80" :rules="rules">
        <n-form-item label="名称" path="name"><n-input v-model:value="form.name" /></n-form-item>
        <n-form-item label="图标" path="icon"><n-input v-model:value="form.icon" placeholder="图标名称 (可空)" /></n-form-item>
        <n-form-item label="排序" path="sort_order"><n-input-number v-model:value="form.sort_order" :min="0" /></n-form-item>
        <n-form-item label="状态"><n-switch v-model:value="enabled" /></n-form-item>
      </n-form>
      <template #footer>
        <n-space>
          <n-button @click="showModal=false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="submit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useMessage, NInput, NButton, NSpace, NDataTable, NModal, NForm, NFormItem, NInputNumber, NSwitch } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { listNavigationCategories, createNavigationCategory, updateNavigationCategory, deleteNavigationCategory, type NavigationCategory } from '../../api/navigation'

const message = useMessage()
const loading = ref(false)
const data = ref<NavigationCategory[]>([])
const keyword = ref('')

async function load(){ loading.value=true; try { data.value = await listNavigationCategories() } finally { loading.value=false } }
load()
function reload(){ load() }

const filtered = computed(()=> data.value.filter(c => !keyword.value || c.name.toLowerCase().includes(keyword.value.toLowerCase())))
const columns = computed<DataTableColumns<NavigationCategory>>(()=>[
  { title:'ID', key:'id', width:70 },
  { title:'名称', key:'name' },
  { title:'图标', key:'icon', width:100 },
  { title:'排序', key:'sort_order', width:80 },
  { title:'状态', key:'status', width:80, render:r=> r.status? '启用':'禁用' },
  { title:'操作', key:'actions', width:160, render:r=> h(NSpace,{size:4},{ default:()=>[
    h(NButton,{ size:'small', onClick:()=>openEdit(r) },{ default:()=> '编辑'}),
    h(NButton,{ size:'small', type:r.status?'warning':'success', quaternary:true, onClick:()=>toggleStatus(r) },{ default:()=> r.status?'禁用':'启用'}),
    h(NButton,{ size:'small', type:'error', quaternary:true, onClick:()=>onDelete(r) },{ default:()=> '删除'})
  ] }) }
])

// form
const showModal = ref(false)
const formRef = ref<FormInst|null>(null)
const form = ref<any>({ id:0, name:'', icon:'', sort_order:0, status:1 })
const enabled = computed({ get:()=> form.value.status===1, set:v=> form.value.status = v?1:0 })
const saving = ref(false)
const rules: FormRules = { name: { required:true, message:'请输入名称', trigger:'blur' } }
const modalTitle = computed(()=> form.value.id? '编辑导航分类':'新建导航分类')

function openCreate(){ form.value={ id:0, name:'', icon:'', sort_order:0, status:1 }; showModal.value=true }
function openEdit(r: NavigationCategory){ form.value={ ...r }; showModal.value=true }
function toggleStatus(r: NavigationCategory){ r.status = r.status?0:1; updateNavigationCategory(r.id,{ status:r.status }).catch(()=>{}) }

async function submit(){
  await formRef.value?.validate()
  saving.value=true
  try {
    if(form.value.id){ await updateNavigationCategory(form.value.id, form.value); message.success('更新成功') }
    else { const created = await createNavigationCategory(form.value); form.value.id = created.id || Date.now(); message.success('创建成功') }
    showModal.value=false
    load()
  } catch(e:any){ message.error(e.message||'保存失败') } finally { saving.value=false }
}
async function onDelete(r: NavigationCategory){ if(!confirm('确定删除?')) return; try { await deleteNavigationCategory(r.id); message.success('已删除'); load() } catch(e:any){ message.error(e.message||'删除失败') } }
</script>
