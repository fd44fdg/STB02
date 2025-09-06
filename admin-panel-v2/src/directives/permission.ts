import type { Directive } from 'vue'
import { useUserStore } from '../stores/user'

// v-permission="['admin','editor']" - 无权限则移除元素
const permission: Directive<HTMLElement, string[] | string> = {
  mounted(el, binding) { apply(el, binding.value) },
  updated(el, binding) { apply(el, binding.value) }
}

function apply(el: HTMLElement, value: string[] | string) {
  const need = Array.isArray(value) ? value : (value ? [value] : [])
  if (!need.length) return
  const store = useUserStore()
  const pass = need.some(r => store.roles.includes(r))
  if (!pass) { el.parentNode && el.parentNode.removeChild(el) }
}

export default permission
