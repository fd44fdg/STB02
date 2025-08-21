import request from '@/utils/request';
import { adaptUserData, adaptUserStats, adaptCheckInData, adaptApiResponse } from '@/utils/dataAdapter';

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @returns {Promise}
 */
export function login(data) {
  return request.post('/auth/login', data);
}

/**
 * 用户注册
 * @param {Object} data 注册数据
 * @returns {Promise}
 */
export function register(data) {
  return request.post('/auth/register', data);
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request.get('/users/profile').then(response => {
    if (response.data) {
      response.data = adaptUserData(response.data);
    }
    return response;
  });
}

/**
 * 获取用户统计数据
 * @returns {Promise}
 */
export function getUserStats() {
  return request.get('/users/stats').then(response => {
    if (response.data) {
      response.data = adaptUserStats(response.data);
    }
    return response;
  });
}

/**
 * 签到
 * @returns {Promise}
 */
export function checkIn() {
  return request.post('/users/check-in').then(response => {
    if (response.data) {
      response.data = adaptCheckInData(response.data);
    }
    return response;
  });
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export function getCurrentUser() {
  return getUserInfo();
}

/**
 * 更新用户信息
 * @param {Object} userInfo 用户信息
 * @returns {Promise}
 */
export function updateUserInfo(userInfo) {
  return request.put('/users/profile', userInfo);
}

/**
 * 修改密码
 * @param {Object} passwordData 密码数据
 * @returns {Promise}
 */
export function changePassword(passwordData) {
  return request.post('/auth/change-password', passwordData);
}

/**
 * 获取签到状态
 * @returns {Promise}
 */
export function getCheckInStatus() {
  return request.get('/users/check-in-status').then(response => {
    if (response.data) {
      response.data = adaptCheckInData(response.data);
    }
    return response;
  });
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
  return request.post('/auth/logout');
}