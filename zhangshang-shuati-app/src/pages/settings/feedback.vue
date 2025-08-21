<template>
	<view class="feedback-container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="header-icon">💬</text>
			<text class="header-title">意见反馈</text>
			<text class="header-subtitle">你的声音，我们用心聆听</text>
		</view>
		
		<!-- 反馈表单 -->
		<view class="feedback-form">
			<!-- 反馈类型 -->
			<view class="form-section">
				<view class="section-title">反馈类型</view>
				<view class="type-options">
					<view 
						v-for="(type, index) in feedbackTypes" 
						:key="index"
						class="type-option"
						:class="{ active: selectedType === type.value }"
						@click="selectType(type.value)"
					>
						<text class="type-icon">{{ type.emoji }}</text>
						<text class="type-text">{{ type.text }}</text>
					</view>
				</view>
			</view>
			
			<!-- 反馈内容 -->
			<view class="form-section">
				<view class="section-title">反馈内容</view>
				<textarea 
					v-model="feedbackContent"
					class="feedback-textarea"
					placeholder="请详细描述您遇到的问题或建议，我们会认真对待每一条反馈..."
					maxlength="500"
					auto-height
					:show-count="true"
				></textarea>
			</view>
			
			<!-- 联系方式 -->
			<view class="form-section">
				<view class="section-title">联系方式（选填）</view>
				<input 
					v-model="contactInfo"
					class="contact-input"
					placeholder="请留下您的邮箱或微信，方便我们回复您"
					maxlength="50"
				/>
			</view>
			
			<!-- 提交按钮 -->
			<view class="submit-section">
				<button 
					class="submit-btn"
					:class="{ disabled: !canSubmit }"
					:disabled="!canSubmit || submitting"
					@click="submitFeedback"
				>
					<text v-if="submitting">提交中...</text>
					<text v-else>提交反馈</text>
				</button>
			</view>
		</view>
		
		<!-- 历史反馈 -->
		<view class="history-section" v-if="feedbackHistory.length > 0">
			<view class="section-title">我的反馈记录</view>
			<view class="history-list">
				<view 
					v-for="(item, index) in feedbackHistory" 
					:key="index"
					class="history-item"
					@click="viewFeedbackDetail(item)"
				>
					<view class="history-header">
						<text class="history-type">{{ getTypeText(item.type) }}</text>
						<text class="history-date">{{ formatDate(item.date) }}</text>
					</view>
					<text class="history-content">{{ item.content.substring(0, 50) }}{{ item.content.length > 50 ? '...' : '' }}</text>
					<view class="history-status">
						<text class="status-text" :class="item.status">{{ getStatusText(item.status) }}</text>
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
			selectedType: '',
			feedbackContent: '',
			contactInfo: '',
			submitting: false,
			feedbackTypes: [
				{ value: 'bug', text: 'Bug反馈', emoji: '🐞' },
				{ value: 'feature', text: '功能建议', emoji: '⭐' },
				{ value: 'ui', text: '界面优化', emoji: '🎨' },
				{ value: 'other', text: '其他问题', emoji: '❓' }
			],
			feedbackHistory: []
		}
	},
	computed: {
		canSubmit() {
			return this.selectedType && this.feedbackContent.trim().length >= 10
		}
	},
	onLoad() {
		this.loadFeedbackHistory()
	},
	methods: {
		// 选择反馈类型
		selectType(type) {
			this.selectedType = type
		},
		
		// 提交反馈
		async submitFeedback() {
			if (!this.canSubmit || this.submitting) {
				return
			}
			
			this.submitting = true
			
			try {
				// 模拟提交到服务器
				await new Promise(resolve => setTimeout(resolve, 1500))
				
				// 创建反馈记录
				const feedback = {
					id: Date.now(),
					type: this.selectedType,
					content: this.feedbackContent,
					contact: this.contactInfo,
					date: new Date(),
					status: 'pending' // pending, processing, resolved
				}
				
				// 保存到本地历史记录
				this.feedbackHistory.unshift(feedback)
				this.saveFeedbackHistory()
				
				// 清空表单
				this.selectedType = ''
				this.feedbackContent = ''
				this.contactInfo = ''
				
				uni.showToast({
					title: '反馈提交成功！',
					icon: 'success',
					duration: 2000
				})
				
			} catch (error) {
				console.error('提交反馈失败:', error)
				uni.showToast({
					title: '提交失败，请重试',
					icon: 'error'
				})
			} finally {
				this.submitting = false
			}
		},
		
		// 加载反馈历史
		loadFeedbackHistory() {
			try {
				const history = uni.getStorageSync('feedback_history')
				if (history) {
					this.feedbackHistory = history.map(item => ({
						...item,
						date: new Date(item.date)
					}))
				}
			} catch (error) {
				console.error('加载反馈历史失败:', error)
			}
		},
		
		// 保存反馈历史
		saveFeedbackHistory() {
			try {
				uni.setStorageSync('feedback_history', this.feedbackHistory)
			} catch (error) {
				console.error('保存反馈历史失败:', error)
			}
		},
		
		// 查看反馈详情
		viewFeedbackDetail(feedback) {
			uni.showModal({
				title: this.getTypeText(feedback.type),
				content: `反馈内容：${feedback.content}\n\n提交时间：${this.formatDate(feedback.date)}\n\n状态：${this.getStatusText(feedback.status)}`,
				showCancel: false,
				confirmText: '知道了'
			})
		},
		
		// 获取类型文本
		getTypeText(type) {
			const typeObj = this.feedbackTypes.find(item => item.value === type)
			return typeObj ? typeObj.text : '未知类型'
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				pending: '待处理',
				processing: '处理中',
				resolved: '已解决'
			}
			return statusMap[status] || '未知状态'
		},
		
		// 格式化日期
		formatDate(date) {
			const now = new Date()
			const diff = now - date
			const days = Math.floor(diff / (1000 * 60 * 60 * 24))
			
			if (days === 0) {
				return '今天'
			} else if (days === 1) {
				return '昨天'
			} else if (days < 7) {
				return `${days}天前`
			} else {
				return date.toLocaleDateString()
			}
		}
	}
}
</script>

<style scoped>
.feedback-container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	text-align: center;
	padding: 40rpx 20rpx;
	background-color: white;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.header-icon {
	font-size: 60rpx;
	margin-bottom: 10rpx;
	display: block;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.header-subtitle {
	font-size: 26rpx;
	color: #999;
}

.feedback-form {
	margin-bottom: 30rpx;
}

.form-section {
	background-color: white;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 28rpx;
	color: #999;
	margin-bottom: 20rpx;
}

.type-options {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -10rpx;
}

.type-option {
	width: calc(50% - 20rpx);
	margin: 10rpx;
	padding: 20rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	transition: all 0.3s ease;
}

.type-option.active {
	background-color: #4A90E2;
}

.type-icon {
	font-size: 36rpx;
	margin-right: 15rpx;
}

.type-option.active .type-icon {
	color: white;
}

.type-text {
	font-size: 28rpx;
	color: #333;
}

.type-option.active .type-text {
	color: white;
}

.feedback-textarea {
	width: 100%;
	min-height: 200rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	padding: 20rpx;
	font-size: 28rpx;
	color: #333;
}

.contact-input {
	width: 100%;
	height: 80rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #333;
}

.submit-section {
	margin-top: 40rpx;
}

.submit-btn {
	width: 100%;
	height: 90rpx;
	background-color: #4A90E2;
	color: white;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn.disabled {
	background-color: #ccc;
	color: #fff;
}

.history-section {
	background-color: white;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.history-list {
	margin-top: 20rpx;
}

.history-item {
	padding: 20rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.history-item:last-child {
	margin-bottom: 0;
}

.history-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.history-type {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.history-date {
	font-size: 24rpx;
	color: #999;
}

.history-content {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 10rpx;
	line-height: 1.5;
}

.history-status {
	text-align: right;
}

.status-text {
	display: inline-block;
	font-size: 24rpx;
	padding: 4rpx 12rpx;
	border-radius: 10rpx;
}

.status-text.pending {
	background-color: #FFB74D;
	color: white;
}

.status-text.processing {
	background-color: #64B5F6;
	color: white;
}

.status-text.resolved {
	background-color: #81C784;
	color: white;
}
</style>