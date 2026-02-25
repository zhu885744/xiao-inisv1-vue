<template>
    <div class="card mb-3" v-if="!state.status.loading">
        <div class="card-body">
            <div class="position-relative">
                <div class="position-absolute opacity-25" style="right: 2rem">
                    <i class="bi bi-file-text text-primary" style="font-size: 43px;"></i>
                </div>
                <h6 class="text-muted text-uppercase mt-0">
                    <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" title="● Markdown编辑器：Vditor支持所见即所得、即时时渲染（类似 Typora）和分屏预览模式。">
                        <i class="bi bi-info-circle text-muted me-1"></i>
                        <span class="ms-1">文章</span>
                    </span>
                </h6>
                <h4 class="m-b-20">
                    <span>Markdown编辑器</span>
                </h4>
                <span class="badge bg-success text-white"> 更多 </span>
                <span class="text-muted">
                    其它配置信息，<span @click="method.show()" class="text-dark pointer">点我配置</span>
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
    <div class="modal fade" id="articleConfigModal" tabindex="-1" aria-labelledby="articleConfigModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="articleConfigModalLabel">文章配置</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="state.status.dialog = false"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">
                                    <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" title="● Markdown编辑器：Vditor支持所见即所得、即时渲染（类似 Typora）和分屏预览模式。">
                                        <i class="bi bi-info-circle text-muted me-1"></i>
                                        <span class="ms-1">编辑器：</span>
                                    </span>
                                </label>
                                <select v-model="state.cache.json.editor" class="form-select" disabled>
                                    <option value="vditor">Markdown (vditor)</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">
                                    <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" title="用户发布的文章，是否需要审核">
                                        <i class="bi bi-info-circle text-muted me-1"></i>
                                        <span class="ms-1">审核：</span>
                                    </span>
                                </label>
                                <select v-model="state.struct.json.audit" class="form-select">
                                    <option v-for="item in state.select.audit" :key="item.value" :value="item.value">
                                        {{ item.label }} <small class="text-muted">({{ item.subtitle }})</small>
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">
                                    <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" title="是否允许用户评论">
                                        <i class="bi bi-info-circle text-muted me-1"></i>
                                        <span class="ms-1">允许评论：</span>
                                    </span>
                                </label>
                                <select v-model="state.struct.json.comment.allow" class="form-select">
                                    <option v-for="item in state.select.comment.allow" :key="item.value" :value="item.value">
                                        {{ item.label }} <small class="text-muted">({{ item.value }})</small>
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">
                                    <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" title="是否显示评论">
                                        <i class="bi bi-info-circle text-muted me-1"></i>
                                        <span class="ms-1">显示评论：</span>
                                    </span>
                                </label>
                                <select v-model="state.struct.json.comment.show" class="form-select">
                                    <option v-for="item in state.select.comment.show" :key="item.value" :value="item.value">
                                        {{ item.label }} <small class="text-muted">({{ item.value }})</small>
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="state.status.dialog = false">取 消</button>
                    <button type="button" class="btn btn-primary" @click="method.save()" :disabled="state.status.wait">
                        <span v-if="state.status.wait" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        保 存
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import cache from '@/utils/cache'
import axios from '@/utils/request'

// 模态框实例
let modalInstance = null

const state = reactive({
    cache: {
        name: 'article',
        json: {
            editor: 'vditor'
        }
    },
    struct: {
        key: 'ARTICLE',
        json: {
            'comment': {
                'allow': 1, 'show': 1
            },
            'audit': 1,
        }
    },
    status: {
        finish: false,
        loading: true,
        dialog: false,
        wait: false
    },
    select: {
        editor: [
            { value: 'vditor', label: 'Markdown' }
        ],
        comment: {
            allow: [
                { value: 1, label: '允许' },
                { value: 0, label: '禁止' },
            ],
            show: [
                { value: 1, label: '显示' },
                { value: 0, label: '隐藏' },
            ]
        },
        audit: [
            { value: 1, label: '开启', subtitle: '严格一点，防止乱搞' },
            { value: 0, label: '关闭', subtitle: '宽松一点，方便用户' },
        ]
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
        method.cache()

        state.status.finish  = false
        state.status.loading = true

        try {
            const { code, data } = await axios.get('/api/config/one', {
                key: 'ARTICLE'
            })

            if (code !== 200) return
            state.struct = data

            // 确保编辑器类型为vditor
            state.cache.json.editor = 'vditor'
            state.struct.json.editor = 'vditor'
            
            state.status.finish  = true
        } catch (error) {
            console.error('获取配置失败:', error)
        } finally {
            state.status.loading = false
        }
    },
    show() {
        if (!state.status.finish) {
            alert('配置获取失败，无法进行配置！')
            return
        }
        
        state.status.dialog = true
        
        // 显示模态框
        if (window.bootstrap) {
            const modalElement = document.getElementById('articleConfigModal')
            if (modalElement) {
                modalInstance = new window.bootstrap.Modal(modalElement)
                modalInstance.show()
            }
        }
    },
    save: async () => {
        state.status.wait   = true

        // 保存时强制设置为vditor
        state.struct.json.editor = 'vditor'
        
        try {
            const { code, msg } = await axios.post('/api/config/save', {
                ...state.struct,
                json: JSON.stringify(state.struct.json)
            })

            if (code !== 200) {
                alert('保存失败：' + msg)
                return
            }

            // 关闭模态框
            if (modalInstance) {
                modalInstance.hide()
            }
            
            state.status.dialog = false
            alert('保存成功')
            cache.set(state.cache.name, state.cache.json)
        } catch (error) {
            console.error('保存配置失败:', error)
            alert('保存失败：网络错误')
        } finally {
            state.status.wait   = false
        }
    },
    // 获取缓存
    cache: (json = state.cache.json) => {
        // 缓存存在 - 直接返回并确保是vditor
        if (cache.has(state.cache.name)) {
            const cached = cache.get(state.cache.name)
            state.cache.json = { ...cached, editor: 'vditor' }
            return
        }

        // 缓存不存在 - 保存缓存（强制为vditor）
        cache.set(state.cache.name, { ...json, editor: 'vditor' })
    },
}

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