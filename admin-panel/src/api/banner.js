import request from '@/utils/request'

// 管理后台 - 轮播图 API
export function fetchAdminBanners() {
  return request({
    url: '/banners/admin',
    method: 'get'
  })
}

export function createAdminBanner(data) {
  return request({
    url: '/banners/admin',
    method: 'post',
    data
  })
}

export function updateAdminBanner(id, data) {
  return request({
    url: `/banners/admin/${id}`,
    method: 'put',
    data
  })
}

export function deleteAdminBanner(id) {
  return request({
    url: `/banners/admin/${id}`,
    method: 'delete'
  })
}
