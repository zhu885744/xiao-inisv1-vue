<template>
    <transition name="modal-fade" mode="out-in">
        <div 
            v-if="state.item.dialog"
            class="modal fade show"
            style="display: block;"
            tabindex="-1" 
            aria-labelledby="registerModalLabel" 
            aria-hidden="false"
            data-bs-backdrop="static"
        >
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 450px; margin: 1.75rem auto;">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="registerModalLabel">注册账号</h5>
                        <button type="button" class="btn-close btn-close-white" @click="method.hide()" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body">
                        <form @submit.prevent="method.register()" novalidate>
                            <div class="mb-3">
                                <label for="nicknameInput" class="form-label">
                                    昵称 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control" 
                                       id="nicknameInput"
                                       v-model="state.struct.nickname"
                                       placeholder="希望别人怎么称呼您？"
                                       required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="accountInput" class="form-label">
                                    账号 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control" 
                                       id="registerAccountInput"
                                       v-model="state.struct.account"
                                       placeholder="定制您的专属账号"
                                       required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="socialInput" class="form-label">
                                    邮箱或手机号 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control" 
                                       id="socialInput"
                                       v-model="state.struct.social"
                                       placeholder="电子邮箱或手机号"
                                       required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="codeInput" class="form-label">
                                    验证码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input type="text" 
                                           class="form-control" 
                                           id="codeInput"
                                           v-model="state.struct.code"
                                           placeholder="请输入验证码"
                                           required
                                           autocomplete="username">
                                    <button type="button" 
                                            class="btn btn-outline-primary" 
                                            @click="method.code()"
                                            :disabled="state.item.loading">
                                        <span v-if="state.item.loading" class="spinner-border spinner-border-sm me-1"></span>
                                        {{ state.item.loading ? `${state.item.second}秒后重试` : '获取验证码' }}
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="passwordInput" class="form-label">
                                    密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input 
                                        :type="showPassword ? 'text' : 'password'" 
                                        class="form-control" 
                                        id="registerPasswordInput"
                                        v-model="state.password.value"
                                        placeholder="请输入密码"
                                        required
                                        autocomplete="new-password">
                                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                        <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="confirmPasswordInput" class="form-label">
                                    确认密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input :type="showConfirmPassword ? 'text' : 'password'" 
                                           class="form-control" 
                                           id="confirmPasswordInput"
                                           v-model="state.password.verify"
                                           placeholder="请再次输入密码"
                                           required
                                           autocomplete="new-password">
                                    <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
                                        <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="row mt-3">
                                <div class="col">
                                    <button type="button" 
                                            class="btn btn-outline-secondary w-100"
                                            @click="method.login()">
                                        已有账号？登录
                                    </button>
                                </div>
                                <div class="col">
                                    <button type="submit" 
                                            class="btn btn-primary w-100"
                                            :disabled="state.item.wait">
                                        <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ state.item.wait ? '注册中...' : '注册' }}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </transition>
    
    <transition name="backdrop-fade">
        <div 
            v-if="state.item.dialog"
            class="modal-backdrop fade show"
            @click="method.hide()"
        ></div>
    </transition>
</template>

<script setup>
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import cache from '@/utils/cache.js'
import { useCommStore } from '@/store/comm'
import { reactive, ref, onUnmounted, watch } from 'vue'

const emit = defineEmits(['finish'])
const store = {
    comm: useCommStore()
}

const state = reactive({
    item: {
        loading: false,
        dialog: false,
        wait: false,
        second: 0,
    },
    struct: {
        social: null,
        account: null,
        nickname: null,
        code: null,
    },
    password: {
        value: null,
        verify: null,
    },
    timer: null,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const showNotification = (message, type = 'info') => {
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

const method = {
    async register() {
        if (utils.is.empty(state.struct.nickname)) {
            showNotification('请填写您的昵称！', 'warning')
            return
        }
        if (utils.is.empty(state.struct.account)) {
            showNotification('请输入一个自定义账号！', 'warning')
            return
        }
        if (utils.is.empty(state.struct.social)) {
            showNotification('请输入您的邮箱或手机号！', 'warning')
            return
        }
        if (utils.is.empty(state.password.value)) {
            showNotification('请输入密码！', 'warning')
            return
        }
        if (utils.is.empty(state.password.verify)) {
            showNotification('请再次输入密码！', 'warning')
            return
        }
        if (utils.is.empty(state.struct.code)) {
            showNotification('请输入验证码！', 'warning')
            return
        }
        if (state.password.value !== state.password.verify) {
            showNotification('两次输入的密码不一致！', 'warning')
            return
        }

        state.item.wait = true

        try {
            const { code, msg, data } = await axios.post('/api/comm/register', {
                ...state.struct, 
                password: state.password.value
            })

            state.item.wait = false

            if (code !== 200) {
                showNotification(msg, 'error')
                return
            }

            cache.set('user-info', data.user, 10)
            utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', data.token, 7 * 24 * 60 * 60)
            method.hide()
            
            store.comm.login.finish = true
            store.comm.login.user = data.user
            store.comm.switchAuth('register', false)
            
            emit('finish', data.user)
        } catch (error) {
            state.item.wait = false
            showNotification('网络异常，请稍后再试！', 'error')
        }
    },

    async code() {
        if (utils.is.empty(state.struct.social)) {
            showNotification('请输入您的邮箱或手机号！', 'warning')
            return
        }

        const social = state.struct.social
        const isPhone = /^1[3-9]\d{9}$/.test(social)
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(social)
        if (!isPhone && !isEmail) {
            showNotification('请填写正确的手机号或邮箱！', 'warning')
            return
        }

        try {
            const { code, msg } = await axios.post('/api/comm/register', {
                social: state.struct.social,
            })

            if (!utils.in.array(code, [200, 201])) {
                showNotification(msg, 'error')
                return
            }

            showNotification(msg || '验证码发送成功！', 'success')

            if (state.timer) clearInterval(state.timer)
            state.item.second = 60
            state.item.loading = true
            
            state.timer = setInterval(() => {
                state.item.second--
                if (state.item.second <= 0) {
                    clearInterval(state.timer)
                    state.timer = null
                    state.item.second = 0
                    state.item.loading = false
                }
            }, 1000)
        } catch (error) {
            showNotification('网络异常，验证码发送失败！', 'error')
        }
    },

    show() {
        state.item.dialog = true
        state.struct.nickname = ''
        state.struct.account = ''
        state.struct.social = ''
        state.struct.code = ''
        state.password.value = ''
        state.password.verify = ''
        showPassword.value = false
        showConfirmPassword.value = false
        
        // 禁止页面滚动
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.body.style.top = '0'
        document.body.style.left = '0'
        document.body.style.zIndex = '1059'
        
        setTimeout(() => {
            const nicknameInput = document.getElementById('nicknameInput')
            if (nicknameInput) {
                nicknameInput.focus()
            }
        }, 300)
    },

    hide() {
        state.item.dialog = false
        showPassword.value = false
        showConfirmPassword.value = false
        
        // 恢复页面滚动
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.zIndex = ''
    },

    login() {
        method.hide()
        setTimeout(() => {
            store.comm.switchAuth('login', true)
        }, 300)
    },
}

watch(() => state.struct.code, (val) => {
    if (val) {
        state.struct.code = val.replace(/\s+/g, '')
    }
})

onUnmounted(() => {
    if (state.timer) clearInterval(state.timer)
    
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