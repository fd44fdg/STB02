<template>
  <view class="back-button" @click="goBack">
    <text class="back-icon">←</text>
    <text v-if="showText" class="back-text">{{ text }}</text>
  </view>
</template>

<script>
export default {
  name: 'BackButton',
  props: {
    delta: {
      type: Number,
      default: 1
    },
    text: {
      type: String,
      default: '返回'
    },
    showText: {
      type: Boolean,
      default: false
    },
    customUrl: {
      type: String,
      default: ''
    },
    isTab: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    goBack() {
      if (this.customUrl) {
        if (this.isTab) {
          uni.switchTab({
            url: this.customUrl
          });
        } else {
          uni.navigateTo({
            url: this.customUrl
          });
        }
      } else {
        uni.navigateBack({
          delta: this.delta
        });
      }
      this.$emit('click');
    }
  }
}
</script>

<style>
.back-button {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 20rpx;
  top: 20rpx;
  z-index: 999;
}

.back-icon {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.back-text {
  font-size: 28rpx;
  color: #333;
  margin-left: 8rpx;
}
</style> 