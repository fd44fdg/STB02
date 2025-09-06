<template>
  <div class="login-root">
    <div class="login-glow" />
    <div class="glass-panel login-panel">
      <h1 class="title">欢迎登录</h1>
      <p class="subtitle">掌上刷题宝 · 管理控制台</p>
      <n-input v-model:value="username" placeholder="用户名" size="large" @keyup.enter="focusPwd" />
      <n-input ref="pwdRef" v-model:value="password" type="password" placeholder="密码" size="large" @keyup.enter="doLogin" />
      <n-button type="primary" size="large" :loading="userStore.loading" block @click="doLogin">登录</n-button>
      <div class="tips">测试账号: <strong>admin / admin123</strong></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '../stores/user'

const username = ref('admin')
const password = ref('admin123')
const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()
const pwdRef = ref()

function focusPwd() { (pwdRef.value as any)?.focus?.() }

async function doLogin() {
  if (!username.value || !password.value) {
    message.warning('请输入账号密码')
    return
  }
  try {
    await userStore.login(username.value, password.value)
    message.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e: any) {
    message.error(e.message || '登录失败')
  }
}
</script>

<style scoped>
.login-root { position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:32px 16px; overflow:hidden; }
.login-glow { position:absolute; inset:0; pointer-events:none; background:
  radial-gradient(800px 600px at 75% 25%, rgba(90,200,250,0.22), transparent 70%),
  radial-gradient(900px 700px at 15% 80%, rgba(15,94,199,0.25), transparent 70%); filter:blur(4px); }
.login-panel { width:100%; max-width:440px; padding:40px 40px 48px; display:flex; flex-direction:column; gap:20px; position:relative; }
.title { margin:0; font-size:32px; font-weight:600; letter-spacing:.5px; background:linear-gradient(90deg,#5AC8FA,#3A86FF,#0F5EC7); -webkit-background-clip:text; color:transparent; }
.subtitle { margin:-4px 0 8px; font-size:14px; color:#B7CCE2; }
.tips { font-size:12px; color:#92A6BD; text-align:center; margin-top:4px; }
@media (max-width:560px){
  .title { font-size:26px; }
  .login-panel { padding:32px 28px 40px; }
}
</style>
