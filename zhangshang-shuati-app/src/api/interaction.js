import request from '@/utils/request'

/**
 * 获取文章的评论列表
 * @param {number} articleId - 文章ID
 * @param {Object} params - 分页等查询参数
 * @returns {Promise<Object>}
 */
export function getArticleComments(articleId, params) {
  return request({
    url: `/articles/${articleId}/comments`,
    method: 'get',
    params
  })
}

/**
 * 发表对文章的评论
 * @param {number} articleId - 文章ID
 * @param {{ content: string }} data - 评论内容
 * @returns {Promise<Object>}
 */
export function postArticleComment(articleId, data) {
  return request({
    url: `/articles/${articleId}/comments`,
    method: 'post',
    data
  })
}

/**
 * 处理用户交互（点赞/收藏）
 * @param {{ entityType: string, entityId: number, interactionType: 'like' | 'favorite' }} data
 * @returns {Promise<Object>}
 */
export function postInteraction(data) {
  return request({
    url: '/user/interactions',
    method: 'post',
    data
  })
}

/**
 * 获取用户的收藏列表
 * @param {Object} params - 分页等查询参数
 * @returns {Promise<Object>}
 */
export function getFavorites(params) {
  return request({
    url: '/user/favorites',
    method: 'get',
    params
  })
} 