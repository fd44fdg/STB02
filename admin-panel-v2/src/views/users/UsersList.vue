<template>
  <div class="page-container">
    <div class="glass-panel" style="padding:16px 16px 8px;">
      <n-space>
        <n-input v-model:value="keyword" placeholder="搜索用户名/昵称" style="width:240px" clearable @keyup.enter="reload" />
        <n-button type="primary" @click="reload">搜索</n-button>
        <n-button secondary @click="openCreate">新建用户</n-button>
      </n-space>
    </div>
    <div class="glass-panel" style="margin-top:16px;padding:12px;">
      <n-data-table :data="data" :columns="columns" :loading="loading" size="small" :row-key="r=>r.id" />
      <div style="display:flex; justify-content:flex-end; margin-top:8px;">
        <n-pagination v-model:page="page" v-model:page-size="pageSize" :page-sizes="[5,10,20,50]" show-size-picker :item-count="total" size="small" />
      </div>
    </div>
    <n-modal v-model:show="showModal" preset="card" :title="modalTitle" style="max-width:520px;">
      <n-form ref="formRef" :model="form" :rules="rules" label-width="80">
        <n-form-item label="用户名" path="username"><n-input v-model:value="form.username" /></n-form-item>
        <n-form-item label="昵称" path="nickname"><n-input v-model:value="form.nickname" /></n-form-item>
        <n-form-item label="角色" path="roles">
          <n-select v-model:value="form.roles" multiple :options="roleOptions" />
        </n-form-item>
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
import { ref, computed, h, watch } from 'vue'
import { useMessage, NInput, NButton, NSpace, NDataTable, NModal, NForm, NFormItem, NSelect, NSwitch, NPagination } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules, SelectOption } from 'naive-ui'
import { listUsers, createUser, updateUser, deleteUser, type UserEntity } from '../../api/users'

const message = useMessage()
const loading = ref(false)
const data = ref<UserEntity[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const roleOptions: SelectOption[] = [
  { label:'管理员', value:'admin' },
  { label:'编辑', value:'editor' }
]

async function load(){
  loading.value = true
  try {
    const res = await listUsers({ page: page.value, pageSize: pageSize.value, keyword: keyword.value })
    data.value = res.items
    total.value = res.total
  } finally { loading.value=false }
}
load()

watch([page, pageSize], ()=> load())

const columns = computed<DataTableColumns<UserEntity>>(()=>[
  { title:'ID', key:'id', width:70 },
  { title:'用户名', key:'username' },
  { title:'昵称', key:'nickname' },
  { title:'角色', key:'roles', render: r => r.roles.join(',') },
  { title:'状态', key:'status', width:80, render: r => r.status? '启用':'禁用' },
  { title:'操作', key:'actions', width:200, render: r => h(NSpace,{size:4},{ default:()=>[
    h(NButton,{ size:'small', onClick:()=>openEdit(r) },{ default:()=> '编辑'}),
    h(NButton,{ size:'small', type:r.status?'warning':'success', quaternary:true, onClick:()=>toggleStatus(r) },{ default:()=> r.status?'禁用':'启用'}),
    h(NButton,{ size:'small', type:'error', quaternary:true, onClick:()=>onDelete(r) },{ default:()=> '删除'})
  ] }) }
])

function reload(){ page.value = 1; load() }

// form
const showModal = ref(false)
const formRef = ref<FormInst|null>(null)
const form = ref<any>({ id:0, username:'', nickname:'', roles:['editor'], status:1 })
const enabled = computed({ get:()=> form.value.status===1, set:v=> form.value.status = v?1:0 })
const saving = ref(false)
const modalTitle = computed(()=> form.value.id? '编辑用户':'新建用户')
const rules: FormRules = { username:{ required:true, message:'请输入用户名', trigger:'blur' } }

function openCreate(){ form.value={ id:0, username:'', nickname:'', roles:['editor'], status:1 }; showModal.value=true }
function openEdit(r:UserEntity){ form.value={ ...r }; showModal.value=true }
async function toggleStatus(r:UserEntity){ r.status = r.status?0:1; await updateUser(r.id, { status: r.status }); message.success('状态已更新') }

async function submit(){
  await formRef.value?.validate()
  saving.value = true
  try {
    if(form.value.id){ await updateUser(form.value.id, { ...form.value }); message.success('更新成功') }
    else { await createUser({ ...form.value }); message.success('创建成功') }
    showModal.value=false
    load()
  } catch(e:any){ message.error(e.message||'保存失败') } finally { saving.value=false }
}

async function onDelete(r:UserEntity){ if(!confirm('确认删除该用户?')) return; await deleteUser(r.id); message.success('已删除'); load() }
</script>
