import { defineStore } from 'pinia'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import axios from '@/utils/request'
import { push } from '@/utils/route'

// 定义Token名称（和后端配置一致）
const TOKEN_NAME = globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'

// 校验token（完善版）
const checkToken = async (state = {}) => {
    const cacheName = 'user-info'
    state.login.finish = false // 先置为未完成，避免缓存欺骗

    // 1. 优先从缓存取用户信息（提升体验）
    const cacheUser = cache.get(cacheName)
    if (cacheUser) {
        state.login.user = cacheUser
        state.login.finish = true // 先设置为完成，提升用户体验
    }

    try {
        // 2. 强制校验后端Token有效性（异步）
        const { code, msg, data } = await axios.post('/api/comm/check-token', {}, {
            // 携带Cookie（适配后端从Cookie取Token）
            withCredentials: true,
            // 请求头携带Token（适配后端从Authorization取Token）
            headers: {
                Authorization: utils.get.cookie(TOKEN_NAME) || ''
            }
        })

        switch (code) {
            case 200:
                // 校验成功 → 更新状态和缓存（延长缓存有效期，比如2小时）
                state.login.user = data.user
                state.login.finish = true
                cache.set(cacheName, data.user, 7200) // 2小时缓存
                break;
            case 401: // Token过期/无效
            case 412: // Token格式错误
                await logout(state)
                break;
            default:
                console.error('Token校验失败：', msg)
                // 不登出，保持缓存中的用户信息
                state.login.finish = true
        }
    } catch (err) {
        // 网络错误/接口异常 → 保持缓存中的用户信息
        console.error('Token校验失败：', err)
        // 不登出，保持缓存中的用户信息
        if (cacheUser) {
            state.login.finish = true
        }
    }
}

// 登出（完善版）
const logout = async (state = {}, path = null) => {
    // 1. 清除前端状态
    state.login.user = {}
    state.login.finish = false
    cache.del('user-info')
    utils.clear.cookie(TOKEN_NAME)

    // 2. 调用后端登出接口（兼容失败场景）
    try {
        await axios.delete('/api/comm/logout', { withCredentials: true })
    } catch (err) {
        console.error('登出接口调用失败：', err)
    }

    // 3. 跳转指定页面（默认首页）
    if (path || path === '') {
        setTimeout(() => push(path || '/'), 300)
    }
}

export const useCommStore = defineStore('comm', {
    state: () => ({
        auth: {
            login: false,
            reset: false,
            register: false,
        },
        login: {
            finish: false,
            user: cache.get('user-info') || {}
        },
        progress: false,
        nav: {
            title: ''
        }
    }),
    actions: {
        switchAuth(name = 'login', bool = true) {
            for (const key in this.auth) {
                this.auth[key] = key === name ? bool : false
            }
        },
        logout(path = null) {
            return logout(this, path)
        },
        // 手动触发登录态校验（比如登录后/页面刷新后）
        async checkLoginState() {
            await checkToken(this)
        }
    },
    getters: {
        getLogin: (state) => {
            // 只在状态未完成且用户信息为空时校验Token
            if (!state.login.finish && utils.is.empty(state.login.user)) {
                // 使用异步方式校验，避免阻塞
                checkToken(state).catch(err => {
                    console.error('Token校验失败：', err)
                })
            }
            return state.login
        }
    }
})