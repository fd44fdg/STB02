<template>
	<view class="back-to-top" :class="{ show: visible }" @click="backToTop">
		<text class="icon">↑</text>
	</view>
</template>

<script>
	export default {
		name: 'BackToTop',
		props: {
			visibilityHeight: {
				type: Number,
				default: 300
			},
			duration: {
				type: Number,
				default: 300
			}
		},
		data() {
			return {
				visible: false,
				scrollTop: 0
			}
		},
		mounted() {
			this.init()
		},
		methods: {
			init() {
				// 监听页面滚动
				uni.onPageScroll(({ scrollTop }) => {
					this.scrollTop = scrollTop
					this.visible = scrollTop > this.visibilityHeight
				})
			},
			backToTop() {
				uni.pageScrollTo({
					scrollTop: 0,
					duration: this.duration
				})
				this.$emit('click')
			}
		}
	}
</script>

<style scoped>
	.back-to-top {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #4A90E2;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		opacity: 0;
		transform: translateY(100rpx);
		transition: all 0.3s ease;
		z-index: 999;
	}
	
	.back-to-top.show {
		opacity: 1;
		transform: translateY(0);
	}
	
	.icon {
		font-size: 36rpx;
		font-weight: bold;
	}
</style>