import { defineStore } from 'pinia'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import axios from '@/utils/request'
import { push } from '@/utils/route'

// 定义Token名称（和后端配置一致）
const TOKEN_NAME = globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'

// 校验token（完善版）
let checkingToken = false // 防止并发调用的标志位
const checkToken = async (state = {}) => {
    // 防止并发调用
    if (checkingToken) return
    checkingToken = true
    
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
    } finally {
        // 重置标志位
        checkingToken = false
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

const fetchSiteInfo = async (state = {}) => {
    const cacheName = 'site-info'
    
    console.log('fetchSiteInfo 开始执行')
    
    // 1. 优先从缓存取站点信息
    const cachedSiteInfo = cache.get(cacheName)
    console.log('缓存中的站点信息:', cachedSiteInfo)
    if (cachedSiteInfo && !utils.is.empty(cachedSiteInfo)) {
        state.siteInfo = cachedSiteInfo
        console.log('从缓存获取站点信息:', cachedSiteInfo)
        return cachedSiteInfo
    }

    try {
        // 2. 从API获取站点信息
        console.log('从API获取站点信息')
        const response = await axios.get('/api/config/one', {
            key: 'SITE_INFO'
        })

        console.log('API响应:', response)
        
        // 检查响应结构
        if (response.code === 200 && response.data) {
            let siteInfo
            
            // 尝试不同的响应结构
            if (response.data.data && response.data.data.json) {
                siteInfo = response.data.data.json
            } else if (response.data.json) {
                siteInfo = response.data.json
            } else {
                siteInfo = response.data
            }
            
            console.log('解析后的站点信息:', siteInfo)
            
            // 处理反引号问题
            if (siteInfo && typeof siteInfo === 'object') {
                Object.keys(siteInfo).forEach(key => {
                    if (typeof siteInfo[key] === 'string') {
                        siteInfo[key] = siteInfo[key].replace(/`/g, '')
                    } else if (typeof siteInfo[key] === 'object' && siteInfo[key] !== null) {
                        Object.keys(siteInfo[key]).forEach(subKey => {
                            if (typeof siteInfo[key][subKey] === 'string') {
                                siteInfo[key][subKey] = siteInfo[key][subKey].replace(/`/g, '')
                            }
                        })
                    }
                })
                
                state.siteInfo = siteInfo
                // 缓存站点信息（24小时）
                cache.set(cacheName, siteInfo, 86400)
                // 更新页面标题
                if (siteInfo.title) {
                    document.title = siteInfo.title
                }
                console.log('成功获取站点信息:', siteInfo)
                return siteInfo
            } else {
                console.error('站点信息格式错误:', siteInfo)
            }
        } else {
            console.error('API响应不符合预期:', response)
        }
    } catch (error) {
        console.error('获取站点信息失败:', error)
    }
    
    console.log('fetchSiteInfo 执行完成，siteInfo:', state.siteInfo)
    return null
}

export const useCommStore = defineStore('comm', {
    state: () => {
        const cachedUser = cache.get('user-info') || {}
        const hasUser = !utils.is.empty(cachedUser)
        const cachedSiteInfo = cache.get('site-info') || {}
        return {
            auth: {
                login: false,
                reset: false,
                register: false,
            },
            login: {
                finish: hasUser,
                user: cachedUser
            },
            progress: false,
            nav: {
                title: ''
            },
            siteInfo: cachedSiteInfo,
            _fetchingSiteInfo: false // 添加标志，避免无限请求
        }
    },
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
        },
        // 获取站点信息
        async fetchSiteInfo(force = true) {
            return await fetchSiteInfo(this, force)
        },
        // 清除站点信息缓存
        clearSiteInfoCache() {
            cache.del('site-info')
            this.siteInfo = {}
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
    },
    getSiteInfo: (state) => {
        // 直接返回站点信息，不再自动获取
        return state.siteInfo
    }
    }
})