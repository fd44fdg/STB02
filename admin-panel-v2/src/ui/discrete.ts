import { createDiscreteApi } from 'naive-ui'

// 全局离散调用，供非组件上下文（路由守卫、store等）使用
export const { message, dialog, notification, loadingBar } = createDiscreteApi([
  'message', 'dialog', 'notification', 'loadingBar'
])
