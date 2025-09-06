<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card user-card">
          <template #header>
            <div class="clearfix">
              <span>关于我</span>
            </div>
          </template>
          <div class="user-profile">
            <div class="box-center">
              <el-avatar :size="100" :src="user.avatar" />
            </div>
            <div class="box-center">
              <div class="user-name text-center">{{ user.name }}</div>
              <div class="user-role text-center text-muted">{{ user.roles.join(' | ') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16" :xs="24">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="account">
              <Account :user="user" />
            </el-tab-pane>
            <el-tab-pane label="账号安全" name="security">
              <Security />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import Account from './components/Account.vue'
import Security from './components/Security.vue'

export default {
  name: 'Profile',
  components: { Account, Security },
  setup() {
    const store = useStore()
    const activeTab = ref('account')
    const user = reactive({
      name: '',
      email: '',
      avatar: '',
      roles: []
    })

    const getUser = () => {
      user.name = store.getters.name || ''
      user.email = store.getters.email || ''
      user.avatar = store.getters.avatar || ''
      user.roles = store.getters.roles || [] // 保证roles永远是数组
    }

    onMounted(() => {
      getUser()
    })

    return {
      user,
      activeTab
    }
  }
}
</script>

<style lang="scss" scoped>
.user-card {
  .user-profile {
    .box-center {
      padding-top: 10px;
      text-align: center;
    }
    .user-name {
      font-weight: bold;
      margin-top: 10px;
    }
    .text-muted {
      color: #777;
      font-size: 14px;
      margin-top: 5px;
    }
  }
}
</style>
