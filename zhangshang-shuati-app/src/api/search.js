// 搜索相关API

// 模拟搜索数据
const mockSearchData = {
	// 知识点数据
	knowledge: [
		{
			id: 1,
			title: 'Vue 3 Composition API',
			description: 'Vue 3中的组合式API，提供更灵活的组件逻辑组织方式',
			category: 'Vue',
			difficulty: 'intermediate',
			tags: ['Vue3', 'Composition API', '前端'],
			type: 'knowledge'
		},
		{
			id: 2,
			title: 'React Hooks',
			description: 'React中的钩子函数，让函数组件拥有状态管理能力',
			category: 'React',
			difficulty: 'intermediate',
			tags: ['React', 'Hooks', '状态管理'],
			type: 'knowledge'
		},
		{
			id: 3,
			title: 'CSS Grid 布局',
			description: 'CSS网格布局系统，用于创建复杂的二维布局',
			category: 'CSS',
			difficulty: 'advanced',
			tags: ['CSS', 'Grid', '布局'],
			type: 'knowledge'
		},
		{
			id: 4,
			title: 'JavaScript 闭包',
			description: 'JavaScript中的闭包概念及其应用场景',
			category: 'JavaScript',
			difficulty: 'intermediate',
			tags: ['JavaScript', '闭包', '作用域'],
			type: 'knowledge'
		},
		{
			id: 5,
			title: 'Node.js 事件循环',
			description: 'Node.js的事件循环机制和异步处理',
			category: 'Node.js',
			difficulty: 'advanced',
			tags: ['Node.js', '事件循环', '异步'],
			type: 'knowledge'
		}
	],
	
	// 题目数据
	questions: [
		{
			id: 1,
			title: 'Vue 3中setup函数的作用是什么？',
			description: '请详细说明Vue 3 Composition API中setup函数的作用和使用方法',
			category: 'Vue',
			difficulty: 'intermediate',
			questionType: 'essay',
			tags: ['Vue3', 'setup', 'Composition API'],
			type: 'question'
		},
		{
			id: 2,
			title: 'React中useState的使用方法',
			description: '以下哪个是React中useState Hook的正确使用方法？',
			category: 'React',
			difficulty: 'beginner',
			questionType: 'choice',
			tags: ['React', 'useState', 'Hooks'],
			type: 'question'
		},
		{
			id: 3,
			title: 'CSS Grid与Flexbox的区别',
			description: '请比较CSS Grid和Flexbox的特点和适用场景',
			category: 'CSS',
			difficulty: 'intermediate',
			questionType: 'essay',
			tags: ['CSS', 'Grid', 'Flexbox'],
			type: 'question'
		},
		{
			id: 4,
			title: 'JavaScript闭包的应用场景',
			description: '以下哪些是JavaScript闭包的常见应用场景？',
			category: 'JavaScript',
			difficulty: 'intermediate',
			questionType: 'multiple',
			tags: ['JavaScript', '闭包', '应用'],
			type: 'question'
		},
		{
			id: 5,
			title: 'Node.js中的异步处理方式',
			description: '请列举Node.js中常用的异步处理方式',
			category: 'Node.js',
			difficulty: 'advanced',
			questionType: 'essay',
			tags: ['Node.js', '异步', 'Promise'],
			type: 'question'
		}
	],
	
	// 文章数据
	articles: [
		{
			id: 1,
			title: 'Vue 3 Composition API 深度解析',
			description: '详细介绍Vue 3中Composition API的使用方法、优势以及与Options API的区别',
			author: '张三',
			category: '前端开发',
			publishTime: '2024-01-15',
			readTime: 8,
			viewCount: 1250,
			likeCount: 89,
			tags: ['Vue3', 'Composition API', '前端'],
			type: 'article'
		},
		{
			id: 2,
			title: 'React Hooks 最佳实践指南',
			description: '从useState到useEffect，全面掌握React Hooks的使用技巧和最佳实践',
			author: '李四',
			category: '前端开发',
			publishTime: '2024-01-12',
			readTime: 12,
			viewCount: 2100,
			likeCount: 156,
			tags: ['React', 'Hooks', '最佳实践'],
			type: 'article'
		},
		{
			id: 3,
			title: 'CSS Grid 布局完全指南',
			description: '从基础概念到高级技巧，全面掌握CSS Grid布局系统',
			author: '王五',
			category: '前端开发',
			publishTime: '2024-01-10',
			readTime: 10,
			viewCount: 1560,
			likeCount: 112,
			tags: ['CSS', 'Grid', '布局'],
			type: 'article'
		},
		{
			id: 4,
			title: 'JavaScript 闭包深入理解',
			description: '深入探讨JavaScript闭包的原理、应用场景和注意事项',
			author: '赵六',
			category: '前端开发',
			publishTime: '2024-01-08',
			readTime: 6,
			viewCount: 890,
			likeCount: 67,
			tags: ['JavaScript', '闭包', '原理'],
			type: 'article'
		},
		{
			id: 5,
			title: 'Node.js 性能优化实战',
			description: 'Node.js应用性能优化的方法和技巧，提升服务器响应速度',
			author: '孙七',
			category: '后端开发',
			publishTime: '2024-01-05',
			readTime: 15,
			viewCount: 1200,
			likeCount: 98,
			tags: ['Node.js', '性能优化', '后端'],
			type: 'article'
		}
	]
}

// 热门搜索关键词
const hotSearchKeywords = [
	'Vue 3',
	'React Hooks',
	'JavaScript',
	'CSS Grid',
	'Node.js',
	'TypeScript',
	'Webpack',
	'前端面试',
	'算法',
	'数据结构'
]

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