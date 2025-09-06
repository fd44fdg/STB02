<template>
  <div class="page-container">
    <div class="glass-panel" style="padding:28px 32px; display:grid; gap:24px;">
      <div>
        <h2 class="title">系统设置</h2>
        <p class="desc">管理全局配置、展示属性与安全策略（示例占位，可扩展为分组面板）。</p>
      </div>
      <n-form :model="form" label-width="120">
        <n-form-item label="站点名称"><n-input v-model:value="form.siteName" placeholder="站点名称" /></n-form-item>
        <n-form-item label="默认主题色"><n-color-picker v-model:value="form.primary" :modes="['hex']" size="small" /></n-form-item>
        <n-form-item label="启用注册"><n-switch v-model:value="form.enableSignup" /></n-form-item>
        <n-form-item label="最大上传(MB)"><n-input-number v-model:value="form.maxUploadMB" :min="1" :max="200" /></n-form-item>
        <n-form-item label="首页公告"><n-input v-model:value="form.announcement" type="textarea" :rows="3" placeholder="公告内容" /></n-form-item>
        <n-space>
          <n-button type="primary" :loading="saving" @click="save">保存设置</n-button>
          <n-button quaternary @click="reset">重置</n-button>
          <n-button secondary @click="exportConfig">导出H5配置</n-button>
        </n-space>
      </n-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useMessage, NForm, NFormItem, NInput, NButton, NSpace, NInputNumber, NSwitch, NColorPicker } from 'naive-ui'
import { useSystemSettingsStore } from '../../stores/systemSettings'
import { toH5Questions } from '../../utils/questionsExport'

const store = useSystemSettingsStore()
const message = useMessage()
const saving = ref(false)
const form = reactive({ ...store.data })

function reset(){ Object.assign(form, store.data) }
async function save(){
  saving.value = true
  try {
    // 本地更新 & 持久化
    store.update({ ...form })
    // 未来可在此调用真实 /system/settings 接口
    message.success('已保存 (本地)')
  } catch(e:any){ message.error(e.message||'保存失败') } finally { saving.value=false }
}

// 响应式更新主题主色（App.vue 会使用 pinia 数据）
watch(()=> form.primary, (v)=> { store.update({ primary: v }); autoExport() }, { flush:'post' })
watch(()=> [form.siteName, form.enableSignup, form.maxUploadMB, form.announcement], ()=> { autoExport() })

function buildPayload(){
  const banners = JSON.parse(localStorage.getItem('repo_banners')||'[]')
  const navigation = JSON.parse(localStorage.getItem('repo_navigation')||'[]')
  const knowledge = JSON.parse(localStorage.getItem('repo_knowledge')||'[]')
  const questions = JSON.parse(localStorage.getItem('repo_questions')||'[]')
  const users = JSON.parse(localStorage.getItem('repo_users')||'[]')
  let h5Questions: any[] = []
  try { h5Questions = toH5Questions(questions) } catch {}
  return {
    generatedAt: new Date().toISOString(),
    settings: store.exportForH5(),
    banners, navigation, knowledge, questions, h5Questions, users
  }
}

function autoExport(){
  try {
    const payload = buildPayload()
    localStorage.setItem('last_export_payload', JSON.stringify(payload))
  } catch {}
}

function exportConfig(){
  try {
    const payload = buildPayload()
    const blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'site-config.json'
    a.click()
    URL.revokeObjectURL(a.href)
    message.success('已导出 site-config.json')
    autoExport()
  } catch(e:any){ message.error(e.message||'导出失败') }
}
</script>

<style scoped>
.title { margin:0 0 8px; font-size:22px; font-weight:600; background:linear-gradient(90deg,#5AC8FA,#3A86FF,#0F5EC7); -webkit-background-clip:text; color:transparent; }
.desc { margin:0 0 4px; font-size:13px; color:#9db5ce; }
</style>
