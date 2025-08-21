<template>
	<view class="change-password-container">
		<!-- 安全提示 -->
		<view class="security-tip">
			<view class="tip-icon">🔒</view>
			<view class="tip-content">
				<text class="tip-title">密码安全</text>
				<text class="tip-text">为了您的账户安全，请设置复杂密码</text>
			</view>
		</view>

		<!-- 密码修改表单 -->
		<view class="form-container">
			<!-- 当前密码 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">当前密码</text>
					<text class="required-mark">*</text>
				</view>
				<view class="password-input-wrapper">
					<input 
						class="form-input password-input" 
						v-model="formData.currentPassword" 
						:type="showCurrentPassword ? 'text' : 'password'"
						placeholder="请输入当前密码"
						@blur="validateCurrentPassword"
					/>
					<text class="password-toggle" @click="toggleCurrentPassword">
						{{showCurrentPassword ? '🙈' : '👁️'}}
					</text>
				</view>
				<text v-if="errors.currentPassword" class="error-text">{{errors.currentPassword}}</text>
			</view>

			<!-- 新密码 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">新密码</text>
					<text class="required-mark">*</text>
				</view>
				<view class="password-input-wrapper">
					<input 
						class="form-input password-input" 
						v-model="formData.newPassword" 
						:type="showNewPassword ? 'text' : 'password'"
						placeholder="请输入新密码"
						@input="onNewPasswordInput"
						@blur="validateNewPassword"
					/>
					<text class="password-toggle" @click="toggleNewPassword">
						{{showNewPassword ? '🙈' : '👁️'}}
					</text>
				</view>
				<text v-if="errors.newPassword" class="error-text">{{errors.newPassword}}</text>
				
				<!-- 密码强度指示器 -->
				<view class="password-strength" v-if="formData.newPassword">
					<text class="strength-label">密码强度：</text>
					<view class="strength-bar">
						<view 
							class="strength-fill" 
							:class="passwordStrengthClass"
							:style="{width: passwordStrengthWidth}"
						></view>
					</view>
					<text class="strength-text" :class="passwordStrengthClass">{{passwordStrengthText}}</text>
				</view>
			</view>

			<!-- 确认新密码 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">确认新密码</text>
					<text class="required-mark">*</text>
				</view>
				<view class="password-input-wrapper">
					<input 
						class="form-input password-input" 
						v-model="formData.confirmPassword" 
						:type="showConfirmPassword ? 'text' : 'password'"
						placeholder="请再次输入新密码"
						@blur="validateConfirmPassword"
					/>
					<text class="password-toggle" @click="toggleConfirmPassword">
						{{showConfirmPassword ? '🙈' : '👁️'}}
					</text>
				</view>
				<text v-if="errors.confirmPassword" class="error-text">{{errors.confirmPassword}}</text>
			</view>

			<!-- 密码要求提示 -->
			<view class="password-requirements">
				<text class="requirements-title">密码要求：</text>
				<view class="requirement-item" :class="{met: requirements.length}">
					<text class="requirement-icon">{{requirements.length ? '✅' : '⭕'}}</text>
					<text class="requirement-text">至少6个字符</text>
				</view>
				<view class="requirement-item" :class="{met: requirements.hasLetter}">
					<text class="requirement-icon">{{requirements.hasLetter ? '✅' : '⭕'}}</text>
					<text class="requirement-text">包含字母</text>
				</view>
				<view class="requirement-item" :class="{met: requirements.hasNumber}">
					<text class="requirement-icon">{{requirements.hasNumber ? '✅' : '⭕'}}</text>
					<text class="requirement-text">包含数字</text>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<button 
				class="save-btn" 
				:class="{loading: saving, disabled: !isFormValid}"
				@click="changePassword"
				:disabled="saving || !isFormValid"
			>
				<text v-if="saving">修改中...</text>
				<text v-else>确认修改</text>
			</button>
			
			<button class="cancel-btn" @click="goBack">
				<text>取消</text>
			</button>
		</view>
	</view>
</template>

<script>
	import { changePassword } from '@/api/auth.js'

	export default {
		data() {
			return {
				formData: {
					currentPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				errors: {
					currentPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				showCurrentPassword: false,
				showNewPassword: false,
				showConfirmPassword: false,
				saving: false,
				requirements: {
					length: false,
					hasLetter: false,
					hasNumber: false
				}
			}
		},
		computed: {
			// 密码强度
			passwordStrength() {
				const password = this.formData.newPassword
				let score = 0
				
				if (password.length >= 6) score++
				if (password.length >= 8) score++
				if (/[a-zA-Z]/.test(password)) score++
				if (/[0-9]/.test(password)) score++
				if (/[^a-zA-Z0-9]/.test(password)) score++
				
				return score
			},
			
			passwordStrengthClass() {
				if (this.passwordStrength <= 2) return 'weak'
				if (this.passwordStrength <= 3) return 'medium'
				return 'strong'
			},
			
			passwordStrengthWidth() {
				return (this.passwordStrength / 5 * 100) + '%'
			},
			
			passwordStrengthText() {
				if (this.passwordStrength <= 2) return '弱'
				if (this.passwordStrength <= 3) return '中'
				return '强'
			},
			
			// 表单是否有效
			isFormValid() {
				return this.formData.currentPassword && 
					   this.formData.newPassword && 
					   this.formData.confirmPassword &&
					   !this.errors.currentPassword &&
					   !this.errors.newPassword &&
					   !this.errors.confirmPassword
			}
		},
		methods: {
			// 切换当前密码显示
			toggleCurrentPassword() {
				this.showCurrentPassword = !this.showCurrentPassword
			},
			
			// 切换新密码显示
			toggleNewPassword() {
				this.showNewPassword = !this.showNewPassword
			},
			
			// 切换确认密码显示
			toggleConfirmPassword() {
				this.showConfirmPassword = !this.showConfirmPassword
			},
			
			// 新密码输入时检查要求
			onNewPasswordInput() {
				const password = this.formData.newPassword
				
				this.requirements = {
					length: password.length >= 6,
					hasLetter: /[a-zA-Z]/.test(password),
					hasNumber: /[0-9]/.test(password)
				}
				
				// 如果确认密码已填写，重新验证
				if (this.formData.confirmPassword) {
					this.validateConfirmPassword()
				}
			},
			
			// 验证当前密码
			validateCurrentPassword() {
				const password = this.formData.currentPassword
				
				if (!password) {
					this.errors.currentPassword = '请输入当前密码'
					return false
				}
				
				this.errors.currentPassword = ''
				return true
			},
			
			// 验证新密码
			validateNewPassword() {
				const password = this.formData.newPassword
				
				if (!password) {
					this.errors.newPassword = '请输入新密码'
					return false
				}
				
				if (password.length < 6) {
					this.errors.newPassword = '密码长度不能少于6位'
					return false
				}
				
				if (password === this.formData.currentPassword) {
					this.errors.newPassword = '新密码不能与当前密码相同'
					return false
				}
				
				this.errors.newPassword = ''
				return true
			},
			
			// 验证确认密码
			validateConfirmPassword() {
				const password = this.formData.confirmPassword
				
				if (!password) {
					this.errors.confirmPassword = '请确认新密码'
					return false
				}
				
				if (password !== this.formData.newPassword) {
					this.errors.confirmPassword = '两次输入的密码不一致'
					return false
				}
				
				this.errors.confirmPassword = ''
				return true
			},
			
			// 修改密码
			async changePassword() {
				if (!this.validateCurrentPassword() || 
					!this.validateNewPassword() || 
					!this.validateConfirmPassword()) {
					return
				}
				
				this.saving = true
				
				try {
					const token = uni.getStorageSync('user_token')
					
					if (!token) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						})
						return
					}
					
					const passwordData = {
						currentPassword: this.formData.currentPassword,
						newPassword: this.formData.newPassword
					}
					
					const result = await changePassword(token, passwordData)
					
					if (result.success) {
						uni.showModal({
							title: '修改成功',
							content: '密码修改成功，请重新登录',
							showCancel: false,
							success: () => {
								// 清除登录状态
								uni.removeStorageSync('user_token')
								uni.removeStorageSync('user_info')
								
								// 跳转到登录页面
								uni.reLaunch({
									url: '/pages/auth/login'
								})
							}
						})
					} else {
						if (result.code === 'WRONG_PASSWORD') {
							this.errors.currentPassword = '当前密码错误'
						} else {
							uni.showToast({
								title: result.message || '修改失败',
								icon: 'none'
							})
						}
					}
				} catch (error) {
					console.error('修改密码失败:', error)
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					})
				} finally {
					this.saving = false
				}
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>
	.change-password-container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 安全提示 */
	.security-tip {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		color: white;
	}

	.tip-icon {
		font-size: 48rpx;
		margin-right: 20rpx;
	}

	.tip-content {
		flex: 1;
	}

	.tip-title {
		font-size: 32rpx;
		font-weight: 600;
		display: block;
		margin-bottom: 8rpx;
	}

	.tip-text {
		font-size: 26rpx;
		opacity: 0.9;
		display: block;
	}

	/* 表单容器 */
	.form-container {
		background: white;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.form-item {
		margin-bottom: 40rpx;
	}

	.form-item:last-child {
		margin-bottom: 0;
	}

	.form-label {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.label-text {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.required-mark {
		color: #ff4757;
		margin-left: 8rpx;
		font-size: 32rpx;
	}

	/* 密码输入框 */
	.password-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.password-input {
		flex: 1;
		height: 88rpx;
		border: 2rpx solid #e1e8ed;
		border-radius: 12rpx;
		padding: 0 80rpx 0 24rpx;
		font-size: 32rpx;
		color: #333;
		background-color: #f8f9fa;
		box-sizing: border-box;
		transition: all 0.3s ease;
	}

	.password-input:focus {
		border-color: #4A90E2;
		background-color: white;
	}

	.password-toggle {
		position: absolute;
		right: 24rpx;
		font-size: 32rpx;
		color: #999;
		cursor: pointer;
	}

	.error-text {
		color: #ff4757;
		font-size: 24rpx;
		margin-top: 10rpx;
		display: block;
	}

	/* 密码强度指示器 */
	.password-strength {
		margin-top: 20rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.strength-label {
		font-size: 26rpx;
		color: #666;
	}

	.strength-bar {
		flex: 1;
		height: 8rpx;
		background: #e1e8ed;
		border-radius: 4rpx;
		overflow: hidden;
	}

	.strength-fill {
		height: 100%;
		transition: all 0.3s ease;
		border-radius: 4rpx;
	}

	.strength-fill.weak {
		background: #ff4757;
	}

	.strength-fill.medium {
		background: #ffa502;
	}

	.strength-fill.strong {
		background: #2ed573;
	}

	.strength-text {
		font-size: 26rpx;
		font-weight: 500;
		min-width: 40rpx;
	}

	.strength-text.weak {
		color: #ff4757;
	}

	.strength-text.medium {
		color: #ffa502;
	}

	.strength-text.strong {
		color: #2ed573;
	}

	/* 密码要求 */
	.password-requirements {
		margin-top: 30rpx;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}

	.requirements-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 15rpx;
		display: block;
	}

	.requirement-item {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
		transition: all 0.3s ease;
	}

	.requirement-item:last-child {
		margin-bottom: 0;
	}

	.requirement-icon {
		font-size: 24rpx;
		margin-right: 12rpx;
		width: 24rpx;
	}

	.requirement-text {
		font-size: 26rpx;
		color: #666;
		transition: all 0.3s ease;
	}

	.requirement-item.met .requirement-text {
		color: #2ed573;
	}

	/* 操作按钮 */
	.action-buttons {
		padding: 20rpx 0;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.save-btn {
		height: 88rpx;
		background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
		color: white;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.save-btn:active {
		transform: translateY(2rpx);
	}

	.save-btn.loading {
		opacity: 0.7;
	}

	.save-btn.disabled {
		background: #ccc;
		opacity: 0.6;
	}

	.cancel-btn {
		height: 88rpx;
		background: white;
		color: #666;
		border: 2rpx solid #e1e8ed;
		border-radius: 12rpx;
		font-size: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.cancel-btn:active {
		background: #f8f9fa;
	}
</style>