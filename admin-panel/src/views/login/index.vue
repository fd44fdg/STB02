<template>
  <div class="login-container">
    <div class="aurora-bg"></div>
    <div class="login-form-wrapper">
      <div class="login-form-glass">
        <div class="form-header">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">登录以继续管理</p>
        </div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          auto-complete="on"
          label-position="left"
        >
          <el-form-item prop="username">
            <el-input
              ref="usernameRef"
              v-model="loginForm.username"
              placeholder="用户名"
              name="username"
              type="text"
              tabindex="1"
              auto-complete="on"
            >
              <template #prefix>
                <el-icon class="el-input__icon"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              ref="passwordRef"
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              name="password"
              tabindex="2"
              auto-complete="on"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon class="el-input__icon"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click.prevent="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  components: { User, Lock },
  setup() {
    const store = useStore()
    const router = useRouter()
    const loginFormRef = ref(null)
    const loading = ref(false)

    const loginForm = reactive({
      username: 'admin',
      password: 'admin123'
    })

    const loginRules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    }

    const handleLogin = () => {
      loginFormRef.value.validate(valid => {
        if (valid) {
          loading.value = true
          store.dispatch('user/login', loginForm)
            .then(() => {
              router.push({ path: '/' })
              loading.value = false
            })
            .catch(() => {
              loading.value = false
            })
        }
      })
    }

    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes aurora-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes form-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.aurora-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: aurora-gradient 15s ease infinite;
  z-index: 1;
}

.login-form-wrapper {
  position: relative;
  z-index: 2;
  animation: form-fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.login-form-glass {
  width: 400px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
  color: #fff;
}

.form-title {
  font-size: 26px;
  font-weight: 600;
  margin: 0;
}

.form-subtitle {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 8px;
}

.login-form {
  .el-form-item {
    margin-bottom: 25px;
  }

  .el-input {
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: none;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    :deep(.el-input__inner) {
      color: #fff;
      &::placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
    }
    :deep(.el-input__prefix .el-icon) {
      color: rgba(255, 255, 255, 0.8);
    }

    &:hover, &.is-focus {
      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.login-button {
  width: 100%;
  height: 45px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
