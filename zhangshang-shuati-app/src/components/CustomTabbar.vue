<template>
  <view class="custom-tabbar" :class="{ 'safe-area-inset-bottom': safeAreaInsetBottom }">
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tabbar-item"
      :class="{ 'tabbar-item--active': current === index }"
      @click="switchTab(index)"
    >
      <ModernTabIcon
        :text="item.text"
        :active="current === index"
        :iconType="item.iconType"
      />
      <view v-if="item.badge" class="tabbar-badge">{{ item.badge }}</view>
      <view v-if="item.dot" class="tabbar-dot"></view>
    </view>
  </view>
</template>

<script>
import ModernTabIcon from './ModernTabIcon.vue'

export default {
  name: 'CustomTabbar',
  components: {
    ModernTabIcon
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
          iconType: 'home'
        },
        {
          pagePath: '/pages/practice/practice', 
          text: '刷题',
          iconType: 'practice'
        },
        {
          pagePath: '/pages/exam/exam',
          text: '考试', 
          iconType: 'exam'
        },
        {
          pagePath: '/pages/profile/profile',
          text: '我的',
          iconType: 'profile'
        }
      ]
    }
  },
  methods: {
    switchTab(index) {
      if (this.current === index) return
      
      const item = this.tabList[index]
      this.$emit('change', index)
      
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
    }
  }
}
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  height: 85px;
  background-color: #ffffff;
  border-top: 0.5px solid #e5e5e5;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.safe-area-inset-bottom {
  /* #ifdef H5 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
}

.tabbar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 12px 0;
  }

  .tabbar-item:active {
    transform: scale(0.95);
  }

  .tabbar-item--active .tabbar-icon {
    transform: scale(1.2) translateY(-2px);
    filter: brightness(1.2);
  }

.tabbar-item__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.tabbar-icon {
  font-size: 22px;
  transition: all 0.3s ease;
  line-height: 1;
  transform: scale(1);
}

.tabbar-item--active .tabbar-icon {
  transform: scale(1.2);
  filter: brightness(1.2);
}

.tabbar-item__text {
    font-size: 12px;
    color: #7A7E83;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    line-height: 1.2;
    text-align: center;
  }

  .tabbar-item--active .tabbar-item__text {
    color: #4A90E2;
    font-weight: 600;
    transform: scale(1.05);
  }

.tabbar-item--active .tabbar-item__text {
  color: #4A90E2;
  font-weight: 500;
}

/* 徽章样式 */
.tabbar-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  background-color: #ff4757;
  color: #ffffff;
  font-size: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-sizing: border-box;
  font-weight: 500;
  line-height: 1;
}

.tabbar-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 6px;
  background-color: #ff4757;
  border-radius: 50%;
}

/* 激活状态的背景效果 */
.tabbar-item--active::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  background-color: rgba(74, 144, 226, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

/* 悬停效果（仅在H5中生效） */
/* #ifdef H5 */
.tabbar-item:hover .tabbar-icon {
  transform: scale(1.1);
}

.tabbar-item:hover .tabbar-item__text {
  color: #4A90E2;
}
/* #endif */

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .custom-tabbar {
    background-color: #1e1e1e;
    border-top-color: #333333;
  }
  
  .tabbar-item__text {
    color: #a0a0a0;
  }
  
  .tabbar-item--active .tabbar-item__text {
    color: #4A90E2;
  }
}
</style>