// 运行时配置（H5/uni-app 前端在启动时拉取 /api/v1/system/config）
import request from './request'

const STORAGE_KEY = 'runtime_config'
let cache = null

function get() {
  if (cache) return cache
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    cache = raw || null
    return cache
  } catch (_) {
    return null
  }
}

function set(cfg) {
  cache = cfg || null
  try {
    uni.setStorageSync(STORAGE_KEY, cache)
  } catch (_) {}
}

async function loadFromServer() {
  try {
    const res = await request.get('/system/config', {}, { loading: false })
    if (res && res.success) {
      set(res.data || {})
      return res.data || {}
    }
  } catch (_) {}
  // 回退本地
  return get() || {}
}

function getValue(path, def) {
  const data = get() || {}
  try {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), data) ?? def
  } catch (_) {
    return def
  }
}

async function init() {
  return loadFromServer()
}

export default {
  init,
  get,
  set,
  getValue
}
