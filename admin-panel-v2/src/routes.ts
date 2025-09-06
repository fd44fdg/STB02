import type { RouteRecordRaw } from 'vue-router'
import Login from './views/Login.vue'
import AppLayout from './layouts/AppLayout.vue'
import Dashboard from './views/Dashboard.vue'
import Banners from './views/banners/Banners.vue'
// 懒加载其它业务
const QuestionsList = () => import('./views/questions/QuestionsList.vue')
const KnowledgeCategories = () => import('./views/knowledge/KnowledgeCategories.vue')
const NavigationCategories = () => import('./views/navigation/NavigationCategories.vue')
const UsersList = () => import('./views/users/UsersList.vue')
const SystemSettings = () => import('./views/system/SystemSettings.vue')

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
    hidden?: boolean
  icon?: string
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: Login, meta: { title: '登录' } },
  {
    path: '/',
    name: 'RootProtected',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard, meta: { title: '仪表盘', requiresAuth: true, icon: 'Home', roles: ['admin','editor'] } },
      { path: 'banners', name: 'Banners', component: Banners, meta: { title: '轮播图', requiresAuth: true, roles: ['admin','editor'], icon: 'Images' } },
      { path: 'questions', name: 'Questions', component: QuestionsList, meta: { title: '题目管理', requiresAuth: true, roles: ['admin','editor'], icon: 'HelpCircle' } },
      { path: 'knowledge/categories', name: 'KnowledgeCategories', component: KnowledgeCategories, meta: { title: '知识点分类', requiresAuth: true, roles: ['admin','editor'], icon: 'Book' } },
  { path: 'navigation/categories', name: 'NavigationCategories', component: NavigationCategories, meta: { title: '导航分类', requiresAuth: true, roles: ['admin'], icon: 'Apps' } },
  { path: 'users', name: 'Users', component: UsersList, meta: { title: '用户管理', requiresAuth: true, roles: ['admin'], icon: 'People' } },
  { path: 'system/settings', name: 'SystemSettings', component: SystemSettings, meta: { title: '系统设置', requiresAuth: true, roles: ['admin'], icon: 'Settings' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default routes
