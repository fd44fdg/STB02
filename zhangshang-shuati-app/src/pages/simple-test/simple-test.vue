<template>
  <view class="simple-wrapper">
    <text class="title">MP TEST OK</text>
    <view class="info">{{ platformInfo }}</view>
  </view>
</template>

<script>
export default {
  name: 'SimpleTest',
  data() {
    return { platformInfo: '' }
  },
  onLoad() {
    try {
      const sys = uni.getSystemInfoSync();
      this.platformInfo = `${sys.platform} ${sys.SDKVersion}`;
    } catch (e) {
      this.platformInfo = 'no system info';
    }
    console.log('[simple-test] mounted');
  }
}
</script>

<style scoped>
.simple-wrapper { padding:60rpx; }
.title { font-size:48rpx; color:#007AFF; font-weight:700; display:block; margin-bottom:24rpx; }
.info { font-size:28rpx; color:#333; }
</style>