<template>
  <view :class="['header-bar', { 'is-sticky': sticky }]">
    <view class="header-left">
      <view v-if="showBack" class="back-button" @tap="$emit('back')">
        <text class="iconfont icon-arrow-left back-icon"></text>
      </view>
      <slot name="left" />
    </view>
    <view class="header-title">{{ title }}</view>
    <view class="header-right">
      <slot name="right" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'HeaderBar',
  props: {
    title: { type: String, default: '' },
    showBack: { type: Boolean, default: true },
    sticky: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.header-bar { position: relative; display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: var(--card-bg, #fff);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05));
}
.header-left, .header-right {
  display: flex; align-items: center;
}
.header-left { justify-content: flex-start; }
.header-right { justify-content: flex-end; }
.back-button {
  width: 60rpx; height: 60rpx;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background-color: var(--card-bg-2, #f5f5f5);
  border: 1rpx solid var(--muted-border, #e9ecef);
  transition: background-color .2s ease, border-color .2s ease, opacity .15s ease;
}
.back-button:active { opacity: var(--active-opacity, .85); }
.back-icon { font-size: 36rpx; color: var(--text-primary, #333); }
.header-title { font-size: 36rpx; font-weight: bold; color: var(--text-primary, #333); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
