<template>
  <div class="security-center">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>安全中心</span>
        </div>
      </template>
      
      <div class="security-menu">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="menu-item" @click="handleChangePassword">
              <div class="menu-content">
                <el-icon class="menu-icon"><Lock /></el-icon>
                <h3>修改密码</h3>
                <p>定期修改密码，保护账户安全</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card shadow="hover" class="menu-item" @click="handleResetPassword">
              <div class="menu-content">
                <el-icon class="menu-icon"><Key /></el-icon>
                <h3>找回密码</h3>
                <p>通过邮箱验证码重置密码</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card shadow="hover" class="menu-item" @click="handleLogout">
              <div class="menu-content">
                <el-icon class="menu-icon"><SwitchButton /></el-icon>
                <h3>退出登录</h3>
                <p>安全退出当前账户</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card shadow="hover" class="menu-item danger" @click="handleDeleteAccount">
              <div class="menu-content">
                <el-icon class="menu-icon"><Delete /></el-icon>
                <h3>注销账号</h3>
                <p>永久删除账户及所有数据</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <el-card shadow="hover" class="menu-item" @click="handleViewLoginLogs">
              <div class="menu-content">
                <el-icon class="menu-icon"><Document /></el-icon>
                <h3>登录日志</h3>
                <p>查看账户登录历史记录</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 安全信息展示 -->
      <div class="security-info">
        <h3>账户安全信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
          <el-descriptions-item label="最后登录时间">{{ formatDate(userInfo.lastLoginTime) }}</el-descriptions-item>
          <el-descriptions-item label="最后修改密码时间">{{ formatDate(userInfo.lastPasswordChangeTime) }}</el-descriptions-item>
          <el-descriptions-item label="账户状态">
            <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
              {{ userInfo.status === 1 ? '正常' : '异常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="安全等级">
            <el-tag :type="getSecurityLevelType(userInfo.securityLevel)">
              {{ getSecurityLevelText(userInfo.securityLevel) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" v-model="changePasswordVisible" width="500px">
      <el-form
        ref="changePasswordFormRef"
        :model="changePasswordForm"
        :rules="changePasswordRules"
        label-width="120px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="changePasswordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="changePasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="changePasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="changePasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChangePassword" :loading="changePasswordLoading">
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 找回密码对话框 -->
    <el-dialog title="找回密码" v-model="resetPasswordVisible" width="500px">
      <el-steps :active="resetPasswordStep" finish-status="success">
        <el-step title="验证邮箱" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>
      
      <!-- 步骤1：验证邮箱 -->
      <div v-if="resetPasswordStep === 0" class="reset-step">
        <el-form
          ref="emailFormRef"
          :model="resetPasswordForm"
          :rules="emailRules"
          label-width="120px"
        >
          <el-form-item label="邮箱地址" prop="email">
            <el-input
              v-model="resetPasswordForm.email"
              placeholder="请输入注册邮箱"
            />
          </el-form-item>
          <el-form-item label="验证码" prop="verifyCode">
            <div class="verify-code-input">
              <el-input
                v-model="resetPasswordForm.verifyCode"
                placeholder="请输入验证码"
                style="width: 200px; margin-right: 10px;"
              />
              <el-button
                @click="sendVerifyCode"
                :disabled="sendCodeDisabled"
                :loading="sendCodeLoading"
              >
                {{ sendCodeText }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 步骤2：重置密码 -->
      <div v-if="resetPasswordStep === 1" class="reset-step">
        <el-form
          ref="resetFormRef"
          :model="resetPasswordForm"
          :rules="resetPasswordRules"
          label-width="120px"
        >
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="resetPasswordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="resetPasswordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 步骤3：完成 -->
      <div v-if="resetPasswordStep === 2" class="reset-step success-step">
        <el-result
          icon="success"
          title="密码重置成功"
          sub-title="您的密码已成功重置，请使用新密码登录"
        />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button
            v-if="resetPasswordStep < 2"
            type="primary"
            @click="nextResetStep"
            :loading="resetPasswordLoading"
          >
            {{ resetPasswordStep === 0 ? '验证邮箱' : '重置密码' }}
          </el-button>
          <el-button
            v-if="resetPasswordStep === 2"
            type="primary"
            @click="resetPasswordVisible = false"
          >
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Key, SwitchButton, Delete, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { sendResetPasswordCode, verifyResetCode, resetPassword, getUserSecurityInfo } from '@/api/security'

export default {
  name: 'SecurityCenter',
  components: {
    Lock,
    Key,
    SwitchButton,
    Delete,
    Document
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    
    const changePasswordVisible = ref(false)
    const resetPasswordVisible = ref(false)
    const changePasswordLoading = ref(false)
    const resetPasswordLoading = ref(false)
    const sendCodeLoading = ref(false)
    const resetPasswordStep = ref(0)
    const countdown = ref(0)
    const timer = ref(null)
    
    const changePasswordFormRef = ref(null)
    const emailFormRef = ref(null)
    const resetFormRef = ref(null)
    
    const userInfo = ref({
      username: '',
      email: '',
      lastLoginTime: null,
      lastPasswordChangeTime: null,
      status: 1,
      securityLevel: 1
    })
    
    const changePasswordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const resetPasswordForm = reactive({
      email: '',
      verifyCode: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
      } else {
        callback()
      }
    }
    
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== changePasswordForm.newPassword) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    
    const validateResetConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== resetPasswordForm.newPassword) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    
    const changePasswordRules = {
      currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
      newPassword: [{ validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
    }
    
    const emailRules = {
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    }
    
    const resetPasswordRules = {
      newPassword: [{ validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ validator: validateResetConfirmPassword, trigger: 'blur' }]
    }
    
    const sendCodeDisabled = computed(() => countdown.value > 0)
    const sendCodeText = computed(() => {
      return countdown.value > 0 ? `${countdown.value}s后重发` : '发送验证码'
    })
    
    const handleChangePassword = () => {
      changePasswordVisible.value = true
      // 重置表单
      Object.keys(changePasswordForm).forEach(key => {
        changePasswordForm[key] = ''
      })
    }
    
    const handleResetPassword = () => {
      resetPasswordVisible.value = true
      resetPasswordStep.value = 0
      // 重置表单
      Object.keys(resetPasswordForm).forEach(key => {
        resetPasswordForm[key] = ''
      })
    }
    
    const handleLogout = () => {
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用退出登录API
        store.dispatch('user/logout').then(() => {
          ElMessage.success('退出登录成功')
          router.push('/login')
        })
      })
    }
    
    const handleViewLoginLogs = () => {
      router.push('/security/login-logs')
    }
    
    const handleDeleteAccount = () => {
      ElMessageBox.confirm(
        '注销账号将永久删除您的所有数据，此操作不可恢复。确定要继续吗？',
        '危险操作',
        {
          confirmButtonText: '确定注销',
          cancelButtonText: '取消',
          type: 'error',
          confirmButtonClass: 'el-button--danger'
        }
      ).then(() => {
        ElMessageBox.prompt('请输入您的密码以确认注销操作', '确认密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'password',
          inputValidator: (value) => {
            if (!value) {
              return '请输入密码'
            }
            return true
          }
        }).then(({ value }) => {
          store.dispatch('user/deleteAccount', value).then(() => {
            ElMessage.success('账号注销成功')
            router.push('/login')
          }).catch(error => {
            ElMessage.error(error.message || '账号注销失败')
          })
        })
      })
    }
    
    const submitChangePassword = () => {
      changePasswordFormRef.value.validate((valid) => {
        if (valid) {
          changePasswordLoading.value = true
          store.dispatch('user/changePassword', {
            currentPassword: changePasswordForm.currentPassword,
            newPassword: changePasswordForm.newPassword
          }).then(() => {
            changePasswordLoading.value = false
            changePasswordVisible.value = false
            ElMessage.success('密码修改成功')
            userInfo.value.lastPasswordChangeTime = new Date()
          }).catch(error => {
            changePasswordLoading.value = false
            ElMessage.error(error.message || '密码修改失败')
          })
        }
      })
    }
    
    const sendVerifyCode = () => {
      if (!resetPasswordForm.email) {
        ElMessage.error('请输入邮箱地址')
        return
      }
      
      sendCodeLoading.value = true
      sendResetPasswordCode(resetPasswordForm.email).then(() => {
        sendCodeLoading.value = false
        ElMessage.success('验证码已发送到您的邮箱')
        startCountdown()
      }).catch(error => {
        sendCodeLoading.value = false
        ElMessage.error(error.message || '发送验证码失败')
      })
    }
    
    const startCountdown = () => {
      countdown.value = 60
      timer.value = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer.value)
        }
      }, 1000)
    }
    
    const nextResetStep = () => {
      if (resetPasswordStep.value === 0) {
        emailFormRef.value.validate((valid) => {
          if (valid) {
            resetPasswordLoading.value = true
            verifyResetCode({
              email: resetPasswordForm.email,
              code: resetPasswordForm.verifyCode
            }).then(() => {
              resetPasswordLoading.value = false
              resetPasswordStep.value = 1
            }).catch(error => {
              resetPasswordLoading.value = false
              ElMessage.error(error.message || '验证码验证失败')
            })
          }
        })
      } else if (resetPasswordStep.value === 1) {
        resetFormRef.value.validate((valid) => {
          if (valid) {
            resetPasswordLoading.value = true
            resetPassword({
              email: resetPasswordForm.email,
              code: resetPasswordForm.verifyCode,
              newPassword: resetPasswordForm.newPassword
            }).then(() => {
              resetPasswordLoading.value = false
              resetPasswordStep.value = 2
            }).catch(error => {
              resetPasswordLoading.value = false
              ElMessage.error(error.message || '密码重置失败')
            })
          }
        })
      }
    }
    
    const getSecurityLevelType = (level) => {
      const types = { 1: 'danger', 2: 'warning', 3: 'success' }
      return types[level] || 'info'
    }
    
    const getSecurityLevelText = (level) => {
      const texts = { 1: '低', 2: '中', 3: '高' }
      return texts[level] || '未知'
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString()
    }
    
    onMounted(() => {
      // 获取用户安全信息
      getUserSecurityInfo().then(response => {
        if (response.data) {
          Object.assign(userInfo.value, response.data)
        }
      }).catch(error => {
        console.error('获取用户安全信息失败:', error)
      })
    })
    
    return {
      userInfo,
      changePasswordVisible,
      resetPasswordVisible,
      changePasswordLoading,
      resetPasswordLoading,
      sendCodeLoading,
      resetPasswordStep,
      changePasswordFormRef,
      emailFormRef,
      resetFormRef,
      changePasswordForm,
      resetPasswordForm,
      changePasswordRules,
      emailRules,
      resetPasswordRules,
      sendCodeDisabled,
      sendCodeText,
      handleChangePassword,
      handleResetPassword,
      handleLogout,
      handleDeleteAccount,
      submitChangePassword,
      sendVerifyCode,
      nextResetStep,
      getSecurityLevelType,
      getSecurityLevelText,
      formatDate,
      handleViewLoginLogs
    }
  }
}
</script>

<style lang="scss" scoped>
.security-center {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.security-menu {
  margin-bottom: 30px;
  
  .menu-item {
    cursor: pointer;
    transition: all 0.3s;
    height: 150px;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    &.danger {
      .menu-content {
        .menu-icon {
          color: #f56c6c;
        }
        
        h3 {
          color: #f56c6c;
        }
      }
    }
    
    .menu-content {
      text-align: center;
      padding: 20px;
      
      .menu-icon {
        font-size: 40px;
        color: #409eff;
        margin-bottom: 15px;
      }
      
      h3 {
        margin: 0 0 10px 0;
        color: #303133;
        font-size: 18px;
      }
      
      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
        line-height: 1.4;
      }
    }
  }
}

.security-info {
  h3 {
    margin-bottom: 20px;
    color: #303133;
  }
}

.dialog-footer {
  text-align: right;
}

.reset-step {
  margin: 20px 0;
  
  &.success-step {
    text-align: center;
  }
}

.verify-code-input {
  display: flex;
  align-items: center;
}

:deep(.el-steps) {
  margin: 20px 0;
}
</style>