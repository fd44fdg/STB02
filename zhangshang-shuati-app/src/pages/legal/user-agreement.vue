<template>
  <view class="container">
    <view class="header">
      <text class="title">用户服务协议</text>
    </view>
    
    <scroll-view class="content" scroll-y="true">
      <view class="section">
        <text class="section-title">1. 服务条款的确认和接纳</text>
        <text class="section-content">
          欢迎使用掌上刷题宝！本协议是您与掌上刷题宝之间关于您使用掌上刷题宝服务所订立的协议。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">2. 服务简介</text>
        <text class="section-content">
          掌上刷题宝是一款专业的在线学习平台，为用户提供题库练习、模拟考试、学习记录等功能。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">3. 用户注册</text>
        <text class="section-content">
          用户在使用本服务前需要注册一个账户。用户应当提供真实、准确、完整的个人信息。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">4. 用户行为规范</text>
        <text class="section-content">
          用户在使用服务时应遵守相关法律法规，不得从事违法违规活动。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">5. 知识产权</text>
        <text class="section-content">
          本平台的所有内容，包括但不限于文字、图片、音频、视频等，均受知识产权法保护。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">6. 免责声明</text>
        <text class="section-content">
          本平台仅提供信息存储空间服务，对用户发布的内容不承担审查义务。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">7. 协议修改</text>
        <text class="section-content">
          我们有权随时修改本协议，修改后的协议将在平台上公布。
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
  name: 'UserAgreement',
  data() {
    return {}
  },
  onLoad() {
    uni.setNavigationBarTitle({
      title: '用户服务协议'
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