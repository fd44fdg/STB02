<template>
  <view class="question-card" @click="handleClick">
    <view class="card-header">
      <view class="question-type" :class="typeClass">{{ typeText }}</view>
      <view class="question-meta">
        <text class="category">{{ question.category }}</text>
        <text class="difficulty" :class="difficultyClass">{{ difficultyText }}</text>
      </view>
    </view>
    
    <view class="card-content">
      <text class="question-title">{{ truncateTitle }}</text>
      <view v-if="question.image" class="question-image">
        <image :src="question.image" mode="aspectFill"></image>
      </view>
    </view>
    
    <view class="card-footer">
      <view class="stats">
        <view class="stat-item">
          <text class="stat-icon">👁️</text>
          <text class="stat-value">{{ question.views || 0 }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">👍</text>
          <text class="stat-value">{{ question.likes || 0 }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">💬</text>
          <text class="stat-value">{{ question.comments || 0 }}</text>
        </view>
      </view>
      <view class="action-buttons">
        <view class="action-button" @click.stop="handleFavorite">
          <text class="action-icon">{{ isFavorite ? '⭐' : '☆' }}</text>
        </view>
        <view class="action-button" @click.stop="handleShare">
          <text class="action-icon">📤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'QuestionCard',
  props: {
    question: {
      type: Object,
      required: true,
      default: () => ({})
    },
    maxTitleLength: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      isFavorite: this.question.isFavorite || false
    }
  },
  computed: {
    typeText() {
      const types = {
        single: '单选题',
        multiple: '多选题',
        boolean: '判断题',
        fill: '填空题',
        essay: '问答题'
      }
      return types[this.question.type] || '未知类型'
    },
    typeClass() {
      return `type-${this.question.type}`
    },
    difficultyText() {
      const difficulties = ['简单', '中等', '困难']
      return difficulties[this.question.difficulty] || '未知难度'
    },
    difficultyClass() {
      const classes = ['easy', 'medium', 'hard']
      return classes[this.question.difficulty] || ''
    },
    truncateTitle() {
      if (!this.question.content) return ''
      if (this.question.content.length <= this.maxTitleLength) return this.question.content
      return this.question.content.substring(0, this.maxTitleLength) + '...'
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.question)
    },
    handleFavorite() {
      this.isFavorite = !this.isFavorite
      this.$emit('favorite', {
        id: this.question.id,
        isFavorite: this.isFavorite
      })
    },
    handleShare() {
      uni.showActionSheet({
        itemList: ['分享给好友', '生成分享图', '复制链接'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              // 分享给好友
              break
            case 1:
              // 生成分享图
              break
            case 2:
              // 复制链接
              uni.setClipboardData({
                data: `题目ID: ${this.question.id}`,
                success: () => {
                  uni.showToast({
                    title: '链接已复制',
                    icon: 'success'
                  })
                }
              })
              break
          }
        }
      })
      this.$emit('share', this.question)
    }
  }
}
</script>

<style>
.question-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.question-type {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #fff;
}

.type-single {
  background-color: #4A90E2;
}

.type-multiple {
  background-color: #722ED1;
}

.type-boolean {
  background-color: #13C2C2;
}

.type-fill {
  background-color: #FA8C16;
}

.type-essay {
  background-color: #EB2F96;
}

.question-meta {
  display: flex;
  align-items: center;
}

.category {
  font-size: 24rpx;
  color: #999;
  margin-right: 16rpx;
}

.difficulty {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.easy {
  color: #52C41A;
  background-color: rgba(82, 196, 26, 0.1);
}

.medium {
  color: #FAAD14;
  background-color: rgba(250, 173, 20, 0.1);
}

.hard {
  color: #F5222D;
  background-color: rgba(245, 34, 45, 0.1);
}

.card-content {
  margin-bottom: 16rpx;
}

.question-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.question-image {
  margin-top: 16rpx;
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.question-image image {
  width: 100%;
  height: 100%;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 16rpx;
}

.stats {
  display: flex;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.stat-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.stat-value {
  font-size: 24rpx;
  color: #999;
}

.action-buttons {
  display: flex;
}

.action-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 16rpx;
}

.action-icon {
  font-size: 32rpx;
  color: #666;
}
</style> 