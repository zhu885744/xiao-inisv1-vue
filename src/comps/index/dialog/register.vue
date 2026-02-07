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
            <div class="modal-dialog modal-dialog-centered" style="max-width: 450px;">
                <div class="modal-content rounded-xl shadow-lg border-0 overflow-hidden">
                    <div class="modal-header bg-gradient-to-r from-success to-green-600 text-white py-4">
                        <h3 class="modal-title fs-5 fw-semibold" id="registerModalLabel">注册账号</h3>
                        <button type="button" class="btn-close btn-close-white" @click="method.hide()" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body px-6 py-5">
                        <form @submit.prevent="method.register()" novalidate class="space-y-4">
                            <div>
                                <label for="nicknameInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">
                                    昵称 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control rounded-lg border-gray-300 focus:border-success focus:ring focus:ring-success focus:ring-opacity-20 transition-all" 
                                       id="nicknameInput"
                                       v-model="state.struct.nickname"
                                       placeholder="希望别人怎么称呼您？"
                                       required>
                                <div class="form-text text-xs text-gray-500 mt-1">这是您在平台上的显示名称</div>
                            </div>
                            
                            <div>
                                <label for="accountInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">
                                    账号 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control rounded-lg border-gray-300 focus:border-success focus:ring focus:ring-success focus:ring-opacity-20 transition-all" 
                                       id="registerAccountInput"
                                       v-model="state.struct.account"
                                       placeholder="定制您的专属账号"
                                       required>
                                <div class="form-text text-xs text-gray-500 mt-1">用于登录的用户名</div>
                            </div>
                            
                            <div>
                                <label for="socialInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">
                                    邮箱或手机号 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control rounded-lg border-gray-300 focus:border-success focus:ring focus:ring-success focus:ring-opacity-20 transition-all" 
                                       id="socialInput"
                                       v-model="state.struct.social"
                                       placeholder="电子邮箱或手机号"
                                       required>
                                <div class="form-text text-xs text-gray-500 mt-1">用于找回密码或验证码登录</div>
                            </div>
                            
                            <div>
                                <label for="codeInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">
                                    验证码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group rounded-lg overflow-hidden">
                                    <input type="text" 
                                           class="form-control border-gray-300 focus:border-success focus:ring focus:ring-success focus:ring-opacity-20 transition-all" 
                                           id="codeInput"
                                           v-model="state.struct.code"
                                           placeholder="请输入验证码"
                                           required
                                           autocomplete="username">
                                    <button type="button" 
                                            class="btn btn-outline-success" 
                                            @click="method.code()"
                                            :disabled="state.item.loading">
                                        <span v-if="state.item.loading" class="spinner-border spinner-border-sm me-1"></span>
                                        {{ state.item.loading ? `${state.item.second}秒后重试` : '获取验证码' }}
                                    </button>
                                </div>
                                <div class="form-text text-xs text-gray-500 mt-1">确认您的邮箱或者手机号是有效的</div>
                            </div>
                            
                            <div>
                                <label for="passwordInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">
                                    密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group rounded-lg overflow-hidden">
                                    <input 
                                        :type="showPassword ? 'text' : 'password'" 
                                        class="form-control border-gray-300 focus:border-success focus:ring focus:ring-success focus:ring-opacity-20 transition-all" 
                                        id="registerPasswordInput"
                                        v-model="state.password.value"
                                        placeholder="请输入密码"
                                        required
                                        autocomplete="new-password">
                                    <button class="btn border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors" type="button" @click="showPassword = !showPassword">
                                        <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label for="confirmPasswordInput" class="form-label text-sm font-medium text-gray-700 mb-1 block">
                                    确认密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group rounded-lg overflow-hidden">
                                    <input :type="showConfirmPassword ? 'text' : 'password'" 
                                           class="form-control border-gray-300 focus:border-success focus:ring focus:ring-success focus:ring-opacity-20 transition-all" 
                                           id="confirmPasswordInput"
                                           v-model="state.password.verify"
                                           placeholder="请再次输入密码"
                                           required
                                           autocomplete="new-password">
                                    <button class="btn border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors" type="button" @click="showConfirmPassword = !showConfirmPassword">
                                        <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3 mt-2">
                                <button type="button" 
                                        class="btn btn-outline-secondary w-100 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                                        @click="method.login()">
                                    已有账号？登录
                                </button>
                                <button type="submit" 
                                        class="btn btn-success w-100 py-2 rounded-lg text-sm font-medium transition-colors hover:shadow-lg"
                                        :disabled="state.item.wait">
                                    <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ state.item.wait ? '注册中...' : '注册' }}
                                </button>
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
            style="z-index: 1050;"
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
            state.item.dialog = false
            
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
    },

    login() {
        state.item.dialog = false
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
    background: linear-gradient(135deg, #198754 0%, #157347 100%);
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
    border-color: #198754;
    box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
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

.btn-success {
    background-color: #198754;
    border-color: #198754;
}

.btn-success:hover {
    background-color: #157347;
    border-color: #146c43;
    box-shadow: 0 0.25rem 0.5rem rgba(25, 135, 84, 0.3);
}

.btn-outline-success {
    color: #198754;
    border-color: #198754;
}

.btn-outline-success:hover {
    background-color: #198754;
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

.form-text {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
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