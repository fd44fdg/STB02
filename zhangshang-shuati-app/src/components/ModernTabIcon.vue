<template>
  <view class="modern-tab-icon" :class="{ 'modern-tab-icon--active': active }">
    <view class="icon-container">
      <ModernIcon 
        :type="iconType" 
        :active="active"
        :size="active ? 32 : 28"
        class="tab-modern-icon"
      />
      <view v-if="active" class="active-indicator"></view>
    </view>
    <text class="tab-text" :class="{ 'tab-text--active': active }">{{ text }}</text>
  </view>
</template>

<script>
import ModernIcon from './ModernIcon.vue'

export default {
  name: 'ModernTabIcon',
  components: {
    ModernIcon
  },
  props: {
    text: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    iconType: {
      type: String,
      default: 'home' // home, practice, exam, profile
    }
  }
}
</script>

<style scoped>
.modern-tab-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 16px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 12px;
    }

    .modern-tab-icon:active {
        transform: scale(0.95);
    }

    .modern-tab-icon--active .icon-svg {
        transform: scale(1.1);
        filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
    }

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.tab-modern-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.active-indicator {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background-color: #4A90E2;
        border-radius: 50%;
        transition: all 0.3s ease;
        opacity: 0;

        &.active {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
        }
    }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.7; transform: translateX(-50%) scale(1.2); }
}

.tab-text {
  font-size: 13px;
  font-weight: 500;
  color: #7A7E83;
  transition: all 0.3s ease;
  margin-top: 6px;
  line-height: 1.2;
  text-align: center;
}

.tab-text--active {
  color: #4A90E2;
  font-weight: 600;
}

/* 激活状态效果 */
.modern-tab-icon--active {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(74, 144, 226, 0.05));
}

.modern-tab-icon--active .icon-container {
  transform: translateY(-2px);
}

.modern-tab-icon--active .icon-svg {
  filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
}

/* 悬停效果 */
/* #ifdef H5 */
.modern-tab-icon:hover {
  background: rgba(74, 144, 226, 0.05);
}

.modern-tab-icon:hover .tab-text {
  color: #4A90E2;
}

.modern-tab-icon:hover .icon-svg {
  transform: scale(1.1);
}
/* #endif */

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .tab-text {
    color: #a0a0a0;
  }
  
  .tab-text--active {
    color: #4A90E2;
  }
  
  .modern-tab-icon--active {
    background: rgba(74, 144, 226, 0.15);
  }
  
  /* #ifdef H5 */
  .modern-tab-icon:hover {
    background: rgba(74, 144, 226, 0.1);
  }
  /* #endif */
}
</style>