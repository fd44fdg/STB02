<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="昵称">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="form.email" disabled />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">更新资料</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    // 创建一个本地的、响应式的数据副本，用于表单绑定
    const form = reactive({ name: '', email: '' })

    // 监听从父组件传来的user prop，当它变化时，更新本地的form副本
    watch(() => props.user, (newUser) => {
      if (newUser) {
        form.name = newUser.name
        form.email = newUser.email
      }
    }, { immediate: true, deep: true })

    const submit = () => {
      // 在真实场景中，这里会调用API更新用户信息
      // 现在我们只显示一个成功的提示
      // 并且，如果需要，可以通知父组件数据已更新
      // emit('update-success', form)
      ElMessage.success('用户信息更新成功')
    }

    return {
      form,
      submit
    }
  }
}
</script>