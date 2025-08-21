<template>
	<view class="review-container">
		<!-- 头部导航 -->
		<view class="review-header">
			<view class="back-button" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">知识点复习</text>
		</view>

		<!-- 进度概览 -->
		<view class="progress-overview">
			<view class="overview-card">
				<view class="overview-item">
					<text class="overview-number">{{ totalStudied }}</text>
					<text class="overview-label">已学习</text>
				</view>
				<view class="overview-item">
					<text class="overview-number">{{ totalKnowledge }}</text>
					<text class="overview-label">总知识点</text>
				</view>
				<view class="overview-item">
					<text class="overview-number">{{ Math.round(totalStudied / totalKnowledge * 100) }}%</text>
					<text class="overview-label">完成度</text>
				</view>
			</view>
		</view>

		<!-- 知识分类卡片 -->
		<view class="knowledge-categories">
			<view class="section-title">
				<ModernIcon type="practice" :size="24" :active="true" />
				<text class="title-text">选择复习领域</text>
			</view>
			
			<view class="categories-grid">
				<view 
					v-for="category in knowledgeCategories" 
					:key="category.id"
					class="category-card"
					:class="{ 'completed': category.progress >= 100 }"
					@click="enterCategory(category)"
				>
					<view class="card-header">
						<ModernIcon :type="category.icon" :size="32" :active="category.progress >= 100" />
						<view class="progress-badge">
							<text class="progress-text">{{ category.progress }}%</text>
						</view>
					</view>
					<view class="card-content">
						<text class="category-title">{{ category.title }}</text>
						<text class="category-desc">{{ category.description }}</text>
						<view class="knowledge-stats">
							<text class="stats-text">{{ category.completed }}/{{ category.total }} 知识点</text>
						</view>
					</view>
					<view class="card-footer">
						<view class="progress-bar">
							<view class="progress-fill" :style="{ width: category.progress + '%' }"></view>
						</view>
						<text class="status-text">{{ getStatusText(category.progress) }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 最近学习 -->
		<view class="recent-study">
			<view class="section-title">
				<ModernIcon type="favorite" :size="24" :active="true" />
				<text class="title-text">最近学习</text>
			</view>
			
			<view class="recent-list">
				<view 
					v-for="item in recentStudy" 
					:key="item.id"
					class="recent-item"
					@click="continueStudy(item)"
				>
					<view class="recent-icon">
						<ModernIcon :type="item.icon" :size="28" />
					</view>
					<view class="recent-content">
						<text class="recent-title">{{ item.title }}</text>
						<text class="recent-time">{{ item.lastStudy }}</text>
					</view>
					<view class="recent-progress">
						<text class="progress-num">{{ item.progress }}%</text>
						<view class="mini-progress">
							<view class="mini-fill" :style="{ width: item.progress + '%' }"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 快速复习 -->
		<view class="quick-review">
			<view class="section-title">
				<ModernIcon type="exam" :size="24" :active="true" />
				<text class="title-text">快速复习</text>
			</view>
			
			<view class="quick-actions">
				<view class="action-card" @click="startQuickReview('weak')">
					<view class="action-icon weak">
						<ModernIcon type="settings" :size="32" />
					</view>
					<text class="action-title">薄弱知识点</text>
					<text class="action-desc">针对掌握不牢的知识点</text>
				</view>
				
				<view class="action-card" @click="startQuickReview('random')">
					<view class="action-icon random">
						<ModernIcon type="search" :size="32" />
					</view>
					<text class="action-title">随机复习</text>
					<text class="action-desc">随机选择知识点复习</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import ModernIcon from '@/components/ModernIcon.vue'

export default {
	name: "Review",
	components: {
		ModernIcon
	},
	data() {
		return {
			totalStudied: 45,
			totalKnowledge: 120,
			knowledgeCategories: [
				{
					id: 1,
					title: "JavaScript基础",
					description: "变量、函数、作用域等基础概念",
					progress: 85,
					completed: 17,
					total: 20,
					icon: "practice"
				},
				{
					id: 2,
					title: "Vue.js框架",
					description: "组件、响应式、生命周期等",
					progress: 60,
					completed: 12,
					total: 20,
					icon: "exam"
				},
				{
					id: 3,
					title: "CSS布局",
					description: "Flexbox、Grid、定位等布局技术",
					progress: 40,
					completed: 8,
					total: 20,
					icon: "settings"
				},
				{
					id: 4,
					title: "HTTP协议",
					description: "请求响应、状态码、缓存等",
					progress: 75,
					completed: 15,
					total: 20,
					icon: "search"
				},
				{
					id: 5,
					title: "Node.js后端",
					description: "Express、中间件、数据库等",
					progress: 30,
					completed: 6,
					total: 20,
					icon: "favorite"
				},
				{
					id: 6,
					title: "数据结构算法",
					description: "数组、链表、排序、查找等",
					progress: 55,
					completed: 11,
					total: 20,
					icon: "profile"
				}
			],
			recentStudy: [
				{
					id: 1,
					title: "JavaScript闭包",
					lastStudy: "2小时前",
					progress: 80,
					icon: "practice"
				},
				{
					id: 2,
					title: "Vue组件通信",
					lastStudy: "昨天",
					progress: 65,
					icon: "exam"
				},
				{
					id: 3,
					title: "CSS Grid布局",
					lastStudy: "2天前",
					progress: 45,
					icon: "settings"
				}
			]
		}
	},
	methods: {
		goBack() {
			uni.switchTab({
				url: '/pages/home/home'
			})
		},
		
		getStatusText(progress) {
			if (progress >= 100) return '已完成'
			if (progress >= 70) return '进行中'
			if (progress >= 30) return '入门中'
			return '未开始'
		},
		
		enterCategory(category) {
			console.log('进入分类:', category.title)
			// 跳转到具体的知识点学习页面
			uni.navigateTo({
				url: `/pages/knowledge/detail?categoryId=${category.id}&title=${encodeURIComponent(category.title)}`
			})
		},
		
		continueStudy(item) {
			console.log('继续学习:', item.title)
			// 跳转到具体的知识点学习页面
			uni.navigateTo({
				url: `/pages/knowledge/detail?itemId=${item.id}&title=${encodeURIComponent(item.title)}`
			})
		},
		
		startQuickReview(type) {
			console.log('开始快速复习:', type)
			// 根据类型开始对应的复习模式
			let url = '/pages/practice/practice?mode=review'
			if (type === 'weak') {
				url += '&focus=weak'
			} else if (type === 'random') {
				url += '&focus=random'
			}
			
			uni.navigateTo({
				url: url
			})
		}
	}
}
</script>

<style scoped>
.review-container {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	padding-bottom: 20rpx;
}

/* 头部导航 */
.review-header {
	display: flex;
	align-items: center;
	padding: 40rpx 30rpx 30rpx;
	background: transparent;
}

.back-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.2);
	margin-right: 20rpx;
}

.back-icon {
	font-size: 32rpx;
	color: white;
	font-weight: bold;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: white;
}

/* 进度概览 */
.progress-overview {
	padding: 0 30rpx 30rpx;
}

.overview-card {
	background: rgba(255, 255, 255, 0.15);
	border-radius: 20rpx;
	padding: 30rpx;
	display: flex;
	justify-content: space-around;
	backdrop-filter: blur(10rpx);
}

.overview-item {
	text-align: center;
}

.overview-number {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: white;
	margin-bottom: 8rpx;
}

.overview-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}

/* 知识分类 */
.knowledge-categories {
	background: white;
	border-radius: 30rpx 30rpx 0 0;
	padding: 40rpx 30rpx 30rpx;
	margin-top: 20rpx;
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-left: 12rpx;
}

.categories-grid {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.category-card {
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid #f0f0f0;
	transition: all 0.3s ease;
}

.category-card.completed {
	border-color: #4A90E2;
	background: linear-gradient(135deg, #f8fbff 0%, #e8f4ff 100%);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.progress-badge {
	background: #4A90E2;
	color: white;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: bold;
}

.category-card.completed .progress-badge {
	background: #52c41a;
}

.card-content {
	margin-bottom: 20rpx;
}

.category-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
	display: block;
}

.category-desc {
	font-size: 24rpx;
	color: #666;
	line-height: 1.4;
	margin-bottom: 12rpx;
	display: block;
}

.knowledge-stats {
	background: #f8f9fa;
	padding: 8rpx 12rpx;
	border-radius: 8rpx;
	display: inline-block;
}

.stats-text {
	font-size: 22rpx;
	color: #4A90E2;
	font-weight: bold;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.progress-bar {
	flex: 1;
	height: 8rpx;
	background: #f0f0f0;
	border-radius: 4rpx;
	margin-right: 16rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #4A90E2 0%, #357ABD 100%);
	border-radius: 4rpx;
	transition: width 0.3s ease;
}

.category-card.completed .progress-fill {
	background: linear-gradient(90deg, #52c41a 0%, #389e0d 100%);
}

.status-text {
	font-size: 22rpx;
	color: #666;
	font-weight: bold;
}

/* 最近学习 */
.recent-study {
	background: white;
	padding: 30rpx;
}

.recent-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.recent-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	border-left: 4rpx solid #4A90E2;
}

.recent-icon {
	margin-right: 16rpx;
}

.recent-content {
	flex: 1;
}

.recent-title {
	font-size: 26rpx;
	color: #333;
	font-weight: bold;
	margin-bottom: 4rpx;
	display: block;
}

.recent-time {
	font-size: 22rpx;
	color: #999;
}

.recent-progress {
	text-align: right;
}

.progress-num {
	font-size: 22rpx;
	color: #4A90E2;
	font-weight: bold;
	display: block;
	margin-bottom: 4rpx;
}

.mini-progress {
	width: 60rpx;
	height: 4rpx;
	background: #f0f0f0;
	border-radius: 2rpx;
	overflow: hidden;
}

.mini-fill {
	height: 100%;
	background: #4A90E2;
	border-radius: 2rpx;
}

/* 快速复习 */
.quick-review {
	background: white;
	padding: 30rpx;
}

.quick-actions {
	display: flex;
	gap: 16rpx;
}

.action-card {
	flex: 1;
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	text-align: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid #f0f0f0;
}

.action-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 16rpx;
}

.action-icon.weak {
	background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
}

.action-icon.random {
	background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
}

.action-title {
	font-size: 26rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
	display: block;
}

.action-desc {
	font-size: 22rpx;
	color: #666;
	line-height: 1.4;
}
</style>