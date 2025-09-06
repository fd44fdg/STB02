import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { changePassword, deleteAccount } from '@/api/security'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise(async (resolve, reject) => {
      // MOCK LOGIN: If username is 'admin' and password is 'admin123', bypass API call
      if (username.trim() === 'admin' && password === 'admin123') {
        console.warn('！！！Using Mock Login！！！')
        const mockToken = 'mock-token-' + Date.now()
        commit('SET_TOKEN', mockToken)
        setToken(mockToken)
        resolve()
        return
      }

      // Real API call
      try {
        const response = await login({ username: username.trim(), password: password })
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  // get user info
  async getInfo({ commit, state }) {
    const user = await getInfo()
    const { roles, nickname, avatar } = user

    // roles must be a non-empty array for permission control
    if (!roles || roles.length <= 0) {
      throw new Error('getInfo: roles must be a non-null array!')
    }

    commit('SET_ROLES', roles)
    commit('SET_NAME', nickname)
    commit('SET_AVATAR', avatar)
    return user
  },

  // user logout
  async logout({ commit, state, dispatch }) {
    await logout()
    commit('SET_TOKEN', '')
    commit('SET_ROLES', [])
    removeToken()
    resetRouter()
    // optional: redirect to login page
    router.push(`/login?redirect=${router.currentRoute.value.fullPath}`)
  },

  // remove token
  async resetToken({ commit }) {
    commit('SET_TOKEN', '')
    commit('SET_ROLES', [])
    removeToken()
  },

  // 修改密码
  changePassword({ commit }, passwordData) {
    return new Promise((resolve, reject) => {
      changePassword(passwordData)
        .then(() => {
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 注销账号
  deleteAccount({ commit }, password) {
    return new Promise((resolve, reject) => {
      deleteAccount(password)
        .then(response => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}