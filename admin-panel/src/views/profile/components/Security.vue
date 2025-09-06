<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <el-form-item label="当前密码" prop="currentPassword">
      <el-input v-model="form.currentPassword" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认新密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">修改密码</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const store = useStore()
    const formRef = ref(null)

    const form = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== form.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    const rules = reactive({
      currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
      newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '长度至少为6个字符', trigger: 'blur' }],
      confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
    })

    const submit = () => {
      formRef.value.validate(valid => {
        if (valid) {
          store.dispatch('user/changePassword', form)
            .then(() => {
              ElMessage.success('密码修改成功，请重新登录')
              // Optionally, force logout after password change
              setTimeout(() => {
                store.dispatch('user/logout')
              }, 1500)
            })
            .catch(error => {
              // Error message is already handled by the request interceptor
            })
        }
      })
    }

    return {
      form,
      rules,
      formRef,
      submit
    }
  }
}
</script>
