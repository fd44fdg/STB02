<template>
  <view class="custom-tab-bar">
    <!-- 顶部激活指示条 -->
    <view class="active-indicator" :style="{ left: indicatorLeft }"></view>
    
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tab-item"
      :class="{ 'tab-item--active': current === index }"
      @click="switchTab(index)"
    >
      <!-- 图标容器 -->
      <view class="icon-container">
        <ModernIcon 
          :type="item.iconType" 
          :active="current === index"
          :size="current === index ? 40 : 36"
          class="tab-icon"
        />
        <!-- 徽章 -->
        <view v-if="item.badge && item.badge > 0" class="badge">
          {{ item.badge > 99 ? '99+' : item.badge }}
        </view>
        <!-- 小红点 -->
        <view v-if="item.dot" class="dot"></view>
      </view>
      
      <!-- 文字标签 -->
      <text class="tab-text" :class="{ 'tab-text--active': current === index }">
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script>
import ModernIcon from '@/components/ModernIcon.vue'

export default {
  name: 'CustomTabBar',
  components: {
    ModernIcon
  },
  data() {
    return {
      current: 0,
      tabList: [
        {
          pagePath: '/pages/home/home',
          text: '首页',
          iconType: 'home',
          badge: 0,
          dot: false
        },
        {
          pagePath: '/pages/practice/practice', 
          text: '刷题',
          iconType: 'practice',
          badge: 0,
          dot: false
        },
        {
          pagePath: '/pages/exam/exam',
          text: '考试', 
          iconType: 'exam',
          badge: 0,
          dot: false
        },
        {
          pagePath: '/pages/profile/profile',
          text: '我的',
          iconType: 'profile',
          badge: 0,
          dot: false
        }
      ]
    }
  },
  computed: {
    // 计算顶部指示条的位置
    indicatorLeft() {
      const itemWidth = 25; // 每个tab项的宽度百分比
      return (this.current * itemWidth) + '%'
    }
  },
  created() {
    // 获取当前页面路径，设置正确的激活状态
    this.updateCurrentTab()
  },
  methods: {
    switchTab(index) {
      if (this.current === index) return
      
      const item = this.tabList[index]
      this.current = index
      
      // 触觉反馈
      this.triggerHapticFeedback()
      
      // 跳转页面
      uni.switchTab({
        url: item.pagePath,
        success: () => {
          this.updateCurrentTab()
        },
        fail: (err) => {
          console.error('切换标签页失败:', err)
        }
      })
    },
    
    // 更新当前选中的标签页
    updateCurrentTab() {
      const pages = getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        const currentRoute = '/' + currentPage.route
        
        const index = this.tabList.findIndex(item => item.pagePath === currentRoute)
        if (index !== -1) {
          this.current = index
        }
      }
    },
    
    // 触觉反馈
    triggerHapticFeedback() {
      // #ifdef APP-PLUS || MP-WEIXIN
      if (uni.vibrateShort) {
        uni.vibrateShort({
          type: 'light'
        })
      }
      // #endif
    },
    
    // 设置徽章
    setBadge(index, count) {
      if (index >= 0 && index < this.tabList.length) {
        this.tabList[index].badge = count
      }
    },
    
    // 设置红点
    setDot(index, show) {
      if (index >= 0 && index < this.tabList.length) {
        this.tabList[index].dot = show
      }
    }
  },
  
  // 页面显示时更新当前标签
  onShow() {
    this.updateCurrentTab()
  }
}
</script>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  height: 100px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  /* 安全区域适配 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 顶部激活指示条 */
.active-indicator {
  position: absolute;
  top: 0;
  width: 25%;
  height: 4px;
  background: linear-gradient(90deg, #007AFF, #4A90E2);
  border-radius: 0 0 2px 2px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  padding: 14px 8px 18px 8px;
  transform: translateY(0);
}

.tab-item:active {
  transform: scale(0.96) translateY(1px);
}

.tab-item--active {
  transform: translateY(-2px);
}

/* 图标容器 */
.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  transition: all 0.3s ease;
}

.tab-item--active .icon-container {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(74, 144, 226, 0.15));
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.2);
}

.tab-icon {
  transition: all 0.3s ease;
}

/* 文字样式 */
.tab-text {
  font-size: 11px;
  font-weight: 500;
  color: #8E8E93;
  transition: all 0.3s ease;
  line-height: 1.2;
  text-align: center;
  letter-spacing: 0.5px;
}

.tab-text--active {
  color: #007AFF;
  font-weight: 600;
  font-size: 12px;
  transform: scale(1.05);
  text-shadow: 0 1px 3px rgba(0, 122, 255, 0.3);
}

/* 徽章样式 */
.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #ff4757, #ff3742);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  box-sizing: border-box;
  line-height: 1;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  animation: badgeBounce 0.6s ease-out;
}

@keyframes badgeBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 小红点样式 */
.dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4757;
  border-radius: 50%;
  border: 2px solid #ffffff;
  animation: dotPulse 2s infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 悬停效果（仅在H5中生效） */
/* #ifdef H5 */
.tab-item:hover .icon-container {
  transform: scale(1.05);
  background: rgba(0, 122, 255, 0.05);
}

.tab-item:hover .tab-text {
  color: #007AFF;
}
/* #endif */

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .custom-tab-bar {
    background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .tab-text {
    color: #a0a0a0;
  }
  
  .tab-text--active {
    color: #007AFF;
  }
  
  .tab-item--active .icon-container {
    background: linear-gradient(135deg, rgba(0, 122, 255, 0.15), rgba(74, 144, 226, 0.2));
  }
}

/* 不同屏幕尺寸适配 */
@media screen and (max-width: 320px) {
  .custom-tab-bar {
    height: 85px;
  }
  
  .icon-container {
    width: 44px;
    height: 44px;
  }
}

@media screen and (min-width: 768px) {
  .custom-tab-bar {
    height: 95px;
  }
  
  .icon-container {
    width: 52px;
    height: 52px;
  }
}
</style>