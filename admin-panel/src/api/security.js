import request from '@/utils/request'

/**
 * 修改当前登录用户的密码
 * @param {object} data 包含 currentPassword 和 newPassword
 */
export function changePassword(data) {
  return request({
    url: '/users/password',
    method: 'put',
    data
  })
}

// 发送找回密码验证码
export function sendResetPasswordCode(email) {
  return request({
    url: '/users/send-reset-code',
    method: 'post',
    data: { email }
  })
}

// 验证找回密码验证码
export function verifyResetCode(data) {
  return request({
    url: '/users/verify-reset-code',
    method: 'post',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/users/reset-password',
    method: 'post',
    data
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 注销账号
export function deleteAccount(password) {
  return request({
    url: '/users/delete-account',
    method: 'post',
    data: { password }
  })
}

// 获取用户安全信息
export function getUserSecurityInfo() {
  return request({
    url: '/users/security-info',
    method: 'get'
  })
}

// 获取登录日志
export function getLoginLogs(params) {
  return request({
    url: '/users/login-logs',
    method: 'get',
    params
  })
}