<template>
  <view class="modern-icon" :class="{ 'modern-icon--active': active }">
    <svg 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="icon-svg"
    >
      <!-- 首页图标 -->
      <g v-if="type === 'home'">
        <path 
          d="M3 9.5L12 3l9 6.5v8.5c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9.5z" 
          :stroke="iconColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <path 
          d="M9 21V12h6v9" 
          :stroke="active ? '#ffffff' : iconColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <circle v-if="active" cx="12" cy="7" r="1.5" :fill="iconColor" opacity="0.6"/>
      </g>

      <!-- 刷题图标 -->
      <g v-else-if="type === 'practice'">
        <rect 
          x="3" y="4" width="18" height="16" rx="2" 
          :stroke="iconColor" 
          stroke-width="2" 
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <path 
          d="M7 8h10M7 12h8M7 16h6" 
          :stroke="active ? '#ffffff' : iconColor" 
          stroke-width="2" 
          stroke-linecap="round"
        />
        <circle v-if="active" cx="17" cy="8" r="2" :fill="iconColor" opacity="0.8"/>
        <path 
          v-if="active"
          d="M16 7l1 1 2-2" 
          stroke="#ffffff" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </g>

      <!-- 考试图标 -->
      <g v-else-if="type === 'exam'">
        <path 
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
          :stroke="iconColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <path 
          d="M14 2v6h6" 
          :stroke="iconColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <circle 
          cx="10" cy="13" r="2" 
          :stroke="active ? '#ffffff' : iconColor" 
          stroke-width="2"
          :fill="active ? '#ffffff' : 'none'"
        />
        <path 
          d="M14 13h2M8 17h8" 
          :stroke="active ? '#ffffff' : iconColor" 
          stroke-width="2" 
          stroke-linecap="round"
        />
        <circle v-if="active" cx="18" cy="6" r="1.5" :fill="iconColor" opacity="0.6"/>
      </g>

      <!-- 个人中心图标 -->
      <g v-else-if="type === 'profile'">
        <circle 
          cx="12" cy="8" r="4" 
          :stroke="iconColor" 
          stroke-width="2"
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <path 
          d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" 
          :stroke="iconColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <circle v-if="active" cx="16" cy="6" r="1.5" :fill="iconColor" opacity="0.6"/>
        <path 
          v-if="active"
          d="M8 8h8" 
          stroke="#ffffff" 
          stroke-width="1.5" 
          stroke-linecap="round"
          opacity="0.7"
        />
      </g>

      <!-- 搜索图标 -->
      <g v-else-if="type === 'search'">
        <circle 
          cx="11" cy="11" r="8" 
          :stroke="iconColor" 
          stroke-width="2"
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <path 
          d="M21 21l-4.35-4.35" 
          :stroke="iconColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <circle v-if="active" cx="11" cy="11" r="3" fill="#ffffff" opacity="0.3"/>
      </g>

      <!-- 收藏图标 -->
      <g v-else-if="type === 'favorite'">
        <path 
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" 
          :stroke="iconColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <circle v-if="active" cx="12" cy="9" r="1.5" :fill="iconColor" opacity="0.6"/>
      </g>

      <!-- 设置图标 -->
      <g v-else-if="type === 'settings'">
        <circle 
          cx="12" cy="12" r="3" 
          :stroke="iconColor" 
          stroke-width="2"
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <path 
          d="M12 1v6m0 6v6m11-7h-6m-6 0H1" 
          :stroke="iconColor" 
          stroke-width="2" 
          stroke-linecap="round"
        />
        <circle v-if="active" cx="18" cy="6" r="1.5" :fill="iconColor" opacity="0.6"/>
      </g>

      <!-- 默认图标 -->
      <g v-else>
        <circle 
          cx="12" cy="12" r="10" 
          :stroke="iconColor" 
          stroke-width="2"
          :fill="active ? iconColor : 'none'"
          fill-opacity="0.1"
        />
        <path 
          d="M8 12h8M12 8v8" 
          :stroke="active ? '#ffffff' : iconColor" 
          stroke-width="2" 
          stroke-linecap="round"
        />
      </g>
    </svg>
  </view>
</template>

<script>
export default {
  name: 'ModernIcon',
  props: {
    type: {
      type: String,
      default: 'home',
      validator: (value) => {
        return ['home', 'practice', 'exam', 'profile', 'search', 'favorite', 'settings'].includes(value)
      }
    },
    active: {
      type: Boolean,
      default: false
    },
    size: {
      type: [String, Number],
      default: 24
    },
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconColor() {
      if (this.color) return this.color
      return this.active ? '#007AFF' : '#8E8E93'
    }
  }
}
</script>

<style scoped>
.modern-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.modern-icon--active {
  transform: scale(1.1);
}

.icon-svg {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 0 transparent);
}

.modern-icon--active .icon-svg {
  filter: drop-shadow(0 2px 8px rgba(0, 122, 255, 0.3));
}

/* 悬停效果 */
/* #ifdef H5 */
.modern-icon:hover {
  transform: scale(1.05);
}

.modern-icon:hover .icon-svg {
  filter: drop-shadow(0 1px 4px rgba(0, 122, 255, 0.2));
}
/* #endif */

/* 动画关键帧 */
@keyframes iconPulse {
  0%, 100% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1.15);
  }
}

.modern-icon--active.pulse {
  animation: iconPulse 2s infinite;
}
</style>