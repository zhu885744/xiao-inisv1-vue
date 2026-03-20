<template>
    <div class="links-table-container">
        <div class="card shadow-sm rounded-3 overflow-hidden">
            <div class="card-body p-0">
                <i-table 
                    :opts="optsConfig" 
                    ref="tableRef"
                    @selection:change="method.handleSelectionChange"
                    class="table table-hover table-striped align-middle"
                >
                    <!-- 批量操作按钮 -->
                    <template #batch-operations>
                        <button v-if="props.type === 'all'" class="btn btn-sm btn-outline-danger" @click="method.batchRemove">
                            <i class="bi bi-trash me-1"></i> 批量删除
                        </button>
                        <button v-if="props.type === 'all'" class="btn btn-sm btn-outline-success ms-1" @click="method.batchAudit(1)">
                            <i class="bi bi-check-circle me-1"></i> 批量通过
                        </button>
                        <button v-if="props.type === 'all'" class="btn btn-sm btn-outline-warning ms-1" @click="method.batchAudit(0)">
                            <i class="bi bi-x-circle me-1"></i> 批量拒绝
                        </button>
                        <button v-if="props.type === 'remove'" class="btn btn-sm btn-outline-success" @click="method.batchRestore">
                            <i class="bi bi-arrow-clockwise me-1"></i> 批量恢复
                        </button>
                        <button v-if="props.type === 'remove'" class="btn btn-sm btn-outline-danger" @click="method.batchDelete">
                            <i class="bi bi-trash me-1"></i> 批量删除
                        </button>
                        <button v-if="props.type === 'remove'" class="btn btn-sm btn-outline-warning" @click="method.clearRecycle">
                            <i class="bi bi-trash3 me-1"></i> 清空回收站
                        </button>
                    </template>

                <!-- 操作列 -->
                <template v-slot:end-header>
                    <th class="text-center" style="width: 180px;">操作</th>
                </template>
                <template v-if="props.type === 'all'" v-slot:end="{ scope }">
                    <td class="text-center">
                        <div class="btn-group" role="group" aria-label="Link actions">
                            <button class="btn btn-sm btn-outline-primary" @click="method.edit(scope)" title="编辑">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button v-if="scope.audit === 0" class="btn btn-sm btn-outline-success ms-1" @click="method.audit(scope.id, 1)" title="通过">
                                <i class="bi bi-check-circle"></i>
                            </button>
                            <button v-if="scope.audit === 1" class="btn btn-sm btn-outline-warning ms-1" @click="method.audit(scope.id, 0)" title="拒绝">
                                <i class="bi bi-x-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger ms-1" @click="method.delete(scope.id, true)" title="删除">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </template>
                <template v-if="props.type === 'remove'" v-slot:end="{ scope }">
                    <td class="text-center">
                        <div class="btn-group" role="group" aria-label="Recycle actions">
                            <button class="btn btn-sm btn-outline-success" @click="method.restore(scope.id)" title="恢复">
                                <i class="bi bi-arrow-clockwise"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-primary ms-1" @click="method.edit(scope)" title="编辑">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger ms-1" @click="method.delete(scope.id, false)" title="删除">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </template>

                <!-- 网站图标自定义插槽 -->
                <template #i-avatar="{ scope = {} }">
                    <img v-if="scope.avatar" :src="scope.avatar" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;" :alt="scope.nickname">
                    <span v-else class="d-inline-block rounded-circle bg-gray-200 text-gray-500 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                        <i class="bi bi-globe"></i>
                    </span>
                </template>

                <!-- 网站名称自定义插槽 -->
                <template #i-nickname="{ scope = {} }">
                    <span class="d-flex align-items-center">
                        <a :href="scope.url" :target="scope.target || '_blank'" class="text-primary hover-underline" :title="scope.nickname">
                            {{ scope?.nickname }}
                        </a>
                        <span v-if="scope.audit === 1" class="ms-1" data-bs-toggle="tooltip" title="已审核">
                            <i class="bi bi-check-circle text-success"></i>
                        </span>
                        <span v-else class="ms-1" data-bs-toggle="tooltip" title="待审核">
                            <i class="bi bi-clock text-warning"></i>
                        </span>
                    </span>
                </template>

                <!-- 网站链接自定义插槽 -->
                <template #i-url="{ scope = {} }">
                    <a :href="scope.url" :target="scope.target || '_blank'" class="text-muted hover-underline" :title="scope.url">
                        {{ method.omit(scope?.url) }}
                    </a>
                </template>

                <!-- 网站描述自定义插槽 -->
                <template #i-description="{ scope = {} }">
                    <span data-bs-toggle="tooltip" :title="scope?.description">
                        {{ method.omit(scope?.description) }}
                    </span>
                </template>

                <!-- 分组自定义插槽 -->
                <template #i-group="{ scope = {} }">
                    <span data-bs-toggle="tooltip" :title="scope?.result?.group?.name || scope?.group || '未分组'">
                        {{ scope?.result?.group?.name || scope?.group || '未分组' }}
                    </span>
                </template>

                <!-- 审核状态自定义插槽 -->
                <template #i-audit="{ scope = {} }">
                    <span class="badge" :class="scope.audit === 1 ? 'bg-success' : 'bg-warning'">
                        {{ scope.audit === 1 ? '已通过' : '待审核' }}
                    </span>
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

                <!-- 用户昵称自定义插槽 -->
                <template #i-uid="{ scope = {} }">
                    <span data-bs-toggle="tooltip" :title="scope?.user?.nickname || (scope?.uid ? '用户ID: ' + scope.uid : '未知用户')">
                        {{ scope?.user?.nickname || (scope?.uid ? '用户ID: ' + scope.uid : '未知用户') }}
                    </span>
                </template>

                </i-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import { useRouter } from 'vue-router'
import iTable from '@/comps/custom/i-table.vue'

const emit  = defineEmits(['refresh','update:init', 'edit'])
const props = defineProps({
    type: {
        type: String,
        default: 'all',
    },
    params: {
        type: Object,
        default: () => ({
            order: 'create_time desc',
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
        table: 'links',
        selection: [], // 存储选中的项
    },
    struct: {},
    opts: {
        columns: [
            { prop: 'avatar'     , label: '图标', width: '60px', slot: true },
            { prop: 'nickname'   , label: '网站名称', width: '150px', slot: true },
            { prop: 'url'        , label: '链接', width: '200px', slot: true },
            { prop: 'description', label: '描述', width: '200px', slot: true },
            { prop: 'group'      , label: '分组', width: '100px', slot: true },
            { prop: 'uid'    , label: '用户昵称', width: '120px', slot: true },
            { prop: 'audit'      , label: '状态', width: '80px', slot: true },
            { prop: 'create_time', label: '创建时间', width: '180px', slot: true },
            { prop: 'update_time', label: '更新时间', width: '180px', slot: true },
        ],
    },
})

// API配置
const optsConfig = computed(() => {
    return {
        url: '/api/links/all',
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
        emit('edit', struct)
    },
    // 审核友链
    async audit(id, audit) {
        const { code, msg } = await axios.put(`/api/links/update`, { id, audit })
        if (code !== 200) {
            alert('审核失败：' + msg)
            return
        }
        // 刷新数据
        await method.init()
    },
    // 批量审核
    async batchAudit(audit) {
        if (utils.is.empty(state.item.selection)) return
        const ids = state.item.selection.map(item => item.id)
        const { code, msg } = await axios.put(`/api/links/update`, { ids, audit })
        if (code !== 200) {
            alert('批量审核失败：' + msg)
            return
        }
        // 清空选中的项
        state.item.selection = []
        // 刷新数据
        await method.init()
    },
    // 真删 和 软删
    async delete(ids = [], isSoft = true) {
        if (utils.is.empty(ids)) return
        
        // 添加删除确认
        const confirmMessage = isSoft ? '确定要将选中的友链移到回收站吗？' : '确定要永久删除选中的友链吗？此操作不可恢复！'
        if (!confirm(confirmMessage)) {
            return
        }
        
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
        emit('refresh', 'remove', 'all', 'check', 'audit')
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
        // 添加清空确认
        if (!confirm('确定要清空回收站吗？此操作将永久删除所有回收站中的友链，不可恢复！')) {
            return
        }
        
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
    // 省略文本
    omit: (text = null, length = 20, omission = ' ... ', location = 'center') => {
        if (utils.is.empty(text)) return '空'
        return utils.string.omit(text, length, omission, location)
    },
    // 格式化时间戳为YYYY-MM-DD HH:mm:ss
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
.links-table-container {
    width: 100%;
}

.hover-underline {
    text-decoration: none;
    transition: text-decoration 0.2s ease;
}

.hover-underline:hover {
    text-decoration: underline;
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
    .batch-operation {
        background-color: var(--bs-dark) !important;
        border: 1px solid var(--bs-border-color) !important;
    }
    
    .batch-operation .text-muted {
        color: var(--bs-light) !important;
    }
    
    .card {
        background-color: var(--bs-dark) !important;
        border: 1px solid var(--bs-border-color) !important;
    }
    
    .table {
        color: var(--bs-light) !important;
    }
    
    .table-hover tbody tr:hover {
        color: var(--bs-light) !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
    }
    
    .table-striped tbody tr:nth-of-type(odd) {
        background-color: rgba(255, 255, 255, 0.03) !important;
    }
}
</style>