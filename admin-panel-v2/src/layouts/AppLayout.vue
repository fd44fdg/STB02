<template>
  <n-layout has-sider style="height: 100vh;">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="logo" @click="goHome">
        <span class="logo-text">刷题宝 Admin</span>
      </div>
      <n-menu
        :value="activePath"
        :options="menuOptions"
        :collapsed="collapsed"
        @update:value="onSelect"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-header class="app-header" bordered>
        <div class="left">
          <n-breadcrumb>
            <n-breadcrumb-item v-for="b in breadcrumbs" :key="b.path">{{ b.meta?.title || b.path }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>
        <div class="right">
          <n-dropdown :options="userMenu" @select="onUserSelect">
            <div class="user-box">
              <img :src="userStore.avatar" class="avatar" />
              <span class="name" v-if="!collapsed">{{ userStore.nickname }}</span>
            </div>
          </n-dropdown>
        </div>
      </n-layout-header>
      <n-layout-content content-style="padding:16px; min-height:0;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NBreadcrumb, NBreadcrumbItem, NDropdown } from 'naive-ui'
// 图标库（已在 package.json 添加 @vicons/ionicons5）
// 若类型声明缺失，可用 any 断言避免阻塞开发
// eslint/ts 可后续通过自定义 d.ts 优化
// @ts-ignore
import { Home, Images, HelpCircle, Book, Apps, People, Settings } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const collapsed = ref(false)

const protectedRoot = computed(() => router.getRoutes().find(r => r.name === 'RootProtected'))

const iconMap: Record<string, any> = { Home, Images, HelpCircle, Book, Apps, People, Settings }

const menuOptions = computed(() => {
  const children = protectedRoot.value?.children || []
  return children
    .filter(r => !r.meta?.hidden)
    .filter(r => !r.meta?.roles || (r.meta?.roles as string[]).some(role => userStore.roles.includes(role)))
    .map(r => {
      const meta: any = r.meta || {}
      const key = r.path.startsWith('/') ? r.path : '/' + r.path
      const iconName = meta.icon as string | undefined
      return {
        key,
        label: meta.title || r.path,
        icon: iconName ? () => h(iconMap[iconName] || Home) : undefined
      }
    })
})

const activePath = computed(() => '/' + (route.path.split('/')[1] || ''))

function onSelect(key: string) {
  router.push(key)
}

function goHome() { router.push('/') }

const breadcrumbs = computed(() => route.matched.filter(r => r.meta && r.meta.title))

const userMenu = [
  { label: '个人信息', key: 'profile' },
  { type: 'divider' },
  { label: '退出登录', key: 'logout' }
]

function onUserSelect(key: string) {
  if (key === 'logout') {
    userStore.logout()
    router.replace('/login')
  } else if (key === 'profile') {
    // 预留: 跳转个人中心
  }
}
</script>

<style scoped>
.logo { height:56px; display:flex; align-items:center; padding:0 12px; font-weight:600; font-size:16px; cursor:pointer; }
.logo-text { white-space:nowrap; }
.app-header { display:flex; align-items:center; justify-content:space-between; padding:0 16px; }
.user-box { display:flex; align-items:center; gap:8px; cursor:pointer; }
.avatar { width:32px; height:32px; border-radius:50%; object-fit:cover; }
.name { font-size:14px; }
</style>
