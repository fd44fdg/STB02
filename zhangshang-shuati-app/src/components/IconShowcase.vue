<template>
  <view class="icon-showcase">
    <view class="showcase-header">
      <text class="showcase-title">现代化SVG图标库</text>
      <text class="showcase-subtitle">专业、精美、可扩展</text>
    </view>
    
    <view class="icon-grid">
      <view 
        v-for="icon in iconList" 
        :key="icon.type"
        class="icon-item"
        @click="toggleActive(icon.type)"
      >
        <view class="icon-container">
          <ModernIcon 
            :type="icon.type" 
            :active="activeIcons.includes(icon.type)"
            :size="48"
            class="showcase-icon"
          />
        </view>
        <text class="icon-name">{{ icon.name }}</text>
        <text class="icon-desc">{{ icon.desc }}</text>
      </view>
    </view>
    
    <!-- 使用说明 -->
    <view class="usage-section">
      <text class="usage-title">使用方法</text>
      <view class="usage-code">
        <text class="code-text">&lt;ModernIcon type="home" :active="true" :size="32" /&gt;</text>
      </view>
      
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-bullet">•</text>
          <text class="feature-text">支持动态尺寸和颜色变化</text>
        </view>
        <view class="feature-item">
          <text class="feature-bullet">•</text>
          <text class="feature-text">激活状态自动高亮和动效</text>
        </view>
        <view class="feature-item">
          <text class="feature-bullet">•</text>
          <text class="feature-text">矢量图标，无限缩放不失真</text>
        </view>
        <view class="feature-item">
          <text class="feature-bullet">•</text>
          <text class="feature-text">现代化设计风格，符合当前趋势</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ModernIcon from './ModernIcon.vue'

export default {
  name: 'IconShowcase',
  components: {
    ModernIcon
  },
  data() {
    return {
      activeIcons: ['home'], // 默认激活首页图标
      iconList: [
        {
          type: 'home',
          name: '首页',
          desc: '主页导航图标'
        },
        {
          type: 'practice',
          name: '刷题',
          desc: '练习学习图标'
        },
        {
          type: 'exam',
          name: '考试',
          desc: '考试测验图标'
        },
        {
          type: 'profile',
          name: '个人',
          desc: '用户中心图标'
        },
        {
          type: 'search',
          name: '搜索',
          desc: '搜索查找图标'
        },
        {
          type: 'favorite',
          name: '收藏',
          desc: '收藏书签图标'
        },
        {
          type: 'settings',
          name: '设置',
          desc: '系统设置图标'
        }
      ]
    }
  },
  methods: {
    toggleActive(iconType) {
      const index = this.activeIcons.indexOf(iconType)
      if (index > -1) {
        this.activeIcons.splice(index, 1)
      } else {
        this.activeIcons.push(iconType)
      }
    }
  }
}
</script>

<style scoped>
.icon-showcase {
  padding: 40rpx;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.showcase-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.showcase-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.showcase-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
  gap: 30rpx;
  margin-bottom: 80rpx;
}

.icon-item {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 20rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.icon-item:hover {
  transform: translateY(-8rpx);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
}

.icon-item:active {
  transform: translateY(-4rpx) scale(0.98);
}

.icon-container {
  margin-bottom: 20rpx;
}

.showcase-icon {
  transition: all 0.3s ease;
}

.icon-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.icon-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

/* 使用说明 */
.usage-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.usage-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.usage-code {
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  overflow-x: auto;
}

.code-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 24rpx;
  color: #495057;
  line-height: 1.5;
  white-space: pre;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.feature-bullet {
  color: #007AFF;
  font-size: 32rpx;
  font-weight: bold;
  line-height: 1;
  margin-top: 4rpx;
}

.feature-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .icon-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
  }
  
  .icon-item {
    padding: 30rpx 15rpx;
  }
}

@media screen and (max-width: 480rpx) {
  .icon-grid {
    grid-template-columns: 1fr;
  }
}
</style>