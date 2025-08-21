<template>
	<view class="container">
		<view class="header">
			<text class="title">掌上刷题宝</text>
			<text class="subtitle">欢迎使用我们的小程序</text>
		</view>
		
		<view class="stats-wrapper">
			<view class="stats-card">
				<text class="number">8</text>
				<text class="label">今日刷题</text>
			</view>
			<view class="stats-card">
				<text class="number">156</text>
				<text class="label">累计刷题</text>
			</view>
		</view>
		
		<view class="content">
			<text class="content-text">开始你的学习之旅</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: "Index",
		data() {
			return {
				title: "掌上刷题宝"
			}
		},
		onLoad() {
			console.log("首页加载完成")
		}
	}
</script>

<style>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.header {
		text-align: center;
		margin-bottom: 40rpx;
	}
	
	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.subtitle {
		font-size: 28rpx;
		color: #666;
		display: block;
	}
	
	.stats-wrapper {
		display: flex;
		margin-bottom: 40rpx;
	}
	
	.stats-card {
		flex: 1;
		background-color: white;
		padding: 30rpx;
		margin-right: 20rpx;
		border-radius: 16rpx;
		text-align: center;
	}
	
	.stats-card:last-child {
		margin-right: 0;
	}
	
	.number {
		font-size: 36rpx;
		font-weight: bold;
		color: #4A90E2;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.label {
		font-size: 24rpx;
		color: #666;
		display: block;
	}
	
	.content {
		background-color: white;
		padding: 40rpx;
		border-radius: 16rpx;
		text-align: center;
	}
	
	.content-text {
		font-size: 32rpx;
		color: #333;
		display: block;
	}
</style>