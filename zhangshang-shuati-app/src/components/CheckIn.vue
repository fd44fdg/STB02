<template>
  <view class="check-in-wrapper">
    <view class="check-in-card" @click="handleCheckIn" :class="{ 'checked-in': isCheckedIn }">
      <view class="card-content">
        <view class="icon">
          <text class="icon-calendar">📅</text>
        </view>
        <view class="text-content">
          <text class="title">{{ isCheckedIn ? '今日已签到' : '每日签到' }}</text>
          <text class="subtitle">{{ isCheckedIn ? `已连续签到 ${continuousDays} 天` : '点击领取今日奖励' }}</text>
        </view>
        <view class="action-button">
          <text>{{ isCheckedIn ? '已完成' : '签到' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js';

export default {
  name: "CheckIn",
  data() {
    return {
      isCheckedIn: false,
      continuousDays: 0,
    };
  },
  created() {
    this.getCheckInStatus();
  },
  methods: {
    getAuthHeader() {
      const token = uni.getStorageSync(config.storage.token);
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    },
    async getCheckInStatus() {
      try {
        const res = await uni.request({
          url: `${config.api.baseUrl}/checkin/status`,
          method: 'GET',
          header: this.getAuthHeader(),
        });

        if (res.statusCode === 200 && res.data.success) {
          this.isCheckedIn = res.data.data.isCheckedIn;
          this.continuousDays = res.data.data.continuousDays;
        } else {
          // 可能需要处理token失效等情况
          console.error('获取签到状态失败', res);
        }
      } catch (error) {
        console.error('请求签到状态异常', error);
      }
    },
    async handleCheckIn() {
      if (this.isCheckedIn) {
        uni.showToast({
          title: '今天已经签过啦',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await uni.request({
          url: `${config.api.baseUrl}/checkin`,
          method: 'POST',
          header: this.getAuthHeader(),
        });

        if (res.statusCode === 200 && res.data.success) {
          this.isCheckedIn = true;
          this.continuousDays = res.data.data.continuousDays;
          uni.showToast({
            title: '签到成功！',
            icon: 'success',
            duration: 2000
          });
        } else {
          uni.showToast({
            title: res.data.message || '签到失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        console.error('签到请求异常', error);
      }
    }
  }
}
</script>

<style scoped>
.check-in-wrapper {
  padding: 0 20rpx;
  margin-top: -20rpx; /* 与上方欢迎卡片重叠一部分，更有层次感 */
  margin-bottom: 20rpx;
}

.check-in-card {
  background: linear-gradient(135deg, #ff8c00 0%, #ffc107 100%);
  border-radius: 16rpx;
  padding: 25rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.check-in-card.checked-in {
  background: linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%);
}

.card-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.text-content {
  flex: 1;
  color: white;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 4rpx;
}

.subtitle {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
}

.action-button {
  background-color: white;
  color: #ff8c00;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.checked-in .action-button {
  background-color: rgba(255, 255, 255, 0.8);
  color: #2193b0;
}
</style>
