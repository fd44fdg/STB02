// 搜索相关API

// 搜索数据结构（空状态，数据从API获取）
const mockSearchData = {
	// 知识点数据
	knowledge: [],
	
	// 题目数据
	questions: [],
	
	// 文章数据
	articles: []
}

// 热门搜索关键词（从API获取）
const hotSearchKeywords = []

/**
 * 搜索功能
 * @param {string} keyword - 搜索关键词
 * @param {string} type - 搜索类型：'all', 'knowledge', 'question', 'article'
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise} 搜索结果
 */
export function searchContent(keyword = '', type = 'all', page = 1, pageSize = 10) {
	return new Promise((resolve) => {
		setTimeout(() => {
			let results = []
			
			if (!keyword.trim()) {
				// 如果没有关键词，返回空结果
				resolve({
					data: [],
					total: 0,
					page,
					pageSize,
					hasMore: false
				})
				return
			}
			
			// 根据类型筛选数据源
			let dataSources = []
			if (type === 'all') {
				dataSources = [
					...mockSearchData.knowledge,
					...mockSearchData.questions,
					...mockSearchData.articles
				]
			} else if (type === 'knowledge') {
				dataSources = mockSearchData.knowledge
			} else if (type === 'question') {
				dataSources = mockSearchData.questions
			} else if (type === 'article') {
				dataSources = mockSearchData.articles
			}
			
			// 执行搜索
			const searchKeyword = keyword.toLowerCase()
			results = dataSources.filter(item => {
				// 在标题、描述、标签中搜索
				const titleMatch = item.title.toLowerCase().includes(searchKeyword)
				const descMatch = item.description.toLowerCase().includes(searchKeyword)
				const categoryMatch = item.category.toLowerCase().includes(searchKeyword)
				const tagsMatch = item.tags.some(tag => tag.toLowerCase().includes(searchKeyword))
				
				return titleMatch || descMatch || categoryMatch || tagsMatch
			})
			
			// 分页处理
			const total = results.length
			const startIndex = (page - 1) * pageSize
			const endIndex = startIndex + pageSize
			const paginatedResults = results.slice(startIndex, endIndex)
			const hasMore = endIndex < total
			
			resolve({
				data: paginatedResults,
				total,
				page,
				pageSize,
				hasMore
			})
		}, 500) // 模拟网络延迟
	})
}

/**
 * 获取热门搜索关键词
 * @returns {Promise} 热门搜索关键词列表
 */
export function getHotSearchKeywords() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				data: hotSearchKeywords
			})
		}, 200)
	})
}

/**
 * 获取搜索建议
 * @param {string} keyword - 输入的关键词
 * @returns {Promise} 搜索建议列表
 */
export function getSearchSuggestions(keyword) {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (!keyword.trim()) {
				resolve({ data: [] })
				return
			}
			
			// 从所有数据中提取相关建议
			const allData = [
				...mockSearchData.knowledge,
				...mockSearchData.questions,
				...mockSearchData.articles
			]
			
			const searchKeyword = keyword.toLowerCase()
			const suggestions = []
			
			// 收集匹配的标题和标签
			allData.forEach(item => {
				// 标题匹配
				if (item.title.toLowerCase().includes(searchKeyword)) {
					suggestions.push({
						text: item.title,
						type: item.type
					})
				}
				
				// 标签匹配
				item.tags.forEach(tag => {
					if (tag.toLowerCase().includes(searchKeyword)) {
						suggestions.push({
							text: tag,
							type: 'tag'
						})
					}
				})
			})
			
			// 去重并限制数量
			const uniqueSuggestions = suggestions
				.filter((item, index, self) => 
					self.findIndex(s => s.text === item.text) === index
				)
				.slice(0, 8)
			
			resolve({
				data: uniqueSuggestions
			})
		}, 300)
	})
}

/**
 * 保存搜索历史
 * @param {string} keyword - 搜索关键词
 */
export function saveSearchHistory(keyword) {
	if (!keyword.trim()) return
	
	try {
		// 获取现有历史记录
		let history = uni.getStorageSync('searchHistory') || []
		
		// 移除重复项
		history = history.filter(item => item !== keyword)
		
		// 添加到开头
		history.unshift(keyword)
		
		// 限制历史记录数量
		if (history.length > 20) {
			history = history.slice(0, 20)
		}
		
		// 保存到本地存储
		uni.setStorageSync('searchHistory', history)
	} catch (error) {
		console.error('保存搜索历史失败:', error)
	}
}

/**
 * 获取搜索历史
 * @returns {Array} 搜索历史列表
 */
export function getSearchHistory() {
	try {
		return uni.getStorageSync('searchHistory') || []
	} catch (error) {
		console.error('获取搜索历史失败:', error)
		return []
	}
}

/**
 * 清除搜索历史
 */
export function clearSearchHistory() {
	try {
		uni.removeStorageSync('searchHistory')
	} catch (error) {
		console.error('清除搜索历史失败:', error)
	}
}

/**
 * 删除单个搜索历史记录
 * @param {string} keyword - 要删除的关键词
 */
export function removeSearchHistoryItem(keyword) {
	try {
		let history = uni.getStorageSync('searchHistory') || []
		history = history.filter(item => item !== keyword)
		uni.setStorageSync('searchHistory', history)
	} catch (error) {
		console.error('删除搜索历史失败:', error)
	}
}