<template>
    <view class="menu-item" @click="$emit('click')">
        <view class="menu-content">
            <uni-icons :type="icon" :color="iconColor" size="22"></uni-icons>
            <text class="menu-title">{{ title }}</text>
        </view>
        <uni-icons v-if="showArrow" type="right" size="18" color="#bbb"></uni-icons>
    </view>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    iconColor: {
        type: String,
        default: '#333',
    },
    showArrow: {
        type: Boolean,
        default: true,
    },
});

defineEmits(['click']);
</script>

<style scoped>
.menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f5f5f5;
    transition: background-color 0.2s;
}
.menu-item:last-child {
    border-bottom: none;
}
.menu-item:active {
    background-color: #f9f9f9;
}
.menu-content {
    display: flex;
    align-items: center;
    gap: 20rpx;
}
.menu-title {
    font-size: 30rpx;
    color: #333;
}
</style> 