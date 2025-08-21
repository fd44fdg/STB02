<template>
  <view class="icon-demo-page">
    <IconShowcase />
  </view>
</template>

<script>
import IconShowcase from '@/components/IconShowcase.vue'

export default {
  name: 'IconDemo',
  components: {
    IconShowcase
  }
}
</script>

<style scoped>
.icon-demo-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>