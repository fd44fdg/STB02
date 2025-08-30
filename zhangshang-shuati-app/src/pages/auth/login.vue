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
			<button class="wechat-login-btn" @click="handleWechatLogin" :disabled="isLoading">
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
import { wechatLogin } from '@/api/auth.js';
import { mapActions } from 'vuex';

export default {
	data() {
		return {
			isLoading: false
		}
	},
	methods: {
        ...mapActions('user', ['login']),

		// 统一处理微信登录逻辑
		async handleWechatLogin() {
			if (this.isLoading) return;
			this.isLoading = true;
			uni.showLoading({
				title: '正在登录...'
			});

			try {
				// 1. 获取微信登录凭证 code
				const loginRes = await uni.login({ provider: 'weixin' });
				if (!loginRes || !loginRes.code) {
					throw new Error('获取微信登录凭证失败');
				}
				const code = loginRes.code;

				// 2. 获取用户微信头像、昵称等信息
				const profileRes = await uni.getUserProfile({
					desc: '用于完善您的会员资料'
				});
				if (!profileRes || !profileRes.userInfo) {
                    // 用户拒绝授权，也视为一种失败
					throw new Error('用户拒绝授权');
				}

				// 3. 调用后端API，传递code和用户信息
				const loginPayload = {
					code,
					userInfo: profileRes.userInfo
				};
                
                // 调用我们封装的API函数
				const response = await wechatLogin(loginPayload);

				// 4. 后端验证成功，返回了token和用户信息
				if (response && response.code === 200 && response.data.token) {
                    // 使用Vuex action来处理登录成功后的状态管理和数据持久化
                    await this.login(response.data);

					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});

					// 登录成功后，延迟一小段时间再跳转，给用户查看提示的时间
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						});
					}, 1500);

				} else {
                    // API返回了错误信息
					throw new Error(response.message || '登录服务异常');
				}

			} catch (error) {
                // 统一处理所有错误
				uni.showToast({
					title: error.message || '登录失败，请稍后重试',
					icon: 'none'
				});
			} finally {
                // 无论成功失败，都要结束loading状态
				this.isLoading = false;
				uni.hideLoading();
			}
		},

		// 返回上一页
		goBack() {
			uni.navigateBack({
				delta: 1
			});
		},

		// 跳转到用户服务协议
		goToUserAgreement() {
			uni.navigateTo({
				url: '/pages/legal/user-agreement'
			});
		},

		// 跳转到隐私政策
		goToPrivacyPolicy() {
			uni.navigateTo({
				url: '/pages/legal/privacy-policy'
			});
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