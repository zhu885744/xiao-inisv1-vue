<template>
    <div class="card mb-3" v-if="!state.status.loading">
        <div class="card-body">
            <div class="position-relative">
                <div class="position-absolute opacity-25" style="right: 2rem">
                    <i class="bi bi-key text-primary" style="font-size: 43px;"></i>
                </div>
                <h6 class="text-muted text-uppercase mt-0">
                    <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" data-bs-placement="top" title="风险操作！此功能不懂请勿开启！\n● 开启之后，所有的API均需要在请求头中提交 i-api-key=密钥 方能使用！\n● 于此同时API安全性将提升90%，剩下10%取决于你的密钥复杂度和对手的能力强弱！">
                        <i class="bi bi-info-circle text-muted me-1"></i>
                        <span class="ms-1">API KEY</span>
                    </span>
                </h6>
                <h4 class="m-b-20">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="apiKeySwitch" v-model="state.status.active" @change="method.change" :disabled="!state.status.finish">
                        <label class="form-check-label" for="apiKeySwitch">{{ state.status.active ? '开启' : '关闭' }}</label>
                    </div>
                </h4>
                <span class="badge bg-primary"> +90% </span>
                <span class="text-muted ms-1">
                    安全性提升，<span @click="method.show()" class="text-dark pointer">点我查看</span>
                </span>
            </div>
        </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="card mb-3">
        <div class="card-body d-flex justify-content-center align-items-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
        </div>
    </div>

    <!-- 配置对话框 -->
    <div class="modal fade" id="apiKeyModal" tabindex="-1" aria-labelledby="apiKeyModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="apiKeyModalLabel">API KEY 配置</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="state.status.dialog = false"></button>
                </div>
                <div class="modal-body">
                    <p class="my-1">● API KEY 不是什么很NB的技术，却能大大提高的接口安全</p>
                    <p class="my-1">● 正常来说不开启也没关系，因为除此之外还有QPS限流器在帮你拦截异常流量</p>
                    <p class="my-1">● 但是如果您开启了API KEY，在使用其它主题的时候，需要按照要求配置密钥到您的主题中，否则主题会拿不到任何数据</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="state.status.dialog = false">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import axios from '@/utils/request'
import Toast from '@/utils/toast'

// 模态框实例
let modalInstance = null

const state = reactive({
    struct: {},
    status: {
        finish: false,
        active: false,
        dialog: false,
        loading: true,
    }
})

onMounted(async () => {
    await method.init()
    
    // 初始化Bootstrap组件
    if (window.bootstrap) {
        // 初始化tooltip
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl))
    }
})

const method = {
    init: async () => {
        state.status.finish  = false
        state.status.loading = true

        try {
            const { code, data } = await axios.get('/api/config/one', {
                key: 'SYSTEM_API_KEY'
            })

            if (code !== 200) return
            state.struct = data

            state.status.finish  = true
        } catch (error) {
            console.error('获取配置失败:', error)
        } finally {
            state.status.loading = false
        }
    },
    show() {
        if (!state.status.finish) {
            Toast.warning('API KEY配置获取失败，无法进行配置！')
            return
        }
        
        state.status.dialog = true
        
        // 显示模态框
        if (window.bootstrap) {
            const modalElement = document.getElementById('apiKeyModal')
            if (modalElement) {
                modalInstance = new window.bootstrap.Modal(modalElement)
                modalInstance.show()
            }
        }
    },
    change: async (event) => {
        const value = event.target.checked
        try {
            const { code, msg } = await axios.post('/api/config/save', {
                key: 'SYSTEM_API_KEY',
                value: value ? 1 : 0
            })

            if (code !== 200) {
                state.status.active = !value
                Toast.error(msg)
            }
        } catch (error) {
            console.error('保存配置失败:', error)
            state.status.active = !value
            Toast.error('保存失败：网络错误')
        }
    },
}

watch(() => state.struct, () => {
    state.status.active = parseInt(state.struct.value) === 1
}, { deep: true })

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>

<style scoped>
/* 自定义样式 */
.pointer {
    cursor: pointer;
}

.pointer:hover {
    text-decoration: underline;
}
</style>