<template>
	<view class="settings-container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="header-title">设置</text>
		</view>
		
		<!-- 设置列表 -->
		<view class="settings-list">
			<!-- 通用设置 -->
			<view class="section">
				<view class="section-title">通用设置</view>
				<view class="setting-item" @click="toggleNotification">
					<view class="item-left">
						<text class="item-icon">🔔</text>
						<text class="item-text">消息通知</text>
					</view>
					<switch :checked="settings.notification" @change="onNotificationChange" color="#4A90E2" />
				</view>
				
				<view class="setting-item" @click="toggleSound">
					<view class="item-left">
						<text class="item-icon">🔊</text>
						<text class="item-text">音效提示</text>
					</view>
					<switch :checked="settings.sound" @change="onSoundChange" color="#4A90E2" />
				</view>
				
				<view class="setting-item" @click="toggleVibration">
					<view class="item-left">
						<text class="item-icon">📳</text>
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
						<text class="item-icon">⭐</text>
						<text class="item-text">默认难度</text>
					</view>
					<view class="item-right">
						<text class="item-value">{{ difficultyText }}</text>
						<text class="item-arrow">></text>
					</view>
				</view>
				
				<view class="setting-item" @click="showQuestionCountPicker">
					<view class="item-left">
						<text class="item-icon">📋</text>
						<text class="item-text">每次练习题数</text>
					</view>
					<view class="item-right">
						<text class="item-value">{{ settings.questionCount }}题</text>
						<text class="item-arrow">></text>
					</view>
				</view>
				
				<view class="setting-item" @click="toggleAutoNext">
					<view class="item-left">
						<text class="item-icon">▶️</text>
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
						<text class="item-icon">🗑️</text>
						<text class="item-text">清除缓存</text>
					</view>
					<view class="item-right">
						<text class="item-value">{{ cacheSize }}</text>
						<text class="item-arrow">></text>
					</view>
				</view>
				
				<view class="setting-item" @click="exportData">
					<view class="item-left">
						<text class="item-icon">📤</text>
						<text class="item-text">导出学习数据</text>
					</view>
					<text class="item-arrow">></text>
				</view>
			</view>
		</view>
		
		<!-- 难度选择器 -->
		<picker-view v-if="showDifficultyModal" class="picker-modal" @click="hideDifficultyPicker">
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
		</picker-view>
		
		<!-- 题数选择器 -->
		<picker-view v-if="showQuestionCountModal" class="picker-modal" @click="hideQuestionCountPicker">
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
		</picker-view>
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
		},
		
		onNotificationChange(e) {
			this.settings.notification = e.detail.value
			this.saveSettings()
		},
		
		// 音效设置
		toggleSound() {
			this.settings.sound = !this.settings.sound
			this.saveSettings()
		},
		
		onSoundChange(e) {
			this.settings.sound = e.detail.value
			this.saveSettings()
		},
		
		// 震动设置
		toggleVibration() {
			this.settings.vibration = !this.settings.vibration
			this.saveSettings()
		},
		
		onVibrationChange(e) {
			this.settings.vibration = e.detail.value
			this.saveSettings()
		},
		
		// 自动下一题设置
		toggleAutoNext() {
			this.settings.autoNext = !this.settings.autoNext
			this.saveSettings()
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
						
						setTimeout(() => {
							// 模拟清理缓存
							this.cacheSize = '0KB'
							uni.hideLoading()
							uni.showToast({
								title: '缓存已清除',
								icon: 'success'
							})
						}, 1500)
					}
				}
			})
		},
		
		// 导出学习数据
		exportData() {
			uni.showLoading({
				title: '准备导出...'
			})
			
			setTimeout(() => {
				uni.hideLoading()
				uni.showModal({
					title: '导出成功',
					content: '学习数据已成功导出到设备。',
					showCancel: false
				})
			}, 1500)
		},
		
		// 计算缓存大小
		calculateCacheSize() {
			// 模拟计算缓存大小
			setTimeout(() => {
				this.cacheSize = '2.5MB'
			}, 500)
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
	padding: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
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
	font-size: 36rpx;
	margin-right: 20rpx;
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