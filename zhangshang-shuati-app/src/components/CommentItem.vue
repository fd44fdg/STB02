<template>
  <view class="comment-item">
    <view class="comment-header">
      <view class="user-info">
        <image class="avatar" :src="comment.avatar || defaultAvatar" mode="aspectFill"></image>
        <view class="user-meta">
          <text class="username">{{ comment.username }}</text>
          <text class="time">{{ formatTime(comment.createTime) }}</text>
        </view>
      </view>
      <view class="comment-actions">
        <view class="action-button" @click="handleReply">
          <text class="action-icon">💬</text>
        </view>
        <view class="action-button" @click="handleLike">
          <text class="action-icon">{{ comment.isLiked ? '❤️' : '🤍' }}</text>
          <text v-if="comment.likes > 0" class="action-count">{{ comment.likes }}</text>
        </view>
      </view>
    </view>
    
    <view class="comment-content">
      <text class="content-text">{{ comment.content }}</text>
      <view v-if="comment.images && comment.images.length > 0" class="content-images">
        <image 
          v-for="(image, index) in comment.images" 
          :key="index" 
          class="content-image" 
          :src="image" 
          mode="aspectFill"
          @click="previewImage(index)"
        ></image>
      </view>
    </view>
    
    <view v-if="showReplies && comment.replies && comment.replies.length > 0" class="replies-section">
      <view 
        v-for="(reply, index) in comment.replies" 
        :key="index"
        class="reply-item"
      >
        <view class="reply-header">
          <view class="user-info">
            <image class="reply-avatar" :src="reply.avatar || defaultAvatar" mode="aspectFill"></image>
            <view class="user-meta">
              <text class="username">{{ reply.username }}</text>
              <text class="time">{{ formatTime(reply.createTime) }}</text>
            </view>
          </view>
        </view>
        <view class="reply-content">
          <text v-if="reply.replyTo" class="reply-to">回复 <text class="reply-name">@{{ reply.replyTo }}</text>：</text>
          <text class="content-text">{{ reply.content }}</text>
        </view>
      </view>
    </view>
    
    <view v-if="comment.replies && comment.replies.length > 0" class="show-more" @click="toggleReplies">
      <text class="show-more-text">{{ showReplies ? '收起回复' : `查看全部 ${comment.replies.length} 条回复` }}</text>
      <text class="show-more-icon">{{ showReplies ? '↑' : '↓' }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true,
      default: () => ({})
    },
    defaultAvatar: {
      type: String,
      default: '/static/default-avatar.png'
    }
  },
  data() {
    return {
      showReplies: false
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const now = new Date()
      const commentDate = new Date(timestamp)
      const diff = Math.floor((now - commentDate) / 1000) // 秒数差
      
      if (diff < 60) {
        return '刚刚'
      } else if (diff < 3600) {
        return Math.floor(diff / 60) + '分钟前'
      } else if (diff < 86400) {
        return Math.floor(diff / 3600) + '小时前'
      } else if (diff < 2592000) {
        return Math.floor(diff / 86400) + '天前'
      } else {
        const year = commentDate.getFullYear()
        const month = (commentDate.getMonth() + 1).toString().padStart(2, '0')
        const day = commentDate.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    },
    handleReply() {
      this.$emit('reply', this.comment)
    },
    handleLike() {
      this.$emit('like', {
        id: this.comment.id,
        isLiked: !this.comment.isLiked
      })
    },
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: this.comment.images
      })
    },
    toggleReplies() {
      this.showReplies = !this.showReplies
    }
  }
}
</script>

<style>
.comment-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background-color: #f0f0f0;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.comment-actions {
  display: flex;
}

.action-button {
  display: flex;
  align-items: center;
  margin-left: 24rpx;
}

.action-icon {
  font-size: 32rpx;
}

.action-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 4rpx;
}

.comment-content {
  margin-bottom: 16rpx;
}

.content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.content-images {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
}

.content-image {
  width: 180rpx;
  height: 180rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
}

.replies-section {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-top: 16rpx;
  margin-bottom: 16rpx;
}

.reply-item {
  margin-bottom: 16rpx;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-header {
  margin-bottom: 8rpx;
}

.reply-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  background-color: #f0f0f0;
}

.reply-content {
  padding-left: 72rpx;
}

.reply-to {
  font-size: 26rpx;
  color: #666;
}

.reply-name {
  color: #4A90E2;
}

.show-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
}

.show-more-text {
  font-size: 26rpx;
  color: #4A90E2;
  margin-right: 8rpx;
}

.show-more-icon {
  font-size: 24rpx;
  color: #4A90E2;
}
</style> 