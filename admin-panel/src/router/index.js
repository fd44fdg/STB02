import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      }
    ]
  },
  {
    path: '/navigation',
    component: Layout,
    meta: { title: '导航管理', icon: 'Menu' },
    children: [
      {
        path: 'categories',
        name: 'NavigationCategories',
        component: () => import('@/views/navigation/categories/index.vue'),
        meta: { title: '导航分类', icon: 'el-icon-menu' }
      }
    ]
  },
  {
    path: '/content',
    component: Layout,
    meta: { title: '内容管理', icon: 'Document' },
    children: [
      {
        path: 'banners',
        name: 'Banners',
        component: () => import('@/views/content/banners/index.vue'),
        meta: { title: '轮播图管理', icon: 'Picture' }
      },
      {
        path: 'ads',
        name: 'Ads',
        component: () => import('@/views/content/ads/index.vue'),
        meta: { title: '广告管理', icon: 'Promotion' }
      }
    ]
  },
  {
    path: '/knowledge',
    component: Layout,
    meta: { title: '知识点管理', icon: 'Reading' },
    children: [
      {
        path: 'points',
        name: 'KnowledgePoints',
        component: () => import('@/views/knowledge/points/index.vue'),
        meta: { title: '知识点列表', icon: 'Collection' }
      },
      {
        path: 'categories',
        name: 'KnowledgeCategories',
        component: () => import('@/views/knowledge/categories/index.vue'),
        meta: { title: '知识点分类', icon: 'Files' }
      }
    ]
  },
  {
    path: '/questions',
    component: Layout,
    meta: { title: '题目管理', icon: 'EditPen' },
    children: [
      {
        path: 'list',
        name: 'QuestionsList',
        component: () => import('@/views/questions/list/index.vue'),
        meta: { title: '题目列表', icon: 'List' }
      },
      {
        path: 'create',
        name: 'QuestionsCreate',
        component: () => import('@/views/questions/create/index.vue'),
        meta: { title: '创建题目', icon: 'Plus' }
      },
      {
        path: 'create-enhanced',
        name: 'QuestionsCreateEnhanced',
        component: () => import('@/views/questions/create/enhanced.vue'),
        meta: { title: '增强创建', icon: 'MagicStick' }
      },
      {
        path: 'edit/:id',
        name: 'QuestionsEdit',
        component: () => import('@/views/questions/edit/index.vue'),
        meta: { title: '编辑题目', icon: 'Edit' },
        hidden: true
      },
      {
        path: 'categories',
        name: 'QuestionsCategories',
        component: () => import('@/views/questions/categories/index.vue'),
        meta: { title: '题目分类', icon: 'Folder' }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    meta: { title: '用户管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'UsersList',
        component: () => import('@/views/users/list/index.vue'),
        meta: { title: '用户列表', icon: 'UserFilled' }
      },
      {
        path: 'stats',
        name: 'UsersStats',
        component: () => import('@/views/users/stats/index.vue'),
        meta: { title: '用户统计', icon: 'TrendCharts' }
      },
      {
        path: 'comments',
        name: 'UsersComments',
        component: () => import('@/views/users/comments/index.vue'),
        meta: { title: '用户评论', icon: 'ChatDotRound' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统设置', icon: 'Setting' },
    children: [
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/system/settings.vue'),
        meta: { title: '系统设置', icon: 'setting' }
      },
      {
          path: 'security',
          name: 'Security',
          component: () => import('@/views/security/index.vue'),
          meta: { title: '安全中心', icon: 'lock' }
        },
        {
          path: 'security/login-logs',
          name: 'LoginLogs',
          component: () => import('@/views/security/login-logs.vue'),
          meta: { title: '登录日志', icon: 'document' }
        }
    ]
  }
]

import { getToken } from '@/utils/auth' // 引入getToken

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
const whiteList = ['/login'] // 白名单，无需登录即可访问

router.beforeEach(async(to, from, next) => {
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，重定向到首页
      next({ path: '/' })
    } else {
      // 正常访问
      next()
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在白名单内，直接放行
      next()
    } else {
      // 其他无权限页面则重定向到登录页
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router