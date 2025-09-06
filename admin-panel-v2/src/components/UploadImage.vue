<template>
  <div>
    <n-space vertical>
      <div v-if="modelValue" style="display:flex;align-items:center;gap:12px;">
        <img :src="modelValue" alt="预览" style="width:160px;height:80px;object-fit:cover;border-radius:8px;" />
        <n-button @click="$emit('update:modelValue', '')">移除</n-button>
      </div>
      <n-upload
        :action="endpoint"
        :headers="headers"
        name="file"
        :max="1"
        :show-file-list="false"
        :on-before-upload="beforeUpload"
        :on-finish="onFinish"
        :on-error="onError"
        accept="image/png,image/jpeg,image/webp"
      >
        <n-button type="primary">上传图片</n-button>
      </n-upload>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessage, NUpload, NButton, NSpace } from 'naive-ui'

const props = defineProps<{ modelValue: string, endpoint?: string }>()
const emit = defineEmits(['update:modelValue'])
const message = useMessage()

const endpoint = computed(() => props.endpoint || '/api/v1/upload/banners')
const headers = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`
}))

function beforeUpload ({ file }: any) {
  const maxSize = 10 * 1024 * 1024 // 10MB dev
  if (file.file?.size > maxSize) {
    message.error('文件过大，最大 10MB')
    return false
  }
  const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.file?.type)
  if (!ok) {
    message.error('仅支持 PNG/JPEG/WEBP 格式')
    return false
  }
  return true
}

function onFinish ({ event }: any) {
  try {
    const res = JSON.parse(event.target.response || '{}')
    const url = res?.data?.url
    if (url) {
      emit('update:modelValue', url)
      message.success('上传成功')
    } else {
      throw new Error(res?.message || '上传失败')
    }
  } catch (e: any) {
    message.error(e.message || '上传失败')
  }
}

function onError () {
  message.error('上传失败')
}
</script>
