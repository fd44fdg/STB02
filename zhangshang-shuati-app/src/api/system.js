import request from '@/utils/request'

export function getRuntimeConfig() {
  return request.get('/system/config')
}

export function updateRuntimeConfig(payload) {
  return request.post('/system/config', payload)
}
