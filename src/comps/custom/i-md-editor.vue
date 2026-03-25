<!-- 自定义Markdown编辑器组件 -->
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
    <MdEditor
        v-bind="editorProps"
        :modelValue="modelValue"
        @update:modelValue="handleModelValueChange"
        @upload-image="handleUploadImage"
    />
    
    <!-- 错误提示 -->
    <div v-if="state.error" class="mt-2 alert alert-danger alert-dismissible fade show" role="alert">
        {{ state.error }}
        <button type="button" class="btn-close" @click="state.error = ''" aria-label="Close"></button>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
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
            height: 500,
            preview: true,
            toolbar: true
        },
        required: false
    },
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 响应式状态
const state = reactive({
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

// 编辑器属性
const editorProps = computed(() => {
    return {
        height: props.opts.height || 500,
        preview: props.opts.preview !== false,
        toolbar: props.opts.toolbar !== false,
        placeholder: '写点什么吧！',
        ...props.opts
    }
})

// 处理模型值变化
const handleModelValueChange = (value) => {
    emit('update:modelValue', value)
}

// 处理图片上传
const handleUploadImage = async (file, insertImage) => {
    state.progress.show = true
    state.error = ''

    try {
        // 创建FormData
        const formData = new FormData()
        formData.append('file', file)

        const { code, msg, data } = await axios.post('/api/file/upload', formData, {
            onUploadProgress: (progressEvent) => {
                state.progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            }
        })

        if (code !== 200) {
            throw new Error(msg)
        }

        const { path } = data
        insertImage({ url: path, alt: file.name })
    } catch (err) {
        state.error = err.message || '上传失败'
        state.progress.value = 0
    } finally {
        setTimeout(() => {
            state.progress.show = false
        }, 1000)
    }
}

// 暴露方法给父组件
defineExpose({
    getValue: () => props.modelValue,
    setValue: (value) => emit('update:modelValue', value)
})
</script>