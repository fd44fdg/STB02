<template>
	<view class="achievements-container">
		<!-- 页面标题 -->
		<view class="header">
			<uni-icons type="medal" size="40" color="#FFD700"></uni-icons>
			<text class="header-title">我的成就</text>
			<text class="header-subtitle">记录你的每一个里程碑</text>
		</view>
		
		<!-- 成就统计 -->
		<view class="stats-section">
			<view class="stats-grid">
				<view class="stat-item">
					<text class="stat-number">{{ achievementStats.total }}</text>
					<text class="stat-label">总成就</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{ achievementStats.unlocked }}</text>
					<text class="stat-label">已解锁</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{ achievementStats.points }}</text>
					<text class="stat-label">成就积分</text>
				</view>
			</view>
		</view>
		
		<!-- 成就分类 -->
		<view class="category-tabs">
			<view 
				v-for="(category, index) in categories" 
				:key="index"
				class="category-tab"
				:class="{ active: activeCategory === category.value }"
				@click="switchCategory(category.value)"
			>
				<uni-icons :type="category.icon" size="18" :color="activeCategory === category.value ? '#fff' : '#4A90E2'"></uni-icons>
				<text class="tab-text">{{ category.text }}</text>
			</view>
		</view>
		
		<!-- 成就列表 -->
		<view class="achievements-list">
			<view 
				v-for="(achievement, index) in filteredAchievements" 
				:key="index"
				class="achievement-item"
				:class="{ unlocked: achievement.unlocked, featured: achievement.featured }"
				@click="viewAchievementDetail(achievement)"
			>
				<!-- 成就图标 -->
				<view class="achievement-icon">
					<uni-icons 
						:type="achievement.icon" 
						size="30" 
						:color="achievement.unlocked ? achievement.color : '#ccc'"
					></uni-icons>
					<view v-if="achievement.featured" class="featured-badge">
						<text>精选</text>
					</view>
				</view>
				
				<!-- 成就信息 -->
				<view class="achievement-info">
					<text class="achievement-title">{{ achievement.title }}</text>
					<text class="achievement-desc">{{ achievement.description }}</text>
					
					<!-- 进度条 -->
					<view v-if="!achievement.unlocked && achievement.progress !== undefined" class="progress-section">
						<view class="progress-bar">
							<view 
								class="progress-fill" 
								:style="{ width: achievement.progress + '%' }"
							></view>
						</view>
						<text class="progress-text">{{ achievement.current }}/{{ achievement.target }}</text>
					</view>
					
					<!-- 奖励信息 -->
					<view class="reward-info">
						<text class="reward-text">奖励：{{ achievement.reward }}积分</text>
						<text v-if="achievement.unlocked" class="unlock-date">{{ formatDate(achievement.unlockedAt) }}</text>
					</view>
				</view>
				
				<!-- 解锁状态 -->
				<view class="achievement-status">
					<view v-if="achievement.unlocked" class="unlocked-badge">
						<uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
					</view>
					<view v-else class="locked-badge">
						<uni-icons type="locked" size="16" color="#999"></uni-icons>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-if="filteredAchievements.length === 0" class="empty-state">
			<uni-icons type="info" size="40" color="#ccc"></uni-icons>
			<text class="empty-text">暂无相关成就</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			activeCategory: 'all',
			categories: [
				{ value: 'all', text: '全部', icon: 'list' },
				{ value: 'study', text: '学习', icon: 'book' },
				{ value: 'practice', text: '练习', icon: 'compose' },
				{ value: 'social', text: '社交', icon: 'person' },
				{ value: 'special', text: '特殊', icon: 'star' }
			],
			achievements: [
				// 学习类成就
				{
					id: 1,
					title: '初学者',
					description: '完成第一次练习',
					category: 'study',
					icon: 'star',
					color: '#FFD700',
					reward: 10,
					unlocked: true,
					unlockedAt: new Date('2024-01-15'),
					featured: false
				},
				{
					id: 2,
					title: '勤奋学习者',
					description: '连续学习7天',
					category: 'study',
					icon: 'calendar',
					color: '#4A90E2',
					reward: 50,
					unlocked: false,
					current: 3,
					target: 7,
					progress: 43,
					featured: true
				},
				{
					id: 3,
					title: '百题达人',
					description: '累计答题100道',
					category: 'practice',
					icon: 'medal',
					color: '#FF6B6B',
					reward: 100,
					unlocked: true,
					unlockedAt: new Date('2024-01-20'),
					featured: false
				},
				{
					id: 4,
					title: '准确射手',
					description: '单次练习正确率达到90%',
					category: 'practice',
					icon: 'checkmarkempty',
					color: '#34C759',
					reward: 30,
					unlocked: false,
					current: 85,
					target: 90,
					progress: 94,
					featured: false
				},
				{
					id: 5,
					title: '签到达人',
					description: '连续签到30天',
					category: 'social',
					icon: 'calendar',
					color: '#FF9500',
					reward: 200,
					unlocked: false,
					current: 12,
					target: 30,
					progress: 40,
					featured: true
				},
				{
					id: 6,
					title: '知识探索者',
					description: '学习5个不同科目',
					category: 'study',
					icon: 'search',
					color: '#8E44AD',
					reward: 80,
					unlocked: false,
					current: 2,
					target: 5,
					progress: 40,
					featured: false
				},
				{
					id: 7,
					title: '完美主义者',
					description: '连续10次练习正确率100%',
					category: 'special',
					icon: 'star-filled',
					color: '#FFD700',
					reward: 500,
					unlocked: false,
					current: 0,
					target: 10,
					progress: 0,
					featured: true
				},
				{
					id: 8,
					title: '夜猫子',
					description: '在晚上11点后学习',
					category: 'special',
					icon: 'moon',
					color: '#5856D6',
					reward: 20,
					unlocked: true,
					unlockedAt: new Date('2024-01-18'),
					featured: false
				}
			]
		}
	},
	computed: {
		// 过滤后的成就列表
		filteredAchievements() {
			if (this.activeCategory === 'all') {
				return this.achievements
			}
			return this.achievements.filter(achievement => achievement.category === this.activeCategory)
		},
		
		// 成就统计
		achievementStats() {
			const total = this.achievements.length
			const unlocked = this.achievements.filter(a => a.unlocked).length
			const points = this.achievements
				.filter(a => a.unlocked)
				.reduce((sum, a) => sum + a.reward, 0)
			
			return { total, unlocked, points }
		}
	},
	onLoad() {
		this.loadAchievements()
	},
	methods: {
		// 切换分类
		switchCategory(category) {
			this.activeCategory = category
		},
		
		// 查看成就详情
		viewAchievementDetail(achievement) {
			let content = `${achievement.description}\n\n奖励：${achievement.reward}积分`
			
			if (achievement.unlocked) {
				content += `\n\n解锁时间：${this.formatDate(achievement.unlockedAt)}`
			} else if (achievement.progress !== undefined) {
				content += `\n\n当前进度：${achievement.current}/${achievement.target} (${achievement.progress}%)`
			}
			
			uni.showModal({
				title: achievement.title,
				content: content,
				showCancel: false,
				confirmText: '知道了'
			})
		},
		
		// 加载成就数据
		loadAchievements() {
			// 这里可以从服务器加载用户的成就数据
			// 目前使用模拟数据
			console.log('加载成就数据')
		},
		
		// 格式化日期
		formatDate(date) {
			if (!date) return ''
			
			const now = new Date()
			const diff = now - date
			const days = Math.floor(diff / (1000 * 60 * 60 * 24))
			
			if (days === 0) {
				return '今天解锁'
			} else if (days === 1) {
				return '昨天解锁'
			} else if (days < 7) {
				return `${days}天前解锁`
			} else {
				return `${date.toLocaleDateString()}解锁`
			}
		}
	}
}
</script>

<style scoped>
.achievements-container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	text-align: center;
	padding: 40rpx 20rpx;
	background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
	border-radius: 16rpx;
	margin-bottom: 30rpx;
	color: white;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	margin: 20rpx 0 10rpx;
	display: block;
}

.header-subtitle {
	font-size: 28rpx;
	opacity: 0.9;
	display: block;
}

/* 成就统计 */
.stats-section {
	background-color: white;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
}

.stats-grid {
	display: flex;
	justify-content: space-around;
}

.stat-item {
	text-align: center;
	flex: 1;
}

.stat-number {
	font-size: 36rpx;
	font-weight: bold;
	color: #4A90E2;
	display: block;
	margin-bottom: 10rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
	display: block;
}

/* 分类标签 */
.category-tabs {
	display: flex;
	background-color: white;
	border-radius: 16rpx;
	padding: 10rpx;
	margin-bottom: 30rpx;
	gap: 10rpx;
}

.category-tab {
	flex: 1;
	padding: 20rpx 10rpx;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	transition: all 0.3s ease;
}

.category-tab.active {
	background-color: #4A90E2;
}

.tab-text {
	font-size: 22rpx;
	color: #333;
	margin-top: 8rpx;
}

.category-tab.active .tab-text {
	color: white;
}

/* 成就列表 */
.achievements-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.achievement-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background-color: white;
	border-radius: 16rpx;
	border: 2rpx solid #f0f0f0;
	transition: all 0.3s ease;
	position: relative;
	opacity: 0.6;
}

.achievement-item.unlocked {
	opacity: 1;
	border-color: #4A90E2;
	box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.1);
}

.achievement-item.featured {
	border-color: #FFD700;
	box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.2);
}

.achievement-item:active {
	transform: scale(0.98);
}

/* 成就图标 */
.achievement-icon {
	position: relative;
	margin-right: 20rpx;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f8f8f8;
	border-radius: 50%;
}

.achievement-item.unlocked .achievement-icon {
	background-color: rgba(74, 144, 226, 0.1);
}

.featured-badge {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	background-color: #FFD700;
	color: white;
	font-size: 18rpx;
	padding: 4rpx 8rpx;
	border-radius: 10rpx;
	transform: scale(0.8);
}

/* 成就信息 */
.achievement-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.achievement-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
	display: block;
}

.achievement-desc {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 15rpx;
	display: block;
	line-height: 1.4;
}

/* 进度条 */
.progress-section {
	margin-bottom: 15rpx;
}

.progress-bar {
	width: 100%;
	height: 8rpx;
	background-color: #f0f0f0;
	border-radius: 4rpx;
	overflow: hidden;
	margin-bottom: 8rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #4A90E2 0%, #357ABD 100%);
	border-radius: 4rpx;
	transition: width 0.3s ease;
}

.progress-text {
	font-size: 22rpx;
	color: #999;
}

/* 奖励信息 */
.reward-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.reward-text {
	font-size: 24rpx;
	color: #4A90E2;
	font-weight: 500;
}

.unlock-date {
	font-size: 22rpx;
	color: #999;
}

/* 解锁状态 */
.achievement-status {
	margin-left: 20rpx;
}

.unlocked-badge {
	width: 40rpx;
	height: 40rpx;
	background-color: #34C759;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.locked-badge {
	width: 40rpx;
	height: 40rpx;
	background-color: #f0f0f0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 80rpx 20rpx;
	background-color: white;
	border-radius: 16rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	margin-top: 20rpx;
	display: block;
}
</style>