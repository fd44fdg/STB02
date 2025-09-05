<template>
	<view class="practice-container">
				<!-- 练习设置 -->
		<view class="settings-card">
			<view class="setting-item">
				<view class="item-label">
					<text class="iconfont icon-counter" style="font-size: 20px; color: var(--text-primary);"></text>
					<text>题目数量</text>
				</view>
				<view class="stepper">
					<button @click="decrement" :disabled="practiceConfig.count <= 10">-</button>
					<text>{{ practiceConfig.count }}</text>
					<button @click="increment" :disabled="practiceConfig.count >= 50">+</button>
				</view>
			</view>
			<view class="setting-item">
				<view class="item-label">
					<text class="iconfont icon-setting" style="font-size: 20px; color: var(--text-primary);"></text>
					<text>练习难度</text>
				</view>
				<view class="difficulty-selector">
					<text 
						v-for="(item, index) in difficultyOptions" 
						:key="index" 
						class="difficulty-option"
						:class="{ active: practiceConfig.difficulty === item.value }"
						@click="setDifficulty(item.value)"
					>{{ item.text }}</text>
				</view>
			</view>
		</view>

		<view class="category-grid">
			<view 
				v-for="(category, index) in categories" 
				:key="category.id"
				class="category-card"
				:style="{ animationDelay: (index * 0.05) + 's' }"
				@click="startPractice(category)"
			>
				<view class="card-icon-wrapper">
					<text :class="['iconfont', iconClassFor(category)]" style="font-size: 28px; color: var(--text-primary);"></text>
				</view>
				<view class="card-content">
					<text class="category-name">{{ category.name }}</text>
					<text class="category-desc">{{ category.description }}</text>
				</view>
				<view class="card-arrow">
					<text class="iconfont icon-arrow-right" style="font-size: 16px; color: var(--text-secondary);"></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue';
// import ModernIcon from '@/components/ModernIcon.vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { subjects } from '@/mock/subjects.js';

export default {
	name: "Practice",
	components: {
		HeaderBar,
		uniIcons
	},
	data() {
		return {
			categories: [],
			practiceConfig: {
				count: 20,
				difficulty: 'medium'
			},
			difficultyOptions: [
				{ value: 'easy', text: '简单' },
				{ value: 'medium', text: '中等' },
				{ value: 'hard', text: '困难' }
			]
		};
	},
	onLoad() {
		this.categories = subjects;
		this.loadDefaultSettings();
	},
	methods: {
		iconClassFor(category) {
			const map = {
				'computer-basics': 'icon-setting',
				'data-structures': 'icon-book',
				'computer-networks': 'icon-network',
				'operating-system': 'icon-cpu',
				'database-systems': 'icon-database',
				'software-engineering': 'icon-edit'
			};
			return map[category.id] || 'icon-book';
		},
		loadDefaultSettings() {
			const globalSettings = uni.getStorageSync('app_settings');
			if (globalSettings) {
				this.practiceConfig.count = globalSettings.questionCount || 20;
				this.practiceConfig.difficulty = globalSettings.difficulty || 'medium';
			}
		},
		decrement() {
			if (this.practiceConfig.count > 10) {
				this.practiceConfig.count -= 10;
			}
		},
		increment() {
			if (this.practiceConfig.count < 50) { // Max 50 questions for practice
				this.practiceConfig.count += 10;
			}
		},
		setDifficulty(level) {
			this.practiceConfig.difficulty = level;
		},
		startPractice(category) {
			uni.setStorageSync('examSessionConfig', {
				pageTitle: category.name + ' - 专项练习',
				mode: 'practice',
				config: {
					category: category.id,
					count: this.practiceConfig.count,
					difficulty: this.practiceConfig.difficulty,
					random: true
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
.practice-container {
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

.settings-card {
	background-color: var(--card-bg, #ffffff);
	border-radius: 24rpx;
	padding: 10rpx 30rpx;
	box-shadow: var(--shadow, 0 8rpx 30rpx rgba(0, 0, 0, 0.05));
	margin-bottom: 40rpx;
}

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 25rpx 0;
}

.setting-item:first-child {
	border-bottom: 1rpx solid var(--border-color, #f0f0f0);
}

.item-label {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	color: var(--text-primary, #303133);
}

.item-label text {
	margin-left: 16rpx;
}

.stepper {
	display: flex;
	align-items: center;
}

.stepper text {
	font-size: 30rpx;
	font-weight: 500;
	color: var(--text-primary, #303133);
	margin: 0 30rpx;
	min-width: 50rpx;
	text-align: center;
}

.stepper button {
	border: 1rpx solid var(--muted-border, #e9ecef);
	width: 50rpx;
	height: 50rpx;
	border-radius: 50%;
	background-color: var(--bg-color-soft, #f4f4f5);
	color: var(--text-primary, #303133);
	font-size: 36rpx;
	line-height: 50rpx;
	padding: 0;
	margin: 0;
}

.stepper button:disabled {
	background-color: var(--bg-color, #f8f9fa);
	color: var(--text-disabled, #c0c4cc);
}

.difficulty-selector {
	border: 1rpx solid var(--muted-border, #e9ecef);
	display: flex;
	background-color: var(--bg-color-soft, #f4f4f5);
	border-radius: 16rpx;
	padding: 6rpx;
}

.difficulty-option {
	font-size: 24rpx;
	padding: 10rpx 20rpx;
	border-radius: 12rpx;
	color: var(--text-secondary, #606266);
	transition: all 0.3s ease;
}

.difficulty-option.active {
	border: 1rpx solid var(--accent, #4A90E2);
	background-color: var(--card-bg, #ffffff);
	color: var(--accent-active, #4A90E2);
	font-weight: bold;
	box-shadow: var(--shadow-soft, 0 2rpx 10rpx rgba(0,0,0,0.1));
}

.category-grid {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.category-card {
	display: flex;
	align-items: center;
	background-color: var(--card-bg, #ffffff);
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: var(--shadow, 0 8rpx 30rpx rgba(0, 0, 0, 0.05));
	transition: all 0.3s ease;
	opacity: 0;
	animation: card-fade-in 0.5s ease forwards;
}

.category-card:active {
	transform: scale(0.98);
	box-shadow: var(--shadow-soft, 0 4rpx 20rpx rgba(0, 0, 0, 0.08));
}

.card-icon-wrapper {
	width: 90rpx;
	height: 90rpx;
	border-radius: 18rpx;
	margin-right: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--bg-color-soft, #f4f4f5);
}

.card-content {
	flex: 1;
}

.category-name {
	font-size: 32rpx;
	font-weight: 500;
	color: var(--text-primary, #303133);
	display: block;
	margin-bottom: 8rpx;
}

.category-desc {
	font-size: 24rpx;
	color: var(--text-secondary, #909399);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-arrow {
	margin-left: 20rpx;
}

.card-arrow uni-icons {
	color: var(--text-disabled, #C0C4CC) !important;
}

@keyframes card-fade-in {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>