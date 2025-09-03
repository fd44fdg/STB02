import request from '@/utils/request'

/**
 * 获取用户列表
 * @param {object} params 查询参数，如 page, limit, keyword 等
 */
export function fetchUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

/**
 * 创建新用户
 * @param {object} data 用户数据
 */
export function createUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

/**
 * 获取单个用户详情
 * @param {number} id 用户ID
 */
export function fetchUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {number} id 用户ID
 * @param {object} data 用户数据
 */
export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {number} id 用户ID
 */
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

/**
 * 获取单个用户的统计信息
 * @param {number} id 用户ID
 */
export function fetchUserStats(id) {
  return request({
    url: `/users/${id}/stats`,
    method: 'get'
  })
}

/**
 * 获取系统统计数据
 */
export function fetchSystemStats() {
  return request({
    url: '/stats',
    method: 'get'
  })
}

/**
 * 获取最近活动记录
 */
export function fetchRecentActivities() {
  return request({
    url: '/activities',
    method: 'get'
  })
}

/**
 * 获取用户增长数据
 */
export function fetchUserGrowthData() {
  return request({
    url: '/stats/user-growth',
    method: 'get'
  })
}

/**
 * 获取分类分布数据
 */
export function fetchCategoryDistribution() {
  return request({
    url: '/stats/category-distribution',
    method: 'get'
  })
} 