<template>
	<view class="login-container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-back" @click="goBack">
				<text class="back-icon">←</text>
				<text class="back-text">返回</text>
			</view>
			<text class="navbar-title">登录</text>
			<view class="navbar-placeholder"></view>
		</view>
		
		<!-- 页面内容区域 -->
		<view class="content-area">
			<!-- 顶部Logo区域 -->
			<view class="header-section">
			<view class="logo-container">
				<text class="logo-icon">📚</text>
				<text class="app-name">掌上刷题宝</text>
			</view>
			<text class="welcome-text">欢迎回来，开始你的学习之旅</text>
		</view>
		
		<!-- 微信登录区域 -->
		<view class="wechat-login-section">
			<view class="wechat-login-tip">
				<text class="tip-text">点击下方按钮，使用微信一键登录</text>
			</view>
			<button class="wechat-login-btn" @click="loginWithWechat" :disabled="isLoading">
				<text class="wechat-icon"></text>
				<text class="btn-text">{{isLoading ? '登录中...' : '微信一键登录'}}</text>
			</button>
			
			<!-- 用户协议和隐私政策 -->
			<view class="agreement-section">
				<text class="agreement-text">登录即表示同意</text>
				<text class="agreement-link" @click="goToUserAgreement">《用户服务协议》</text>
				<text class="agreement-text">和</text>
				<text class="agreement-link" @click="goToPrivacyPolicy">《隐私政策》</text>
			</view>
		</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isLoading: false
		}
	},
	methods: {
		// 微信登录
		async loginWithWechat() {
			this.isLoading = true
			uni.showLoading({
				title: '微信登录中...'
			})
			try {
				// 获取微信登录 code
				const [loginError, loginRes] = await uni.login({ provider: 'weixin' })
				if (loginError || !loginRes.code) {
					uni.showToast({
						title: '微信登录失败，请重试',
						icon: 'none'
					})
					return
				}
				const code = loginRes.code

				// 获取用户信息
				const [profileError, profileRes] = await uni.getUserProfile({
					desc: '用于完善用户资料' // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				})

				if (profileError) {
					uni.showToast({
						title: '已取消微信登录',
						icon: 'none'
					})
					return
				}

				// 将 code 和用户信息发送到后端进行登录/注册
				// 假设后端接口为 /api/auth/wechatLogin
				try {
					const response = await this.$http.post('/api/auth/wechatLogin', {
						code: code,
						userInfo: profileRes.userInfo
					})

					if (response.code === 200) {
						uni.setStorageSync('user_token', response.data.token)
						uni.setStorageSync('user_info', response.data.userInfo)
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1500)
					} else {
						uni.showToast({
							title: response.message || '登录失败',
							icon: 'none'
						})
					}
				} catch (apiError) {
					console.error('登录API调用失败，使用游客模式:', apiError)
					// API调用失败时，使用游客模式
					this.useGuestMode(profileRes.userInfo)
				}
			} catch (error) {
				console.error('微信登录失败:', error)
				uni.showToast({
					title: '网络错误或微信登录失败',
					icon: 'none'
				})
			} finally {
				this.isLoading = false
				uni.hideLoading()
			}
		},

		// 返回上一页
		goBack() {
			uni.navigateBack({
				delta: 1
			})
		},

		// 跳转到用户服务协议
		goToUserAgreement() {
			uni.navigateTo({
				url: '/pages/legal/user-agreement'
			})
		},

		// 跳转到隐私政策
		goToPrivacyPolicy() {
			uni.navigateTo({
				url: '/pages/legal/privacy-policy'
			})
		},
		
		// 游客模式登录
		useGuestMode(userInfo) {
			// 生成临时用户信息
			const guestUser = {
				id: 'guest_' + Date.now(),
				nickname: userInfo?.nickName || '游客用户',
				avatar: userInfo?.avatarUrl || '/static/images/default-avatar.png',
				isGuest: true
			}
			
			// 生成临时token
			const guestToken = 'guest_token_' + Date.now()
			
			// 保存到本地存储
			uni.setStorageSync('user_token', guestToken)
			uni.setStorageSync('user_info', guestUser)
			
			uni.showToast({
				title: '已进入游客模式',
				icon: 'success'
			})
			
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}, 1500)
		}
	}
}
</script>

<style scoped>
	.login-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	
	/* 自定义导航栏 */
	.custom-navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 30rpx;
		padding-top: var(--status-bar-height, 44rpx);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10rpx);
	}
	
	.navbar-back {
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 10rpx;
		border-radius: 10rpx;
		transition: all 0.3s ease;
	}
	
	.navbar-back:active {
		background: rgba(255, 255, 255, 0.2);
	}
	
	.back-icon {
		font-size: 32rpx;
		color: #ffffff;
		margin-right: 8rpx;
		font-weight: bold;
	}
	
	.back-text {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.navbar-title {
		font-size: 32rpx;
		color: #ffffff;
		font-weight: bold;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}
	
	.navbar-placeholder {
		width: 120rpx;
	}
	
	/* 页面内容区域 */
	.content-area {
		flex: 1;
		padding: 40rpx 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	
	/* 顶部Logo区域 */
	.header-section {
		text-align: center;
		margin-bottom: 60rpx;
		padding-top: 40rpx;
	}
	
	.logo-container {
		margin-bottom: 20rpx;
	}
	
	.logo-icon {
		font-size: 80rpx;
		margin-bottom: 15rpx;
		display: block;
	}
	
	.app-name {
		font-size: 36rpx;
		color: #ffffff;
		font-weight: bold;
		display: block;
	}
	
	.welcome-text {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.5;
	}
	
	/* 微信登录区域 */
	.wechat-login-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding-bottom: 100rpx; /* 留出底部协议的空间 */
	}
	
	.wechat-login-tip {
		margin-bottom: 60rpx;
		text-align: center;
	}
	
	.tip-text {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.wechat-login-btn {
		width: 80%;
		height: 100rpx;
		background-color: #07c160;
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		box-shadow: 0 10rpx 20rpx rgba(7, 193, 96, 0.3);
		transition: all 0.3s ease;
	}
	
	.wechat-login-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 5rpx 10rpx rgba(7, 193, 96, 0.3);
	}
	
	.wechat-icon {
		font-size: 40rpx;
		margin-right: 20rpx;
	}
	
	.agreement-section {
		position: absolute;
		bottom: 50rpx;
		left: 0;
		right: 0;
		text-align: center;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
	}
	
	.agreement-link {
		color: #ffffff;
		text-decoration: underline;
		margin: 0 5rpx;
	}
</style>