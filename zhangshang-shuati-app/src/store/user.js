import { wechatLogin, logout, getUserInfo } from '@/api/auth';

const state = {
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || {
        id: null,
        username: '',
        nickname: '',
        email: '',
        avatar: '',
        role: 'guest'
    },
};

const mutations = {
    SET_TOKEN: (state, token) => {
        state.token = token;
        uni.setStorageSync('token', token);
    },
    SET_USER_INFO: (state, userInfo) => {
        state.userInfo = userInfo;
        uni.setStorageSync('userInfo', userInfo);
    },
    CLEAR_USER_DATA: (state) => {
        state.token = '';
        state.userInfo = null;
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
    }
};

const actions = {
    // 微信登录
    async login({ commit }, loginData) {
        // loginData 已经包含了 token 和 user
        const { token, user } = loginData;
        if (!token || !user) {
            return Promise.reject(new Error('登录数据无效'));
        }
        commit('SET_TOKEN', token);
        commit('SET_USER_INFO', user);
        return Promise.resolve(loginData);
    },

    // 退出登录
    async logout({ commit }) {
        try {
            // 尝试调用后端登出接口，即使失败也继续前端的登出流程
            await logout();
        } catch (error) {
            console.error("Logout API call failed, but proceeding with client-side logout.", error);
        }
        commit('CLEAR_USER_DATA');
        return Promise.resolve();
    },

    // 从后端获取最新用户信息并更新
    async fetchUserInfo({ commit, state }) {
        if (!state.token) {
            return Promise.reject(new Error('No token found'));
        }
        try {
            const response = await getUserInfo();
            if (response && response.code === 200 && response.data) {
                commit('SET_USER_INFO', response.data);
                return Promise.resolve(response.data);
            } else {
                throw new Error(response.message || '获取用户信息失败');
            }
        } catch (error) {
            // 如果token失效，获取用户信息会失败，此时也应该清除本地数据
            commit('CLEAR_USER_DATA');
            return Promise.reject(error);
        }
    }
};

const getters = {
    isLoggedIn: state => !!state.token,
    userInfo: state => state.userInfo,
    token: state => state.token
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}; 