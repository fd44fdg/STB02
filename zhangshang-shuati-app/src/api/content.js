import request from '@/utils/request';

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=10] - 每页数量
 * @param {string} [params.sort='latest'] - 排序方式 (latest, popular)
 * @param {number} [params.category_id] - 分类ID
 * @returns {Promise<Object>}
 */
export function getArticles(params) {
    return request({
        url: '/articles',
        method: 'get',
        params,
    });
}

/**
 * 获取文章详情
 * @param {number} id - 文章ID
 * @returns {Promise<Object>}
 */
export function getArticleDetail(id) {
    return request({
        url: `/articles/${id}`,
        method: 'get',
    });
}

/**
 * 获取横幅广告列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>}
 */
export function getBanners(params) {
    return request({
        url: '/banners',
        method: 'get',
        params,
    });
} 