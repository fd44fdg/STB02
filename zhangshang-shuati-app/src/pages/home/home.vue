<template>
	<view class="home-container">
		<!-- 用户欢迎区域 -->
		<view class="welcome-section">
			<view class="welcome-card">
				<view class="user-info">
					<image class="avatar" :src="userInfo.avatar || '/static/images/avatar-placeholder.png'" mode="aspectFill"></image>
					<view class="user-text">
						<text class="greeting">{{ greeting }}</text>
						<text class="username">{{ userInfo.nickname || '未登录用户' }}</text>
					</view>
				</view>
				<view class="streak-info">
					<text class="streak-number">{{ userStats.continuousDays || 0 }}</text>
					<text class="streak-label">连续学习天数</text>
				</view>
			</view>
		</view>

		<!-- 签到组件 -->
		<check-in></check-in>

		<!-- 今日统计 -->
		<view class="today-stats">
			<view class="stats-header">
				<text class="section-title">今日学习</text>
				<text class="date-text">{{ currentDate }}</text>
			</view>
			<view class="stats-grid">
				<view class="stats-item">
					<text class="stats-number">{{ todayStats.questionsCount }}</text>
					<text class="stats-label">已刷题数</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ todayStats.correctRate }}%</text>
					<text class="stats-label">正确率</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ todayStats.studyTime }}</text>
					<text class="stats-label">学习时长</text>
				</view>
			</view>
		</view>

		<!-- 快速开始 -->
		<view class="quick-start">
			<text class="section-title">快速开始</text>
			<view class="action-buttons">
				<view class="action-btn primary" @click="startPractice">
					<view class="btn-icon">📚</view>
					<view class="btn-text">
						<text class="btn-title">刷题练习</text>
						<text class="btn-desc">巩固知识点</text>
					</view>
				</view>
				<view class="action-btn secondary" @click="startExam">
					<view class="btn-icon">🎯</view>
					<view class="btn-text">
						<text class="btn-title">模拟考试</text>
						<text class="btn-desc">检验学习成果</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 知识点进度 -->
		<view class="knowledge-progress">
			<view class="section-header">
				<text class="section-title">学习进度</text>
				<text class="view-all" @click="viewAllProgress">查看全部</text>
			</view>
			<view class="progress-list">
				<view 
					v-for="item in knowledgeProgress" 
					:key="item.id"
					class="progress-item"
					@click="startKnowledgeStudy(item)"
				>
					<view class="progress-info">
						<text class="progress-title">{{ item.title }}</text>
						<view class="progress-bar">
							<view class="progress-fill" :style="{ width: item.progress + '%' }"></view>
						</view>
						<text class="progress-text">{{ item.progress }}% ({{ item.completedCount }}/{{ item.totalCount }})</text>
					</view>
					<view class="progress-action">
						<text class="continue-text">继续学习</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 最近错题 -->
		<view class="recent-mistakes" v-if="recentMistakes.length > 0">
			<view class="section-header">
				<text class="section-title">最近错题</text>
				<text class="view-all" @click="viewAllMistakes">错题本</text>
			</view>
			<view class="mistakes-list">
				<view 
					v-for="mistake in recentMistakes" 
					:key="mistake.id"
					class="mistake-item"
					@click="reviewMistake(mistake)"
				>
					<view class="mistake-content">
						<text class="mistake-title">{{ mistake.title }}</text>
						<text class="mistake-type">{{ mistake.type }}</text>
					</view>
					<view class="mistake-action">
						<text class="review-text">复习</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 推荐学习 -->
		<view class="recommendations">
			<text class="section-title">推荐学习</text>
			<view class="recommendation-list">
				<view 
					v-for="item in recommendations" 
					:key="item.id"
					class="recommendation-item"
					@click="startRecommendation(item)"
				>
					<view class="recommendation-icon">{{ item.icon }}</view>
					<view class="recommendation-content">
						<text class="recommendation-title">{{ item.title }}</text>
						<text class="recommendation-desc">{{ item.description }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import CheckIn from '@/components/CheckIn.vue';
	export default {
		name: "Home",
		components: {
			CheckIn
		},
		data() {
			return {
				userInfo: {
					nickname: "学习者",
					avatar: ""
				},
				userStats: {
					continuousDays: 7
				},
				todayStats: {
					questionsCount: 15,
					correctRate: 85,
					studyTime: 45
				},
				knowledgeProgress: [
					{
						id: 1,
						title: "JavaScript基础",
						progress: 75,
						completedCount: 30,
						totalCount: 40
					},
					{
						id: 2,
						title: "Vue.js框架",
						progress: 60,
						completedCount: 18,
						totalCount: 30
					},
					{
						id: 3,
						title: "CSS布局",
						progress: 40,
						completedCount: 12,
						totalCount: 30
					}
				],
				recentMistakes: [
					{
						id: 1,
						title: "JavaScript闭包的概念",
						type: "单选题"
					},
					{
						id: 2,
						title: "CSS Flexbox布局",
						type: "多选题"
					}
				],
				recommendations: [
					{
						id: 1,
						icon: "🔥",
						title: "热门题目",
						description: "最受欢迎的练习题目"
					},
					{
						id: 2,
						icon: "⭐",
						title: "每日一题",
						description: "精选每日挑战题目"
					},
					{
						id: 3,
						icon: "📖",
						title: "知识点复习",
						description: "系统化复习重点知识"
					}
				]
			}
		},
		computed: {
			greeting() {
				const hour = new Date().getHours()
				if (hour < 6) return "深夜好"
				if (hour < 9) return "早上好"
				if (hour < 12) return "上午好"
				if (hour < 14) return "中午好"
				if (hour < 17) return "下午好"
				if (hour < 19) return "傍晚好"
				return "晚上好"
			},
			currentDate() {
				const now = new Date()
				const month = now.getMonth() + 1
				const day = now.getDate()
				return `${month}月${day}日`
			}
		},
		onLoad() {
			console.log("Home页面加载完成 - 触发编译")
			this.loadUserData()
			this.loadTodayStats()
		},
		onShow() {
			// 页面显示时刷新数据
			this.refreshData()
		},
		onPullDownRefresh() {
			// 下拉刷新
			this.refreshData()
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		methods: {
			// 加载用户数据
			loadUserData() {
				// 模拟加载用户数据
				const userData = uni.getStorageSync('userInfo')
				if (userData) {
					this.userInfo = userData
				}
			},
			
			// 加载今日统计
			loadTodayStats() {
				// 模拟从API加载今日统计数据
				// 实际项目中这里应该调用API
			},
			
			// 刷新数据
			refreshData() {
				this.loadUserData()
				this.loadTodayStats()
			},
			
			// 开始练习
			startPractice() {
				uni.switchTab({
					url: '/pages/practice/practice'
				})
			},
			
			// 开始考试
			startExam() {
				uni.switchTab({
					url: '/pages/exam/exam'
				})
			},
			
			// 查看全部进度
			viewAllProgress() {
				uni.navigateTo({
					url: '/pages/study-records/index'
				})
			},
			
			// 开始知识点学习
			startKnowledgeStudy(item) {
				uni.navigateTo({
					url: `/pages/practice/practice?category=${encodeURIComponent(item.title)}`
				})
			},
			
			// 查看全部错题
			viewAllMistakes() {
				uni.navigateTo({
					url: '/pages/wrong-questions/index'
				})
			},
			
			// 复习错题
			reviewMistake(mistake) {
				uni.navigateTo({
					url: `/pages/question/detail?id=${mistake.id}&from=mistakes`
				})
			},
			
			// 开始推荐学习
			startRecommendation(item) {
				// 显示加载提示
				uni.showLoading({
					title: '正在进入...'
				})
				
				switch(item.id) {
					case 1:
						// 热门题目 - 存储模式参数后使用switchTab跳转
						uni.setStorageSync('practiceMode', {
							mode: 'popular',
							autoStart: true
						})
						uni.switchTab({
							url: '/pages/practice/practice',
							success: () => {
								uni.hideLoading()
							},
							fail: (err) => {
								uni.hideLoading()
								console.error('跳转失败:', err)
								uni.showToast({
									title: '进入失败，请重试',
									icon: 'none'
								})
							}
						})
						break
					case 2:
						// 每日一题 - 存储模式参数后使用switchTab跳转
						uni.setStorageSync('practiceMode', {
							mode: 'daily',
							autoStart: true
						})
						uni.switchTab({
							url: '/pages/practice/practice',
							success: () => {
								uni.hideLoading()
							},
							fail: (err) => {
								uni.hideLoading()
								console.error('跳转失败:', err)
								uni.showToast({
									title: '进入失败，请重试',
									icon: 'none'
								})
							}
						})
						break
					case 3:
						// 知识点复习 - 跳转到专门的复习页面
						uni.navigateTo({
							url: '/pages/review/review',
							success: () => {
								uni.hideLoading()
							},
							fail: (err) => {
								uni.hideLoading()
								console.error('跳转失败:', err)
								uni.showToast({
									title: '进入失败，请重试',
									icon: 'none'
								})
							}
						})
						break
					default:
						uni.hideLoading()
						uni.showToast({
							title: '功能暂未开放',
							icon: 'none'
						})
				}
			}
		}
	}
</script>

<style>
	.home-container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 20rpx;
	}

	/* 欢迎区域 */
	.welcome-section {
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.welcome-card {
		background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
		border-radius: 16rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 40rpx;
		margin-right: 20rpx;
		border: 3rpx solid rgba(255, 255, 255, 0.3);
	}

	.user-text {
		display: flex;
		flex-direction: column;
	}

	.greeting {
		color: rgba(255, 255, 255, 0.9);
		font-size: 24rpx;
		margin-bottom: 4rpx;
	}

	.username {
		color: white;
		font-size: 32rpx;
		font-weight: bold;
	}

	.streak-info {
		text-align: center;
	}

	.streak-number {
		display: block;
		color: white;
		font-size: 48rpx;
		font-weight: bold;
	}

	.streak-label {
		color: rgba(255, 255, 255, 0.9);
		font-size: 24rpx;
	}

	/* 今日统计 */
	.today-stats {
		background-color: white;
		margin: 0 20rpx 20rpx;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.stats-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.date-text {
		font-size: 24rpx;
		color: #666;
	}

	.stats-grid {
		display: flex;
		justify-content: space-between;
	}

	.stats-item {
		text-align: center;
		flex: 1;
	}

	.stats-number {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #4A90E2;
		margin-bottom: 8rpx;
	}

	.stats-label {
		font-size: 24rpx;
		color: #666;
	}

	/* 快速开始 */
	.quick-start {
		margin: 0 20rpx 20rpx;
	}

	.action-buttons {
		display: flex;
		gap: 16rpx;
	}

	.action-btn {
		flex: 1;
		background-color: white;
		border-radius: 16rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
	}

	.action-btn.primary .btn-title,
	.action-btn.primary .btn-desc {
		color: white;
	}

	.btn-icon {
		font-size: 48rpx;
		margin-right: 16rpx;
	}

	.btn-text {
		display: flex;
		flex-direction: column;
	}

	.btn-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 4rpx;
	}

	.btn-desc {
		font-size: 22rpx;
		color: #666;
	}

	/* 知识点进度 */
	.knowledge-progress {
		background-color: white;
		margin: 0 20rpx 20rpx;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.view-all {
		font-size: 24rpx;
		color: #4A90E2;
	}

	.progress-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.progress-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
	}

	.progress-info {
		flex: 1;
	}

	.progress-title {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 8rpx;
		display: block;
	}

	.progress-bar {
		width: 100%;
		height: 8rpx;
		background-color: #f0f0f0;
		border-radius: 4rpx;
		margin-bottom: 8rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4A90E2 0%, #357ABD 100%);
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 22rpx;
		color: #666;
	}

	.progress-action {
		margin-left: 20rpx;
	}

	.continue-text {
		font-size: 24rpx;
		color: #4A90E2;
	}

	/* 最近错题 */
	.recent-mistakes {
		background-color: white;
		margin: 0 20rpx 20rpx;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.mistakes-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.mistake-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx;
		background-color: #fff7f7;
		border-radius: 12rpx;
		border-left: 4rpx solid #ff6b6b;
	}

	.mistake-content {
		flex: 1;
	}

	.mistake-title {
		font-size: 26rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 4rpx;
		display: block;
	}

	.mistake-type {
		font-size: 22rpx;
		color: #666;
	}

	.mistake-action {
		margin-left: 20rpx;
	}

	.review-text {
		font-size: 24rpx;
		color: #ff6b6b;
	}

	/* 推荐学习 */
	.recommendations {
		background-color: white;
		margin: 0 20rpx;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.recommendation-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.recommendation-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
	}

	.recommendation-icon {
		font-size: 32rpx;
		margin-right: 16rpx;
	}

	.recommendation-content {
		flex: 1;
	}

	.recommendation-title {
		font-size: 26rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 4rpx;
		display: block;
	}

	.recommendation-desc {
		font-size: 22rpx;
		color: #666;
	}
</style>