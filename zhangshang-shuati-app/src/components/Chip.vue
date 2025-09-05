<template>
  <view :class="['chip', typeClass, sizeClass, { 'is-closable': closable }]">
    <slot />
    <text v-if="closable" class="chip-close" @tap="$emit('close')">×</text>
  </view>
</template>

<script>
export default {
  name: 'Chip',
  props: {
    type: { type: String, default: 'default' }, // default / primary / warning / danger
    size: { type: String, default: 'md' }, // sm / md
    closable: { type: Boolean, default: false }
  },
  computed: {
    typeClass() { return `chip-${this.type}` },
    sizeClass() { return `chip-${this.size}` }
  }
}
</script>

<style scoped>
.chip {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 6rpx 14rpx; border-radius: 20rpx;
  background-color: var(--card-bg-2, #f5f5f5);
  border: 1rpx solid var(--muted-border, #e9ecef);
  color: var(--text-secondary, #666);
}
.chip-md { font-size: 26rpx; }
.chip-sm { font-size: 22rpx; padding: 4rpx 10rpx; }
.chip-primary { background-color: rgba(99,158,236,0.12); color: var(--accent, #4A90E2); border-color: var(--accent, #4A90E2); }
.chip-warning { background-color: var(--warning-bg, #fff7e6); color: var(--warning-dark, #FFA500); border-color: var(--warning-dark, #FFA500); }
.chip-danger { background-color: var(--danger-bg, #fff1f0); color: var(--danger, #ff4d4f); border-color: var(--danger, #ff4d4f); }
.chip-close { margin-left: 8rpx; font-size: .9em; color: inherit; }
</style>
