<template>
	<view class="about-container">
		<!-- 应用信息卡片 -->
		<view class="app-info-card">
			<view class="app-logo">
				<uni-icons type="book" size="60" color="#4A90E2"></uni-icons>
			</view>
			<text class="app-name">掌上刷题宝</text>
			<text class="app-slogan">让学习更高效，让知识更有趣</text>
			<view class="version-info">
				<text class="version-text">版本 {{ appVersion }}</text>
			</view>
		</view>
		
		<!-- 应用介绍 -->
		<view class="intro-section">
			<view class="section-title">应用介绍</view>
			<text class="intro-text">
				掌上刷题宝是一款专为学习者打造的智能刷题应用。我们致力于通过科技手段提升学习效率，让知识获取变得更加便捷和有趣。
			</text>
		</view>
		
		<!-- 功能特色 -->
		<view class="features-section">
			<view class="section-title">功能特色</view>
			<view class="features-list">
				<view class="feature-item">
					<uni-icons type="star" size="20" color="#FFD700"></uni-icons>
					<text class="feature-text">智能题库，覆盖多个学科领域</text>
				</view>
				<view class="feature-item">
					<uni-icons type="checkmarkempty" size="20" color="#34C759"></uni-icons>
					<text class="feature-text">个性化学习，精准推荐练习内容</text>
				</view>
				<view class="feature-item">
					<uni-icons type="calendar" size="20" color="#4A90E2"></uni-icons>
					<text class="feature-text">学习记录，追踪进步轨迹</text>
				</view>
				<view class="feature-item">
					<uni-icons type="medal" size="20" color="#FF6B6B"></uni-icons>
					<text class="feature-text">成就系统，激发学习动力</text>
				</view>
			</view>
		</view>
		
		<!-- 开发团队 -->
		<view class="team-section">
			<view class="section-title">开发团队</view>
			<view class="team-info">
				<view class="team-item">
					<uni-icons type="person" size="24" color="#4A90E2"></uni-icons>
					<view class="team-details">
						<text class="team-role">技术开发</text>
						<text class="team-name">Claude 3.5 Sonnet</text>
					</view>
				</view>
				<view class="team-item">
					<uni-icons type="color" size="24" color="#FF6B6B"></uni-icons>
					<view class="team-details">
						<text class="team-role">UI设计</text>
						<text class="team-name">AI Design Team</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 联系我们 -->
		<view class="contact-section">
			<view class="section-title">联系我们</view>
			<view class="contact-list">
				<view class="contact-item" @click="copyEmail">
					<uni-icons type="email" size="20" color="#4A90E2"></uni-icons>
					<text class="contact-text">support@shuatibao.com</text>
					<uni-icons type="copy" size="16" color="#999"></uni-icons>
				</view>
				<view class="contact-item" @click="openWebsite">
					<uni-icons type="home" size="20" color="#4A90E2"></uni-icons>
					<text class="contact-text">www.shuatibao.com</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
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
			<text class="copyright">© 2024 掌上刷题宝. All rights reserved.</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				appVersion: '1.0.0'
			}
		},
		onLoad() {
			// 获取应用版本信息
			this.getAppVersion();
		},
		methods: {
			// 获取应用版本
			getAppVersion() {
				// 在实际项目中，可以从配置文件或API获取版本信息
				try {
					// 这里可以调用原生API获取应用版本
					// plus.runtime.version 在App环境下可用
					if (typeof plus !== 'undefined' && plus.runtime) {
						this.appVersion = plus.runtime.version;
					}
				} catch (e) {
					console.log('获取版本信息失败:', e);
				}
			},
			
			// 复制邮箱地址
			copyEmail() {
				const email = 'support@shuatibao.com';
				// #ifdef H5
				if (navigator.clipboard) {
					navigator.clipboard.writeText(email).then(() => {
						uni.showToast({
							title: '邮箱地址已复制',
							icon: 'success'
						});
					}).catch(() => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					});
				} else {
					uni.showToast({
						title: '浏览器不支持复制功能',
						icon: 'none'
					});
				}
				// #endif
				
				// #ifdef APP-PLUS
				uni.setClipboardData({
					data: email,
					success: () => {
						uni.showToast({
							title: '邮箱地址已复制',
							icon: 'success'
						});
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
				// #endif
				
				// #ifdef MP
				uni.setClipboardData({
					data: email,
					success: () => {
						uni.showToast({
							title: '邮箱地址已复制',
							icon: 'success'
						});
					}
				});
				// #endif
			},
			
			// 打开官网
			openWebsite() {
				uni.showModal({
					title: '提示',
					content: '即将跳转到官方网站',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							// #ifdef H5
							window.open('https://www.shuatibao.com', '_blank');
							// #endif
							
							// #ifdef APP-PLUS
							plus.runtime.openURL('https://www.shuatibao.com');
							// #endif
							
							// #ifdef MP
							uni.showToast({
								title: '小程序暂不支持跳转外部链接',
								icon: 'none'
							});
							// #endif
						}
					}
				});
			},
			
			// 显示隐私政策
			showPrivacyPolicy() {
				uni.showModal({
					title: '隐私政策',
					content: '我们重视您的隐私保护。详细的隐私政策请访问官网查看。',
					showCancel: false,
					confirmText: '知道了'
				});
			},
			
			// 显示服务条款
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
		padding: 20px;
		background-color: #f8f9fa;
		min-height: 100vh;
	}
	
	/* 应用信息卡片 */
	.app-info-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20px;
		padding: 40px 20px;
		text-align: center;
		margin-bottom: 20px;
		color: white;
		box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
	}
	
	.app-logo {
		margin-bottom: 20px;
	}
	
	.app-name {
		font-size: 28px;
		font-weight: bold;
		display: block;
		margin-bottom: 8px;
	}
	
	.app-slogan {
		font-size: 16px;
		opacity: 0.9;
		display: block;
		margin-bottom: 20px;
	}
	
	.version-info {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		padding: 8px 16px;
		display: inline-block;
	}
	
	.version-text {
		font-size: 14px;
		font-weight: 500;
	}
	
	/* 通用区块样式 */
	.intro-section,
	.features-section,
	.team-section,
	.contact-section {
		background-color: white;
		border-radius: 15px;
		padding: 20px;
		margin-bottom: 15px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}
	
	.section-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-bottom: 15px;
		padding-bottom: 8px;
		border-bottom: 2px solid #f0f0f0;
	}
	
	/* 应用介绍 */
	.intro-text {
		font-size: 15px;
		color: #666;
		line-height: 1.6;
		display: block;
	}
	
	/* 功能特色 */
	.features-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	
	.feature-item {
		display: flex;
		align-items: center;
		padding: 12px;
		background-color: #f8f9fa;
		border-radius: 10px;
		transition: all 0.3s ease;
	}
	
	.feature-item:active {
		transform: scale(0.98);
		background-color: #e9ecef;
	}
	
	.feature-text {
		font-size: 14px;
		color: #555;
		margin-left: 12px;
		flex: 1;
	}
	
	/* 开发团队 */
	.team-info {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	
	.team-item {
		display: flex;
		align-items: center;
		padding: 15px;
		background-color: #f8f9fa;
		border-radius: 12px;
	}
	
	.team-details {
		margin-left: 15px;
		flex: 1;
	}
	
	.team-role {
		font-size: 12px;
		color: #999;
		display: block;
		margin-bottom: 4px;
	}
	
	.team-name {
		font-size: 16px;
		color: #333;
		font-weight: 500;
		display: block;
	}
	
	/* 联系我们 */
	.contact-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	
	.contact-item {
		display: flex;
		align-items: center;
		padding: 15px;
		background-color: #f8f9fa;
		border-radius: 12px;
		transition: all 0.3s ease;
	}
	
	.contact-item:active {
		transform: scale(0.98);
		background-color: #e9ecef;
	}
	
	.contact-text {
		font-size: 14px;
		color: #555;
		margin-left: 12px;
		flex: 1;
	}
	
	/* 法律信息 */
	.legal-section {
		padding: 20px;
		text-align: center;
	}
	
	.legal-links {
		margin-bottom: 15px;
	}
	
	.legal-link {
		font-size: 14px;
		color: #4A90E2;
		padding: 8px 12px;
		transition: opacity 0.3s ease;
	}
	
	.legal-link:active {
		opacity: 0.7;
	}
	
	.legal-separator {
		font-size: 14px;
		color: #ccc;
		margin: 0 8px;
	}
	
	.copyright {
		font-size: 12px;
		color: #999;
		display: block;
	}
</style>