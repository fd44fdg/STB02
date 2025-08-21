<template>
  <view class="tab-icon" :class="{ 'tab-icon--active': active }">
    <view class="icon-wrapper">
      <image 
        v-if="iconType === 'image'"
        :src="iconPath" 
        :class="['tab-icon__image', { 'tab-icon__image--active': active }]"
        mode="aspectFit"
      />
      <text 
        v-else-if="iconType === 'iconfont'"
        :class="['iconfont', iconClass, { 'tab-icon__iconfont--active': active }]"
      />
      <view 
        v-else-if="iconType === 'svg'"
        :class="['tab-icon__svg', { 'tab-icon__svg--active': active }]"
        v-html="svgContent"
      />
    </view>
    <text :class="['tab-icon__text', { 'tab-icon__text--active': active }]">
      {{ text }}
    </text>
  </view>
</template>

<script>
export default {
  name: 'TabIcon',
  props: {
    // 图标类型: 'image' | 'iconfont' | 'svg'
    iconType: {
      type: String,
      default: 'iconfont'
    },
    // 图标路径（image类型使用）
    iconPath: {
      type: String,
      default: ''
    },
    // 图标类名（iconfont类型使用）
    iconClass: {
      type: String,
      default: ''
    },
    // SVG内容（svg类型使用）
    svgContent: {
      type: String,
      default: ''
    },
    // 文本
    text: {
      type: String,
      required: true
    },
    // 是否激活状态
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.tab-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  transition: all 0.3s ease;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
}

.tab-icon__image {
  width: 100%;
  height: 100%;
  filter: grayscale(1);
  transition: filter 0.3s ease;
}

.tab-icon__image--active {
  filter: none;
}

.iconfont {
  font-size: 20px;
  color: #7A7E83;
  transition: color 0.3s ease;
}

.tab-icon__iconfont--active {
  color: #4A90E2 !important;
}

.tab-icon__svg {
  width: 100%;
  height: 100%;
  fill: #7A7E83;
  transition: fill 0.3s ease;
}

.tab-icon__svg--active {
  fill: #4A90E2;
}

.tab-icon__text {
  font-size: 10px;
  color: #7A7E83;
  transition: color 0.3s ease;
  line-height: 1.2;
  text-align: center;
}

.tab-icon__text--active {
  color: #4A90E2;
  font-weight: 500;
}

/* 动画效果 */
.tab-icon--active .icon-wrapper {
  transform: scale(1.1);
}

/* H5 特定样式 */
/* #ifdef H5 */
.tab-icon:hover .icon-wrapper {
  transform: scale(1.05);
}
/* #endif */
</style>