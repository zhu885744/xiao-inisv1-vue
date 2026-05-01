<template>
    <div class="pages-table-container">
        <div class="card shadow-sm rounded-3 overflow-hidden">
            <div class="card-body p-0">
                <i-table
                    :opts="optsConfig"
                    ref="tableRef"
                    @selection:change="method.handleSelectionChange"
                    class="table table-hover table-striped align-middle"
                >
                    <template #batch-operations>
                        <button v-if="props.type === 'all'" class="btn btn-sm btn-outline-danger" @click="method.batchRemove">
                            <i class="bi bi-trash me-1"></i> 批量删除
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

                    <template v-slot:end-header>
                        <th class="text-center" style="width: 120px;">操作</th>
                    </template>
                    <template v-if="props.type === 'all'" v-slot:end="{ scope }">
                        <td class="text-center">
                            <div class="btn-group" role="group" aria-label="Page actions">
                                <button class="btn btn-sm btn-outline-primary" @click="method.edit(scope)" title="编辑">
                                    <i class="bi bi-pencil"></i>
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
                                <button class="btn btn-sm btn-outline-danger ms-1" @click="method.delete(scope.id, false)" title="删除">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </template>

                    <template #i-create_time="{ scope = {} }">
                        <span class="text-muted" data-bs-toggle="tooltip" :title="method.formatTime(scope.create_time)">
                            {{ method.formatTime(scope.create_time) }}
                        </span>
                    </template>

                    <template #i-update_time="{ scope = {} }">
                        <span class="text-muted" data-bs-toggle="tooltip" :title="method.formatTime(scope.update_time)">
                            {{ method.formatTime(scope.update_time) }}
                        </span>
                    </template>

                    <template #i-title="{ scope = {} }">
                        <span @dblclick="method.edit(scope)" class="d-flex align-items-center cursor-pointer">
                            <span class="limit-1-line" data-bs-toggle="tooltip" :title="scope.title">
                                {{ scope?.title }}
                            </span>
                        </span>
                    </template>

                    <template #i-key="{ scope = {} }">
                        <code class="small">{{ scope?.key || '-' }}</code>
                    </template>

                    <template #i-tags="{ scope = {} }">
                        <span v-if="scope?.tags" class="badge bg-secondary me-1" v-for="tag in method.splitTags(scope.tags)" :key="tag">
                            {{ tag }}
                        </span>
                        <span v-else class="text-muted">-</span>
                    </template>

                    <template #i-editor="{ scope = {} }">
                        <span class="badge bg-info">{{ scope?.editor || '-' }}</span>
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

const tableRef = ref(null)
const router = useRouter()

const state  = reactive({
    item: {
        table: 'pages',
        selection: [],
    },
    struct: {},
    opts: {
        columns: [
            { prop: 'key'  , label: '标识', width: '120px', slot: true },
            { prop: 'title'  , label: '标题', width: '150px', slot: true },
            { prop: 'tags' , label: '标签', width: '150px', slot: true },
            { prop: 'editor' , label: '编辑器', width: '100px', slot: true },
            { prop: 'create_time', label: '创建时间', width: '180px', slot: true },
            { prop: 'update_time', label: '更新时间', width: '180px', slot: true },
        ],
    },
})

const optsConfig = computed(() => {
    return {
        url: '/api/pages/all',
        method: 'get',
        params: props.params,
        columns: state.opts.columns,
        selection: true
    }
})

watch(() => props.params, () => {
    if (tableRef.value && typeof tableRef.value.refresh === 'function') {
        tableRef.value.refresh()
    }
}, { deep: true })

const method = {
    init: async () => {
        if (tableRef.value && typeof tableRef.value.refresh === 'function') {
            await tableRef.value.refresh()
        } else if (tableRef.value && typeof tableRef.value.loadData === 'function') {
            await tableRef.value.loadData()
        } else if (tableRef.value && typeof tableRef.value.init === 'function') {
            await tableRef.value.init()
        }
    },
    refresh: async () => {
        if (tableRef.value && typeof tableRef.value.refresh === 'function') {
            await tableRef.value.refresh()
        }
    },
    loadData: async () => {
        if (tableRef.value && typeof tableRef.value.loadData === 'function') {
            await tableRef.value.loadData()
        }
    },
    edit: struct => {
        router.push({path: '/admin/pages/write/' + parseInt(struct.id)})
    },
    async delete(ids = [], isSoft = true) {
        if (utils.is.empty(ids)) return

        const confirmMessage = isSoft ? '确定要将选中的页面移到回收站吗？' : '确定要永久删除选中的页面吗？此操作不可恢复！'
        if (!confirm(confirmMessage)) {
            return
        }

        const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`
        const { code, msg } = await axios.del(uri, { ids })
        if (code !== 200) {
            alert('删除失败：' + msg)
            return
        }
        state.item.selection = []
        emit('refresh', 'remove')
        await method.init()
    },
    async restore(ids = []) {
        if (utils.is.empty(ids)) return
        const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })
        if (code !== 200) {
            alert('恢复失败：' + msg)
            return
        }
        state.item.selection = []
        emit('refresh', 'all')
        await method.init()
    },
    handleSelectionChange(selection) {
        state.item.selection = selection
    },
    async batchRemove() {
        if (utils.is.empty(state.item.selection)) return
        const ids = state.item.selection.map(item => item.id)
        await method.delete(ids, true)
    },
    async batchDelete() {
        if (utils.is.empty(state.item.selection)) return
        const ids = state.item.selection.map(item => item.id)
        await method.delete(ids, false)
    },
    async batchRestore() {
        if (utils.is.empty(state.item.selection)) return
        const ids = state.item.selection.map(item => item.id)
        await method.restore(ids)
    },
    async clearRecycle() {
        if (!confirm('确定要清空回收站吗？此操作将永久删除所有回收站中的页面，不可恢复！')) {
            return
        }

        const { code, msg } = await axios.del(`/api/${state.item.table}/clear`)
        if (code !== 200) {
            alert('清空失败：' + msg)
            return
        }
        state.item.selection = []
        emit('refresh', 'remove')
        await method.init()
    },
    splitTags(tags = '') {
        if (utils.is.empty(tags)) return []
        return tags.split(',').map(t => t.trim()).filter(t => t)
    },
    formatTime: (timestamp) => {
        if (!timestamp || timestamp === 0) {
            return '无数据'
        }
        const date = new Date(timestamp * 1000)
        const pad = (num) => num.toString().padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }
}

onMounted(async () => {
    if (props.init) await method.init()

    if (window.bootstrap) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl))
    }
})

watch(() => props.init, (val) => {
    if (val) method.init()
})

defineExpose({
    init: method.init,
    refresh: method.refresh,
    loadData: method.loadData,
})
</script>

<style scoped>
.pages-table-container {
    width: 100%;
}

.limit-1-line {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.cursor-pointer {
    cursor: pointer;
    transition: color 0.2s ease;
}

.cursor-pointer:hover {
    color: var(--bs-primary);
}

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