<template>
	<view class="edit-profile-container">
		<!-- 头像编辑区域 -->
		<view class="avatar-section">
			<view class="avatar-wrapper" @click="chooseAvatar">
				<image 
					v-if="userInfo.avatar" 
					:src="userInfo.avatar" 
					class="avatar-image"
					mode="aspectFill"
				/>
				<view v-else class="avatar-placeholder">
					<text class="avatar-icon">👤</text>
				</view>
				<view class="avatar-edit-overlay">
					<text class="edit-icon">📷</text>
					<text class="edit-text">更换头像</text>
				</view>
			</view>
			<text class="avatar-tip">点击更换头像</text>
		</view>

		<!-- 个人信息表单 -->
		<view class="form-container">
			<!-- 昵称 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">昵称</text>
					<text class="required-mark">*</text>
				</view>
				<input 
					class="form-input" 
					v-model="formData.nickname" 
					placeholder="请输入昵称"
					maxlength="20"
					@blur="validateNickname"
				/>
				<text v-if="errors.nickname" class="error-text">{{errors.nickname}}</text>
			</view>

			<!-- 邮箱 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">邮箱</text>
				</view>
				<input 
					class="form-input disabled" 
					v-model="formData.email" 
					placeholder="邮箱地址"
					disabled
				/>
				<text class="input-tip">邮箱地址不可修改</text>
			</view>

			<!-- 性别 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">性别</text>
				</view>
				<view class="gender-options">
					<view 
						class="gender-option" 
						:class="{active: formData.gender === 'male'}"
						@click="selectGender('male')"
					>
						<text class="gender-icon">👨</text>
						<text class="gender-text">男</text>
					</view>
					<view 
						class="gender-option" 
						:class="{active: formData.gender === 'female'}"
						@click="selectGender('female')"
					>
						<text class="gender-icon">👩</text>
						<text class="gender-text">女</text>
					</view>
					<view 
						class="gender-option" 
						:class="{active: formData.gender === 'unknown'}"
						@click="selectGender('unknown')"
					>
						<text class="gender-icon">🤷</text>
						<text class="gender-text">保密</text>
					</view>
				</view>
			</view>

			<!-- 生日 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">生日</text>
				</view>
				<picker 
					mode="date" 
					:value="formData.birthday" 
					@change="onBirthdayChange"
					class="date-picker"
				>
					<view class="picker-content">
						<text class="picker-text" :class="{placeholder: !formData.birthday}">
							{{formData.birthday || '请选择生日'}}
						</text>
						<text class="picker-arrow">></text>
					</view>
				</picker>
			</view>

			<!-- 个人简介 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">个人简介</text>
				</view>
				<textarea 
					class="form-textarea" 
					v-model="formData.bio" 
					placeholder="介绍一下自己吧..."
					maxlength="200"
					auto-height
				/>
				<view class="char-count">
					<text class="count-text">{{formData.bio.length}}/200</text>
				</view>
			</view>

			<!-- 学习目标 -->
			<view class="form-item">
				<view class="form-label">
					<text class="label-text">学习目标</text>
				</view>
				<view class="goal-options">
					<view 
						v-for="goal in goalOptions" 
						:key="goal.value"
						class="goal-option" 
						:class="{active: formData.learningGoal === goal.value}"
						@click="selectGoal(goal.value)"
					>
						<text class="goal-text">{{goal.label}}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<button 
				class="save-btn" 
				:class="{loading: saving}"
				@click="saveProfile"
				:disabled="saving"
			>
				<text v-if="saving">保存中...</text>
				<text v-else>保存修改</text>
			</button>
			
			<button class="cancel-btn" @click="goBack">
				<text>取消</text>
			</button>
		</view>

		<!-- 修改密码入口 -->
		<view class="password-section">
			<view class="password-item" @click="goToChangePassword">
				<view class="password-icon">🔒</view>
				<text class="password-text">修改密码</text>
				<text class="password-arrow">></text>
			</view>
		</view>
	</view>
</template>

<script>
	import { getCurrentUser, updateUserInfo } from '@/api/auth.js'
	import request from '@/utils/request'

	export default {
		data() {
			return {
				userInfo: {},
				formData: {
					nickname: '',
					email: '',
					gender: 'unknown',
					birthday: '',
					bio: '',
					learningGoal: '',
					avatar: ''
				},
				errors: {
					nickname: ''
				},
				saving: false,
				goalOptions: [
					{ value: 'exam', label: '考试备考' },
					{ value: 'skill', label: '技能提升' },
					{ value: 'hobby', label: '兴趣爱好' },
					{ value: 'career', label: '职业发展' }
				]
			}
		},
		onLoad() {
			this.loadUserInfo()
		},
		methods: {
			// 加载用户信息
			async loadUserInfo() {
				try {
					const token = uni.getStorageSync('user_token')
					
					if (!token) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						})
						uni.navigateBack()
						return
					}
					
					const result = await getCurrentUser(token)
					
					if (result.success) {
						this.userInfo = result.userInfo
						// 填充表单数据
						this.formData = {
							nickname: result.userInfo.nickname || '',
							email: result.userInfo.email || '',
							gender: result.userInfo.gender || 'unknown',
							birthday: result.userInfo.birthday || '',
							bio: result.userInfo.bio || '',
							learningGoal: result.userInfo.learningGoal || '',
							avatar: result.userInfo.avatar || ''
						}
					} else {
						uni.showToast({
							title: '获取用户信息失败',
							icon: 'none'
						})
						uni.navigateBack()
					}
				} catch (error) {
					console.error('加载用户信息失败:', error)
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					})
				}
			},
			
			// 选择头像
			chooseAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0]
						
						// 显示上传中提示
						uni.showLoading({
							title: '上传头像中...'
						})
						
						// 使用request中的uploadFile方法上传头像
						request.uploadFile('/users/avatar', tempFilePath, 'avatar')
							.then(res => {
								if (res.success && res.data && res.data.url) {
									// 上传成功，使用返回的URL更新头像
									const avatarUrl = res.data.url
									this.formData.avatar = avatarUrl
									this.userInfo.avatar = avatarUrl
									
									uni.hideLoading()
									uni.showToast({
										title: '头像已上传',
										icon: 'success'
									})
								} else {
									// 上传失败，但可以临时使用本地路径
									this.formData.avatar = tempFilePath
									this.userInfo.avatar = tempFilePath
									
									uni.hideLoading()
									uni.showToast({
										title: '头像将在下次登录时失效',
										icon: 'none'
									})
								}
							})
							.catch(error => {
								console.error('上传头像失败:', error)
								// 上传失败，临时使用本地路径
								this.formData.avatar = tempFilePath
								this.userInfo.avatar = tempFilePath
								
								uni.hideLoading()
								uni.showToast({
									title: '头像上传失败，将在下次登录时失效',
									icon: 'none'
								})
							})
					},
					fail: (error) => {
						console.error('选择头像失败:', error)
						uni.showToast({
							title: '选择头像失败',
							icon: 'none'
						})
					}
				})
			},
			
			// 验证昵称
			validateNickname() {
				const nickname = this.formData.nickname.trim()
				
				if (!nickname) {
					this.errors.nickname = '请输入昵称'
					return false
				}
				
				if (nickname.length < 2) {
					this.errors.nickname = '昵称至少2个字符'
					return false
				}
				
				if (nickname.length > 20) {
					this.errors.nickname = '昵称不能超过20个字符'
					return false
				}
				
				this.errors.nickname = ''
				return true
			},
			
			// 选择性别
			selectGender(gender) {
				this.formData.gender = gender
			},
			
			// 生日选择
			onBirthdayChange(e) {
				this.formData.birthday = e.detail.value
			},
			
			// 选择学习目标
			selectGoal(goal) {
				this.formData.learningGoal = goal
			},
			
			// 保存资料
			async saveProfile() {
				if (!this.validateNickname()) {
					return
				}
				
				this.saving = true
				
				try {
					const token = uni.getStorageSync('user_token')
					
					const updateData = {
						nickname: this.formData.nickname.trim(),
						gender: this.formData.gender,
						birthday: this.formData.birthday,
						bio: this.formData.bio.trim(),
						learningGoal: this.formData.learningGoal,
						avatar: this.formData.avatar
					}
					
					const result = await updateUserInfo(token, updateData)
					
					if (result.success) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						})
						
						// 更新本地存储的用户信息
						uni.setStorageSync('user_info', result.userInfo)
						
						// 延迟返回上一页
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						uni.showToast({
							title: result.message || '保存失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('保存资料失败:', error)
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
			},
			
			// 跳转到修改密码页面
			goToChangePassword() {
				uni.navigateTo({
					url: '/pages/profile/change-password'
				})
			}
		}
	}
</script>

<style>
	.edit-profile-container {
		padding: 20rpx;
		background-color: var(--bg-color, #f5f5f5);
		min-height: 100vh;
	}

	/* 头像编辑区域 */
	.avatar-section {
		background: var(--card-bg, #ffffff);
		border-radius: 16rpx;
		padding: 40rpx;
		margin-bottom: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05));
	}

	.avatar-wrapper {
		position: relative;
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 20rpx;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.avatar-icon {
		font-size: 60rpx;
		color: #ffffff;
	}

	.avatar-edit-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.6);
		color: #ffffff;
		padding: 10rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.edit-icon {
		font-size: 24rpx;
		margin-bottom: 4rpx;
	}

	.edit-text {
		font-size: 20rpx;
	}

	.avatar-tip {
		font-size: 28rpx;
		color: var(--text-secondary, #666);
	}

	/* 表单容器 */
	.form-container {
		background: var(--card-bg, #ffffff);
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05));
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
		color: var(--text-primary, #333);
		font-weight: 500;
	}

	.required-mark {
		color: var(--danger, #ff4757);
		margin-left: 8rpx;
		font-size: 32rpx;
	}

	.form-input {
		width: 100%;
		height: 88rpx;
		border: 2rpx solid var(--muted-border, #e1e8ed);
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 32rpx;
		color: var(--text-primary, #333);
		background-color: var(--card-bg-2, #f8f9fa);
		box-sizing: border-box;
		transition: all 0.3s ease;
	}

	.form-input:focus {
		border-color: var(--accent, #4A90E2);
		background-color: var(--card-bg, #ffffff);
	}

	.form-input.disabled {
		background-color: var(--card-bg-2, #f0f0f0);
		color: var(--text-secondary, #999);
	}

	.form-textarea {
		width: 100%;
		min-height: 120rpx;
		border: 2rpx solid var(--muted-border, #e1e8ed);
		border-radius: 12rpx;
		padding: 20rpx;
		font-size: 32rpx;
		color: var(--text-primary, #333);
		background-color: var(--card-bg-2, #f8f9fa);
		box-sizing: border-box;
		resize: none;
		transition: all 0.3s ease;
	}

	.form-textarea:focus {
		border-color: var(--accent, #4A90E2);
		background-color: var(--card-bg, #ffffff);
	}

	.error-text {
		color: var(--danger, #ff4757);
		font-size: 24rpx;
		margin-top: 10rpx;
		display: block;
	}

	.input-tip {
		color: var(--text-secondary, #999);
		font-size: 24rpx;
		margin-top: 10rpx;
		display: block;
	}

	.char-count {
		display: flex;
		justify-content: flex-end;
		margin-top: 10rpx;
	}

	.count-text {
		font-size: 24rpx;
		color: var(--text-secondary, #999);
	}

	/* 性别选择 */
	.gender-options {
		display: flex;
		gap: 20rpx;
	}

	.gender-option {
		flex: 1;
		height: 80rpx;
		border: 2rpx solid var(--muted-border, #e1e8ed);
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--card-bg-2, #f8f9fa);
		transition: all 0.3s ease;
	}

	.gender-option.active {
		border-color: var(--accent, #4A90E2);
		background: rgba(99, 158, 236, 0.15);
	}

	.gender-icon {
		font-size: 32rpx;
		margin-bottom: 4rpx;
	}

	.gender-text {
		font-size: 24rpx;
		color: var(--text-secondary, #666);
	}

	.gender-option.active .gender-text {
		color: var(--accent, #4A90E2);
		font-weight: 500;
	}

	/* 日期选择器 */
	.date-picker {
		width: 100%;
	}

	.picker-content {
		height: 88rpx;
		border: 2rpx solid var(--muted-border, #e1e8ed);
		border-radius: 12rpx;
		padding: 0 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--card-bg-2, #f8f9fa);
		transition: all 0.3s ease;
	}

	.picker-text {
		font-size: 32rpx;
		color: var(--text-primary, #333);
	}

	.picker-text.placeholder {
		color: var(--text-secondary, #999);
	}

	.picker-arrow {
		font-size: 28rpx;
		color: var(--text-secondary, #999);
	}

	/* 学习目标选择 */
	.goal-options {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.goal-option {
		padding: 20rpx 30rpx;
		border: 2rpx solid var(--muted-border, #e1e8ed);
		border-radius: 50rpx;
		background: var(--card-bg-2, #f8f9fa);
		transition: all 0.3s ease;
	}

	.goal-option.active {
		border-color: var(--accent, #4A90E2);
		background: rgba(99, 158, 236, 0.15);
	}

	.goal-text {
		font-size: 28rpx;
		color: var(--text-secondary, #666);
	}

	.goal-option.active .goal-text {
		color: var(--accent, #4A90E2);
		font-weight: 500;
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
		background: linear-gradient(135deg, var(--accent, #4A90E2) 0%, var(--accent-dark, #357ABD) 100%);
		color: #ffffff;
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

	.cancel-btn {
		height: 88rpx;
		background: var(--card-bg, #ffffff);
		color: var(--text-secondary, #666);
		border: 2rpx solid var(--muted-border, #e1e8ed);
		border-radius: 12rpx;
		font-size: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.cancel-btn:active {
		background: var(--card-bg-2, #f8f9fa);
	}

	/* 修改密码区域 */
	.password-section {
		background: var(--card-bg, #ffffff);
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
		box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05));
	}

	.password-item {
		display: flex;
		align-items: center;
		height: 80rpx;
	}

	.password-icon {
		font-size: 40rpx;
		margin-right: 30rpx;
	}

	.password-text {
		flex: 1;
		font-size: 32rpx;
		color: var(--text-primary, #333);
	}

	.password-arrow {
		font-size: 28rpx;
		color: var(--text-secondary, #999);
	}
</style>