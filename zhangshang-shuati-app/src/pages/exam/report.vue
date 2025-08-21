<template>
	<view class="report-container">
		<!-- 结果总览卡片 -->
		<view class="summary-card">
			<view class="summary-header">
				<text class="congrats-text">{{ accuracy >= 80 ? '太棒了，继续保持！' : (accuracy >= 60 ? '成绩不错，再接再厉！' : '别灰心，继续努力！') }}</text>
			</view>
			<view class="summary-grid">
				<view class="stat-item">
					<text class="stat-value">{{ correctCount }} / {{ totalCount }}</text>
					<text class="stat-label">答对</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ accuracy }}%</text>
					<text class="stat-label">正确率</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ formattedDuration }}</text>
					<text class="stat-label">用时</text>
				</view>
			</view>
		</view>

		<!-- 题目列表 -->
		<view class="questions-section">
			<view class="section-title">
				<text>全部题目</text>
			</view>
			<scroll-view scroll-y class="questions-scroll-view">
				<view v-for="(question, index) in questions" :key="question.id" class="question-item">
					<view class="question-title">
						<view class="question-number">{{ index + 1 }}.</view>
						<view class="question-text">{{ question.title }}</view>
					</view>
					<view class="question-result">
						<text class="result-label">你的答案: {{ getUserAnswerString(question) }}</text>
						<uni-icons :type="isAnswerCorrect(question) ? 'checkmark-filled' : 'close-filled'" :color="isAnswerCorrect(question) ? '#4caf50' : '#f44336'" size="20"></uni-icons>
					</view>
					<view class="correct-answer">
						<text>正确答案: {{ getCorrectAnswerString(question) }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="footer-actions">
			<button class="action-btn" @click="goHome">返回首页</button>
			<button class="action-btn primary" @click="reviewWrong">回顾错题</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const questions = ref([]);
const correctCount = ref(0);
const totalCount = ref(0);
const duration = ref(0);

onLoad(() => {
	const result = uni.getStorageSync('examResult');
	if (result) {
		questions.value = result.questions || [];
		correctCount.value = result.correctCount || 0;
		totalCount.value = result.totalCount || 0;
		duration.value = result.duration || 0;
	}
});

onUnmounted(() => {
    // 清理缓存，防止下次直接进入报告页
    uni.removeStorageSync('examResult');
});

const accuracy = computed(() => {
	if (totalCount.value === 0) return 0;
	return Math.round((correctCount.value / totalCount.value) * 100);
});

const formattedDuration = computed(() => {
    const minutes = Math.floor(duration.value / 60);
    const seconds = duration.value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const isAnswerCorrect = (question) => {
    const correctAnswer = JSON.stringify([...(question.correctAnswer || [])].sort());
    const userAnswer = JSON.stringify([...(question.userAnswer || [])].sort());
    return correctAnswer === userAnswer;
};

const getCorrectAnswerString = (question) => (question.correctAnswer || []).map(i => String.fromCharCode(65 + i)).join(', ');
const getUserAnswerString = (question) => {
    const userAnswer = question.userAnswer;
    if (userAnswer === undefined || userAnswer.length === 0) return '未作答';
    return userAnswer.map(i => String.fromCharCode(65 + i)).join(', ');
}

const goHome = () => {
	uni.switchTab({
		url: '/pages/index/index'
	});
};

const reviewWrong = () => {
	// 跳转到错题本页面
	uni.navigateTo({
		url: '/pages/wrong-questions/index'
	});
};
</script>

<style lang="scss" scoped>
.report-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #f7f8fa;
}

.summary-card {
	background: linear-gradient(135deg, #4C8AF5, #67B2FF);
	color: white;
	margin: 20rpx;
	border-radius: 20rpx;
	padding: 40rpx 30rpx;
	text-align: center;
    box-shadow: 0 8rpx 20rpx rgba(76, 138, 245, 0.3);
}

.summary-header {
	margin-bottom: 40rpx;
}

.congrats-text {
	font-size: 36rpx;
	font-weight: bold;
}

.summary-grid {
	display: flex;
	justify-content: space-around;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-value {
	font-size: 40rpx;
	font-weight: bold;
}

.stat-label {
	font-size: 26rpx;
	opacity: 0.8;
	margin-top: 10rpx;
}

.questions-section {
	flex: 1;
	margin: 0 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
    padding-left: 20rpx;
	border-left: 6rpx solid #4C8AF5;
}

.questions-scroll-view {
    height: 0; // 配合 flex: 1; 使用
    flex: 1;
}

.question-item {
	padding: 25rpx 0;
	border-bottom: 1px solid #f0f0f0;
    &:last-child {
        border-bottom: none;
    }
}

.question-title {
	display: flex;
	align-items: flex-start;
	font-size: 28rpx;
	margin-bottom: 15rpx;
}

.question-number {
	margin-right: 10rpx;
	color: #666;
}

.question-text {
	flex: 1;
	line-height: 1.6;
}

.question-result, .correct-answer {
	font-size: 26rpx;
	color: #666;
	margin-left: 38rpx;
}

.question-result {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.correct-answer {
    color: #4caf50;
    font-weight: 500;
}

.footer-actions {
	display: flex;
	gap: 20rpx;
	padding: 20rpx;
	background-color: #fff;
    border-top: 1px solid #eee;
}

.action-btn {
	flex: 1;
	margin: 0;
	border-radius: 50rpx;
	font-weight: 500;

	&.primary {
		background-color: #4C8AF5;
		color: white;
	}
}
</style> 