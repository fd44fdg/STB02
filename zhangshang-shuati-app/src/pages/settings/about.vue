<template>
	<view class="about-container">
		<!-- 页面标题 -->
		<view class="page-header">
			<view class="back-button" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="page-title">关于我们</text>
		</view>
		
		<!-- 应用信息卡片 -->
		<view class="app-info-card">
            <view class="app-logo">
            	<uni-icons type="book" size="60" color="#FFFFFF"></uni-icons>
        	</view>
			<text class="app-name">掌上刷题宝</text>
			<text class="app-slogan">让学习更高效，让知识更有趣</text>
			<view class="version-info">
				<text class="version-text">版本 {{ appVersion }}</text>
			</view>
		</view>
		
		<!-- 关于与联系 -->
		<view class="info-section">
			<view class="info-item">
				<text class="info-label">出品人</text>
				<text class="info-value">LMY</text>
			</view>
			<view class="info-item" @click="sendEmail">
				<text class="info-label">联系我们</text>
				<view class="info-value-clickable">
					<text class="info-text">2511622309@qq.com</text>
					<uni-icons type="email" size="16" color="#999999"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 法律信息 -->
		<view class="legal-section">
			<view class="legal-links">
				<text class="legal-link" @click="showPrivacyPolicy">隐私政策</text>
				<text class="legal-separator">|</text>
				<text class="legal-link" @click="showTermsOfService">服务条款</text>
			</view>
			<text class="copyright">© 2025 掌上刷题宝. All rights reserved.</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				appVersion: '1.0.1' // Updated version
			}
		},
		onLoad() {
			this.getAppVersion();
		},
		methods: {
			goBack() {
				uni.navigateBack({ delta: 1 });
			},
			
			getAppVersion() {
				try {
					if (typeof plus !== 'undefined' && plus.runtime) {
						this.appVersion = plus.runtime.version;
					}
				} catch (e) {
					console.log('获取版本信息失败:', e);
				}
			},
			
			sendEmail() {
				const email = '2511622309@qq.com';
				// #ifdef H5
				window.location.href = `mailto:${email}`;
				// #endif
				
				// #ifdef APP-PLUS
				uni.openURL(`mailto:${email}`);
				// #endif

				// #ifdef MP
				uni.setClipboardData({
					data: email,
					success: () => {
						uni.showToast({
							title: '邮箱已复制',
							icon: 'none'
						});
					}
				});
				// #endif
			},
			
			showPrivacyPolicy() {
				uni.showModal({
					title: '隐私政策',
					content: '我们重视您的隐私保护。详细的隐私政策请访问官网查看。',
					showCancel: false,
					confirmText: '知道了'
				});
			},
			
			showTermsOfService() {
				uni.showModal({
					title: '服务条款',
					content: '使用本应用即表示您同意我们的服务条款。详细条款请访问官网查看。',
					showCancel: false,
					confirmText: '知道了'
				});
			}
		}
	}
</script>

<style scoped>
	.about-container {
		background-color: #f8f9fa;
		min-height: 100vh;
	}
	
	.page-header {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		position: relative;
	}
	
	.back-button {
		position: absolute;
		left: 30rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-icon {
		font-size: 40rpx;
		color: #333;
	}
	
	.page-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
		text-align: center;
		margin-left: -60rpx; /* Offset for absolute positioned back button */
	}
	
	.app-info-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 60rpx 40rpx;
		text-align: center;
		color: white;
	}
	
	.app-logo {
		margin-bottom: 20rpx;
	}
	
	.app-name {
		font-size: 48rpx;
		font-weight: bold;
		display: block;
		margin-bottom: 8rpx;
	}
	
	.app-slogan {
		font-size: 28rpx;
		opacity: 0.9;
		display: block;
		margin-bottom: 30rpx;
	}
	
	.version-info {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 20rpx;
		padding: 8rpx 24rpx;
		display: inline-block;
	}
	
	.version-text {
		font-size: 24rpx;
		font-weight: 500;
	}
	
	.info-section {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 20rpx 40rpx;
		margin: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 28rpx;
		color: #666;
	}

	.info-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.info-value-clickable {
		display: flex;
		align-items: center;
		gap: 10rpx;
		color: #4A90E2;
	}

	.info-text {
		font-size: 28rpx;
	}
	
	.legal-section {
		padding: 40rpx;
		text-align: center;
	}
	
	.legal-links {
		margin-bottom: 15rpx;
	}
	
	.legal-link {
		font-size: 26rpx;
		color: #4A90E2;
		padding: 8rpx 12rpx;
	}
	
	.legal-separator {
		font-size: 26rpx;
		color: #ccc;
		margin: 0 8rpx;
	}
	
	.copyright {
		font-size: 24rpx;
		color: #999;
		display: block;
	}
</style>
