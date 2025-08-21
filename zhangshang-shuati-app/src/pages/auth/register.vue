<template>
	<view class="register-container">
		<!-- 顶部Logo区域 -->
		<view class="header-section">
			<view class="logo-container">
				<text class="logo-icon">📚</text>
				<text class="app-name">掌上刷题宝</text>
			</view>
			<text class="welcome-text">创建账号，开启你的学习之旅</text>
		</view>
		
		<!-- 注册表单 -->
		<view class="form-container">
			<view class="form-title">
				<text class="title-text">注册账号</text>
			</view>
			
			<!-- 邮箱输入 -->
			<view class="input-group">
				<view class="input-label">
					<text class="label-icon">📧</text>
					<text class="label-text">邮箱地址</text>
				</view>
				<input 
					class="form-input" 
					v-model="formData.email" 
					type="text"
					placeholder="请输入邮箱地址"
					@blur="validateEmail"
				/>
				<text v-if="errors.email" class="error-text">{{errors.email}}</text>
			</view>
			
			<!-- 昵称输入 -->
			<view class="input-group">
				<view class="input-label">
					<text class="label-icon">👤</text>
					<text class="label-text">昵称</text>
				</view>
				<input 
					class="form-input" 
					v-model="formData.nickname" 
					type="text"
					placeholder="请输入昵称"
					@blur="validateNickname"
				/>
				<text v-if="errors.nickname" class="error-text">{{errors.nickname}}</text>
			</view>
			
			<!-- 密码输入 -->
			<view class="input-group">
				<view class="input-label">
					<text class="label-icon">🔒</text>
					<text class="label-text">设置密码</text>
				</view>
				<view class="password-input-wrapper">
					<input 
						class="form-input password-input" 
						v-model="formData.password" 
						:type="showPassword ? 'text' : 'password'"
						placeholder="请设置6-20位密码"
						@blur="validatePassword"
					/>
					<text class="password-toggle" @click="togglePassword">
						{{showPassword ? '🙈' : '👁️'}}
					</text>
				</view>
				<text v-if="errors.password" class="error-text">{{errors.password}}</text>
			</view>
			
			<!-- 确认密码输入 -->
			<view class="input-group">
				<view class="input-label">
					<text class="label-icon">🔐</text>
					<text class="label-text">确认密码</text>
				</view>
				<view class="password-input-wrapper">
					<input 
						class="form-input password-input" 
						v-model="formData.confirmPassword" 
						:type="showConfirmPassword ? 'text' : 'password'"
						placeholder="请再次输入密码"
						@blur="validateConfirmPassword"
					/>
					<text class="password-toggle" @click="toggleConfirmPassword">
						{{showConfirmPassword ? '🙈' : '👁️'}}
					</text>
				</view>
				<text v-if="errors.confirmPassword" class="error-text">{{errors.confirmPassword}}</text>
			</view>
			
			<!-- 用户协议 -->
			<view class="agreement-section" @click="toggleAgreement">
				<text class="checkbox" :class="{checked: formData.agreement}">{{formData.agreement ? '☑️' : '☐'}}</text>
				<view class="agreement-text">
					<text class="agreement-normal">我已阅读并同意</text>
					<text class="agreement-link" @click.stop="viewTerms">《用户协议》</text>
					<text class="agreement-normal">和</text>
					<text class="agreement-link" @click.stop="viewPrivacy">《隐私政策》</text>
				</view>
			</view>
			<text v-if="errors.agreement" class="error-text agreement-error">{{errors.agreement}}</text>
			
			<!-- 注册按钮 -->
			<button 
				class="register-btn" 
				:class="{disabled: !isFormValid || isLoading}"
				@click="handleRegister"
				:disabled="!isFormValid || isLoading"
			>
				<text class="btn-text">{{isLoading ? '注册中...' : '立即注册'}}</text>
			</button>
			
			<!-- 登录链接 -->
			<view class="login-section">
				<text class="login-hint">已有账号？</text>
				<text class="login-link" @click="goToLogin">立即登录</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			formData: {
				email: '',
				nickname: '',
				password: '',
				confirmPassword: '',
				agreement: false
			},
			errors: {
				email: '',
				nickname: '',
				password: '',
				confirmPassword: '',
				agreement: ''
			},
			showPassword: false,
			showConfirmPassword: false,
			isLoading: false
		}
	},
	computed: {
		isFormValid() {
			return this.formData.email && 
				   this.formData.nickname && 
				   this.formData.password && 
				   this.formData.confirmPassword && 
				   this.formData.agreement && 
				   !this.errors.email && 
				   !this.errors.nickname && 
				   !this.errors.password && 
				   !this.errors.confirmPassword
		}
	},
	methods: {
		// 邮箱验证
		validateEmail() {
			const email = this.formData.email.trim()
			if (!email) {
				this.errors.email = '请输入邮箱地址'
				return false
			}
			
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(email)) {
				this.errors.email = '请输入正确的邮箱格式'
				return false
			}
			
			this.errors.email = ''
			return true
		},
		
		// 昵称验证
		validateNickname() {
			const nickname = this.formData.nickname.trim()
			if (!nickname) {
				this.errors.nickname = '请输入昵称'
				return false
			}
			
			if (nickname.length < 2 || nickname.length > 20) {
				this.errors.nickname = '昵称长度应为2-20个字符'
				return false
			}
			
			this.errors.nickname = ''
			return true
		},
		
		// 密码验证
		validatePassword() {
			const password = this.formData.password
			if (!password) {
				this.errors.password = '请设置密码'
				return false
			}
			
			if (password.length < 6 || password.length > 20) {
				this.errors.password = '密码长度应为6-20位'
				return false
			}
			
			// 密码强度验证
			const hasLetter = /[a-zA-Z]/.test(password)
			const hasNumber = /\d/.test(password)
			if (!hasLetter || !hasNumber) {
				this.errors.password = '密码应包含字母和数字'
				return false
			}
			
			this.errors.password = ''
			// 如果确认密码已填写，则同时验证确认密码
			if (this.formData.confirmPassword) {
				this.validateConfirmPassword()
			}
			return true
		},
		
		// 确认密码验证
		validateConfirmPassword() {
			const confirmPassword = this.formData.confirmPassword
			if (!confirmPassword) {
				this.errors.confirmPassword = '请确认密码'
				return false
			}
			
			if (confirmPassword !== this.formData.password) {
				this.errors.confirmPassword = '两次输入的密码不一致'
				return false
			}
			
			this.errors.confirmPassword = ''
			return true
		},
		
		// 验证用户协议
		validateAgreement() {
			if (!this.formData.agreement) {
				this.errors.agreement = '请阅读并同意用户协议和隐私政策'
				return false
			}
			
			this.errors.agreement = ''
			return true
		},
		
		// 切换密码显示
		togglePassword() {
			this.showPassword = !this.showPassword
		},
		
		// 切换确认密码显示
		toggleConfirmPassword() {
			this.showConfirmPassword = !this.showConfirmPassword
		},
		
		// 切换协议同意状态
		toggleAgreement() {
			this.formData.agreement = !this.formData.agreement
			if (this.formData.agreement) {
				this.errors.agreement = ''
			}
		},
		
		// 查看用户协议
		viewTerms() {
			uni.navigateTo({
				url: '/pages/legal/user-agreement'
			})
		},
		
		// 查看隐私政策
		viewPrivacy() {
			uni.navigateTo({
				url: '/pages/legal/privacy-policy'
			})
		},
		
		// 处理注册
		async handleRegister() {
			if (!this.isFormValid || this.isLoading) return
			
			// 验证表单
			if (!this.validateEmail() || 
				!this.validateNickname() || 
				!this.validatePassword() || 
				!this.validateConfirmPassword() || 
				!this.validateAgreement()) {
				return
			}
			
			this.isLoading = true
			
			try {
				// 模拟注册API调用
				const registerResult = await this.simulateRegister({
					email: this.formData.email,
					nickname: this.formData.nickname,
					password: this.formData.password
				})
				
				if (registerResult.success) {
					uni.showToast({
						title: '注册成功',
						icon: 'success'
					})
					
					// 跳转到登录页面
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/auth/login'
						})
					}, 1500)
				} else {
					uni.showToast({
						title: registerResult.message || '注册失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('注册失败:', error)
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				})
			} finally {
				this.isLoading = false
			}
		},
		
		// 模拟注册API
		async simulateRegister(userData) {
			return new Promise((resolve) => {
				setTimeout(() => {
					// 模拟邮箱已存在的情况
					if (userData.email === 'test@example.com') {
						resolve({
							success: false,
							message: '该邮箱已被注册'
						})
					} else {
						resolve({
							success: true,
							message: '注册成功'
						})
					}
				}, 1000)
			})
		},
		
		// 跳转到登录页面
		goToLogin() {
			uni.navigateTo({
				url: '/pages/auth/login'
			})
		}
	}
}
</script>

<style scoped>
	.register-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 40rpx 30rpx;
		display: flex;
		flex-direction: column;
	}
	
	/* 顶部Logo区域 */
	.header-section {
		text-align: center;
		margin-bottom: 40rpx;
		padding-top: 60rpx;
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
	
	/* 表单容器 */
	.form-container {
		background-color: #ffffff;
		border-radius: 25rpx;
		padding: 40rpx 30rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
	}
	
	.form-title {
		text-align: center;
		margin-bottom: 30rpx;
	}
	
	.title-text {
		font-size: 32rpx;
		color: #333333;
		font-weight: bold;
	}
	
	/* 输入组 */
	.input-group {
		margin-bottom: 25rpx;
	}
	
	.input-label {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}
	
	.label-icon {
		font-size: 28rpx;
		margin-right: 10rpx;
	}
	
	.label-text {
		font-size: 26rpx;
		color: #333333;
		font-weight: 500;
	}
	
	.form-input {
		width: 100%;
		height: 90rpx;
		padding: 0 20rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 15rpx;
		font-size: 28rpx;
		color: #333333;
		background-color: #f8f9fa;
		box-sizing: border-box;
		transition: all 0.3s ease;
	}
	
	.form-input:focus {
		border-color: #4A90E2;
		background-color: #ffffff;
	}
	
	.password-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.password-input {
		padding-right: 80rpx;
	}
	
	.password-toggle {
		position: absolute;
		right: 20rpx;
		font-size: 32rpx;
		cursor: pointer;
		user-select: none;
	}
	
	.error-text {
		font-size: 22rpx;
		color: #dc3545;
		margin-top: 8rpx;
		display: block;
	}
	
	/* 用户协议 */
	.agreement-section {
		display: flex;
		align-items: flex-start;
		margin: 20rpx 0 10rpx;
		cursor: pointer;
	}
	
	.checkbox {
		font-size: 28rpx;
		margin-right: 10rpx;
		color: #4A90E2;
		transition: all 0.3s ease;
		margin-top: 2rpx;
	}
	
	.checkbox.checked {
		color: #4A90E2;
	}
	
	.agreement-text {
		flex: 1;
	}
	
	.agreement-normal {
		font-size: 24rpx;
		color: #666666;
	}
	
	.agreement-link {
		font-size: 24rpx;
		color: #4A90E2;
		cursor: pointer;
	}
	
	.agreement-error {
		margin-bottom: 20rpx;
	}
	
	/* 注册按钮 */
	.register-btn {
		width: 100%;
		height: 90rpx;
		background: linear-gradient(135deg, #4A90E2 0%, #357abd 100%);
		border: none;
		border-radius: 45rpx;
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
		margin: 30rpx 0;
		transition: all 0.3s ease;
		box-shadow: 0 8rpx 20rpx rgba(74, 144, 226, 0.3);
	}
	
	.register-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 10rpx rgba(74, 144, 226, 0.3);
	}
	
	.register-btn.disabled {
		background: #cccccc;
		box-shadow: none;
		opacity: 0.6;
	}
	
	.btn-text {
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
	}
	
	/* 登录链接 */
	.login-section {
		text-align: center;
	}
	
	.login-hint {
		font-size: 24rpx;
		color: #666666;
		margin-right: 10rpx;
	}
	
	.login-link {
		font-size: 24rpx;
		color: #4A90E2;
		font-weight: bold;
		cursor: pointer;
	}
</style>