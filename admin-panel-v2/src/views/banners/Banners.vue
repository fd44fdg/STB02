<template>
  <div class="page-container">
    <div class="glass-panel" style="padding: 16px 16px 0;">
      <n-space justify="space-between" align="center">
        <h2 style="margin: 8px 0;">轮播图管理 v2</h2>
        <n-space>
          <n-input v-model:value="keyword" placeholder="搜索标题" clearable style="width: 240px;" />
          <n-switch v-model:value="onlyVisible">
            <template #checked>只看已启用</template>
            <template #unchecked>全部</template>
          </n-switch>
          <n-button type="primary" @click="openCreate">新建</n-button>
        </n-space>
      </n-space>
    </div>

    <div class="glass-panel" style="margin-top: 16px; padding: 16px;">
      <n-data-table :columns="columns" :data="filtered" :loading="loading" :bordered="false"/>
    </div>

    <n-drawer v-model:show="showDrawer" :width="420">
      <n-drawer-content :title="drawerTitle">
        <n-form :model="form" :rules="rules" ref="formRef" label-placement="left" label-width="80">
          <n-form-item label="标题" path="title">
            <n-input v-model:value="form.title" placeholder="请输入标题" />
          </n-form-item>
          <n-form-item label="图片" path="image_url">
            <n-input v-model:value="form.image_url" placeholder="图片URL或使用上传" />
            <UploadImage v-model="form.image_url" />
          </n-form-item>
          <n-form-item label="链接" path="link_url">
            <n-input v-model:value="form.link_url" placeholder="点击跳转链接（可选）" />
          </n-form-item>
          <n-form-item label="排序" path="sort_order">
            <n-input-number v-model:value="form.sort_order" :min="0" />
          </n-form-item>
          <n-form-item label="可见">
            <n-switch v-model:value="form.is_visible" />
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
import { ref, computed, h } from 'vue'
import { useMessage, NButton, NSpace, NInput, NSwitch, NDataTable, NDrawer, NDrawerContent, NForm, NFormItem, NInputNumber, NTag, NPopconfirm } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { listBanners, createBanner, updateBanner, deleteBanner, type Banner } from '../../api/banners'
import UploadImage from '../../components/UploadImage.vue'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const data = ref<Banner[]>([])
const keyword = ref('')
const onlyVisible = ref(false)

const columns = computed<DataTableColumns<Banner>>(() => [
  {
    title: '图片',
    key: 'image_url',
    render: (row) => h('img', { src: row.image_url, style: 'width: 120px; height: 60px; object-fit: cover; border-radius: 8px;' })
  },
  { title: '标题', key: 'title' },
  { title: '链接', key: 'link_url' },
  { title: '排序', key: 'sort_order', width: 80 },
  {
    title: '状态', key: 'is_visible', width: 100,
    render: (row) => h(NTag, { type: row.is_visible ? 'success' : 'default' }, { default: () => row.is_visible ? '启用' : '禁用' })
  },
  {
    title: '操作', key: 'actions', width: 220,
    render: (row) => h(NSpace, {}, {
      default: () => [
        h(NButton, { size: 'small', onClick: () => openEdit(row) }, { default: () => '编辑' }),
        h(NPopconfirm, { onPositiveClick: () => onToggle(row) }, {
          trigger: () => h(NButton, { size: 'small' }, { default: () => row.is_visible ? '禁用' : '启用' }),
          default: () => `确定要${row.is_visible ? '禁用' : '启用'}吗？`
        }),
        h(NPopconfirm, { onPositiveClick: () => onDelete(row) }, {
          trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
          default: () => '确定要删除吗？'
        })
      ]
    })
  }
])

const filtered = computed(() => {
  let list = data.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(i => (i.title || '').toLowerCase().includes(kw))
  }
  if (onlyVisible.value) {
    list = list.filter(i => i.is_visible)
  }
  return list
})

async function load () {
  loading.value = true
  try {
    data.value = await listBanners()
  } catch (e: any) {
    message.error(e.message || '加载失败')
    data.value = []
  } finally {
    loading.value = false
  }
}

const showDrawer = ref(false)
const formRef = ref<FormInst | null>(null)
const form = ref({ id: 0, title: '', image_url: '', link_url: '', sort_order: 0, is_visible: true })
const rules: FormRules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  image_url: { required: true, message: '请输入图片URL', trigger: 'blur' }
}

function openCreate () {
  form.value = { id: 0, title: '', image_url: '', link_url: '', sort_order: 0, is_visible: true }
  showDrawer.value = true
}

function openEdit (row: Banner) {
  form.value = { ...row }
  showDrawer.value = true
}

const drawerTitle = computed(() => form.value.id ? '编辑轮播图' : '新建轮播图')

async function submit () {
  await formRef.value?.validate()
  saving.value = true
  try {
    if (form.value.id) {
      await updateBanner(form.value.id, {
        title: form.value.title,
        image_url: form.value.image_url,
        link_url: form.value.link_url || null,
        sort_order: form.value.sort_order,
        is_visible: form.value.is_visible
      })
      message.success('更新成功')
    } else {
      await createBanner({
        title: form.value.title,
        image_url: form.value.image_url,
        link_url: form.value.link_url || null,
        sort_order: form.value.sort_order,
        is_visible: form.value.is_visible
      })
      message.success('创建成功')
    }
    showDrawer.value = false
    load()
  } catch (e: any) {
    message.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function onDelete (row: Banner) {
  try {
    await deleteBanner(row.id)
    message.success('删除成功')
    load()
  } catch (e: any) {
    message.error(e.message || '删除失败')
  }
}

async function onToggle (row: Banner) {
  try {
    await updateBanner(row.id, { is_visible: !row.is_visible })
    message.success('状态已更新')
    load()
  } catch (e: any) {
    message.error(e.message || '更新失败')
  }
}

load()
</script>
