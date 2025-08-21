<template>
  <view class="study-progress">
    <view class="progress-header">
      <text class="progress-title">{{ title }}</text>
      <text v-if="showMore" class="more-text" @click="handleMore">查看详情</text>
    </view>
    
    <view class="progress-container">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercentage + '%', backgroundColor: fillColor }"></view>
      </view>
      <view class="progress-info">
        <text class="progress-text">{{ currentValue }}/{{ totalValue }}</text>
        <text class="progress-percentage">{{ progressPercentage }}%</text>
      </view>
    </view>
    
    <view v-if="showDetails" class="progress-details">
      <view class="detail-item" v-for="(item, index) in details" :key="index">
        <view class="detail-label">{{ item.label }}</view>
        <view class="detail-value">{{ item.value }}</view>
      </view>
    </view>
    
    <view v-if="showTips" class="progress-tips">
      <text class="tips-text">{{ tips }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StudyProgress',
  props: {
    title: {
      type: String,
      default: '学习进度'
    },
    currentValue: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 100
    },
    fillColor: {
      type: String,
      default: '#4A90E2'
    },
    showMore: {
      type: Boolean,
      default: false
    },
    details: {
      type: Array,
      default: () => []
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    tips: {
      type: String,
      default: ''
    },
    showTips: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    progressPercentage() {
      if (this.totalValue === 0) return 0
      return Math.round((this.currentValue / this.totalValue) * 100)
    }
  },
  methods: {
    handleMore() {
      this.$emit('more')
    }
  }
}
</script>

<style>
.study-progress {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.progress-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.more-text {
  font-size: 24rpx;
  color: #4A90E2;
}

.progress-container {
  margin-bottom: 16rpx;
}

.progress-bar {
  height: 16rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
}

.progress-percentage {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.progress-details {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
}

.detail-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.progress-tips {
  background-color: #FFF7E6;
  border-radius: 12rpx;
  padding: 16rpx;
  border-left: 4rpx solid #FAAD14;
}

.tips-text {
  font-size: 24rpx;
  color: #D48806;
  line-height: 1.5;
}
</style> 