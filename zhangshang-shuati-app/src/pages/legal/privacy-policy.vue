<template>
  <view class="container">
    <view class="header">
      <text class="title">隐私政策</text>
    </view>
    
    <scroll-view class="content" scroll-y="true">
      <view class="section">
        <text class="section-title">1. 信息收集</text>
        <text class="section-content">
          我们会收集您在使用服务过程中主动提供的信息，包括但不限于注册信息、学习记录等。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">2. 信息使用</text>
        <text class="section-content">
          我们使用收集的信息来提供、维护和改进我们的服务，包括个性化学习推荐、学习进度跟踪等。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">3. 信息共享</text>
        <text class="section-content">
          我们不会向第三方出售、出租或以其他方式披露您的个人信息，除非获得您的明确同意。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">4. 信息安全</text>
        <text class="section-content">
          我们采用行业标准的安全措施来保护您的个人信息，防止未经授权的访问、使用或披露。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">5. Cookie使用</text>
        <text class="section-content">
          我们使用Cookie和类似技术来改善用户体验，您可以通过浏览器设置来管理Cookie。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">6. 第三方服务</text>
        <text class="section-content">
          我们的服务可能包含第三方链接，这些第三方的隐私政策可能与我们不同。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">7. 儿童隐私</text>
        <text class="section-content">
          我们不会故意收集13岁以下儿童的个人信息。如果发现此类情况，我们会立即删除相关信息。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">8. 政策更新</text>
        <text class="section-content">
          我们可能会不时更新本隐私政策，更新后的政策将在应用内公布。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">9. 联系我们</text>
        <text class="section-content">
          如果您对本隐私政策有任何疑问，请通过应用内反馈功能联系我们。
        </text>
      </view>
      
      <view class="footer">
        <text class="update-time">最后更新时间：2024年1月1日</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'PrivacyPolicy',
  data() {
    return {}
  },
  onLoad() {
    uni.setNavigationBarTitle({
      title: '隐私政策'
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #4A90E2;
  padding: 40rpx 30rpx 30rpx;
  
  .title {
    color: white;
    font-size: 36rpx;
    font-weight: bold;
  }
}

.content {
  height: calc(100vh - 200rpx);
  padding: 30rpx;
}

.section {
  background-color: white;
  margin-bottom: 30rpx;
  padding: 30rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .section-content {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

.footer {
  text-align: center;
  padding: 40rpx 0;
  
  .update-time {
    font-size: 24rpx;
    color: #999;
  }
}
</style>