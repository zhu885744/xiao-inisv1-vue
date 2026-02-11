<template>
    <transition name="modal-fade" mode="out-in">
        <div 
            v-if="state.item.dialog"
            class="modal fade show"
            style="display: block; z-index: 1060;"
            tabindex="-1" 
            aria-labelledby="loginModalLabel" 
            aria-hidden="false"
            aria-modal="true"
            id="loginModal"
        >
            <div class="modal-dialog modal-dialog-centered" style="max-width: 450px; margin: 0 auto;">
                <div class="modal-content rounded-3 shadow-lg border-0 overflow-hidden">
                    <div class="modal-header bg-gradient-to-r from-primary to-blue-600 text-white py-4">
                        <h3 class="modal-title fs-5 fw-semibold" id="loginModalLabel">账号密码登录</h3>
                        <button type="button" class="btn-close btn-close-white" @click="method.hide()" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body px-6 py-5">
                        <form @submit.prevent="method.login()" class="space-y-4">
                            <div>
                                <label for="loginAccountInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">帐号</label>
                                <input type="text" 
                                       class="form-control rounded-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 transition-all"
                                       id="loginAccountInput"
                                       v-model="state.struct.account"
                                       placeholder="帐号 | 邮箱 | 手机号"
                                       required
                                       autocomplete="username">
                            </div>
                            
                            <div>
                                <label for="loginPasswordInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">密码</label>
                                <div class="input-group rounded-3 overflow-hidden">
                                    <input :type="showPassword ? 'text' : 'password'" 
                                           class="form-control border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-20 transition-all"
                                           id="loginPasswordInput"
                                           v-model="state.struct.password"
                                           @keyup.enter="method.login()"
                                           placeholder="请输入密码"
                                           required
                                           autocomplete="current-password">
                                    <button class="btn border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                                            type="button" 
                                            @click="showPassword = !showPassword">
                                        <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button type="submit" 
                                        class="btn btn-primary w-100 py-3 rounded-3 font-medium transition-all hover:shadow-lg"
                                        :disabled="state.item.wait">
                                    <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    {{ state.item.wait ? '登录中...' : '登录' }}
                                </button>
                            </div>
                        </form>

                        <div class="grid grid-cols-2 gap-3 mt-4">
                            <button type="button" 
                                    class="btn btn-outline-secondary w-100 py-2 rounded-3 text-sm font-medium transition-colors hover:bg-gray-50"
                                    @click="method.reset()">
                                忘记密码
                            </button>
                            <button type="button" 
                                    class="btn btn-outline-primary w-100 py-2 rounded-3 text-sm font-medium transition-colors hover:bg-primary/5"
                                    v-if="parseInt(store.config.getAllowRegister?.value) === 1"
                                    @click="method.register()">
                                注册帐号
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
    
    <transition name="backdrop-fade">
        <div 
            v-if="state.item.dialog"
            class="modal-backdrop fade show"
            style="z-index: 1059;"
            @click="method.hide()"
        ></div>
    </transition>
</template>

<script setup>
import { reactive, ref, getCurrentInstance, onUnmounted } from 'vue'
import cache from '@/utils/cache.js'
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import cryptoUtil from '@/utils/crypto'
import { useCommStore } from '@/store/comm'
import { useConfigStore } from '@/store/config'

const { proxy } = getCurrentInstance()
const emit = defineEmits(['finish'])
const store = {
    comm: useCommStore(),
    config: useConfigStore()
}

const state = reactive({
    item: {
        type: 'login',
        wait: false,
        finish: false,
        dialog: false,
    },
    struct: {
        account: '',
        password: '',
    },
})

const showPassword = ref(false)

const cryptoUtils = {
    generateSecureKey(length = 16, salt = '') {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let secureKey = ''
        
        for (let i = 0; i < length; i++) {
            secureKey += charset.charAt(Math.floor(Math.random() * charset.length))
        }
        
        const hash = cryptoUtil.hash?.md5 ? cryptoUtil.hash.md5(`${secureKey}${Date.now()}${salt}`) : 
                    cryptoUtil.md5 ? cryptoUtil.md5(`${secureKey}${Date.now()}${salt}`) :
                    secureKey
        
        return hash.substring(0, length)
    }
}

const method = {
    async login() {
        if (!state.struct.account || !state.struct.password) {
            method.showToast('请输入账号和密码', 'warning')
            return
        }

        const accountRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^1[3-9]\d{9}$|^[a-zA-Z0-9_]{4,20}$/
        if (!accountRegex.test(state.struct.account)) {
            method.showToast('账号格式不正确（支持邮箱、手机号、4-20位字母数字下划线）', 'warning')
            return
        }
        
        if (state.struct.password.length < 6) {
            method.showToast('密码长度不能少于6位', 'warning')
            return
        }
        
        state.item.wait = true

        try {
            const unix = await method.unix()
            
            const iv = cryptoUtil.token ? cryptoUtil.token(`iv-${unix}`, 16, 'aes') : 
                      cryptoUtils.generateSecureKey(16, `iv-${unix}`)
            
            const key = cryptoUtil.token ? cryptoUtil.token(`key-${unix}`, 16, 'aes') : 
                       cryptoUtils.generateSecureKey(16, `key-${unix}`)
            
            const safeIv = iv.length >= 16 ? iv.substring(0, 16) : iv.padEnd(16, '0')
            const safeKey = key.length >= 16 ? key.substring(0, 16) : key.padEnd(16, '0')

            let AES
            if (cryptoUtil.createAES) {
                AES = cryptoUtil.createAES(safeKey, safeIv)
            } else if (cryptoUtil.AES) {
                AES = new cryptoUtil.AES(safeKey, safeIv)
            } else {
                throw new Error('加密工具不可用')
            }

            const params = {
                account: AES.encrypt(state.struct.account),
                password: AES.encrypt(state.struct.password)
            }

            const { data, code, msg } = await axios.post('/api/comm/login', params, {
                headers: {
                    'X-Khronos': unix,
                    'X-Gorgon': `${safeKey} ${safeIv}`,
                    'X-Argus': AES.encrypt(JSON.stringify({
                        unix, 
                        account: state.struct.account, 
                        password: state.struct.password
                    }))
                },
                timeout: 10000
            })

            state.item.wait = false

            if (code === 200) {
                const userData = data?.user || {}
                const userStatus = Number(userData.status) || 0
                
                if (userStatus === 1) {
                    method.clearCache()
                    method.showToast('当前账号已被冻结，请联系管理员！', 'error')
                    method.animation()
                    return
                }

                if (!data.token || !data.user || !data.user.id) {
                    throw new Error('登录成功但返回数据不完整')
                }

                if (cache.set) {
                    cache.set('user-info', data.user, 7 * 24 * 60)
                } else if (cache.put) {
                    cache.put('user-info', data.user, 7 * 24 * 60)
                } else {
                    localStorage.setItem('user-info', JSON.stringify({
                        data: data.user,
                        expire: Date.now() + 7 * 24 * 60 * 60 * 1000
                    }))
                }
                
                if (utils.set?.cookie) {
                    utils.set.cookie(
                        globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', 
                        data.token, 
                        7 * 24 * 60 * 60
                    )
                }
                
                state.item.finish = true
                method.hide()
                
                store.comm.login.finish = true
                store.comm.login.user = data.user
                store.comm.switchAuth('login', false)
                
                emit('finish', data.user)
                return
            }
            
            if (code === 201) {
                method.showToast(msg, 'info')
                return
            }

            method.animation()
            method.showToast(msg || '登录失败，请检查账号密码', 'error')
            method.clearCache()

        } catch (error) {
            let errorMsg = '登录失败，请稍后重试'
            if (error.message.includes('超时')) {
                errorMsg = '请求超时，请检查网络连接'
            } else if (error.message.includes('加密')) {
                errorMsg = '加密处理失败'
            }
            
            method.showToast(errorMsg, 'error')
            method.clearCache()
            method.animation()
            state.item.wait = false
        }
    },

    show() {
        state.item.dialog = true
        state.struct.account = ''
        state.struct.password = ''
        showPassword.value = false
        
        // 禁止页面滚动
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.body.style.top = '0'
        document.body.style.left = '0'
        document.body.style.zIndex = '1059'
        
        setTimeout(() => {
            const accountInput = document.getElementById('loginAccountInput')
            if (accountInput) {
                accountInput.focus()
            }
        }, 300)
    },

    hide() {
        state.item.dialog = false
        showPassword.value = false
        
        // 恢复页面滚动
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.zIndex = ''
    },

    register() {
        method.hide()
        setTimeout(() => {
            store.comm.switchAuth('register', true)
        }, 300)
    },

    reset() {
        method.hide()
        setTimeout(() => {
            store.comm.switchAuth('reset', true)
        }, 300)
    },

    animation() {
        const el = proxy.$refs.password
        if (el) {
            el.classList.add('shake-horizontal')
            setTimeout(() => {
                el.classList.remove('shake-horizontal')
            }, 1000)
        }
    },

    clearCache() {
        try {
            if (utils.set?.cookie) {
                utils.set.cookie(
                    globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1
                )
            }
            
            if (cache && typeof cache.remove === 'function') {
                cache.remove('user-info')
            } else if (cache && typeof cache.del === 'function') {
                cache.del('user-info')
            } else if (cache && typeof cache.delete === 'function') {
                cache.delete('user-info')
            } else if (cache && typeof cache.clear === 'function') {
                cache.clear()
            }
            
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('user-info')
            }
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('user-info')
            }
            
            if (store.comm.login) {
                store.comm.login.finish = false
                store.comm.login.user = null
            }
        } catch (error) {
            // 忽略缓存清理错误
        }
    },

    async unix() {
        try {
            const { code, data } = await axios.get('/dev/info/time', {
                timeout: 5000
            })
            if (code === 200 && data.unix && typeof data.unix === 'number') {
                return data.unix
            }
        } catch (error) {
            // 忽略获取服务器时间失败的错误
        }
        
        return Math.round(Date.now() / 1000)
    },

    showToast(message, type = 'info') {
        try {
            if (typeof window !== 'undefined' && window.Toast) {
                const toastType = type === 'success' ? 'success' : 
                               type === 'error' ? 'error' : 
                               type === 'warning' ? 'warning' : 'info'
                
                if (window.Toast[toastType]) {
                    window.Toast[toastType](message)
                    return
                }
            }
            
            if (typeof window !== 'undefined' && window.$toast) {
                if (window.$toast[type]) {
                    window.$toast[type](message)
                    return
                }
            }
        } catch (error) {
            // 忽略显示消息失败的错误
        }
    }
}

onUnmounted(() => {
    state.struct.account = ''
    state.struct.password = ''
    showPassword.value = false
    
    // 确保在组件卸载时恢复页面滚动
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.height = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.zIndex = ''
})

defineExpose({
    show: method.show,
    hide: method.hide
})
</script>

<style scoped>
/* 自定义样式 */
.modal-content {
    border-radius: 1rem;
    box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.2);
    border: none;
    overflow: hidden;
}

.modal-header {
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
    color: white;
}

.modal-title {
    font-size: 1.125rem;
    font-weight: 600;
}

.modal-body {
    padding: 1.5rem;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 0.5rem;
    display: block;
}

.form-control {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    transition: all 0.2s ease;
}

.form-control:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    outline: none;
}

.input-group {
    border-radius: 0.5rem;
    overflow: hidden;
}

.input-group .btn {
    border-radius: 0;
    border-left: none;
    background-color: #f8f9fa;
    border-color: #d1d5db;
    color: #6c757d;
    transition: all 0.2s ease;
}

.input-group .btn:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
}

.btn {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-primary {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

.btn-primary:hover {
    background-color: #0b5ed7;
    border-color: #0a58ca;
    box-shadow: 0 0.25rem 0.5rem rgba(13, 110, 253, 0.3);
}

.btn-outline-primary {
    color: #0d6efd;
    border-color: #0d6efd;
}

.btn-outline-primary:hover {
    background-color: #0d6efd;
    color: white;
}

.btn-outline-secondary {
    color: #6c757d;
    border-color: #6c757d;
}

.btn-outline-secondary:hover {
    background-color: #6c757d;
    color: white;
}

/* 抖动动画 */
.shake-horizontal {
    animation: shake-horizontal 0.5s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
}

@keyframes shake-horizontal {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
    20%, 40%, 60%, 80% { transform: translateX(8px); }
}

/* 响应式调整 */
@media (max-width: 576px) {
    .modal-dialog {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
    }
    
    .modal-content {
        border-radius: 0.75rem;
    }
    
    .modal-body {
        padding: 1.25rem;
    }
}

/* 修复模态框层级 */
:deep(.modal-backdrop) {
    z-index: 1050;
    backdrop-filter: blur(4px);
}

:deep(.modal) {
    z-index: 1051;
}

/* 网格布局 */
.grid {
    display: grid;
}

.grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
}

.gap-3 {
    gap: 0.75rem;
}

.space-y-4 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
    transition: opacity 0.3s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
    opacity: 0;
}
</style>