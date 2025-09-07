<template>
  <view class="home-min-root">
    <text>Home Minimal Debug Page</text>
    <view class="log-line">mounted: {{ mounted }}</view>
    <view class="log-line">onLoad ran: {{ onLoadRan }}</view>
  </view>
</template>

<script>
export default {
  name: 'HomeMin',
  data() {
    return { mounted: false, onLoadRan: false }
  },
  onLoad() {
    // 不做任何依赖调用，仅标记执行
    this.onLoadRan = true
    // 故意不访问 this.$route / this.$mp.query 等，观察是否仍出现 query 设置错误
  },
  mounted() {
    this.mounted = true
  }
}
</script>

<style scoped>
.home-min-root { padding: 24rpx; }
.log-line { margin-top: 16rpx; font-size: 26rpx; color: #333; }
</style>