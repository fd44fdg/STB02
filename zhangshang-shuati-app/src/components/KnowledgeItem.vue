<template>
	<view class="knowledge-item" @click="handleClick">
		<view class="item-header">
			<view class="category-tag" :style="{backgroundColor: categoryColor}">
				<text class="category-text">{{item.category}}</text>
			</view>
			<view class="difficulty-level">
				<text class="difficulty-text">{{getDifficultyText(item.difficulty)}}</text>
			</view>
		</view>
		
		<view class="item-content">
			<text class="item-title">{{item.title}}</text>
			<text class="item-description">{{item.description}}</text>
		</view>
		
		<view class="item-footer">
			<view class="item-stats">
				<text class="stat-text">题目数: {{item.questionCount}}</text>
				<text class="stat-text">完成度: {{item.progress}}%</text>
			</view>
			<view class="item-action">
				<text class="action-text">开始学习</text>
				<text class="action-arrow">></text>
			</view>
		</view>
		
		<view class="progress-bar">
			<view class="progress-fill" :style="{width: item.progress + '%'}"></view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'KnowledgeItem',
		// 知识点卡片组件 - 重新编译
		props: {
			item: {
				type: Object,
				required: true,
				default: () => ({})
			}
		},
		computed: {
			categoryColor() {
				const colorMap = {
					'HTML': '#E34F26',
					'CSS': '#1572B6',
					'Javascript': '#F7DF1E',
					'Ajax': '#61DAFB',
					'Nodejs': '#339933',
					'React': '#61DAFB',
					'web前端': '#4A90E2'
				};
				return colorMap[this.item.category] || '#4A90E2';
			}
		},
		methods: {
			getDifficultyText(difficulty) {
				const difficultyMap = {
					1: '入门',
					2: '初级',
					3: '中级',
					4: '高级',
					5: '专家'
				};
				return difficultyMap[difficulty] || '未知';
			},
			handleClick() {
				this.$emit('click', this.item);
			}
		}
	}
</script>

<style scoped>
	.knowledge-item {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
		position: relative;
		overflow: hidden;
	}
	
	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.category-tag {
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
	}
	
	.category-text {
		color: #ffffff;
		font-size: 22rpx;
		font-weight: bold;
	}
	
	.difficulty-level {
		padding: 8rpx 16rpx;
		background-color: #f8f9fa;
		border-radius: 20rpx;
		border: 1rpx solid #e9ecef;
	}
	
	.difficulty-text {
		color: #6c757d;
		font-size: 22rpx;
	}
	
	.item-content {
		margin-bottom: 20rpx;
	}
	
	.item-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.item-description {
		font-size: 26rpx;
		color: #666666;
		line-height: 1.5;
		display: block;
	}
	
	.item-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.item-stats {
		display: flex;
		flex-direction: column;
	}
	
	.stat-text {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 5rpx;
	}
	
	.item-action {
		display: flex;
		align-items: center;
	}
	
	.action-text {
		font-size: 26rpx;
		color: #4A90E2;
		font-weight: bold;
		margin-right: 8rpx;
	}
	
	.action-arrow {
		font-size: 24rpx;
		color: #4A90E2;
	}
	
	.progress-bar {
		height: 6rpx;
		background-color: #f0f0f0;
		border-radius: 3rpx;
		overflow: hidden;
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4A90E2 0%, #357ABD 100%);
		border-radius: 3rpx;
		transition: width 0.3s ease;
	}
</style>