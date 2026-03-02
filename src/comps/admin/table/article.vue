<template>
    <div>
        <!-- 批量操作工具栏 -->
        <div v-if="state.item.selection.length > 0" class="batch-operation mb-3">
            <div class="d-flex align-items-center gap-2">
                <span class="text-muted">已选择 {{ state.item.selection.length }} 项</span>
                <button v-if="props.type === 'all'" class="btn btn-sm btn-outline-danger" @click="method.batchRemove">
                    <i class="bi bi-trash"></i> 批量删除
                </button>
                <button v-if="props.type === 'remove'" class="btn btn-sm btn-outline-success" @click="method.batchRestore">
                    <i class="bi bi-arrow-clockwise"></i> 批量恢复
                </button>
                <button v-if="props.type === 'remove'" class="btn btn-sm btn-outline-danger" @click="method.batchDelete">
                    <i class="bi bi-trash"></i> 批量删除
                </button>
                <button v-if="props.type === 'remove'" class="btn btn-sm btn-outline-warning" @click="method.clearRecycle">
                    <i class="bi bi-trash3"></i> 清空回收站
                </button>
            </div>
        </div>
        
        <i-table 
            :opts="optsConfig" 
            ref="tableRef"
            @selection:change="method.handleSelectionChange"
        >

        <!-- 操作列 -->
        <template v-slot:end-header>
            <th class="text-center" style="width: 100px;">操作</th>
        </template>
        <template v-if="props.type === 'all'" v-slot:end="{ scope }">
            <td class="text-center">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="method.edit(scope)">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" @click="method.delete(scope.id, true)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </template>
        <template v-if="props.type === 'remove'" v-slot:end="{ scope }">
            <td class="text-center">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-success" @click="method.restore(scope.id)">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary ms-1" @click="method.edit(scope)">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" @click="method.delete(scope.id, false)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </template>

        <!-- 创建时间自定义插槽 -->
        <template #i-create_time="{ scope = {} }">
            <span class="text-muted" data-bs-toggle="tooltip" :title="method.formatTime(scope.create_time)">
                {{ method.formatTime(scope.create_time) }}
            </span>
        </template>

        <!-- 更新时间自定义插槽 -->
        <template #i-update_time="{ scope = {} }">
            <span class="text-muted" data-bs-toggle="tooltip" :title="method.formatTime(scope.update_time)">
                {{ method.formatTime(scope.update_time) }}
            </span>
        </template>

        <!-- 标题自定义插槽 -->
        <template #i-title="{ scope = {} }">
            <span @dblclick="method.edit(scope)" class="d-flex align-items-center">
                <span v-if="scope.audit === 1" class="me-1" data-bs-toggle="tooltip" title="已审核">
                    <i class="bi bi-check-circle text-success"></i>
                </span>
                <span v-if="scope.top === 1" class="me-1" data-bs-toggle="tooltip" title="置顶">
                    <i class="bi bi-star text-warning"></i>
                </span>
                <span class="limit-1-line" data-bs-toggle="tooltip" :title="scope.title">
                    {{ scope?.title }}
                </span>
            </span>
        </template>

        <!-- 摘要自定义插槽 -->
        <template #i-abstract="{ scope = {} }">
            <span data-bs-toggle="tooltip" :title="method.autoWrap(scope.abstract)">
                {{ method.omit(scope?.abstract) }}
            </span>
        </template>

        <!-- 备注自定义插槽 -->
        <template #i-remark="{ scope }">
            <span data-bs-toggle="tooltip" :title="method.autoWrap(scope?.remark)">
                {{ method.omit(scope?.remark) }}
            </span>
        </template>

        </i-table>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import { useRouter } from 'vue-router'
import iTable from '@/comps/custom/i-table.vue'

const emit  = defineEmits(['refresh','update:init'])
const props = defineProps({
    type: {
        type: String,
        default: 'all',
    },
    params: {
        type: Object,
        default: () => ({
            order: 'id asc',
        }),
    },
    init: {
        type: Boolean,
        default: false,
    }
})

// 表格引用
const tableRef = ref(null)

const router = useRouter()
const state  = reactive({
    item: {
        table: 'article',
        selection: [], // 存储选中的项
    },
    struct: {},
    opts: {
        columns: [
            { prop: 'title'  , label: '标题', width: '150px', slot: true },
            { prop: 'abstract', label: '摘要', width: '200px', slot: true },
            { prop: 'remark' , label: '备注', width: '200px', slot: true },
            { prop: 'create_time', label: '创建时间', width: '180px', slot: true },
            { prop: 'update_time', label: '更新时间', width: '180px', slot: true },
        ],
    },
})

// API配置
const optsConfig = computed(() => {
    return {
        url: '/api/article/all',
        method: 'get',
        params: props.params,
        columns: state.opts.columns,
        selection: true // 启用多选功能
    }
})

const method = {
    // 刷新数据
    init: async () => {
        // 重新加载数据
        if (tableRef.value && typeof tableRef.value.refresh === 'function') {
            await tableRef.value.refresh()
        } else if (tableRef.value && typeof tableRef.value.loadData === 'function') {
            // 兼容 i-table 组件的 loadData 方法
            await tableRef.value.loadData()
        } else if (tableRef.value && typeof tableRef.value.init === 'function') {
            // 兼容 i-table 组件的 init 方法
            await tableRef.value.init()
        }
    },
    // 刷新数据 - 使用i-table的refresh方法
    refresh: async () => {
        if (tableRef.value && typeof tableRef.value.refresh === 'function') {
            await tableRef.value.refresh()
        }
    },
    // 加载数据 - 使用i-table的loadData方法
    loadData: async () => {
        if (tableRef.value && typeof tableRef.value.loadData === 'function') {
            await tableRef.value.loadData()
        }
    },
    // 编辑数据
    edit: struct => {
        router.push({path: '/admin/article/write/' + parseInt(struct.id)})
    },
    // 真删 和 软删
    async delete(ids = [], isSoft = true) {
        if (utils.is.empty(ids)) return
        // 拼接服务地址
        const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`
        const { code, msg } = await axios.del(uri, { ids })
        if (code !== 200) {
            alert('删除失败：' + msg)
            return
        }
        // 清空选中的项
        state.item.selection = []
        // 刷新回收站数据
        emit('refresh', 'remove', 'check', 'audit')
        // 重新加载数据
        await method.init()
    },
    // 恢复数据
    async restore(ids = []) {
        if (utils.is.empty(ids)) return
        const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })
        if (code !== 200) {
            alert('恢复失败：' + msg)
            return
        }
        // 清空选中的项
        state.item.selection = []
        // 刷新全部数据
        emit('refresh', 'all', 'check', 'audit')
        // 重新加载数据
        await method.init()
    },
    // 处理选择变化
    handleSelectionChange(selection) {
        state.item.selection = selection
    },
    // 批量软删除
    async batchRemove() {
        if (utils.is.empty(state.item.selection)) return
        const ids = state.item.selection.map(item => item.id)
        await method.delete(ids, true)
    },
    // 批量硬删除
    async batchDelete() {
        if (utils.is.empty(state.item.selection)) return
        const ids = state.item.selection.map(item => item.id)
        await method.delete(ids, false)
    },
    // 批量恢复
    async batchRestore() {
        if (utils.is.empty(state.item.selection)) return
        const ids = state.item.selection.map(item => item.id)
        await method.restore(ids)
    },
    // 清空回收站
    async clearRecycle() {
        const { code, msg } = await axios.del(`/api/${state.item.table}/clear`)
        if (code !== 200) {
            alert('清空失败：' + msg)
            return
        }
        // 清空选中的项
        state.item.selection = []
        // 刷新回收站数据
        emit('refresh', 'remove')
        // 重新加载数据
        await method.init()
    },
    // 自动换行
    autoWrap(text = '', length = 40, symbol = '\n') {
        if (utils.is.empty(text)) return text
        return text.replace(new RegExp(`(.{${length}})`, 'g'), `$1${symbol}`)
    },
    // 复制文本
    copy: (text = null, msg = '复制成功！') => {
        if (utils.is.empty(text)) return
        utils.set.copy.text(text)
        if (!utils.is.empty(msg)) {
            alert(msg)
        }
    },
    // 省略文本
    omit: (text = null, length = 10, omission = ' ... ', location = 'center') => {
        if (utils.is.empty(text)) return '空'
        return utils.string.omit(text, length, omission, location)
    },
    // 格式化时间戳为YYYY-MM-DD HH:mm:ss（通用适配创建/更新时间）
    formatTime: (timestamp) => {
        if (!timestamp || timestamp === 0) {
            return '无数据'
        }
        // 直接使用原始时间戳（假设后端返回的是秒级时间戳）
        const date = new Date(timestamp * 1000)
        // 补零函数
        const pad = (num) => num.toString().padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }
}

onMounted(async () => {
    if (props.init) await method.init()
    
    // 初始化Bootstrap tooltip
    if (window.bootstrap) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl))
    }
})

watch(() => props.init, (val) => {
    if (val) method.init()
})

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
    refresh: method.refresh,
    loadData: method.loadData,
})
</script>

<style scoped>
/* 自定义样式 */
.limit-1-line {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>