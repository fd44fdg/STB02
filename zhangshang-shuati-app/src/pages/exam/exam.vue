<template>
	<view class="exam-container">
		<view class="header">
		</view>

		<!-- 配置卡片 -->
		<view class="config-card">
			<!-- 科目选择 -->
			<view class="config-item" @click="showSubjectPicker">
				<view class="item-label">
					<ModernIcon type="practice" :size="20" />
					<text>选择科目</text>
				</view>
				<view class="picker-value">
					<text>{{ selectedSubjectName }}</text>
					<uni-icons type="right" size="16" color="#909399"></uni-icons>
				</view>
			</view>

			<!-- 题目数量 -->
			<view class="config-item">
				<view class="item-label">
					<ModernIcon type="exam" :size="20" />
					<text>题目数量</text>
				</view>
				<view class="stepper">
					<button @click="decrement" :disabled="questionCount <= 10">-</button>
					<text>{{ questionCount }}</text>
					<button @click="increment" :disabled="questionCount >= 100">+</button>
				</view>
			</view>

			<!-- 考试时间 -->
			<view class="config-item">
				<view class="item-label">
					<ModernIcon type="favorite" :size="20" />
					<text>考试时间 (分钟)</text>
				</view>
				<text class="duration-text">{{ examDuration }}</text>
			</view>
		</view>

		<!-- 开始按钮 -->
		<button class="start-exam-btn" @click="startExam" :disabled="!isReady">
			开始考试
		</button>

		<!-- 自定义科目选择器 -->
		<view class="custom-picker-mask" v-if="subjectPickerVisible" @click="hideSubjectPicker">
			<view class="custom-picker-container" @click.stop>
				<view class="picker-header">
					<text class="picker-title">请选择科目</text>
					<text class="picker-close" @click="hideSubjectPicker">完成</text>
				</view>
				<view class="picker-options">
					<view 
						v-for="(subject, index) in subjects"
						:key="subject.id"
						class="picker-option"
						:class="{ selected: subjectIndex === index }"
						@click="selectSubject(index)"
					>
						{{ subject.name }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import ModernIcon from '@/components/ModernIcon.vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { subjects } from '@/mock/subjects.js';

export default {
	name: "Exam",
	components: {
		ModernIcon,
		uniIcons
	},
	data() {
		return {
			subjects: subjects,
			subjectIndex: 0,
			questionCount: 20,
			subjectPickerVisible: false,
		};
	},
	computed: {
		selectedSubjectName() {
			if (this.subjectIndex > -1 && this.subjects[this.subjectIndex]) {
				return this.subjects[this.subjectIndex].name;
			}
			return '请选择';
		},
		examDuration() {
			return Math.ceil(this.questionCount * 1.5);
		},
		isReady() {
			return this.subjectIndex !== -1 && this.subjects.length > 0;
		}
	},
	methods: {
		showSubjectPicker() {
			this.subjectPickerVisible = true;
		},
		hideSubjectPicker() {
			this.subjectPickerVisible = false;
		},
		selectSubject(index) {
			this.subjectIndex = index;
		},
		decrement() {
			if (this.questionCount > 10) {
				this.questionCount -= 10;
			}
		},
		increment() {
			if (this.questionCount < 100) {
				this.questionCount += 10;
			}
		},
		startExam() {
			if (!this.isReady) {
				uni.showToast({ title: '请先选择科目', icon: 'none' });
				return;
			}
			const selectedSubject = this.subjects[this.subjectIndex];
			uni.setStorageSync('examSessionConfig', {
				pageTitle: selectedSubject.name + ' - 模拟考试',
				mode: 'exam',
				config: {
					category: selectedSubject.id,
					count: this.questionCount,
					duration: this.examDuration * 60
				}
			});
			uni.navigateTo({
				url: '/pages/exam/session'
			});
		}
	}
};
</script>

<style scoped>
.exam-container {
	background-color: var(--bg-color, #f8f9fa);
	min-height: 100vh;
	padding: 40rpx 30rpx;
}

.header {
	margin-bottom: 40rpx;
	padding-left: 10rpx;
}

.title {
	font-size: 48rpx;
	font-weight: bold;
	color: var(--text-primary, #303133);
	display: block;
	margin-bottom: 10rpx;
}

.subtitle {
	font-size: 28rpx;
	color: var(--text-secondary, #909399);
}

.config-card {
	background-color: var(--card-bg, #ffffff);
	border-radius: 24rpx;
	padding: 20rpx 40rpx;
	box-shadow: var(--shadow, 0 8rpx 30rpx rgba(0, 0, 0, 0.05));
	margin-bottom: 60rpx;
}

.config-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 35rpx 0;
	border-bottom: 1rpx solid var(--border-color, #f0f0f0);
}

.config-item:last-child {
	border-bottom: none;
}

.item-label {
	display: flex;
	align-items: center;
	font-size: 30rpx;
	color: var(--text-primary, #303133);
}

.item-label text {
	margin-left: 16rpx;
}

.picker-value {
	display: flex;
	align-items: center;
	font-size: 30rpx;
	color: var(--text-secondary, #606266);
}

.picker-value uni-icons {
	color: var(--text-disabled, #909399) !important;
}

.stepper {
	display: flex;
	align-items: center;
}

.stepper text {
	font-size: 32rpx;
	font-weight: 500;
	color: var(--text-primary, #303133);
	margin: 0 40rpx;
	min-width: 60rpx;
	text-align: center;
}

.stepper button {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background-color: var(--bg-color-soft, #f4f4f5);
	color: var(--text-primary, #303133);
	font-size: 40rpx;
	line-height: 60rpx;
	padding: 0;
	margin: 0;
}

.stepper button:disabled {
	background-color: var(--bg-color, #f8f9fa);
	color: var(--text-disabled, #c0c4cc);
}

.duration-text {
	font-size: 30rpx;
	color: var(--text-secondary, #909399);
}

.start-exam-btn {
	background: var(--accent-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
	color: white;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 50rpx;
	padding: 25rpx 0;
	box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s ease;
}

.start-exam-btn:disabled {
	background: var(--bg-disabled, #c8c9cc);
	box-shadow: none;
	color: var(--text-on-disabled, #ffffff);
}

/* Custom Picker Styles */
.custom-picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	z-index: 1000;
	transition: opacity 0.3s ease;
}

.custom-picker-container {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: var(--card-bg, #ffffff);
	border-radius: 30rpx 30rpx 0 0;
	padding: 20rpx 0;
	transform: translateY(100%);
	animation: slide-up 0.3s ease forwards;
}

.picker-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 40rpx 20rpx;
	border-bottom: 1rpx solid var(--border-color, #f0f0f0);
}

.picker-title {
	font-size: 32rpx;
	font-weight: bold;
	color: var(--text-primary, #303133);
}

.picker-close {
	font-size: 30rpx;
	color: var(--accent-active, #4A90E2);
}

.picker-options {
	max-height: 500rpx;
	overflow-y: auto;
	padding: 20rpx 40rpx;
}

.picker-option {
	font-size: 32rpx;
	color: var(--text-primary, #303133);
	padding: 25rpx 0;
	text-align: center;
	transition: background-color 0.2s ease;
}

.picker-option.selected {
	color: var(--accent-active, #4A90E2);
	font-weight: bold;
}

@keyframes slide-up {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}
</style>