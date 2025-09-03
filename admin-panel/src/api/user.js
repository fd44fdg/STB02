import request from '@/utils/request'

// =================== Admin Authentication ===================

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/auth/verify',
    method: 'get'
  })
}

export function logout() {
  // 后端目前没有logout接口，但前端请求可以保留，方便未来扩展
  // 调用此接口后，前端的token会被清除，实现登出效果
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// =================== User Management by Admin ===================

/**
 * 获取用户列表（管理员）
 * @param {object} params - 查询参数，例如 { page, limit, keyword }
 */
export function getUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

/**
 * 创建用户（管理员）
 * @param {object} data - 用户数据
 */
export function createUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户（管理员）
 * @param {number} id - 用户ID
 * @param {object} data - 要更新的用户数据
 */
export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户（管理员）
 * @param {number} id - 用户ID
 */
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}