<template>
    <div class="px-1 px-lg-0 mt-2">
        <div class="row">
            <div class="col-lg-9">
                <div class="card mb-2">
                    <div class="card-body" style="min-height: 485px">
                        <div v-if="!state.struct.editor" class="d-flex justify-content-center align-items-center py-5">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">加载中...</span>
                            </div>
                            <span class="ms-2">加载编辑器中...</span>
                        </div>
                        <i-md-editor ref="vditorRef" v-model="state.struct.content" :opts="{ height: 600 }"></i-md-editor>
                    </div>
                    <div class="card-footer d-flex justify-content-end gap-2">
                        <button class="btn btn-primary" type="button" @click="method.save()" :disabled="state.item.wait">
                            <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            保存页面
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-lg-3" id="page-header-title">
                <div v-if="state.item.loading" class="d-flex justify-content-center align-items-center py-5">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">加载中...</span>
                    </div>
                    <span class="ms-2">加载数据中...</span>
                </div>
                <div v-else>
                    <div class="card mb-2">
                        <div class="card-header" data-bs-toggle="collapse" href="#collapse1" role="button" aria-expanded="true" aria-controls="collapse1">
                            <h6 class="mb-0">基本信息</h6>
                        </div>
                        <div id="collapse1" class="collapse show">
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">
                                        <span class="text-danger me-1">*</span>
                                        <span>页面标识：</span>
                                        <span class="text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="页面的唯一标识符，用于URL访问">
                                            <i class="bi bi-info-circle ms-1"></i>
                                        </span>
                                    </label>
                                    <input type="text" v-model="state.struct.key" class="form-control" placeholder="如：about-us">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">
                                        <span class="text-danger me-1">*</span>
                                        <span>页面标题：</span>
                                        <span class="text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="页面的标题">
                                            <i class="bi bi-info-circle ms-1"></i>
                                        </span>
                                    </label>
                                    <input type="text" v-model="state.struct.title" class="form-control" placeholder="页面标题">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">
                                        <span>标签：</span>
                                        <span class="text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="页面的标签，多个用逗号分隔">
                                            <i class="bi bi-info-circle ms-1"></i>
                                        </span>
                                    </label>
                                    <input type="text" v-model="state.struct.tags" class="form-control" placeholder="标签1,标签2">
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">
                                        <span>发布时间：</span>
                                        <span class="text-muted" data-bs-toggle="tooltip" data-bs-placement="top" title="页面的发布时间，留空则为当前时间">
                                            <i class="bi bi-info-circle ms-1"></i>
                                        </span>
                                    </label>
                                    <input type="datetime-local" v-model="state.struct.publishTime" class="form-control" step="1" placeholder="选择发布时间">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import axios from '@/utils/request'
import IMdEditor from '@/comps/custom/i-md-editor.vue'
import { usePageTitle } from '@/utils/usePageTitle'
import toast from '@/utils/toast'

const route = useRoute()
const router = useRouter()

const { setDynamicTitle } = usePageTitle()

const updatePageTitle = () => {
    const id = route.params?.id
    if (id) {
        setDynamicTitle(`编辑独立页面 - ${state.struct.title || '加载中...'}`)
    } else {
        setDynamicTitle('撰写独立页面')
    }
}

const vditorRef = ref(null)

const state = reactive({
    item: {
        id: null,
        loading: false,
        wait: false
    },
    struct: {
        key: '',
        title: '',
        content: '',
        tags: '',
        editor: 'vditor',
        publishTime: '',
    },
})

const method = {
    init: async () => {
        let id = route.params?.id
        if (!utils.is.empty(id)) {
            state.item.id = parseInt(id)
            state.item.loading = true
        }
        if (!utils.is.empty(state.item.id)) {
            await method.getPage(state.item.id)
        } else {
            state.struct.editor = 'vditor'
        }
    },
    getPage: async (id = null) => {
        try {
            const { code, msg, data } = await axios.get('/api/pages/one', { id })
            if (code !== 200) {
                await router.push({ path: '/admin/pages/write' })
                toast.info(`已为您跳转到独立页面编辑页！${msg}`)
                return
            }

            if (data.publish_time && data.publish_time > 0) {
                const date = new Date(data.publish_time * 1000)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const minutes = String(date.getMinutes()).padStart(2, '0')
                const seconds = String(date.getSeconds()).padStart(2, '0')
                data.publishTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
            } else {
                data.publishTime = ''
            }

            state.struct = data
            state.struct.editor = 'vditor'

            state.item.loading = false
        } catch (error) {
            console.error('获取页面信息失败:', error)
            toast.error('获取页面信息失败，请重试')
            state.item.loading = false
        }
    },
    save: async () => {
        try {
            if (!state.struct.content) {
                toast.warning('编辑器尚未加载完成，请稍候重试')
                return
            }

            if (utils.is.empty(state.struct?.key)) return toast.warning('页面标识不能为空')
            if (utils.is.empty(state.struct?.title)) return toast.warning('页面标题不能为空')

            const saveData = { ...state.struct }

            if (state.struct.publishTime) {
                saveData.publish_time = Math.floor(new Date(state.struct.publishTime).getTime() / 1000)
            }
            delete saveData.publishTime

            state.item.wait = true

            let response
            if (state.item.id) {
                response = await axios.put('/api/pages/update', saveData)
            } else {
                response = await axios.post('/api/pages/create', saveData)
            }

            const { code, msg, data } = response

            state.item.wait = false

            if (code !== 200) return toast.error('保存失败：' + msg)

            toast.success('保存成功：' + msg)

            state.item.id = data.id
            state.struct.id = data.id

            await router.push({ path: '/admin/pages/write/' + parseInt(data.id) })
        } catch (error) {
            console.error('保存页面失败:', error)
            toast.error('保存页面失败，请重试')
            state.item.wait = false
        }
    },
}

onMounted(async () => {
    await method.init()
    updatePageTitle()

    if (window.bootstrap) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl))

        const tabElementList = document.querySelectorAll('[data-bs-toggle="tab"]')
        const tabList = [...tabElementList].map(tabEl => new window.bootstrap.Tab(tabEl))
    }
})

watch(() => route.params?.id, (value) => {
    if (utils.is.empty(value)) return
    method.init()
    updatePageTitle()
})

watch(() => state.struct.title, () => {
    updatePageTitle()
})
</script>