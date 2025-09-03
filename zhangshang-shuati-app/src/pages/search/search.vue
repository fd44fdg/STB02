<template>
	<view class="search-container">
		<!-- 搜索头部 -->
		<view class="search-header">
			<view class="search-box">
				<view class="search-input-wrapper">
					<text class="search-icon">🔍</text>
					<input 
						class="search-input" 
						v-model="searchKeyword" 
						placeholder="搜索知识点、题目或文章"
						@input="onSearchInput"
						@confirm="handleSearch"
						confirm-type="search"
					/>
					<view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
						<text class="clear-icon">×</text>
					</view>
				</view>
				<view class="search-btn" @click="handleSearch">
					<text class="search-btn-text">搜索</text>
				</view>
			</view>
			
			<!-- 搜索过滤器 -->
			<scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
				<view class="filter-list">
					<view 
						v-for="filter in searchFilters" 
						:key="filter.key"
						class="filter-item" 
						:class="{active: selectedFilter === filter.key}"
						@click="selectFilter(filter.key)"
					>
						<text class="filter-text">{{filter.label}}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 搜索历史 -->
		<view v-if="!searchKeyword && searchHistory.length > 0" class="search-history">
			<view class="history-header">
				<text class="history-title">搜索历史</text>
				<text class="clear-history" @click="clearHistory">清空</text>
			</view>
			<view class="history-list">
				<view 
					v-for="(item, index) in searchHistory" 
					:key="index"
					class="history-item" 
					@click="selectHistoryItem(item)"
				>
					<text class="history-icon">🕒</text>
					<text class="history-text">{{item}}</text>
					<text class="delete-icon" @click.stop="deleteHistoryItem(index)">×</text>
				</view>
			</view>
		</view>
		
		<!-- 热门搜索 -->
		<view v-if="!searchKeyword" class="hot-search">
			<view class="hot-header">
				<text class="hot-title">热门搜索</text>
			</view>
			<view class="hot-list">
				<view 
					v-for="(item, index) in hotSearches" 
					:key="index"
					class="hot-item" 
					@click="selectHotSearch(item)"
				>
					<text class="hot-text">{{item}}</text>
				</view>
			</view>
		</view>
		
		<!-- 搜索结果 -->
		<view v-if="searchKeyword" class="search-results">
			<view v-if="loading" class="loading-container">
				<text class="loading-text">搜索中...</text>
			</view>
			
			<view v-else-if="searchResults.length === 0" class="empty-container">
				<text class="empty-icon">🔍</text>
				<text class="empty-text">未找到相关内容</text>
				<text class="empty-tip">试试其他关键词吧</text>
			</view>
			
			<view v-else class="results-list">
				<view class="results-header">
					<text class="results-count">找到 {{searchResults.length}} 个结果</text>
				</view>
				
				<view 
					v-for="item in filteredResults" 
					:key="item.id"
					class="result-item" 
					@click="handleResultClick(item)"
				>
					<view class="result-header">
						<view class="result-type" :style="{backgroundColor: getTypeColor(item.type)}">
							<text class="type-text">{{getTypeLabel(item.type)}}</text>
						</view>
						<view v-if="item.difficulty" class="difficulty-tag">
							<text class="difficulty-text">{{getDifficultyText(item.difficulty)}}</text>
						</view>
					</view>
					
					<view class="result-content">
						<text class="result-title">{{highlightKeyword(item.title)}}</text>
						<text class="result-description">{{highlightKeyword(item.description)}}</text>
					</view>
					
					<view class="result-footer">
						<view class="result-meta">
							<text class="meta-text">{{item.category}}</text>
							<text v-if="item.questionCount" class="meta-text">{{item.questionCount}}题</text>
							<text v-if="item.readTime" class="meta-text">{{item.readTime}}分钟阅读</text>
						</view>
						<text class="result-arrow">></text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 回到顶部按钮 -->
		<BackToTop v-if="searchResults.length > 5" />
	</view>
</template>

<script>
import BackToTop from '@/components/BackToTop/index.vue'
	import { searchKnowledge } from '@/api/knowledge.js'
	
	export default {
		components: {
			BackToTop
		},
		data() {
			return {
				searchKeyword: '',
				loading: false,
				searchResults: [],
				selectedFilter: 'all',
				searchFilters: [
					{ key: 'all', label: '全部' },
					{ key: 'knowledge', label: '知识点' },
					{ key: 'question', label: '题目' },
					{ key: 'article', label: '文章' }
				],
				searchHistory: [],
				hotSearches: [
					'JavaScript闭包',
					'CSS布局',
					'React Hooks',
					'Vue组件',
					'Node.js',
					'前端性能优化',
					'响应式设计',
					'Ajax请求'
				],
				// 搜索数据（从API获取）
				mockSearchData: []
			}
		},
		computed: {
			filteredResults() {
				if (this.selectedFilter === 'all') {
					return this.searchResults
				}
				return this.searchResults.filter(item => item.type === this.selectedFilter)
			}
		},
		onLoad() {
			this.loadSearchHistory()
		},
		methods: {
			// 处理搜索输入
			onSearchInput() {
				// 实时搜索（防抖处理）
				clearTimeout(this.searchTimer)
				this.searchTimer = setTimeout(() => {
					if (this.searchKeyword.trim()) {
						this.performSearch()
					}
				}, 500)
			},
			
			// 执行搜索
			async performSearch() {
				if (!this.searchKeyword.trim()) {
					uni.showToast({
						title: '请输入搜索关键词',
						icon: 'none'
					})
					return
				}
				
				this.loading = true
				this.searchResults = []
				
				try {
					// 调用搜索API
					const searchParams = {
						keyword: this.searchKeyword.trim(),
						type: this.selectedFilter,
						page: 1,
						limit: 20
					};
					
					// 调用搜索API
					const result = await this.searchContent(searchParams);
					if (result && result.data) {
						this.searchResults = result.data.list || [];
					} else {
						// 使用模拟数据
						await this.simulateSearch();
					}
					
					// 保存搜索历史
					this.saveSearchHistory(this.searchKeyword);
					
					if (this.searchResults.length === 0) {
						uni.showToast({
							title: '未找到相关内容',
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: `找到${this.searchResults.length}条结果`,
							icon: 'success'
						});
					}
				} catch (error) {
					// 搜索过程中发生错误
					this.searchResults = [];
					uni.showToast({
						title: '搜索失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			
			// 模拟搜索
			async simulateSearch() {
				return new Promise((resolve) => {
					setTimeout(() => {
						const keyword = this.searchKeyword.toLowerCase()
						this.searchResults = this.mockSearchData.filter(item => 
							item.title.toLowerCase().includes(keyword) ||
							item.description.toLowerCase().includes(keyword) ||
							item.category.toLowerCase().includes(keyword)
						)
						resolve()
					}, 800)
				})
			},
			
			// 清空搜索
			clearSearch() {
				this.searchKeyword = ''
				this.searchResults = []
			},
			
			// 选择过滤器
			selectFilter(filterKey) {
				this.selectedFilter = filterKey
			},
			
			// 选择历史搜索
			selectHistoryItem(keyword) {
				this.searchKeyword = keyword
				this.performSearch()
			},
			
			// 选择热门搜索
			selectHotSearch(keyword) {
				this.searchKeyword = keyword
				this.performSearch()
			},
			
			// 删除历史记录项
			deleteHistoryItem(index) {
				this.searchHistory.splice(index, 1)
				this.saveSearchHistoryToStorage()
			},
			
			// 清空历史记录
			clearHistory() {
				uni.showModal({
					title: '确认清空',
					content: '确定要清空所有搜索历史吗？',
					success: (res) => {
						if (res.confirm) {
							this.searchHistory = []
							this.saveSearchHistoryToStorage()
						}
					}
				})
			},
			
			// 保存搜索历史
			saveSearchHistory(keyword) {
				const index = this.searchHistory.indexOf(keyword)
				if (index > -1) {
					this.searchHistory.splice(index, 1)
				}
				this.searchHistory.unshift(keyword)
				
				// 限制历史记录数量
				if (this.searchHistory.length > 10) {
					this.searchHistory = this.searchHistory.slice(0, 10)
				}
				
				this.saveSearchHistoryToStorage()
			},
			
			// 加载搜索历史
			loadSearchHistory() {
				try {
					const history = uni.getStorageSync('searchHistory')
					if (history) {
						this.searchHistory = JSON.parse(history)
					}
				} catch (error) {
					console.error('加载搜索历史失败:', error)
				}
			},
			
			// 保存搜索历史到本地存储
			saveSearchHistoryToStorage() {
				try {
					uni.setStorageSync('searchHistory', JSON.stringify(this.searchHistory))
				} catch (error) {
					console.error('保存搜索历史失败:', error)
				}
			},
			
			// 搜索内容API调用
			async searchContent(params) {
				try {
					// 这里可以调用真实的搜索API
					// const response = await request({
					//   url: '/api/v1/search',
					//   method: 'GET',
					//   params: params
					// });
					// return response;
					
					// 暂时返回null，让调用方处理空结果
					return null;
				} catch (error) {
					throw error;
				}
			},
			
			// 处理搜索结果点击
			handleResultClick(item) {
				// 点击搜索结果的处理逻辑
				
				switch (item.type) {
					case 'knowledge':
						// 跳转到知识点详情
						uni.navigateTo({
							url: `/pages/knowledge/detail?id=${item.id}`
						})
						break
					case 'question':
						// 跳转到题目详情
						uni.navigateTo({
							url: `/pages/question/detail?id=${item.id}`
						})
						break
					case 'article':
						// 跳转到文章详情
						uni.navigateTo({
							url: `/pages/article/detail?id=${item.id}`
						})
						break
					default:
						uni.showToast({
							title: '功能开发中',
							icon: 'none'
						})
				}
			},
			
			// 获取类型颜色
			getTypeColor(type) {
				const colorMap = {
					knowledge: '#4A90E2',
					question: '#52C41A',
					article: '#FA8C16'
				}
				return colorMap[type] || '#999999'
			},
			
			// 获取类型标签
			getTypeLabel(type) {
				const labelMap = {
					knowledge: '知识点',
					question: '题目',
					article: '文章'
				}
				return labelMap[type] || '未知'
			},
			
			// 获取难度文本
			getDifficultyText(difficulty) {
				const difficultyMap = {
					1: '入门',
					2: '初级',
					3: '中级',
					4: '高级',
					5: '专家'
				}
				return difficultyMap[difficulty] || '未知'
			},
			
			// 高亮关键词
			highlightKeyword(text) {
				// 简单的高亮处理，实际项目中可以使用更复杂的高亮逻辑
				return text
			}
		}
	}
</script>

<style scoped>
	.search-container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	/* 搜索头部 */
	.search-header {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.search-box {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #f8f9fa;
		border-radius: 25rpx;
		padding: 0 20rpx;
		margin-right: 20rpx;
	}
	
	.search-icon {
		font-size: 32rpx;
		color: #999999;
		margin-right: 15rpx;
	}
	
	.search-input {
		flex: 1;
		height: 80rpx;
		font-size: 28rpx;
		color: #333333;
		background-color: transparent;
		border: none;
		outline: none;
	}
	
	.clear-btn {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #cccccc;
		border-radius: 50%;
	}
	
	.clear-icon {
		font-size: 24rpx;
		color: #ffffff;
	}
	
	.search-btn {
		padding: 20rpx 30rpx;
		background-color: #4A90E2;
		border-radius: 25rpx;
	}
	
	.search-btn-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	/* 过滤器 */
	.filter-scroll {
		margin-top: 20rpx;
	}
	
	.filter-list {
		display: flex;
		white-space: nowrap;
	}
	
	.filter-item {
		padding: 15rpx 30rpx;
		margin-right: 20rpx;
		background-color: #f8f9fa;
		border-radius: 20rpx;
		border: 2rpx solid transparent;
		transition: all 0.3s ease;
	}
	
	.filter-item.active {
		background-color: #4A90E2;
		border-color: #4A90E2;
	}
	
	.filter-text {
		font-size: 24rpx;
		color: #666666;
	}
	
	.filter-item.active .filter-text {
		color: #ffffff;
	}
	
	/* 搜索历史 */
	.search-history {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.history-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.clear-history {
		font-size: 24rpx;
		color: #999999;
	}
	
	.history-list {
		display: flex;
		flex-direction: column;
	}
	
	.history-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.history-item:last-child {
		border-bottom: none;
	}
	
	.history-icon {
		font-size: 28rpx;
		color: #999999;
		margin-right: 20rpx;
	}
	
	.history-text {
		flex: 1;
		font-size: 26rpx;
		color: #333333;
	}
	
	.delete-icon {
		font-size: 32rpx;
		color: #cccccc;
		padding: 10rpx;
	}
	
	/* 热门搜索 */
	.hot-search {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.hot-header {
		margin-bottom: 20rpx;
	}
	
	.hot-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.hot-list {
		display: flex;
		flex-wrap: wrap;
	}
	
	.hot-item {
		padding: 15rpx 25rpx;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		background-color: #f8f9fa;
		border-radius: 20rpx;
		border: 1rpx solid #e9ecef;
	}
	
	.hot-text {
		font-size: 24rpx;
		color: #666666;
	}
	
	/* 搜索结果 */
	.search-results {
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
	
	.results-list {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.results-header {
		margin-bottom: 30rpx;
	}
	
	.results-count {
		font-size: 24rpx;
		color: #999999;
	}
	
	.result-item {
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.result-item:last-child {
		border-bottom: none;
	}
	
	.result-header {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.result-type {
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
		margin-right: 15rpx;
	}
	
	.type-text {
		font-size: 20rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.difficulty-tag {
		padding: 8rpx 16rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border: 1rpx solid #e9ecef;
	}
	
	.difficulty-text {
		font-size: 20rpx;
		color: #666666;
	}
	
	.result-content {
		margin-bottom: 15rpx;
	}
	
	.result-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.result-description {
		font-size: 26rpx;
		color: #666666;
		line-height: 1.5;
		display: block;
	}
	
	.result-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.result-meta {
		display: flex;
		align-items: center;
	}
	
	.meta-text {
		font-size: 22rpx;
		color: #999999;
		margin-right: 20rpx;
	}
	
	.result-arrow {
		font-size: 24rpx;
		color: #cccccc;
	}
</style>