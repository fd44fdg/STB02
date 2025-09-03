const express = require('express');
const { sendSuccess } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');
const searchService = require('../services/searchService');

const router = express.Router();

/**
 * @api {get} /search 全局搜索
 * @apiName GlobalSearch
 * @apiGroup Search
 * @apiVersion 1.0.0
 *
 * @apiParam {String} keyword 搜索关键词.
 * @apiParam {String} [type] 搜索类型 (all, knowledge, question, article). 默认为 'all'.
 * @apiParam {Number} [page=1] 页码.
 * @apiParam {Number} [limit=10] 每页数量.
 *
 * @apiSuccess {Object[]} results 搜索结果列表.
 * @apiSuccess {Number} total 结果总数.
 * @apiSuccess {Number} page 当前页码.
 * @apiSuccess {Number} limit 每页数量.
 * @apiSuccess {Boolean} hasMore 是否有更多结果.
 */
router.get('/', asyncHandler(async (req, res) => {
    const result = await searchService.globalSearch(req.query);
    sendSuccess(res, result);
}));

/**
 * @api {get} /search/hot-keywords 获取热门搜索词
 * @apiName GetHotKeywords
 * @apiGroup Search
 * @apiVersion 1.0.0
 *
 * @apiSuccess {String[]} keywords 热门关键词列表.
 */
router.get('/hot-keywords', (req, res) => {
    const keywords = searchService.getHotKeywords();
    sendSuccess(res, keywords);
});

module.exports = router;