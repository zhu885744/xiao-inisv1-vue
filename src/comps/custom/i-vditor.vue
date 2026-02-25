<template>
    <!-- 上传进度条 -->
    <div v-if="state.progress.show" class="mb-3">
        <div class="progress" style="height: 8px;">
            <div 
                class="progress-bar" 
                :class="progressClass" 
                :style="{ width: state.progress.value + '%' }"
                role="progressbar"
                :aria-valuenow="state.progress.value"
                aria-valuemin="0"
                aria-valuemax="100"
            ></div>
        </div>
        <div class="text-center text-sm mt-1">{{ state.progress.value }}%</div>
    </div>
    
    <!-- 编辑器容器 -->
    <div v-bind="$attrs" ref="vditorRef"></div>
    
    <!-- 错误提示 -->
    <div v-if="state.error" class="mt-2 alert alert-danger alert-dismissible fade show" role="alert">
        {{ state.error }}
        <button type="button" class="btn-close" @click="state.error = ''" aria-label="Close"></button>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import utils from '@/utils/utils'
import axios from '@/utils/request'

// 定义属性
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    opts: {
        type: Object,
        default: {
            height: 360,
            toolbarConfig: {
                pin: true,
            },
            cache: {
                enable: false,
            },
        },
        required: false
    },
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 响应式状态
const vditorRef = ref(null)
const state = reactive({
    vditor: null,
    content: '### 默认',
    progress: {
        value: 0,
        show: false,
    },
    error: ''
})

// 计算属性
const progressClass = computed(() => {
    if (state.progress.value < 30) {
        return 'bg-dark'
    } else if (state.progress.value < 60) {
        return 'bg-primary'
    } else if (state.progress.value < 100) {
        return 'bg-info'
    } else {
        return 'bg-success'
    }
})

// 基础URL
const base_url = (process.env.NODE_ENV === 'production' ? (import.meta.env.VITE_BASE || '/') : '/')

// 默认配置
const defaultOpts = {
    height: 500,
    toolbarConfig: {
        pin: true,
    },
    cache: {
        enable: false,
    },
}

// 方法
const initVditor = () => {
    state.vditor = new Vditor(vditorRef.value, {
        cdn: base_url + 'assets/libs/vditor',
        placeholder: '写点什么吧！',
        toolbarConfig: {
            pin: true,
        },
        cache: {
            enable: false,
        },
        counter: {
            enable: true,
        },
        resize: {
            enable: true,
        },
        preview: {
            hljs: {
                enable: true,
                lineNumber: true,
            },
            math: {
                engine: 'MathJax',
            }
        },
        after: () => {
            state.vditor.setValue(props.modelValue)
        },
        upload: {
            accept: 'image/*, video/*',
            multiple: false,
            handler: async (files) => {
                // 创建FormData
                const formData = new FormData()
                formData.append('file', files[0])

                state.progress.show = true
                state.error = ''

                try {
                    const { code, msg, data } = await axios.post('/api/file/upload', formData, {
                        onUploadProgress: (progressEvent) => {
                            state.progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                        }
                    })

                    if (code !== 200) {
                        throw new Error(msg)
                    }

                    const { path } = data
                    
                    if (fileFormat(path) === 'image') {
                        state.vditor.insertValue(`![](${path})`)
                    } else if (fileFormat(path) === 'video') {
                        state.vditor.insertValue(`<video src="${path}" controls>Not Support</video>`)
                    } else {
                        state.vditor.insertValue(`${path}`)
                    }
                } catch (err) {
                    state.error = err.message || '上传失败'
                    state.progress.value = 0
                } finally {
                    setTimeout(() => {
                        state.progress.show = false
                    }, 1000)
                }
            },
            filename: (name) => {
                return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5.)]/g, '')
                    .replace(/[?\\/:|<>*\[\]()$%{}@~]/g, '')
                    .replace(/\s/g, '')
            },
        },
        ...{ ...defaultOpts, ...props.opts },
    })
}

// 文件格式判断
const fileFormat = (url = null) => {
    let result = 'other'
    const image = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico']
    const video = ['avi', 'mp4']
    
    if (url) {
        const array = url.split('.')
        const ext = array.pop()?.toLowerCase()
        if (image.includes(ext)) {
            result = 'image'
        } else if (video.includes(ext)) {
            result = 'video'
        }
    }
    
    return result
}

// 暴露方法给父组件
defineExpose({
    getHTML: () => state.vditor?.getHTML(),
    getValue: () => state.vditor?.getValue(),
    html2md: (html) => state.vditor?.html2md(html),
    setValue: (markdown) => state.vditor?.setValue(markdown),
})

// 生命周期
onMounted(() => {
    initVditor()
})

// 监听modelValue变化
watch(() => props.modelValue, (value) => {
    if (state.vditor && value !== state.vditor.getValue()) {
        state.vditor.setValue(value)
    }
})
</script>

<style scoped>
/* 自定义样式 */
.vditor {
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    overflow: hidden;
}

.vditor-toolbar {
    border-bottom: 1px solid #dee2e6;
}

.vditor-content {
    min-height: 360px;
}
</style>