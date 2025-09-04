<template>
	<view class="profile-container">
		<!-- 用户卡片 -->
		<view class="user-card">
			<!-- 未登录状态 -->
			<view v-if="!isLoggedIn" class="login-prompt">
				<image class="avatar-placeholder" src="/static/images/avatar-placeholder.png" mode="aspectFill"></image>
				<text class="login-text">点击登录</text>
				<button class="login-btn" @click="goToLogin">立即登录</button>
			</view>
			
			<!-- 已登录状态 -->
			<view v-else class="user-info">
				<view class="user-header">
					<image class="avatar" :src="userInfo.avatar || '/static/images/avatar-placeholder.png'" mode="aspectFill"></image>
					<view class="user-details">
						<view class="nickname">{{ userInfo.nickname || '未设置昵称' }}</view>
						<view class="level">{{ userStats.level || 'LV.1 新手' }}</view>
						<view class="study-info">
							<text class="study-days">学习{{ userStats.totalDays || 0 }}天</text>
							<text class="total-questions">刷题{{ userStats.totalQuestions || 0 }}道</text>
						</view>
					</view>
					<button class="edit-btn" @click="goToEditProfile">
						<uni-icons type="gear" size="20" color="var(--text-secondary)"></uni-icons>
					</button>
				</view>
				
				<!-- 签到区域 -->
				<view class="check-in-section">
					<view class="check-in-card">
						<view class="check-in-info">
							<view class="check-in-title">每日签到</view>
							<view class="check-in-stats">
								<text class="total-days">累计签到 {{ checkInStatus.totalDays || 0 }} 天</text>
								<text class="continuous-days">连续签到 {{ checkInStatus.continuousDays || 0 }} 天</text>
							</view>
						</view>
						<button 
							class="check-in-btn" 
							:class="{ 'checked': checkInStatus.hasCheckedInToday, 'loading': checkInLoading }"
							@click="handleCheckIn"
							:disabled="checkInStatus.hasCheckedInToday || checkInLoading"
						>
							<text v-if="checkInLoading">签到中...</text>
							<text v-else-if="checkInStatus.hasCheckedInToday">已签到</text>
							<text v-else>签到</text>
						</button>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 学习数据 - 仅登录后显示 -->
		<view class="data-section" v-if="isLoggedIn">
			<view class="section-title">学习数据</view>
			<view class="data-grid">
				<view class="data-item" @click="viewDetail('accuracy')">
					<view class="data-icon accuracy-icon">📊</view>
					<view class="data-info">
						<text class="data-title">正确率</text>
						<text class="data-value">{{userStats.correctRate || 0}}%</text>
					</view>
				</view>
				
				<view class="data-item" @click="viewDetail('streak')">
					<view class="data-icon streak-icon">🔥</view>
					<view class="data-info">
						<text class="data-title">连续学习</text>
						<text class="data-value">{{userStats.continuousDays || 0}}天</text>
					</view>
				</view>
				
				<view class="data-item" @click="viewDetail('rank')">
					<view class="data-icon rank-icon">🏆</view>
					<view class="data-info">
						<text class="data-title">排名</text>
						<text class="data-value">第{{userStats.rank || 0}}名</text>
					</view>
				</view>
				
				<view class="data-item" @click="viewDetail('points')">
					<view class="data-icon points-icon">⭐</view>
					<view class="data-info">
						<text class="data-title">积分</text>
						<text class="data-value">{{userStats.points || 0}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="section-title">功能菜单</view>
			<view class="menu-list">
				<view class="menu-item" @click="goToEditProfile">
					<view class="menu-icon">👤</view>
					<text class="menu-text">我的资料</text>
					<text class="menu-arrow">></text>
				</view>
				
				<view class="menu-item" @click="goToWrongQuestions()">
					<view class="menu-icon">❌</view>
					<text class="menu-text">我的错题本</text>
					<text class="menu-arrow">></text>
				</view>
				
				<view class="menu-item" @click="goToFavorites()">
					<view class="menu-icon">⭐</view>
					<text class="menu-text">我的收藏</text>
					<text class="menu-arrow">></text>
				</view>
				
				<view class="menu-item" @click="goToStudyRecords()">
					<view class="menu-icon">📝</view>
					<text class="menu-text">学习记录</text>
					<text class="menu-arrow">></text>
				</view>
				
				<view class="menu-item" @click="goToPage('achievements')">
					<view class="menu-icon">🏅</view>
					<text class="menu-text">我的成就</text>
					<text class="menu-arrow">></text>
				</view>
				
				<view class="menu-item" @click="goToPage('settings')">
					<view class="menu-icon">⚙️</view>
					<text class="menu-text">设置</text>
					<text class="menu-arrow">></text>
				</view>
				
				<view class="menu-item" @click="goToPage('feedback')">
					<view class="menu-icon">💬</view>
					<text class="menu-text">意见反馈</text>
					<text class="menu-arrow">></text>
				</view>
				
				<view class="menu-item" @click="goToPage('about')">
					<view class="menu-icon">ℹ️</view>
					<text class="menu-text">关于我们</text>
					<text class="menu-arrow">></text>
				</view>
				-->
				
				<!-- 登出选项 - 仅登录后显示 -->
				<view class="menu-item logout-item" v-if="isLoggedIn" @click="handleLogout">
					<view class="menu-icon">🚪</view>
					<text class="menu-text logout-text">退出登录</text>
					<text class="menu-arrow">></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getCurrentUser, getUserStats, checkIn, getCheckInStatus } from '@/api/auth.js'

export default {
	data() {
		return {
			isLoggedIn: false,
			userInfo: {},
			userStats: {},
			loading: false,
			checkInStatus: {
				totalDays: 0,
				continuousDays: 0,
				hasCheckedInToday: false
			},
			checkInLoading: false
		}
	},
		onLoad(options) {
			// 确保options对象存在，防止TypeError
			if (!options) {
				options = {}
			}
			console.log('Profile页面onLoad options:', options)
			this.checkLoginStatus();
		},
		onShow() {
			// 每次显示页面时检查登录状态
			this.checkLoginStatus();
			if (this.isLoggedIn) {
				this.loadCheckInStatus()
			}
		},
		methods: {
			// 检查登录状态
			async checkLoginStatus() {
				try {
					const token = uni.getStorageSync('user_token')
					
					if (!token) {
						this.isLoggedIn = false
						return
					}
					
					// 验证token并获取用户信息
					const userResult = await getCurrentUser(token)
					
					if (userResult.success) {
						this.isLoggedIn = true
						this.userInfo = userResult.userInfo
						
						// 获取用户统计数据
						this.loadUserStats(token)
						this.loadCheckInStatus()
					} else {
						// token无效，清除本地存储
						this.clearUserData()
					}
				} catch (error) {
					console.error('检查登录状态失败:', error)
					this.isLoggedIn = false
				}
			},
			
			// 加载用户统计数据
			async loadUserStats(token) {
				try {
					const statsResult = await getUserStats(token)
					
					if (statsResult.success && statsResult.stats) {
						this.userStats = statsResult.stats
					} else {
						// 使用默认统计数据
						this.userStats = this.getDefaultUserStats()
					}
				} catch (error) {
					console.error('加载用户统计数据失败，使用默认数据:', error)
					this.userStats = this.getDefaultUserStats()
				}
			},
			
			// 跳转到登录页面
			goToLogin() {
				uni.navigateTo({
					url: '/pages/auth/login'
				})
			},
			
			// 跳转到编辑资料页面
			goToEditProfile() {
				if (!this.isLoggedIn) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					this.goToLogin()
					return
				}
				
				uni.navigateTo({
					url: '/pages/profile/edit'
				})
			},
			
			// 处理登出
			async handleLogout() {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出登录吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const token = uni.getStorageSync('user_token')
								
								// 调用登出API
								await logout(token)
								
								// 清除本地数据
								this.clearUserData()
								
								uni.showToast({
									title: '已退出登录',
									icon: 'success'
								})
							} catch (error) {
								console.error('登出失败:', error)
								// 即使API调用失败，也清除本地数据
								this.clearUserData()
							}
						}
					}
				})
			},
			
			// 清除用户数据
			clearUserData() {
				uni.removeStorageSync('user_token')
				uni.removeStorageSync('user_info')
				uni.removeStorageSync('remembered_email')
				uni.removeStorageSync('remember_me')
				
				this.isLoggedIn = false
				this.userInfo = {}
				this.userStats = {}
			},
			viewDetail(type) {
				const titles = {
					accuracy: '正确率详情',
					streak: '连续学习记录',
					rank: '排名详情',
					points: '积分详情'
				};
				
				uni.showToast({
					title: `${titles[type]}功能开发中`,
					icon: 'none'
				});
			},
			
			// 加载签到状态
			async loadCheckInStatus() {
				try {
					const token = uni.getStorageSync('user_token')
					if (!token) return
					
					const result = await getCheckInStatus(token)
					if (result.success && result.data) {
						this.checkInStatus = result.data
					} else {
						// 使用默认签到状态
						this.checkInStatus = this.getDefaultCheckInStatus()
					}
				} catch (error) {
					console.error('获取签到状态失败，使用默认数据:', error)
					this.checkInStatus = this.getDefaultCheckInStatus()
				}
			},
			
			// 处理签到
			async handleCheckIn() {
				if (this.checkInStatus.hasCheckedInToday || this.checkInLoading) {
					return
				}
				
				this.checkInLoading = true
				
				try {
					const token = uni.getStorageSync('user_token')
					if (!token) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						})
						return
					}
					
					const result = await checkIn(token)
					if (result.success) {
						// 更新签到状态
						this.checkInStatus.totalDays = result.data.totalDays
						this.checkInStatus.continuousDays = result.data.continuousDays
						this.checkInStatus.hasCheckedInToday = true
						
						// 显示签到成功提示
						uni.showToast({
							title: `签到成功！获得${result.data.rewardPoints}积分`,
							icon: 'success',
							duration: 2000
						})
						
						// 刷新用户统计数据
						this.loadUserStats()
					} else {
						uni.showToast({
							title: result.message || '签到失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('签到失败:', error)
					uni.showToast({
						title: '签到失败，请重试',
						icon: 'none'
					})
				} finally {
					this.checkInLoading = false
				}
			},
			// 跳转到错题本
			goToWrongQuestions() {
				uni.navigateTo({
					url: '/pages/wrong-questions/index'
				})
			},
			
			// 跳转到收藏夹
			goToFavorites() {
				uni.navigateTo({
					url: '/pages/favorites/index'
				})
			},
			
			// 跳转到学习记录
			goToStudyRecords() {
				uni.navigateTo({
					url: '/pages/study-records/index'
				})
			},
			
			goToPage(page) {
				const routes = {
					achievements: '/pages/study/achievements',
					settings: '/pages/settings/index',
					feedback: '/pages/settings/feedback',
					about: '/pages/settings/about'
				};
				
				if (routes[page]) {
					uni.navigateTo({
						url: routes[page]
					});
				} else {
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					});
				}
			},
			
			// 获取默认用户统计数据
			getDefaultUserStats() {
				return {
					totalQuestions: 0,
					correctQuestions: 0,
					accuracy: 0,
					studyDays: 0,
					continuousStudyDays: 0,
					totalStudyTime: 0,
					points: 0,
					level: 1,
					levelProgress: 0,
					rank: 0
				}
			},
			
			// 获取默认签到状态
			getDefaultCheckInStatus() {
				return {
					totalDays: 0,
					continuousDays: 0,
					hasCheckedInToday: false
				}
			}
		}
	}
</script>

<style scoped>
	.profile-container {
		padding: 20rpx;
		background-color: var(--bg-color, #f5f5f5);
		min-height: 100vh;
	}
	
	/* 用户信息卡片 */
	.user-card {
		background: var(--card-bg, #ffffff);
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0,0,0,0.1));
	}
	
	.login-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	
	.avatar-placeholder {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin-bottom: 20rpx;
		background-color: var(--card-bg, #ffffff);
	}
	
	/* 确保uni-app的image组件在H5平台上正确显示图片 */
	.avatar-placeholder img, .avatar-placeholder uni-image, .avatar-placeholder div {
		width: 100% !important;
		height: 100% !important;
		border-radius: 50% !important;
		object-fit: cover !important;
		background-size: cover !important;
		background-position: center center !important;
	}
	
	.login-text {
		font-size: 32rpx;
		color: var(--text-secondary, #666);
		margin-bottom: 20rpx;
	}
	
	.login-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #ffffff;
		border: none;
		border-radius: 50rpx;
		padding: 20rpx 40rpx;
		font-size: 28rpx;
	}
	
	.user-info {
		width: 100%;
	}
	
	.user-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin-right: 30rpx;
		background-color: var(--card-bg, #ffffff);
	}
	
	/* 确保uni-app的image组件在H5平台上正确显示图片 */
	.avatar img, .avatar uni-image, .avatar div {
		width: 100% !important;
		height: 100% !important;
		border-radius: 50% !important;
		object-fit: cover !important;
		background-size: cover !important;
		background-position: center center !important;
	}
	
	.user-details {
		flex: 1;
	}
	
	.nickname {
		font-size: 36rpx;
		font-weight: bold;
		color: var(--text-primary, #333);
		margin-bottom: 10rpx;
	}
	
	.level {
		font-size: 28rpx;
		color: var(--text-secondary, #666);
		margin-bottom: 15rpx;
	}
	
	.study-info {
		display: flex;
		gap: 20rpx;
	}
	
	.study-days, .total-questions {
		font-size: 24rpx;
		color: var(--text-secondary, #999);
	}
	
	.edit-btn {
		background: var(--card-bg-2, #f5f5f5);
		border: none;
		border-radius: 50%;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	/* 签到功能样式 */
	.check-in-section {
		margin-top: 30rpx;
	}
	
	.check-in-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20rpx;
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.check-in-info {
		flex: 1;
	}
	
	.check-in-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 15rpx;
	}
	
	.check-in-stats {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.total-days, .continuous-days {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.check-in-btn {
		background: rgba(255, 255, 255, 0.2);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 50rpx;
		padding: 20rpx 30rpx;
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
		transition: all 0.3s ease;
	}
	
	.check-in-btn:not(:disabled):active {
		transform: scale(0.95);
	}
	
	.check-in-btn.checked {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		opacity: 0.7;
	}
	
	.check-in-btn.loading {
		opacity: 0.7;
	}
	
	.check-in-btn:disabled {
		opacity: 0.6;
	}
	
	.user-avatar {
		margin-right: 30rpx;
	}
	
	.avatar-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		border: 4rpx solid rgba(255,255,255,0.3);
	}
	
	.user-info {
		flex: 1;
	}
	
	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		display: block;
		margin-bottom: 8rpx;
	}
	
	.user-level {
		font-size: 24rpx;
		opacity: 0.8;
		display: block;
	}
	
	.user-stats {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.stat-item {
		text-align: center;
		margin-bottom: 15rpx;
	}
	
	.stat-item:last-child {
		margin-bottom: 0;
	}
	
	.stat-number {
		font-size: 32rpx;
		font-weight: bold;
		display: block;
		margin-bottom: 5rpx;
	}
	
	.stat-label {
		font-size: 20rpx;
		opacity: 0.8;
		display: block;
	}
	
	/* 学习数据 */
	.data-section {
		margin-bottom: 30rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: var(--text-primary, #333333);
		margin-bottom: 20rpx;
	}
	
	.data-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	
	.data-item {
		background-color: var(--card-bg, #ffffff);
		border-radius: 16rpx;
		padding: 30rpx 20rpx;
		width: 48%;
		margin-bottom: 20rpx;
		box-shadow: var(--shadow, 0 4rpx 12rpx rgba(0,0,0,0.1));
		display: flex;
		align-items: center;
	}
	
	.data-icon {
		font-size: 40rpx;
		margin-right: 20rpx;
	}
	
	.data-info {
		flex: 1;
	}
	
	.data-title {
		font-size: 24rpx;
		color: var(--text-secondary, #666666);
		display: block;
		margin-bottom: 8rpx;
	}
	
	.data-value {
		font-size: 28rpx;
		font-weight: bold;
		color: var(--accent, #4A90E2);
		display: block;
	}
	
	/* 功能菜单 */
	.menu-section {
		margin-bottom: 30rpx;
	}
	
	.menu-list {
		background-color: var(--card-bg, #ffffff);
		border-radius: 16rpx;
		box-shadow: var(--shadow, 0 4rpx 12rpx rgba(0,0,0,0.1));
		overflow: hidden;
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid var(--muted-border, #f0f0f0);
	}
	
	.menu-item:last-child {
		border-bottom: none;
	}
	
	.logout-item {
		border: 2rpx solid var(--danger, #ff4757);
		background: var(--danger-bg, #fff5f5);
	}
	
	.menu-icon {
		font-size: 40rpx;
		margin-right: 20rpx;
	}
	
	.menu-text {
		flex: 1;
		font-size: 28rpx;
		color: var(--text-primary, #333333);
	}
	
	.logout-text {
		color: var(--danger, #ff4757);
	}
	
	.menu-arrow {
		font-size: 24rpx;
		color: var(--text-secondary, #999999);
	}
</style>