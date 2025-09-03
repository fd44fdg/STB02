<template>
	<view class="settings-container">
		<!-- 页面标题 -->
		<view class="header">
			<view class="back-button" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="header-title">设置</text>
		</view>
		
		<!-- 设置列表 -->
		<view class="settings-list">
			<!-- 通用设置 -->
			<view class="section">
				<view class="section-title">通用设置</view>
				<view class="setting-item">
					<view class="item-left" @click="toggleNotification">
						<view class="item-icon notification-icon"></view>
						<text class="item-text">消息通知</text>
					</view>
					<switch :checked="settings.notification" @change="onNotificationChange" color="#4A90E2" />
				</view>

				<view class="setting-item">
					<view class="item-left" @click="toggleSound">
						<view class="item-icon sound-icon"></view>
						<text class="item-text">音效提示</text>
					</view>
					<switch :checked="settings.sound" @change="onSoundChange" color="#4A90E2" />
				</view>

				<view class="setting-item">
					<view class="item-left" @click="toggleVibration">
						<view class="item-icon vibration-icon"></view>
						<text class="item-text">震动反馈</text>
					</view>
					<switch :checked="settings.vibration" @change="onVibrationChange" color="#4A90E2" />
				</view>
			</view>
			
			<!-- 学习设置 -->
			<view class="section">
				<view class="section-title">学习设置</view>
				<view class="setting-item" @click="showDifficultyPicker">
					<view class="item-left">
						<view class="item-icon difficulty-icon"></view>
						<text class="item-text">默认难度</text>
					</view>
					<view class="item-right">
						<text class="item-value">{{ difficultyText }}</text>
						<text class="item-arrow">></text>
					</view>
				</view>
				
				<view class="setting-item" @click="showQuestionCountPicker">
					<view class="item-left">
						<view class="item-icon question-count-icon"></view>
						<text class="item-text">每次练习题数</text>
					</view>
					<view class="item-right">
						<text class="item-value">{{ settings.questionCount }}题</text>
						<text class="item-arrow">></text>
					</view>
				</view>
				
				<view class="setting-item">
					<view class="item-left" @click="toggleAutoNext">
						<view class="item-icon auto-next-icon"></view>
						<text class="item-text">自动下一题</text>
					</view>
					<switch :checked="settings.autoNext" @change="onAutoNextChange" color="#4A90E2" />
				</view>
			</view>
			
			<!-- 数据管理 -->
			<view class="section">
				<view class="section-title">数据管理</view>
				<view class="setting-item" @click="clearCache">
					<view class="item-left">
						<view class="item-icon cache-icon"></view>
						<text class="item-text">清除缓存</text>
					</view>
					<view class="item-right">
						<text class="item-value">{{ cacheSize }}</text>
						<text class="item-arrow">></text>
					</view>
				</view>
				
				<view class="setting-item" @click="exportData">
					<view class="item-left">
						<view class="item-icon export-icon"></view>
						<text class="item-text">导出学习数据</text>
					</view>
					<text class="item-arrow">></text>
				</view>
			</view>
		</view>
		
		<!-- 难度选择器 -->
		<view v-if="showDifficultyModal" class="picker-modal" @click="hideDifficultyPicker">
			<view class="picker-content" @click.stop>
				<view class="picker-header">
					<text class="picker-title">选择默认难度</text>
					<text class="picker-cancel" @click="hideDifficultyPicker">取消</text>
				</view>
				<view class="picker-options">
					<view
						v-for="(item, index) in difficultyOptions"
						:key="index"
						class="picker-option"
						:class="{ active: settings.difficulty === item.value }"
						@click="selectDifficulty(item.value)"
					>
						<text>{{ item.text }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 题数选择器 -->
		<view v-if="showQuestionCountModal" class="picker-modal" @click="hideQuestionCountPicker">
			<view class="picker-content" @click.stop>
				<view class="picker-header">
					<text class="picker-title">选择每次练习题数</text>
					<text class="picker-cancel" @click="hideQuestionCountPicker">取消</text>
				</view>
				<view class="picker-options">
					<view
						v-for="count in questionCountOptions"
						:key="count"
						class="picker-option"
						:class="{ active: settings.questionCount === count }"
						@click="selectQuestionCount(count)"
					>
						<text>{{ count }}题</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			settings: {
				notification: true,
				sound: true,
				vibration: false,
				difficulty: 'medium',
				questionCount: 20,
				autoNext: false
			},
			showDifficultyModal: false,
			showQuestionCountModal: false,
			difficultyOptions: [
				{ value: 'easy', text: '简单' },
				{ value: 'medium', text: '中等' },
				{ value: 'hard', text: '困难' }
			],
			questionCountOptions: [10, 15, 20, 25, 30, 50],
			cacheSize: '0KB'
		}
	},
	computed: {
		difficultyText() {
			const option = this.difficultyOptions.find(item => item.value === this.settings.difficulty)
			return option ? option.text : '中等'
		}
	},
	onLoad(options) {
		// 确保options对象存在，防止TypeError
		if (!options) {
			options = {}
		}
		console.log('Settings页面onLoad options:', options)
		this.loadSettings()
		this.calculateCacheSize()
	},
	methods: {
		// 返回上一页
		goBack() {
			// 获取当前页面栈
			const pages = getCurrentPages();

			// 如果页面栈只有一个页面，跳转到首页
			if (pages.length <= 1) {
				uni.switchTab({
					url: '/pages/home/home'
				});
			} else {
				// 正常返回上一页
				uni.navigateBack({
					delta: 1
				});
			}
		},
		
		// 加载设置
		loadSettings() {
			try {
				const savedSettings = uni.getStorageSync('app_settings')
				if (savedSettings) {
					this.settings = { ...this.settings, ...savedSettings }
				}
			} catch (error) {
				console.error('加载设置失败:', error)
			}
		},
		
		// 保存设置
		saveSettings() {
			try {
				uni.setStorageSync('app_settings', this.settings)
			} catch (error) {
				console.error('保存设置失败:', error)
			}
		},
		
		// 通知设置
		toggleNotification() {
			this.settings.notification = !this.settings.notification
			this.saveSettings()
			// 添加反馈
			uni.showToast({
				title: this.settings.notification ? '已开启消息通知' : '已关闭消息通知',
				icon: 'none',
				duration: 1500
			})
		},

		onNotificationChange(e) {
			this.settings.notification = e.detail.value
			this.saveSettings()
		},

		// 音效设置
		toggleSound() {
			this.settings.sound = !this.settings.sound
			this.saveSettings()
			// 添加反馈
			uni.showToast({
				title: this.settings.sound ? '已开启音效提示' : '已关闭音效提示',
				icon: 'none',
				duration: 1500
			})
		},

		onSoundChange(e) {
			this.settings.sound = e.detail.value
			this.saveSettings()
		},

		// 震动设置
		toggleVibration() {
			this.settings.vibration = !this.settings.vibration
			this.saveSettings()
			// 添加反馈
			uni.showToast({
				title: this.settings.vibration ? '已开启震动反馈' : '已关闭震动反馈',
				icon: 'none',
				duration: 1500
			})
		},

		onVibrationChange(e) {
			this.settings.vibration = e.detail.value
			this.saveSettings()
		},

		// 自动下一题设置
		toggleAutoNext() {
			this.settings.autoNext = !this.settings.autoNext
			this.saveSettings()
			// 添加反馈
			uni.showToast({
				title: this.settings.autoNext ? '已开启自动下一题' : '已关闭自动下一题',
				icon: 'none',
				duration: 1500
			})
		},

		onAutoNextChange(e) {
			this.settings.autoNext = e.detail.value
			this.saveSettings()
		},
		
		// 显示难度选择器
		showDifficultyPicker() {
			this.showDifficultyModal = true
		},
		
		// 隐藏难度选择器
		hideDifficultyPicker() {
			this.showDifficultyModal = false
		},
		
		// 选择难度
		selectDifficulty(difficulty) {
			this.settings.difficulty = difficulty
			this.saveSettings()
			this.hideDifficultyPicker()

			// 添加反馈
			const difficultyText = this.difficultyOptions.find(item => item.value === difficulty)?.text || '中等'
			uni.showToast({
				title: `默认难度已设为${difficultyText}`,
				icon: 'none',
				duration: 1500
			})
		},
		
		// 显示题数选择器
		showQuestionCountPicker() {
			this.showQuestionCountModal = true
		},
		
		// 隐藏题数选择器
		hideQuestionCountPicker() {
			this.showQuestionCountModal = false
		},
		
		// 选择题数
		selectQuestionCount(count) {
			this.settings.questionCount = count
			this.saveSettings()
			this.hideQuestionCountPicker()

			// 添加反馈
			uni.showToast({
				title: `每次练习题数已设为${count}题`,
				icon: 'none',
				duration: 1500
			})
		},
		
		// 清除缓存
		clearCache() {
			uni.showModal({
				title: '清除缓存',
				content: '确定要清除应用缓存吗？这将不会删除您的学习数据。',
				success: res => {
					if (res.confirm) {
						uni.showLoading({
							title: '清理中...'
						})
						
						// 实际清理缓存数据
						try {
							// 清理图片缓存
							// #ifdef APP-PLUS
							if (plus && plus.cache) {
								plus.cache.clear()
							}
							// #endif
							
							// 清理临时数据（保留用户设置和登录信息）
							const preserveKeys = ['app_settings', 'user_token', 'user_info']
							const storage = uni.getStorageInfoSync()
							
							storage.keys.forEach(key => {
								if (!preserveKeys.includes(key)) {
									uni.removeStorageSync(key)
								}
							})
							
							setTimeout(() => {
								this.cacheSize = '0KB'
								uni.hideLoading()
								uni.showToast({
									title: '缓存已清除',
									icon: 'success'
								})
							}, 1000)
							
						} catch (error) {
							console.error('清理缓存失败:', error)
							uni.hideLoading()
							uni.showToast({
								title: '清理失败',
								icon: 'error'
							})
						}
					}
				}
			})
		},
		
		// 导出学习数据
		exportData() {
			uni.showLoading({
				title: '准备导出...'
			})
			
			try {
				// 收集用户数据
				const userData = {
					userInfo: uni.getStorageSync('user_info') || {},
					studyRecords: uni.getStorageSync('study_records') || [],
					wrongQuestions: uni.getStorageSync('wrong_questions') || [],
					favorites: uni.getStorageSync('favorites') || [],
					achievements: uni.getStorageSync('achievements') || [],
					settings: uni.getStorageSync('app_settings') || {},
					exportTime: new Date().toISOString(),
					version: '1.0.0'
				}
				
				const dataString = JSON.stringify(userData, null, 2)
				
				setTimeout(() => {
					uni.hideLoading()
					
					// #ifdef H5
					// H5环境下使用下载
					const blob = new Blob([dataString], { type: 'application/json' })
					const url = URL.createObjectURL(blob)
					const a = document.createElement('a')
					a.href = url
					a.download = `学习数据_${new Date().getTime()}.json`
					a.click()
					URL.revokeObjectURL(url)
					
					uni.showToast({
						title: '导出成功',
						icon: 'success'
					})
					// #endif
					
					// #ifdef APP-PLUS
					// App环境下保存到文件
					const fileName = `学习数据_${new Date().getTime()}.json`
					const filePath = '_downloads/' + fileName
					
					plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, fs => {
						fs.root.getFile(fileName, { create: true }, fileEntry => {
							fileEntry.createWriter(writer => {
								writer.write(dataString)
								uni.showModal({
									title: '导出成功',
									content: `数据已保存到 Downloads/${fileName}`,
									showCancel: false
								})
							})
						})
					})
					// #endif
					
					// #ifdef MP
					// 小程序环境下复制到剪贴板
					uni.setClipboardData({
						data: dataString,
						success: () => {
							uni.showModal({
								title: '导出成功',
								content: '数据已复制到剪贴板，可粘贴到记事本保存',
								showCancel: false
							})
						}
					})
					// #endif
					
				}, 1000)
				
			} catch (error) {
				console.error('导出数据失败:', error)
				uni.hideLoading()
				uni.showToast({
					title: '导出失败',
					icon: 'error'
				})
			}
		},
		
		// 计算缓存大小
		calculateCacheSize() {
			try {
				const storageInfo = uni.getStorageInfoSync()
				let totalSize = 0
				
				// 计算所有存储数据的大小
				storageInfo.keys.forEach(key => {
					try {
						const data = uni.getStorageSync(key)
						if (data) {
							const dataString = typeof data === 'string' ? data : JSON.stringify(data)
							totalSize += new Blob([dataString]).size
						}
					} catch (e) {
						// 忽略无法读取的数据
					}
				})
				
				// 格式化大小
				if (totalSize < 1024) {
					this.cacheSize = totalSize + 'B'
				} else if (totalSize < 1024 * 1024) {
					this.cacheSize = (totalSize / 1024).toFixed(1) + 'KB'
				} else {
					this.cacheSize = (totalSize / (1024 * 1024)).toFixed(1) + 'MB'
				}
				
			} catch (error) {
				console.error('计算缓存大小失败:', error)
				this.cacheSize = '未知'
			}
		}
	}
}
</script>

<style scoped>
.settings-container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
	border-radius: 50%;
	background-color: #f5f5f5;
}

.back-icon {
	font-size: 40rpx;
	color: #333;
	font-weight: bold;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
	text-align: center;
}

.settings-list {
	margin-bottom: 20rpx;
}

.section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 28rpx;
	color: #999;
	margin-bottom: 20rpx;
	padding-left: 10rpx;
}

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 10rpx;
	border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
	border-bottom: none;
}

.item-left {
	display: flex;
	align-items: center;
}

.item-icon {
	width: 36rpx;
	height: 36rpx;
	margin-right: 20rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* SVG 图标样式 */
.notification-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 12px;
	height: 14px;
	border: 2px solid #4A90E2;
	border-radius: 3px 3px 0 0;
	background: transparent;
}

.notification-icon::after {
	content: '';
	position: absolute;
	top: 70%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 4px;
	height: 3px;
	background: #4A90E2;
	border-radius: 50%;
}

.sound-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 25%;
	transform: translate(-50%, -50%) skew(-10deg);
	width: 6px;
	height: 6px;
	background: #4A90E2;
}

.sound-icon::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 60%;
	transform: translate(-50%, -50%);
	width: 10px;
	height: 10px;
	border: 2px solid #4A90E2;
	border-left: none;
	border-radius: 0 10px 10px 0;
	background: transparent;
}

.vibration-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 8px;
	height: 14px;
	border: 2px solid #4A90E2;
	border-radius: 3px;
	background: transparent;
}

.vibration-icon::after {
	content: '';
	position: absolute;
	top: 25%;
	left: 35%;
	width: 2px;
	height: 2px;
	background: #4A90E2;
	box-shadow: 4px 0 0 #4A90E2, 8px 0 0 #4A90E2, 4px 16px 0 #4A90E2, 8px 16px 0 #4A90E2;
}

.difficulty-icon::before {
	content: '';
	position: absolute;
	top: 30%;
	left: 50%;
	transform: translateX(-50%);
	width: 0;
	height: 0;
	border-left: 6px solid transparent;
	border-right: 6px solid transparent;
	border-bottom: 10px solid #FFD700;
}

.difficulty-icon::after {
	content: '';
	position: absolute;
	top: 65%;
	left: 50%;
	transform: translateX(-50%);
	width: 16px;
	height: 6px;
	background: #FFD700;
	border-radius: 3px;
}

.question-count-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 14px;
	height: 16px;
	border: 2px solid #4A90E2;
	background: transparent;
}

.question-count-icon::after {
	content: '';
	position: absolute;
	top: 40%;
	left: 50%;
	transform: translateX(-50%);
	width: 8px;
	height: 1px;
	background: #4A90E2;
	box-shadow: 0 3px 0 #4A90E2, 0 6px 0 #4A90E2;
}

.auto-next-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 0;
	height: 0;
	border-left: 8px solid #4A90E2;
	border-top: 6px solid transparent;
	border-bottom: 6px solid transparent;
}

.cache-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 12px;
	height: 16px;
	border: 2px solid #FF6B6B;
	background: transparent;
}

.cache-icon::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 4px;
	height: 4px;
	background: #FF6B6B;
}

.export-icon::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 16px;
	height: 2px;
	background: #34C759;
}

.export-icon::after {
	content: '';
	position: absolute;
	top: 30%;
	left: 70%;
	transform: translate(-50%, -50%);
	width: 0;
	height: 0;
	border-left: 4px solid transparent;
	border-right: 4px solid transparent;
	border-bottom: 6px solid #34C759;
}

.item-text {
	font-size: 28rpx;
	color: #333;
}

.item-right {
	display: flex;
	align-items: center;
}

.item-value {
	font-size: 28rpx;
	color: #999;
	margin-right: 10rpx;
}

.item-arrow {
	font-size: 28rpx;
	color: #999;
}

/* 选择器样式 */
.picker-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 999;
	display: flex;
	align-items: flex-end;
}

.picker-content {
	width: 100%;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
}

.picker-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	border-bottom: 1px solid #f5f5f5;
}

.picker-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.picker-cancel {
	font-size: 28rpx;
	color: #4A90E2;
}

.picker-options {
	padding: 20rpx;
	max-height: 600rpx;
	overflow-y: auto;
}

.picker-option {
	padding: 20rpx;
	text-align: center;
	font-size: 30rpx;
	color: #333;
	border-radius: 10rpx;
	margin-bottom: 10rpx;
}

.picker-option.active {
	background-color: #4A90E2;
	color: #fff;
}
</style>