<template>
	<view class="article-list">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-box" @click="goToSearch">
				<text class="search-icon">🔍</text>
				<text class="search-placeholder">搜索技术文章...</text>
			</view>
			<view class="filter-btn" @click="showFilterModal">
				<text class="filter-icon">⚙</text>
			</view>
		</view>
		
		<!-- 分类标签 -->
		<scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
			<view class="category-list">
				<view 
					v-for="category in categories" 
					:key="category.key"
					class="category-item" 
					:class="{active: selectedCategory === category.key}"
					@click="selectCategory(category.key)"
				>
					<text class="category-name">{{category.name}}</text>
					<text class="category-count">{{category.count}}</text>
				</view>
			</view>
		</scroll-view>
		
		<!-- 排序选项 -->
		<view class="sort-options">
			<view class="sort-left">
				<text class="article-count">共 {{filteredArticles.length}} 篇文章</text>
			</view>
			<view class="sort-right">
				<view 
					v-for="sort in sortOptions" 
					:key="sort.key"
					class="sort-item" 
					:class="{active: selectedSort === sort.key}"
					@click="selectSort(sort.key)"
				>
					<text class="sort-text">{{sort.name}}</text>
				</view>
			</view>
		</view>
		
		<!-- 文章列表 -->
		<view class="articles-container">
			<view v-if="loading" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="filteredArticles.length === 0" class="empty-container">
				<text class="empty-icon">📄</text>
				<text class="empty-text">暂无文章</text>
				<text class="empty-tip">换个分类试试吧</text>
			</view>
			
			<view v-else class="articles-list">
				<view 
					v-for="article in sortedArticles" 
					:key="article.id"
					class="article-item" 
					@click="goToArticleDetail(article)"
				>
					<!-- 文章封面图 -->
					<view class="article-cover">
						<image 
							v-if="article.coverImage" 
							:src="article.coverImage" 
							class="cover-image"
							mode="aspectFill"
						></image>
						<view v-else class="cover-placeholder">
							<text class="placeholder-icon">📄</text>
						</view>
						
						<!-- 文章标签 -->
						<view class="article-tags">
							<view class="tag-item category-tag" :style="{backgroundColor: getCategoryColor(article.category)}">
								<text class="tag-text">{{article.category}}</text>
							</view>
							<view v-if="article.isHot" class="tag-item hot-tag">
								<text class="tag-text">🔥 热门</text>
							</view>
							<view v-if="article.isNew" class="tag-item new-tag">
								<text class="tag-text">🆕 最新</text>
							</view>
						</view>
					</view>
					
					<!-- 文章内容 -->
					<view class="article-content">
						<view class="article-header">
							<text class="article-title">{{article.title}}</text>
							<view class="article-meta">
								<text class="meta-item">{{article.author}}</text>
								<text class="meta-separator">·</text>
								<text class="meta-item">{{formatDate(article.publishTime)}}</text>
							</view>
						</view>
						
						<view class="article-summary">
							<text class="summary-text">{{article.summary}}</text>
						</view>
						
						<view class="article-footer">
							<view class="article-stats">
								<view class="stat-item">
									<text class="stat-icon">👁</text>
									<text class="stat-text">{{formatNumber(article.viewCount)}}</text>
								</view>
								<view class="stat-item">
									<text class="stat-icon">👍</text>
									<text class="stat-text">{{formatNumber(article.likeCount)}}</text>
								</view>
								<view class="stat-item">
									<text class="stat-icon">💬</text>
									<text class="stat-text">{{formatNumber(article.commentCount)}}</text>
								</view>
							</view>
							
							<view class="read-info">
								<text class="read-time">{{article.readTime}}分钟阅读</text>
								<text class="read-arrow">›</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 加载更多 -->
		<view v-if="hasMore && !loading" class="load-more" @click="loadMore">
			<text class="load-more-text">加载更多</text>
		</view>
		
		<!-- 筛选弹窗 -->
		<view v-if="showFilter" class="filter-modal" @click="hideFilterModal">
			<view class="filter-content" @click.stop>
				<view class="filter-header">
					<text class="filter-title">筛选条件</text>
					<text class="filter-close" @click="hideFilterModal">×</text>
				</view>
				
				<view class="filter-section">
					<view class="section-title">
						<text class="title-text">文章类型</text>
					</view>
					<view class="filter-options">
						<view 
							v-for="type in articleTypes" 
							:key="type.key"
							class="filter-option" 
							:class="{active: selectedTypes.includes(type.key)}"
							@click="toggleType(type.key)"
						>
							<text class="option-text">{{type.name}}</text>
						</view>
					</view>
				</view>
				
				<view class="filter-section">
					<view class="section-title">
						<text class="title-text">难度等级</text>
					</view>
					<view class="filter-options">
						<view 
							v-for="level in difficultyLevels" 
							:key="level.key"
							class="filter-option" 
							:class="{active: selectedLevels.includes(level.key)}"
							@click="toggleLevel(level.key)"
						>
							<text class="option-text">{{level.name}}</text>
						</view>
					</view>
				</view>
				
				<view class="filter-actions">
					<view class="reset-btn" @click="resetFilter">
						<text class="btn-text">重置</text>
					</view>
					<view class="confirm-btn" @click="applyFilter">
						<text class="btn-text">确定</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loading: false,
				hasMore: true,
				selectedCategory: 'all',
				selectedSort: 'latest',
				showFilter: false,
				selectedTypes: [],
				selectedLevels: [],
				categories: [
					{ key: 'all', name: '全部', count: 156 },
					{ key: 'frontend', name: '前端开发', count: 45 },
					{ key: 'backend', name: '后端开发', count: 38 },
					{ key: 'mobile', name: '移动开发', count: 25 },
					{ key: 'ai', name: '人工智能', count: 22 },
					{ key: 'devops', name: 'DevOps', count: 18 },
					{ key: 'design', name: '设计', count: 8 }
				],
				sortOptions: [
					{ key: 'latest', name: '最新' },
					{ key: 'popular', name: '热门' },
					{ key: 'views', name: '浏览量' }
				],
				articleTypes: [
					{ key: 'tutorial', name: '教程' },
					{ key: 'experience', name: '经验分享' },
					{ key: 'news', name: '技术资讯' },
					{ key: 'interview', name: '面试题' }
				],
				difficultyLevels: [
					{ key: 'beginner', name: '入门' },
					{ key: 'intermediate', name: '进阶' },
					{ key: 'advanced', name: '高级' }
				],
				// 模拟文章数据
				articles: [
					{
						id: 1,
						title: 'Vue 3 Composition API 深度解析',
						summary: '详细介绍Vue 3中Composition API的使用方法、优势以及与Options API的区别，帮助开发者更好地理解和使用这一新特性。',
						author: '张三',
						category: 'frontend',
						type: 'tutorial',
						difficulty: 'intermediate',
						publishTime: '2024-01-15',
						readTime: 8,
						viewCount: 1250,
						likeCount: 89,
						commentCount: 23,
						isHot: true,
						isNew: false,
						coverImage: null
					},
					{
						id: 2,
						title: 'React Hooks 最佳实践指南',
						summary: '从useState到useEffect，从自定义Hook到性能优化，全面掌握React Hooks的使用技巧和最佳实践。',
						author: '李四',
						category: 'frontend',
						type: 'experience',
						difficulty: 'advanced',
						publishTime: '2024-01-12',
						readTime: 12,
						viewCount: 2100,
						likeCount: 156,
						commentCount: 45,
						isHot: true,
						isNew: false,
						coverImage: null
					},
					{
						id: 3,
						title: 'Node.js 微服务架构实战',
						summary: '基于Node.js构建微服务架构的完整指南，包括服务拆分、通信机制、监控和部署等关键环节。',
						author: '王五',
						category: 'backend',
						type: 'tutorial',
						difficulty: 'advanced',
						publishTime: '2024-01-10',
						readTime: 15,
						viewCount: 890,
						likeCount: 67,
						commentCount: 18,
						isHot: false,
						isNew: true,
						coverImage: null
					},
					{
						id: 4,
						title: 'CSS Grid 布局完全指南',
						summary: '从基础概念到高级技巧，全面掌握CSS Grid布局系统，创建复杂而灵活的网页布局。',
						author: '赵六',
						category: 'frontend',
						type: 'tutorial',
						difficulty: 'intermediate',
						publishTime: '2024-01-08',
						readTime: 10,
						viewCount: 1560,
						likeCount: 112,
						commentCount: 31,
						isHot: false,
						isNew: false,
						coverImage: null
					},
					{
						id: 5,
						title: 'Flutter 跨平台开发入门',
						summary: '零基础学习Flutter，从环境搭建到第一个应用，快速入门跨平台移动开发。',
						author: '孙七',
						category: 'mobile',
						type: 'tutorial',
						difficulty: 'beginner',
						publishTime: '2024-01-05',
						readTime: 6,
						viewCount: 780,
						likeCount: 45,
						commentCount: 12,
						isHot: false,
						isNew: true,
						coverImage: null
					}
				]
			}
		},
		computed: {
			filteredArticles() {
				let filtered = this.articles
				
				// 按分类筛选
				if (this.selectedCategory !== 'all') {
					filtered = filtered.filter(article => article.category === this.selectedCategory)
				}
				
				// 按类型筛选
				if (this.selectedTypes.length > 0) {
					filtered = filtered.filter(article => this.selectedTypes.includes(article.type))
				}
				
				// 按难度筛选
				if (this.selectedLevels.length > 0) {
					filtered = filtered.filter(article => this.selectedLevels.includes(article.difficulty))
				}
				
				return filtered
			},
			
			sortedArticles() {
				const articles = [...this.filteredArticles]
				
				switch (this.selectedSort) {
					case 'latest':
						return articles.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
					case 'popular':
						return articles.sort((a, b) => b.likeCount - a.likeCount)
					case 'views':
						return articles.sort((a, b) => b.viewCount - a.viewCount)
					default:
						return articles
				}
			}
		},
		onLoad() {
			this.loadArticles()
		},
		methods: {
			// 加载文章列表
			async loadArticles() {
				this.loading = true
				try {
					// 模拟API调用
					await this.simulateApiCall()
					// 文章数据已在data中定义
				} catch (error) {
					console.error('加载文章失败:', error)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			
			// 模拟API调用
			simulateApiCall() {
				return new Promise((resolve) => {
					setTimeout(resolve, 800)
				})
			},
			
			// 选择分类
			selectCategory(category) {
				this.selectedCategory = category
			},
			
			// 选择排序
			selectSort(sort) {
				this.selectedSort = sort
			},
			
			// 跳转到搜索页面
			goToSearch() {
				uni.navigateTo({
					url: '/pages/search/search'
				})
			},
			
			// 跳转到文章详情
			goToArticleDetail(article) {
				uni.navigateTo({
					url: `/pages/article/detail?id=${article.id}`
				})
			},
			
			// 显示筛选弹窗
			showFilterModal() {
				this.showFilter = true
			},
			
			// 隐藏筛选弹窗
			hideFilterModal() {
				this.showFilter = false
			},
			
			// 切换文章类型
			toggleType(type) {
				const index = this.selectedTypes.indexOf(type)
				if (index > -1) {
					this.selectedTypes.splice(index, 1)
				} else {
					this.selectedTypes.push(type)
				}
			},
			
			// 切换难度等级
			toggleLevel(level) {
				const index = this.selectedLevels.indexOf(level)
				if (index > -1) {
					this.selectedLevels.splice(index, 1)
				} else {
					this.selectedLevels.push(level)
				}
			},
			
			// 重置筛选
			resetFilter() {
				this.selectedTypes = []
				this.selectedLevels = []
			},
			
			// 应用筛选
			applyFilter() {
				this.hideFilterModal()
				// 筛选逻辑已在computed中处理
			},
			
			// 加载更多
			async loadMore() {
				if (this.loadingMore || !this.hasMore) return
				
				this.loadingMore = true
				this.page++
				
				try {
					// 调用API加载更多文章
					// const result = await getArticles({
					//   page: this.page,
					//   limit: this.limit,
					//   category: this.selectedCategory
					// });
					
					// 模拟API调用
					await new Promise(resolve => setTimeout(resolve, 1000))
					
					// 模拟更多文章数据
					const moreArticles = [
						{
							id: this.articleList.length + 1,
							title: `加载的新文章 ${this.page}`,
							summary: '这是通过加载更多功能获取的新文章内容...',
							author: '系统',
							publishTime: new Date().toISOString(),
							readCount: Math.floor(Math.random() * 1000),
							likeCount: Math.floor(Math.random() * 100),
							coverImage: '/static/images/article-default.jpg'
						}
					]
					
					this.articleList.push(...moreArticles)
					
					// 检查是否还有更多数据
					if (this.page >= 5) { // 模拟最多5页数据
						this.hasMore = false
						uni.showToast({
							title: '没有更多内容了',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('加载更多失败:', error)
					this.page-- // 回滚页码
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					})
				} finally {
					this.loadingMore = false
				}
			},
			
			// 获取分类颜色
			getCategoryColor(category) {
				const colorMap = {
					frontend: '#4A90E2',
					backend: '#52C41A',
					mobile: '#FA8C16',
					ai: '#722ED1',
					devops: '#13C2C2',
					design: '#EB2F96'
				}
				return colorMap[category] || '#999999'
			},
			
			// 格式化日期
			formatDate(dateString) {
				const date = new Date(dateString)
				const now = new Date()
				const diff = now - date
				const days = Math.floor(diff / (1000 * 60 * 60 * 24))
				
				if (days === 0) {
					return '今天'
				} else if (days === 1) {
					return '昨天'
				} else if (days < 7) {
					return `${days}天前`
				} else {
					return dateString
				}
			},
			
			// 格式化数字
			formatNumber(num) {
				if (num >= 1000) {
					return (num / 1000).toFixed(1) + 'k'
				}
				return num.toString()
			}
		}
	}
</script>

<style scoped>
	.article-list {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	/* 搜索头部 */
	.search-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		gap: 20rpx;
	}
	
	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		border-radius: 25rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.search-icon {
		font-size: 32rpx;
		color: #999999;
		margin-right: 15rpx;
	}
	
	.search-placeholder {
		font-size: 28rpx;
		color: #999999;
	}
	
	.filter-btn {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		border-radius: 50%;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.filter-icon {
		font-size: 32rpx;
		color: #4A90E2;
	}
	
	/* 分类标签 */
	.category-scroll {
		margin-bottom: 30rpx;
	}
	
	.category-list {
		display: flex;
		white-space: nowrap;
		padding: 0 10rpx;
	}
	
	.category-item {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 30rpx;
		margin-right: 20rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		border: 2rpx solid #e9ecef;
		min-width: 120rpx;
		transition: all 0.3s ease;
	}
	
	.category-item.active {
		background-color: #4A90E2;
		border-color: #4A90E2;
	}
	
	.category-name {
		font-size: 26rpx;
		color: #333333;
		font-weight: bold;
		margin-bottom: 5rpx;
	}
	
	.category-item.active .category-name {
		color: #ffffff;
	}
	
	.category-count {
		font-size: 20rpx;
		color: #999999;
	}
	
	.category-item.active .category-count {
		color: rgba(255, 255, 255, 0.8);
	}
	
	/* 排序选项 */
	.sort-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.sort-left {
		flex: 1;
	}
	
	.article-count {
		font-size: 24rpx;
		color: #999999;
	}
	
	.sort-right {
		display: flex;
		gap: 20rpx;
	}
	
	.sort-item {
		padding: 12rpx 20rpx;
		background-color: #f8f9fa;
		border-radius: 16rpx;
		border: 1rpx solid #e9ecef;
		transition: all 0.3s ease;
	}
	
	.sort-item.active {
		background-color: #4A90E2;
		border-color: #4A90E2;
	}
	
	.sort-text {
		font-size: 22rpx;
		color: #666666;
	}
	
	.sort-item.active .sort-text {
		color: #ffffff;
	}
	
	/* 文章列表 */
	.articles-container {
		margin-bottom: 30rpx;
	}
	
	.loading-container,
	.empty-container {
		padding: 100rpx 0;
		text-align: center;
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.empty-icon {
		font-size: 80rpx;
		color: #cccccc;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999999;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.empty-tip {
		font-size: 24rpx;
		color: #cccccc;
		display: block;
	}
	
	.articles-list {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}
	
	/* 文章项 */
	.article-item {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
		transition: transform 0.3s ease;
	}
	
	.article-item:active {
		transform: scale(0.98);
	}
	
	/* 文章封面 */
	.article-cover {
		position: relative;
		height: 300rpx;
		overflow: hidden;
	}
	
	.cover-image {
		width: 100%;
		height: 100%;
	}
	
	.cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.placeholder-icon {
		font-size: 80rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.article-tags {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		display: flex;
		gap: 10rpx;
	}
	
	.tag-item {
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
		backdrop-filter: blur(10rpx);
	}
	
	.category-tag {
		background-color: rgba(255, 255, 255, 0.9);
	}
	
	.hot-tag {
		background-color: rgba(255, 87, 34, 0.9);
	}
	
	.new-tag {
		background-color: rgba(76, 175, 80, 0.9);
	}
	
	.tag-text {
		font-size: 20rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.category-tag .tag-text {
		color: #333333;
	}
	
	/* 文章内容 */
	.article-content {
		padding: 30rpx;
	}
	
	.article-header {
		margin-bottom: 20rpx;
	}
	
	.article-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		line-height: 1.4;
		margin-bottom: 15rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.article-meta {
		display: flex;
		align-items: center;
	}
	
	.meta-item {
		font-size: 22rpx;
		color: #999999;
	}
	
	.meta-separator {
		margin: 0 10rpx;
		font-size: 22rpx;
		color: #cccccc;
	}
	
	.article-summary {
		margin-bottom: 25rpx;
	}
	
	.summary-text {
		font-size: 26rpx;
		color: #666666;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.article-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.article-stats {
		display: flex;
		gap: 30rpx;
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	
	.stat-icon {
		font-size: 24rpx;
	}
	
	.stat-text {
		font-size: 22rpx;
		color: #999999;
	}
	
	.read-info {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}
	
	.read-time {
		font-size: 22rpx;
		color: #4A90E2;
	}
	
	.read-arrow {
		font-size: 28rpx;
		color: #4A90E2;
	}
	
	/* 加载更多 */
	.load-more {
		padding: 30rpx;
		text-align: center;
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.load-more-text {
		font-size: 28rpx;
		color: #4A90E2;
	}
	
	/* 筛选弹窗 */
	.filter-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: flex-end;
	}
	
	.filter-content {
		width: 100%;
		max-height: 80vh;
		background-color: #ffffff;
		border-radius: 20rpx 20rpx 0 0;
		padding: 30rpx;
		overflow-y: auto;
	}
	
	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #e9ecef;
	}
	
	.filter-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.filter-close {
		font-size: 40rpx;
		color: #999999;
		padding: 10rpx;
	}
	
	.filter-section {
		margin-bottom: 40rpx;
	}
	
	.section-title {
		margin-bottom: 20rpx;
	}
	
	.title-text {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.filter-options {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}
	
	.filter-option {
		padding: 15rpx 25rpx;
		background-color: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 20rpx;
		transition: all 0.3s ease;
	}
	
	.filter-option.active {
		background-color: #4A90E2;
		border-color: #4A90E2;
	}
	
	.option-text {
		font-size: 24rpx;
		color: #666666;
	}
	
	.filter-option.active .option-text {
		color: #ffffff;
	}
	
	.filter-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 40rpx;
	}
	
	.reset-btn,
	.confirm-btn {
		flex: 1;
		padding: 30rpx;
		border-radius: 16rpx;
		text-align: center;
	}
	
	.reset-btn {
		background-color: #f8f9fa;
		border: 2rpx solid #e9ecef;
	}
	
	.confirm-btn {
		background-color: #4A90E2;
	}
	
	.reset-btn .btn-text {
		color: #666666;
	}
	
	.confirm-btn .btn-text {
		color: #ffffff;
	}
	
	.btn-text {
		font-size: 28rpx;
		font-weight: bold;
	}
</style>