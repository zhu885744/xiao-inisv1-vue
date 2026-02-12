<template>
    <transition name="modal-fade" mode="out-in">
        <div 
            v-if="state.item.dialog"
            class="modal fade show"
            style="display: block;"
            tabindex="-1" 
            aria-labelledby="resetPasswordModalLabel" 
            aria-hidden="false"
            data-bs-backdrop="static"
        >
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 450px; margin: 1.75rem auto;">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="resetPasswordModalLabel">忘记密码</h5>
                        <button type="button" class="btn-close btn-close-white" @click="method.hide()" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body">
                        <form @submit.prevent="method.reset()" novalidate>
                            <div class="mb-3">
                                <label for="contactInput" class="form-label">邮箱或手机号</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="contactInput"
                                       v-model="state.struct.social"
                                       placeholder="用于接收验证码">
                            </div>
                            
                            <div class="mb-3">
                                <label for="verificationCode" class="form-label">
                                    验证码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input type="text" 
                                           class="form-control" 
                                           id="verificationCode"
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
                                <label for="newPassword" class="form-label">
                                    新的密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input 
                                        :type="showPassword ? 'text' : 'password'" 
                                        class="form-control" 
                                        id="resetNewPassword"
                                        v-model="state.password.value"
                                        placeholder="请输入新密码（至少6位）"
                                        minlength="6"
                                        required
                                        autocomplete="new-password">
                                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                        <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">
                                    确认密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input :type="showConfirmPassword ? 'text' : 'password'" 
                                           class="form-control" 
                                           id="confirmPassword"
                                           v-model="state.password.verify"
                                           placeholder="请再次输入新密码"
                                           minlength="6"
                                           required
                                           autocomplete="new-password">
                                    <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
                                        <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="alert alert-info mb-4" v-if="state.password.value && state.password.value.length > 0">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>密码强度：</span>
                                    <div class="progress" style="width: 70%; height: 8px;">
                                        <div class="progress-bar" :class="getPasswordStrengthClass" 
                                             :style="{width: getPasswordStrength}"></div>
                                    </div>
                                    <small class="ms-2">{{ getPasswordStrengthText }}</small>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col">
                                    <button type="button" 
                                            class="btn btn-outline-secondary w-100"
                                            @click="method.login()">
                                        记起来了？登录
                                    </button>
                                </div>
                                <div class="col">
                                    <button type="submit" 
                                            class="btn btn-primary w-100"
                                            :disabled="state.item.wait || !isFormValid">
                                        <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ state.item.wait ? '重置中...' : '重置密码' }}
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
import { reactive, ref, computed, onUnmounted, watch } from 'vue'
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import { useCommStore } from '@/store/comm'

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

const isFormValid = computed(() => {
    const { social, code } = state.struct
    const { value: pwd, verify: pwdVerify } = state.password
    
    const hasIdentity = !utils.is.empty(social)
    const hasCode = !utils.is.empty(code)
    const hasPassword = !utils.is.empty(pwd) && pwd.length >= 6
    const passwordsMatch = pwd === pwdVerify && !utils.is.empty(pwdVerify)
    
    return hasIdentity && hasCode && hasPassword && passwordsMatch
})

const getPasswordStrength = computed(() => {
    const password = state.password.value || ''
    if (password.length === 0) return '0%'
    
    let strength = 0
    if (password.length >= 6) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25
    
    return `${Math.min(strength, 100)}%`
})

const getPasswordStrengthClass = computed(() => {
    const strength = parseInt(getPasswordStrength.value)
    if (strength < 25) return 'bg-danger'
    if (strength < 50) return 'bg-warning'
    if (strength < 75) return 'bg-info'
    return 'bg-success'
})

const getPasswordStrengthText = computed(() => {
    const strength = parseInt(getPasswordStrength.value)
    if (strength < 25) return '很弱'
    if (strength < 50) return '较弱'
    if (strength < 75) return '中等'
    return '强'
})

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
    async reset() {
        if (!isFormValid.value) {
            showNotification('请完善所有必填信息！', 'warning')
            return
        }

        try {
            state.item.wait = true
            const { code: resCode, msg } = await axios.post('/api/comm/reset-password', {
                ...state.struct, 
                password: state.password.value
            })

            state.item.wait = false

            if (resCode !== 200) {
                throw new Error(msg || '重置密码失败！')
            }

            method.hide()
            emit('finish')

        } catch (error) {
            state.item.wait = false
            showNotification(error.message || '网络异常，请稍后再试！', 'error')
        }
    },

    async code() {
        const { social } = state.struct
        if (utils.is.empty(social)) {
            showNotification('请填写邮箱或手机号！', 'warning')
            return
        }

        if (social) {
            const isPhone = /^1[3-9]\d{9}$/.test(social)
            const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(social)
            if (!isPhone && !isEmail) {
                showNotification('请填写正确的手机号或邮箱！', 'warning')
                return
            }
        }

        try {
            state.item.loading = true
            const { code: resCode, msg } = await axios.post('/api/comm/reset-password', {
                social,
                account
            })

            if (!utils.in.array(resCode, [200, 201])) {
                throw new Error(msg || '发送验证码失败！')
            }

            showNotification(msg || '验证码发送成功！', 'success')

            if (state.timer) clearInterval(state.timer)
            state.item.second = 60
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
            state.item.loading = false
            showNotification(error.message || '网络异常，验证码发送失败！', 'error')
        }
    },

    show() {
        state.item.dialog = true
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
            const contactInput = document.getElementById('contactInput')
            if (contactInput) {
                contactInput.focus()
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