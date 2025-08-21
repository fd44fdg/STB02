<template>
  <view class="enhanced-tabbar" :class="{ 'safe-area-inset-bottom': safeAreaInsetBottom }">
    <!-- 激活状态的顶部指示条 -->
    <view class="active-indicator-bar" :style="{ left: indicatorLeft }"></view>
    
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tabbar-item"
      :class="{ 'tabbar-item--active': current === index }"
      @click="switchTab(index)"
    >
      <!-- 图标容器 -->
      <view class="icon-container">
        <view 
          class="icon-wrapper" 
          :class="{ 'icon-wrapper--active': current === index }"
        >
          <ModernIcon 
            :type="item.iconType" 
            :active="current === index"
            :size="current === index ? 32 : 28"
            class="tab-icon"
          />
          <!-- 激活状态的发光效果 -->
          <view v-if="current === index" class="glow-effect"></view>
        </view>
        <!-- 小红点或徽章 -->
        <view v-if="item.badge && item.badge > 0" class="badge">{{ item.badge > 99 ? '99+' : item.badge }}</view>
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
import ModernIcon from './ModernIcon.vue'

export default {
  name: 'EnhancedTabbar',
  components: {
    ModernIcon
  },
  props: {
    current: {
      type: Number,
      default: 0
    },
    safeAreaInsetBottom: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
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
  methods: {
    switchTab(index) {
      if (this.current === index) return
      
      const item = this.tabList[index]
      this.$emit('change', index)
      
      // 添加触觉反馈（如果支持）
      this.triggerHapticFeedback()
      
      uni.switchTab({
        url: item.pagePath,
        fail: (err) => {
          console.error('切换失败:', err)
          // 如果不是 tabBar 页面，使用 navigateTo
          uni.navigateTo({
            url: item.pagePath
          })
        }
      })
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
    
    // 更新徽章数量
    updateBadge(index, count) {
      if (index >= 0 && index < this.tabList.length) {
        this.tabList[index].badge = count
      }
    },
    
    // 显示/隐藏小红点
    showDot(index, show = true) {
      if (index >= 0 && index < this.tabList.length) {
        this.tabList[index].dot = show
      }
    }
  }
}
</script>

<style scoped>
.enhanced-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  height: 90px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.safe-area-inset-bottom {
  /* #ifdef H5 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
}

/* 顶部激活指示条 */
.active-indicator-bar {
  position: absolute;
  top: 0;
  width: 25%;
  height: 4px;
  background: linear-gradient(90deg, #007AFF, #4A90E2);
  border-radius: 0 0 2px 2px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  padding: 12px 8px 16px 8px;
  transform: translateY(0);
}

.tabbar-item:active {
  transform: scale(0.96) translateY(1px);
}

.tabbar-item--active {
  transform: translateY(-2px);
}

/* 图标容器 */
.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: transparent;
}

.icon-wrapper--active {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(74, 144, 226, 0.15));
  transform: scale(1.15);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.2);
}

/* 发光效果 */
.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  background: radial-gradient(circle, rgba(0, 122, 255, 0.2) 0%, transparent 70%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* 图标样式 */
.tab-icon {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: scale(1);
}

.tab-icon--active {
  transform: scale(1.1);
}

/* 文字样式 */
.tab-text {
  font-size: 12px;
  font-weight: 500;
  color: #8E8E93;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  line-height: 1.2;
  text-align: center;
  letter-spacing: 0.5px;
}

.tab-text--active {
  color: #007AFF;
  font-weight: 600;
  font-size: 13px;
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
.tabbar-item:hover .icon-wrapper {
  transform: scale(1.08);
  background: rgba(0, 122, 255, 0.05);
}

.tabbar-item:hover .tab-icon {
  filter: grayscale(0);
}

.tabbar-item:hover .tab-text {
  color: #007AFF;
}
/* #endif */

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .enhanced-tabbar {
    background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .tab-text {
    color: #a0a0a0;
  }
  
  .tab-text--active {
    color: #007AFF;
  }
  
  .icon-wrapper--active {
    background: linear-gradient(135deg, rgba(0, 122, 255, 0.15), rgba(74, 144, 226, 0.2));
  }
}

/* 不同屏幕尺寸适配 */
@media screen and (max-width: 320px) {
  .enhanced-tabbar {
    height: 85px;
  }
  
  .icon-wrapper {
    width: 44px;
    height: 44px;
  }
  
  .tab-icon {
    font-size: 24px;
  }
  
  .tab-icon--active {
    font-size: 28px;
  }
}

@media screen and (min-width: 768px) {
  .enhanced-tabbar {
    height: 95px;
  }
  
  .icon-wrapper {
    width: 52px;
    height: 52px;
  }
  
  .tab-icon {
    font-size: 30px;
  }
  
  .tab-icon--active {
    font-size: 34px;
  }
}
</style>