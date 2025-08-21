<template>
  <view class="demo-page">
    <!-- 页面内容 -->
    <view class="content-area">
      <view class="demo-header">
        <text class="demo-title">增强版导航栏演示</text>
        <text class="demo-subtitle">体验全新的导航栏设计</text>
      </view>
      
      <!-- 功能演示区域 -->
      <view class="demo-section">
        <text class="section-title">✨ 新导航栏特性</text>
        <view class="feature-list">
          <view class="feature-item">
            <text class="feature-icon">🔸</text>
            <view class="feature-text">
              <text class="feature-title">现代化SVG图标</text>
              <text class="feature-desc">精美的矢量图标，更加专业</text>
            </view>
          </view>
          
          <view class="feature-item">
            <text class="feature-icon">🌐</text>
            <view class="feature-text">
              <text class="feature-title">动态状态变化</text>
              <text class="feature-desc">激活状态有缩放、发光和颜色变化</text>
            </view>
          </view>
          
          <view class="feature-item">
            <text class="feature-icon">🎨</text>
            <view class="feature-text">
              <text class="feature-title">响应式设计</text>
              <text class="feature-desc">渐变背景、毛玻璃效果、流畅动画</text>
            </view>
          </view>
          
          <view class="feature-item">
            <text class="feature-icon">📱</text>
            <view class="feature-text">
              <text class="feature-title">触觉反馈</text>
              <text class="feature-desc">点击时提供震动反馈（支持设备）</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 控制面板 -->
      <view class="demo-section">
        <text class="section-title">🎮 控制面板</text>
        <view class="control-panel">
          <view class="control-item">
            <text class="control-label">当前选中：</text>
            <text class="control-value">{{ currentTabName }}</text>
          </view>
          
          <view class="control-item">
            <text class="control-label">徽章演示：</text>
            <view class="badge-controls">
              <button 
                class="badge-btn" 
                @click="setBadge(0, badgeCount0 + 1)"
                size="mini"
              >
                首页 +1
              </button>
              <button 
                class="badge-btn" 
                @click="setBadge(1, badgeCount1 + 1)"
                size="mini"
              >
                刷题 +1
              </button>
              <button 
                class="badge-btn" 
                @click="clearAllBadges"
                size="mini"
                type="warn"
              >
                清除全部
              </button>
            </view>
          </view>
          
          <view class="control-item">
            <text class="control-label">红点演示：</text>
            <view class="dot-controls">
              <button 
                class="dot-btn" 
                @click="toggleDot(2)"
                size="mini"
                :type="showDot2 ? 'warn' : 'default'"
              >
                {{ showDot2 ? '隐藏' : '显示' }}考试红点
              </button>
              <button 
                class="dot-btn" 
                @click="toggleDot(3)"
                size="mini"
                :type="showDot3 ? 'warn' : 'default'"
              >
                {{ showDot3 ? '隐藏' : '显示' }}我的红点
              </button>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 样式说明 -->
      <view class="demo-section">
        <text class="section-title">📋 样式说明</text>
        <view class="style-info">
          <view class="style-item">
            <text class="style-label">高度：</text>
            <text class="style-value">90px（响应式）</text>
          </view>
          <view class="style-item">
            <text class="style-label">图标大小：</text>
            <text class="style-value">28px → 32px（激活）</text>
          </view>
          <view class="style-item">
            <text class="style-label">动画时长：</text>
            <text class="style-value">0.4s 缓动</text>
          </view>
          <view class="style-item">
            <text class="style-label">特效：</text>
            <text class="style-value">毛玻璃背景、发光效果、脉冲动画</text>
          </view>
        </view>
      </view>
      
      <!-- 底部占位，避免被导航栏遮挡 -->
      <view class="bottom-spacer"></view>
    </view>
    
    <!-- 增强版导航栏 -->
    <EnhancedTabbar 
      :current="currentTab" 
      @change="onTabChange"
      ref="enhancedTabbar"
    />
  </view>
</template>

<script>
import EnhancedTabbar from '@/components/EnhancedTabbar.vue'

export default {
  name: 'TabbarDemo',
  components: {
    EnhancedTabbar
  },
  data() {
    return {
      currentTab: 0,
      badgeCount0: 0,
      badgeCount1: 0,
      showDot2: false,
      showDot3: false
    }
  },
  computed: {
    currentTabName() {
      const names = ['首页', '刷题', '考试', '我的']
      return names[this.currentTab] || '未知'
    }
  },
  methods: {
    onTabChange(index) {
      this.currentTab = index
      console.log('切换到标签页:', index)
    },
    
    setBadge(index, count) {
      if (index === 0) {
        this.badgeCount0 = count
      } else if (index === 1) {
        this.badgeCount1 = count
      }
      
      // 更新导航栏徽章
      if (this.$refs.enhancedTabbar) {
        this.$refs.enhancedTabbar.updateBadge(index, count)
      }
    },
    
    clearAllBadges() {
      this.badgeCount0 = 0
      this.badgeCount1 = 0
      
      if (this.$refs.enhancedTabbar) {
        this.$refs.enhancedTabbar.updateBadge(0, 0)
        this.$refs.enhancedTabbar.updateBadge(1, 0)
        this.$refs.enhancedTabbar.updateBadge(2, 0)
        this.$refs.enhancedTabbar.updateBadge(3, 0)
      }
    },
    
    toggleDot(index) {
      if (index === 2) {
        this.showDot2 = !this.showDot2
        if (this.$refs.enhancedTabbar) {
          this.$refs.enhancedTabbar.showDot(2, this.showDot2)
        }
      } else if (index === 3) {
        this.showDot3 = !this.showDot3
        if (this.$refs.enhancedTabbar) {
          this.$refs.enhancedTabbar.showDot(3, this.showDot3)
        }
      }
    }
  },
  
  onLoad() {
    console.log('导航栏演示页面加载完成')
  }
}
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f2f5 0%, #ffffff 100%);
}

.content-area {
  padding: 40rpx 30rpx;
  padding-bottom: 180rpx; /* 为导航栏留出空间 */
}

.demo-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.demo-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.demo-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.demo-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

/* 功能列表 */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.feature-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  margin-top: 4rpx;
}

.feature-text {
  flex: 1;
}

.feature-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

/* 控制面板 */
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.control-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.control-value {
  font-size: 24rpx;
  color: #007AFF;
  padding: 12rpx 20rpx;
  background: #f0f6ff;
  border-radius: 12rpx;
  display: inline-block;
}

.badge-controls,
.dot-controls {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.badge-btn,
.dot-btn {
  flex: 1;
  min-width: 140rpx;
  font-size: 22rpx !important;
}

/* 样式信息 */
.style-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.style-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.style-item:last-child {
  border-bottom: none;
}

.style-label {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.style-value {
  font-size: 24rpx;
  color: #666;
  text-align: right;
  flex: 1;
  margin-left: 20rpx;
}

.bottom-spacer {
  height: 100rpx;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .badge-controls,
  .dot-controls {
    flex-direction: column;
  }
  
  .badge-btn,
  .dot-btn {
    min-width: auto;
  }
}
</style>