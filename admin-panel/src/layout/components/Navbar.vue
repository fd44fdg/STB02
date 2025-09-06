<template>
  <div class="navbar">
    <div class="left-menu">
      <el-icon class="hamburger" @click="toggleSideBar">
        <Expand v-if="sidebar.opened" />
        <Fold v-else />
      </el-icon>
      <breadcrumb class="breadcrumb-container" />
    </div>
    
    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" />
          <el-icon class="el-icon-caret-bottom">
            <CaretBottom />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/profile/index">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click="logout">
              <span style="display:block;">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import { Expand, Fold, CaretBottom } from '@element-plus/icons-vue'

export default {
  name: 'Navbar',
  components: {
    Breadcrumb,
    Expand,
    Fold,
    CaretBottom
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const sidebar = computed(() => store.state.app.sidebar)
    const avatar = computed(() => store.state.user.avatar || '/default-avatar.svg')

    const toggleSideBar = () => {
      store.dispatch('app/toggleSideBar')
    }

    const logout = async () => {
      await store.dispatch('user/logout')
      router.push('/login')
    }

    return {
      sidebar,
      avatar,
      toggleSideBar,
      logout
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .left-menu {
    display: flex;
    align-items: center;

    .hamburger {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
      cursor: pointer;
      margin-right: 20px;
    }

    .breadcrumb-container {
      margin-left: 10px;
    }
  }

  .right-menu {
    display: flex;
    align-items: center;

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>