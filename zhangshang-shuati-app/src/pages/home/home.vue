<template>
	<view class="home-container">
		<!-- 用户欢迎区域 -->
		<view class="welcome-section">
			<view class="welcome-card">
				<view class="user-info">
					<image class="avatar" :src="(userInfo && userInfo.avatar) || '/static/images/avatar-placeholder.png'" mode="aspectFill"></image>
					<view class="user-text">
						<text class="greeting">{{ greeting }}</text>
						<text class="username">{{ (userInfo && userInfo.nickname) || '未登录用户' }}</text>
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
				<view class="action-btn" :class="{ primary: activeButton === 'practice' }" @click="startPractice">
					<view class="btn-icon">📚</view>
					<view class="btn-text">
						<text class="btn-title">刷题练习</text>
						<text class="btn-desc">巩固知识点</text>
					</view>
				</view>
				<view class="action-btn" :class="{ primary: activeButton === 'exam' }" @click="startExam">
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
		
		<!-- 隐藏的调试按钮，双击10次显示 -->
		<view v-if="showDebugPanel" class="debug-panel">
			<text class="debug-title">前后端连接测试</text>
			<view class="debug-buttons">
				<button class="debug-btn" @click="testBackendConnection">测试后端连接</button>
				<button class="debug-btn" @click="testApiEndpoints">测试API接口</button>
				<button class="debug-btn" @click="testAuthSystem">测试认证系统</button>
				<button class="debug-btn" @click="clearDebugLogs">清除日志</button>
			</view>
			<view class="debug-logs">
				<text v-for="(log, index) in debugLogs" :key="index" class="debug-log">
					{{ log }}
				</text>
			</view>
		</view>
		
		<!-- 隐藏的调试触发器 -->
		<view class="debug-trigger" @click="handleDebugTrigger"></view>
	</view>
</template>

<script>
	import CheckIn from '@/components/CheckIn.vue';
	import { getUserStats } from '@/api/auth';
	import { getStatsSummary } from '@/api/stats';
	import { mapGetters } from 'vuex';
	
	export default {
		name: "Home",
		components: {
			CheckIn
		},
		data() {
			return {
				userStats: {
					continuousDays: 0
				},
				todayStats: {
					questionsCount: 0,
					correctRate: 0,
					studyTime: 0
				},
				activeButton: null, // 添加跟踪当前活跃按钮的状态
				knowledgeProgress: [],
				recentMistakes: [],
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
				],
				// 调试功能相关
				showDebugPanel: false,
				debugClickCount: 0,
				debugLogs: []
			}
		},
		computed: {
			...mapGetters('user', ['userInfo', 'isLoggedIn']),
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
			this.loadAllData()
		},
		onShow() {
			// 页面显示时重置活跃按钮状态
			this.activeButton = null
			console.log('页面显示，重置按钮状态')
			// 只有在用户登录时才刷新数据
			if (this.isLoggedIn) {
				this.refreshData()
			}
		},
		onPullDownRefresh() {
			// 下拉刷新
			if (this.isLoggedIn) {
				this.refreshData()
			}
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 1000)
		},
		methods: {
			// 加载所有数据
			async loadAllData() {
				if (!this.isLoggedIn) {
					console.warn('用户未登录，跳过数据加载');
					return;
				}
				
				try {
					await Promise.all([
						this.loadUserStats(),
						this.loadTodayStats(),
						this.loadKnowledgeProgress(),
						this.loadRecentMistakes()
					]);
				} catch (error) {
					console.error('加载数据失败:', error);
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
					});
				}
			},
			
			// 加载用户统计数据
			async loadUserStats() {
				try {
					const response = await getUserStats();
					if (response && response.code === 200 && response.data) {
						this.userStats = {
							continuousDays: response.data.continuousDays || 0,
							...response.data
						};
					}
				} catch (error) {
					console.error('加载用户统计失败:', error);
				}
			},
			
			// 加载今日统计
			async loadTodayStats() {
				try {
					const response = await getStatsSummary();
					if (response && response.code === 200 && response.data) {
						this.todayStats = {
							questionsCount: response.data.todayQuestions || 0,
							correctRate: response.data.todayCorrectRate || 0,
							studyTime: response.data.todayStudyTime || 0,
							...response.data
						};
					}
				} catch (error) {
					console.error('加载今日统计失败:', error);
				}
			},
			
			// 加载知识点进度
			async loadKnowledgeProgress() {
				try {
					// 如果有API接口，在这里调用
					// const response = await getKnowledgeProgress();
					// if (response && response.code === 200) {
					//     this.knowledgeProgress = response.data;
					// }
					
					// 临时使用模拟数据
					this.knowledgeProgress = [
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
					];
				} catch (error) {
					console.error('加载知识点进度失败:', error);
				}
			},
			
			// 加载最近错题
			async loadRecentMistakes() {
				try {
					// 如果有API接口，在这里调用
					// const response = await getRecentMistakes();
					// if (response && response.code === 200) {
					//     this.recentMistakes = response.data;
					// }
					
					// 临时使用模拟数据
					this.recentMistakes = [
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
					];
				} catch (error) {
					console.error('加载最近错题失败:', error);
				}
			},
			
			// 加载用户数据
			loadUserData() {
				// 这个方法现在由Vuex管理，不需要手动处理
			},
			
			// 刷新数据
			async refreshData() {
				await this.loadAllData();
			},
			
			// 开始练习
			startPractice() {
				// 设置活跃按钮
				this.activeButton = 'practice';
				
				// 添加调试日志
				console.log('跳转到刷题练习页面');
				
				// 跳转到练习页面
				uni.switchTab({
					url: '/pages/practice/practice',
					success: () => {
						console.log('跳转成功');
					},
					fail: (err) => {
						console.error('跳转失败:', err);
						uni.showToast({
							title: '跳转失败，请重试',
							icon: 'none'
						});
						// 重置活跃按钮
						this.activeButton = null;
					}
				});
			},
			
			// 开始考试
			startExam() {
				// 设置活跃按钮
				this.activeButton = 'exam';
				
				// 添加调试日志
				console.log('跳转到模拟考试页面');
				
				uni.switchTab({
					url: '/pages/exam/exam',
					success: () => {
						console.log('跳转成功');
					},
					fail: (err) => {
						console.error('跳转失败:', err);
						uni.showToast({
							title: '跳转失败，请重试',
							icon: 'none'
						});
						// 重置活跃按钮
						this.activeButton = null;
					}
				});
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
						// 热门题目 - 跳转到独立页面
						uni.navigateTo({
							url: '/pages/question/standalone?mode=popular',
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
						// 每日一题 - 跳转到独立页面
						uni.navigateTo({
							url: '/pages/question/standalone?mode=daily',
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
			},
					
			// 调试功能方法
			handleDebugTrigger() {
				this.debugClickCount++
				if (this.debugClickCount >= 10) {
					this.showDebugPanel = !this.showDebugPanel
					this.debugClickCount = 0
					this.addDebugLog('调试面板' + (this.showDebugPanel ? '开启' : '关闭'))
				}
				// 3秒后重置计数
				setTimeout(() => {
					this.debugClickCount = 0
				}, 3000)
			},
					
			addDebugLog(message) {
				const timestamp = new Date().toLocaleTimeString()
				this.debugLogs.unshift(`[${timestamp}] ${message}`)
				// 保持最多20条日志
				if (this.debugLogs.length > 20) {
					this.debugLogs.pop()
				}
			},
					
			clearDebugLogs() {
				this.debugLogs = []
				this.addDebugLog('日志已清除')
			},
					
			async testBackendConnection() {
				this.addDebugLog('开始测试后端连接...')
				try {
					// 先测试健康检查接口
					const healthUrl = 'http://localhost:3002/health'
					this.addDebugLog(`测试地址: ${healthUrl}`)
							
					const response = await uni.request({
						url: healthUrl,
						method: 'GET',
						timeout: 5000
					})
							
					if (response[1].statusCode === 200) {
						this.addDebugLog('✅ 后端连接成功')
						this.addDebugLog(`后端响应: ${JSON.stringify(response[1].data)}`)
					} else {
						this.addDebugLog(`❌ 后端连接失败: HTTP ${response[1].statusCode}`)
					}
				} catch (error) {
					this.addDebugLog(`❌ 后端连接错误: ${error.message || error}`)
				}
			},
					
			async testApiEndpoints() {
				this.addDebugLog('开始测试API接口...')
						
				try {
					// 导入request工具
					const request = require('@/utils/request.js').default
					this.addDebugLog(`API基础地址: ${request.baseUrl}`)
							
					// 测试根路径
					const rootResponse = await request.get('/')
					this.addDebugLog('✅ API根路径访问成功')
					this.addDebugLog(`根路径响应: ${JSON.stringify(rootResponse.data)}`)
							
				} catch (error) {
					this.addDebugLog(`❌ API测试失败: ${error.message || error}`)
					console.error('API测试错误:', error)
				}
			},
					
			async testAuthSystem() {
				this.addDebugLog('开始测试认证系统...')
						
				try {
					// 导入request工具
					const request = require('@/utils/request.js').default
							
					// 测试数据
					const testUser = {
						username: 'test_' + Date.now(),
						email: `test_${Date.now()}@example.com`,
						password: 'test123456',
						nickname: '测试用户'
					}
							
					// 1. 测试用户注册
					this.addDebugLog('步骤1: 测试用户注册...')
					try {
						const registerResponse = await request.post('/auth/register', testUser)
						this.addDebugLog('✅ 用户注册成功')
						this.addDebugLog(`注册响应: ${JSON.stringify(registerResponse.data || registerResponse)}`)
								
						// 2. 测试用户登录
						this.addDebugLog('步骤2: 测试用户登录...')
						const loginResponse = await request.post('/auth/login', {
							username: testUser.username,
							password: testUser.password
						})
						this.addDebugLog('✅ 用户登录成功')
						this.addDebugLog(`登录响应: ${JSON.stringify(loginResponse.data || loginResponse)}`)
								
						// 3. 保存token并测试获取用户信息
						if (loginResponse.data && loginResponse.data.token) {
							uni.setStorageSync('zs_token', loginResponse.data.token)
							this.addDebugLog('步骤3: 测试获取用户信息...')
									
							const userInfoResponse = await request.get('/users/profile')
							this.addDebugLog('✅ 获取用户信息成功')
							this.addDebugLog(`用户信息: ${JSON.stringify(userInfoResponse.data || userInfoResponse)}`)
						}
								
						this.addDebugLog('✅ 认证系统测试完成！')
								
					} catch (registerError) {
						this.addDebugLog(`❌ 注册失败: ${registerError.message || registerError}`)
								
						// 如果注册失败，尝试直接登录（可能用户已存在）
						this.addDebugLog('尝试使用默认测试账号登录...')
						const defaultLoginResponse = await request.post('/auth/login', {
							username: 'admin',
							password: 'admin123'
						})
						this.addDebugLog('✅ 默认账号登录成功')
						this.addDebugLog(`登录响应: ${JSON.stringify(defaultLoginResponse.data || defaultLoginResponse)}`)
					}
							
				} catch (error) {
					this.addDebugLog(`❌ 认证系统测试失败: ${error.message || error}`)
					console.error('认证系统测试错误:', error)
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
		background-color: #ffffff;
	}

	/* 确保uni-app的image组件在H5平台上正确显示图片 */
	.avatar img, .avatar uni-image, .avatar div {
		width: 100% !important;
		height: 100% !important;
		border-radius: 40rpx !important;
		object-fit: cover !important;
		background-size: cover !important;
		background-position: center center !important;
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
	
	/* 调试面板样式 */
	.debug-trigger {
		position: fixed;
		bottom: 200rpx;
		right: 40rpx;
		width: 80rpx;
		height: 80rpx;
		opacity: 0;
		z-index: 999;
	}
	
	.debug-panel {
		position: fixed;
		bottom: 300rpx;
		left: 20rpx;
		right: 20rpx;
		background-color: rgba(0, 0, 0, 0.9);
		border-radius: 16rpx;
		padding: 20rpx;
		z-index: 1000;
		max-height: 60vh;
		overflow-y: auto;
	}
	
	.debug-title {
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
		display: block;
	}
	
	.debug-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}
	
	.debug-btn {
		background-color: #007AFF;
		color: #fff;
		border: none;
		border-radius: 8rpx;
		padding: 12rpx 16rpx;
		font-size: 24rpx;
		flex: 1;
		min-width: 120rpx;
	}
	
	.debug-logs {
		max-height: 300rpx;
		overflow-y: auto;
		border-top: 1rpx solid #333;
		padding-top: 12rpx;
	}
	
	.debug-log {
		color: #ccc;
		font-size: 20rpx;
		line-height: 1.4;
		margin-bottom: 8rpx;
		display: block;
		word-break: break-all;
	}
</style>