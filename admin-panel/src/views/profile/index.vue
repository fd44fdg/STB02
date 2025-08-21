<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      
      <div class="profile-content">
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
          >
            <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="avatar-tips">
            <p>点击上传头像</p>
            <p class="tips-text">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
          </div>
        </div>
        
        <div class="info-section">
          <el-form
            ref="profileForm"
            :model="userInfo"
            :rules="rules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userInfo.username" :disabled="true" />
            </el-form-item>
            
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="userInfo.nickname" placeholder="请输入昵称" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
            </el-form-item>
            
            <el-form-item label="角色">
              <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'primary'">
                {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </el-form-item>
            
            <el-form-item label="注册时间">
              <span>{{ userInfo.createTime }}</span>
            </el-form-item>
            
            <el-form-item label="最后登录">
              <span>{{ userInfo.lastLoginTime }}</span>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="updateProfile">更新资料</el-button>
              <el-button @click="showPasswordDialog = true">修改密码</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px"
      :before-close="handleClosePasswordDialog"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="updatePassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'Profile',
  components: {
    Plus
  },
  setup() {
    const profileForm = ref(null)
    const passwordFormRef = ref(null)
    const showPasswordDialog = ref(false)
    
    const userInfo = reactive({
      id: null,
      username: '',
      nickname: '',
      email: '',
      phone: '',
      avatar: '/static/default-avatar.svg',
      role: '',
      createTime: '',
      lastLoginTime: ''
    })
    
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const rules = {
      nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ]
    }
    
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    const beforeAvatarUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
    
    const handleAvatarSuccess = (response, file) => {
      userInfo.avatar = URL.createObjectURL(file.raw)
      ElMessage.success('头像上传成功')
    }
    
    const updateProfile = async () => {
      try {
        await profileForm.value.validate()
        // 这里应该调用API更新用户信息
        ElMessage.success('个人资料更新成功')
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }
    
    const updatePassword = async () => {
      try {
        await passwordForm.value.validate()
        // 这里应该调用API更新密码
        ElMessage.success('密码修改成功')
        showPasswordDialog.value = false
        // 重置表单
        Object.assign(passwordForm, {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }
    
    const handleClosePasswordDialog = () => {
      passwordForm.value?.resetFields()
      showPasswordDialog.value = false
    }
    
    onMounted(() => {
      // 这里可以调用API获取用户信息
    })
    
    return {
      profileForm,
      passwordFormRef,
      showPasswordDialog,
      userInfo,
      passwordForm,
      rules,
      passwordRules,
      beforeAvatarUpload,
      handleAvatarSuccess,
      updateProfile,
      updatePassword,
      handleClosePasswordDialog
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  .card-header {
    font-size: 18px;
    font-weight: 600;
  }
}

.profile-content {
  display: flex;
  gap: 40px;
  
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 200px;
    
    .avatar-uploader {
      .avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: block;
      }
      
      :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 50%;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: 0.2s;
        width: 120px;
        height: 120px;
        
        &:hover {
          border-color: #409eff;
        }
      }
      
      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 120px;
        height: 120px;
        line-height: 120px;
        text-align: center;
      }
    }
    
    .avatar-tips {
      margin-top: 15px;
      text-align: center;
      
      p {
        margin: 5px 0;
        
        &.tips-text {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
  
  .info-section {
    flex: 1;
    
    .profile-form {
      max-width: 500px;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>