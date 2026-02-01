<template>
  <!-- Bootstrap登录弹窗：替代Element-UI Dialog，保留原有双向绑定逻辑 -->
 <div 
    class="modal fade" 
    tabindex="-1" 
    aria-hidden="true"
    :class="{ show: state.item.dialog }"
    style="z-index: 1060;"
  >
    <div class="modal-dialog modal-dialog-centered" style="max-width: 500px; width: 90vw;">
      <div class="modal-content border-0 shadow-lg">
        <!-- 弹窗头部：成功提示栏 -->
        <div class="modal-body p-0">
          <div class="alert alert-success d-flex align-items-center mb-0 border-0 rounded-0" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="15" height="15" fill="currentColor">
              <use xlink:href="#check-circle-fill"/>
            </svg>
            <span>账号密码登录</span>
          </div>

          <!-- 登录表单：替换Element-UI Input为Bootstrap Form -->
          <div class="p-4 login-form">
            <!-- 帐号输入框 -->
            <div class="mb-3 mt-3">
              <label class="form-label mb-1">帐号：</label>
              <input
                type="text"
                class="form-control custom-input"
                v-model="state.struct.account"
                placeholder="帐号 | 邮箱 | 手机号"
                autocomplete="off"
              >
            </div>
            <!-- 密码输入框：绑定ref、回车登录、显示密码切换 -->
            <div class="mb-3 position-relative" ref="password">
              <label class="form-label mb-1">密码：</label>
              <input
                :type="state.item.showPwd ? 'text' : 'password'"
                class="form-control custom-input pe-5"
                v-model="state.struct.password"
                @keyup.enter="method.login()"
                placeholder="请输入密码"
                autocomplete="off"
              >
              <!-- 密码显示/隐藏切换按钮 -->
              <button
                type="button"
                class="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-0"
                style="width: 24px; height: 24px;"
                @click="state.item.showPwd = !state.item.showPwd"
              >
                <svg class="bi" width="16" height="16" fill="currentColor">
                  <use xlink:href="#{{ state.item.showPwd ? 'eye-slash-fill' : 'eye-fill' }}"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 操作按钮栏：替换Element-UI Button，保留加载状态 -->
          <div class="modal-footer d-flex justify-content-center gap-2 border-0 p-3 bg-light-subtle rounded-bottom">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="method.reset()"
            >
              忘记密码
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="method.login()"
              :disabled="state.item.wait"
            >
              <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ state.item.wait ? '登录中 ...' : '登  录' }}
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary"
              v-if="parseInt(store.config.getAllowRegister?.value) === 1"
              @click="method.register()"
            >
              注册帐号
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 弹窗遮罩层：点击不关闭（对应原close-on-click-modal="false"） -->
    <div 
      v-if="state.item.dialog"
      class="modal-backdrop fade show" 
      style="z-index: 1050;"
    ></div>
  </div>
</template>

<script setup>
import { reactive, watch, getCurrentInstance, onUnmounted } from 'vue'
import cache from '@/utils/cache.js'
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import crypto from '@/utils/crypto.js'
import { useCommStore } from '@/store/comm'
import { useConfigStore } from '@/store/config'

// 移除Element-UI的ISvg，使用Bootstrap内置svg图标
const { proxy } = getCurrentInstance()
const emit = defineEmits(['finish'])
const store = {
    comm: useCommStore(),
    config: useConfigStore()
}

const state = reactive({
    item: {
        type: 'login',         // 登录类型固定为账号密码登录
        wait: false,           // 是否等待
        finish :  false,       // 登录完成
        dialog :  false,       // 弹窗显示隐藏
        showPwd: false,        // 新增：密码显示/隐藏切换（替代Element-UI的show-password）
    },
    struct: {
        account : null,        // 邮箱 | 账号 | 手机号
        password: null,        // 密码
    },
    timer: null,             // 计时器（保留，兼容原有卸载逻辑）
})

const method = {
    // 登录 - 保留原有所有业务逻辑（AES加密、请求头、状态判断等）
    async login() {
        // 非空校验：替换Element-UI的表单校验，基础空值判断
        if (!state.struct.account || !state.struct.password) {
            ElMessage.warning('请输入账号和密码！')
            method.animation()
            return
        }
        
        state.item.wait = true

        const unix = await method.unix()
        const iv   = crypto.token(`iv-${unix}` , 16, 'login')
        const key  = crypto.token(`key-${unix}`, 16, 'login')
        const AES  = crypto.AES(key, iv)

        // 固定使用账号密码登录参数
        const params = {
            account : AES.encrypt(state.struct.account),
            password: AES.encrypt(state.struct.password)
        }

        try {
            const { data, code, msg } = await axios.post('/api/comm/' + state.item.type, params, {
                headers: {
                    'X-Khronos': unix,
                    'X-Gorgon' : `${key} ${iv}`,
                    'X-Argus'  : AES.encrypt(JSON.stringify({
                        unix, account: state.struct.account, password: state.struct.password
                    }))
                }
            })

            state.item.wait = false

            if (code === 200) {
                // 冻结状态判断逻辑
                const userData = data?.user || {}
                const userStatus = Number(userData.status) || 0
                if (userStatus === 1) {
                    method.clearCache()
                    ElMessage.error('当前账号已被冻结，请联系管理员！')
                    method.animation()
                    return
                }

                // 正常登录流程
                cache.set('user-info', data.user, 10)
                utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', data.token, 7 * 24 * 60 * 60)
                state.item.finish = true
                state.item.dialog = false
                // 更新仓库状态
                store.comm.login.finish = true
                store.comm.login.user   = data.user
                store.comm.switchAuth('login', false)
                // 通知父组件
                emit('finish', data.user)
                ElMessage.success('登录成功')
                return
            }
            if (code === 201) return ElMessage.info(msg)

            // 水平抖动动画
            method.animation()

            ElMessage.error(msg)
            method.clearCache()

        } catch (error) {
            ElMessage.error(error.message || '登录失败')
            method.clearCache()
            state.item.wait = false
        }
    },

    // 显示对话框：保留原有逻辑
    show: () => (state.item.dialog = true),
    // 点击注册：保留原有逻辑
    register: () => {
        store.comm.switchAuth('register', true)
    },
    // 点击忘记密码：保留原有逻辑
    reset: () => {
        store.comm.switchAuth('reset', true)
    },
    // 密码框抖动动画：适配Bootstrap的DOM结构，保留原有逻辑
    animation: () => {
        const el = proxy.$refs.password
        if (el) {
            el.classList.add('active', 'shake-horizontal')
            setTimeout(() => {
                el.classList.remove('active', 'shake-horizontal')
            }, 1000)
        }
    },
    // 清除缓存：保留原有逻辑
    clearCache: () => {
        utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1)
    },
    // 获取当前时间戳：保留原有逻辑
    unix: async () => {
        const { code, data } = await axios.get('/dev/info/time')
        if (code !== 200) return Math.round(new Date() / 1000)
        return data.unix
    },
    // 三方授权登录：保留原有逻辑
    oauth: (target = 'qq') => {
        window.open(`/api/oauth/${target}?key=inis`, "oauth", "width=800,height=500,top=100,left=100")
    }
}

// 组件卸载时清除计时器：保留原有逻辑
onUnmounted(() => {
    if (state.timer) {
        clearInterval(state.timer)
    }
})

// 弹窗关闭时重置表单：新增，提升交互体验
watch(() => state.item.dialog, (val) => {
    if (!val) {
        state.struct.account = null
        state.struct.password = null
        state.item.showPwd = false
    }
}, { immediate: false })

// 将子组件方法暴露给父组件：保留原有逻辑
defineExpose({
    show: method.show,
})
</script>

<style scoped>
/* 自定义输入框样式：贴近原有Element-UI风格 */
.custom-input {
    border: 1px solid #dcdcdc;
    border-radius: 4px;
    height: 38px;
    transition: border-color 0.2s ease;
}
.custom-input:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
    outline: none;
}

/* 密码框抖动动画：保留原有动画逻辑 */
.shake-horizontal {
    animation: shake-horizontal 0.8s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
}
@keyframes shake-horizontal {
    0%, 100% {
        transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
        transform: translateX(5px);
    }
}

/* 弹窗样式优化：避免Bootstrap默认样式冲突 */
:deep(.modal) {
    overflow-y: auto;
}
:deep(.modal-content) {
    border-radius: 8px;
}
:deep(.alert) {
    padding: 0.75rem 1rem;
}
:deep(.btn) {
    padding: 0.375rem 1rem;
    font-size: 14px;
}
/* 修复Bootstrap svg图标垂直对齐 */
:deep(.bi) {
    vertical-align: -0.125em;
}
</style>