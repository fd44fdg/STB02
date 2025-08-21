<template>
  <view class="icon-demo">
    <view class="demo-section">
      <text class="section-title">导航栏图标效果预览</text>
      
      <!-- 原始图标展示 -->
      <view class="icon-row">
        <view class="icon-item">
          <text class="emoji-icon">🏠</text>
          <text class="icon-label">首页</text>
        </view>
        <view class="icon-item">
          <text class="emoji-icon">📝</text>
          <text class="icon-label">刷题</text>
        </view>
        <view class="icon-item">
          <text class="emoji-icon">📋</text>
          <text class="icon-label">考试</text>
        </view>
        <view class="icon-item">
          <text class="emoji-icon">👤</text>
          <text class="icon-label">我的</text>
        </view>
      </view>
      
      <!-- iconfont图标展示 -->
      <text class="section-title">iconfont 图标</text>
      <view class="icon-row">
        <view class="icon-item">
          <text class="iconfont icon-tab-home"></text>
          <text class="icon-label">首页</text>
        </view>
        <view class="icon-item">
          <text class="iconfont icon-tab-practice"></text>
          <text class="icon-label">刷题</text>
        </view>
        <view class="icon-item">
          <text class="iconfont icon-tab-exam"></text>
          <text class="icon-label">考试</text>
        </view>
        <view class="icon-item">
          <text class="iconfont icon-tab-profile"></text>
          <text class="icon-label">我的</text>
        </view>
      </view>
      
      <!-- 自定义TabBar组件演示 -->
      <text class="section-title">自定义导航栏组件</text>
      <view class="custom-tabbar-demo">
        <CustomTabbar :current="currentTab" @change="handleTabChange" />
      </view>
    </view>
  </view>
</template>

<script>
import CustomTabbar from '@/components/CustomTabbar.vue'

export default {
  name: 'IconDemo',
  components: {
    CustomTabbar
  },
  data() {
    return {
      currentTab: 0
    }
  },
  methods: {
    handleTabChange(index) {
      this.currentTab = index
      console.log('切换到标签页:', index)
    }
  }
}
</script>

<style scoped>
.icon-demo {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.demo-section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: block;
}

.icon-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
}

.emoji-icon {
  font-size: 24px;
  margin-bottom: 4px;
  line-height: 1;
}

.iconfont {
  font-size: 24px;
  color: #4A90E2;
  margin-bottom: 4px;
}

.icon-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.custom-tabbar-demo {
  position: relative;
  height: 80px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

/* 引入iconfont样式 */
@import url('/static/fonts/iconfont.css');
</style>