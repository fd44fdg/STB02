<template>
  <div class="page-container">
    <div class="glass-panel profile-card">
      <h2 class="title">个人信息</h2>
      <p class="sub">查看与更新当前登录账号资料（本地 Mock 可编辑，不会持久到后端）。</p>
      <n-form :model="form" label-width="90">
        <n-form-item label="用户名">
          <n-input v-model:value="form.username" disabled />
        </n-form-item>
        <n-form-item label="昵称">
          <n-input v-model:value="form.nickname" placeholder="输入昵称" />
        </n-form-item>
        <n-form-item label="头像URL">
          <n-input v-model:value="form.avatar" placeholder="可输入图片地址" />
        </n-form-item>
        <n-form-item label="角色">
          <n-tag v-for="r in user.roles" :key="r" size="small" type="success" style="margin-right:6px;">{{ r }}</n-tag>
        </n-form-item>
        <n-space>
          <n-button type="primary" :loading="saving" @click="save">保存</n-button>
          <n-button quaternary @click="reset">重置</n-button>
        </n-space>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '../../stores/user'
import { useMessage, NForm, NFormItem, NInput, NButton, NSpace, NTag } from 'naive-ui'

const userStore = useUserStore()
const user = userStore.profile || { username: 'unknown', nickname: '', avatar: '', roles: [] }
const form = reactive({ username: user.username, nickname: user.nickname || '', avatar: user.avatar || '' })
const message = useMessage()
const saving = ref(false)

function reset(){ form.nickname = userStore.profile?.nickname || ''; form.avatar = userStore.profile?.avatar || '' }

async function save(){
  saving.value = true
  try {
    await userStore.updateProfileLocal({ nickname: form.nickname, avatar: form.avatar })
    message.success('已更新')
  } catch (e:any) { message.error(e.message || '更新失败') } finally { saving.value=false }
}
</script>

<style scoped>
.profile-card { padding:32px 36px; max-width:560px; }
.title { margin:0 0 4px; font-size:22px; font-weight:600; background:linear-gradient(90deg,#5AC8FA,#3A86FF,#0F5EC7); -webkit-background-clip:text; color:transparent; }
.sub { margin:0 0 24px; font-size:13px; color:#96b1c9; }
</style>
