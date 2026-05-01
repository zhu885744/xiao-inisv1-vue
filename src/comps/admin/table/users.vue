<template>
    <div class="users-table-container">
        <div class="card shadow-sm rounded-3 overflow-hidden">
            <div class="card-body p-0">
                <i-table
                    :opts="optsConfig"
                    ref="tableRef"
                    @selection:change="method.handleSelectionChange"
                    class="table table-hover table-striped align-middle"
                >
                    <template #batch-operations>
                        <button v-if="props.type === 'all' || props.type === 'active' || props.type === 'disabled'" class="btn btn-sm btn-outline-danger" @click="method.batchRemove">
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
                        <th class="text-center" style="width: 160px;">操作</th>
                    </template>
                    <template v-if="props.type !== 'remove'" v-slot:end="{ scope }">
                        <td class="text-center">
                            <div class="btn-group" role="group" aria-label="User actions">
                                <button class="btn btn-sm btn-outline-primary" @click="method.edit(scope)" title="编辑">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button v-if="scope.status === 1" class="btn btn-sm btn-outline-warning ms-1" @click="method.toggleStatus(scope)" title="禁用">
                                    <i class="bi bi-slash-circle"></i>
                                </button>
                                <button v-if="scope.status === 0" class="btn btn-sm btn-outline-success ms-1" @click="method.toggleStatus(scope)" title="启用">
                                    <i class="bi bi-check-circle"></i>
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

                    <template #i-avatar="{ scope = {} }">
                        <div class="d-flex align-items-center">
                            <img :src="scope.avatar || '/static/images/avatar.png'" class="rounded-circle me-2" style="width: 32px; height: 32px; object-fit: cover;" @error="method.handleAvatarError">
                            <span v-if="scope.id === 1" class="badge bg-danger ms-1">系统</span>
                        </div>
                    </template>

                    <template #i-nickname="{ scope = {} }">
                        <span class="d-flex align-items-center">
                            <span>{{ scope?.nickname || '-' }}</span>
                        </span>
                    </template>

                    <template #i-description="{ scope = {} }">
                        <span :title="scope?.description">{{ method.omit(scope?.description, 20) }}</span>
                    </template>

                    <template #i-source="{ scope = {} }">
                        <span class="badge bg-secondary">{{ scope?.source || '-' }}</span>
                    </template>

                    <template #i-gender="{ scope = {} }">
                        <span v-if="scope?.gender == 1" class="badge bg-primary">男</span>
                        <span v-else-if="scope?.gender == 2" class="badge bg-danger">女</span>
                        <span v-else class="badge bg-secondary">未知</span>
                    </template>

                    <template #i-status="{ scope = {} }">
                        <span v-if="scope?.status == 1" class="badge bg-success">正常</span>
                        <span v-else-if="scope?.status == 0" class="badge bg-danger">禁用</span>
                        <span v-else class="badge bg-secondary">-</span>
                    </template>

                    <template #i-create_time="{ scope = {} }">
                        <span class="text-muted" data-bs-toggle="tooltip" :title="method.formatTime(scope.create_time)">
                            {{ method.formatTime(scope.create_time) }}
                        </span>
                    </template>

                </i-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import iTable from '@/comps/custom/i-table.vue'

const router = useRouter()

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

const state  = reactive({
    item: {
        table: 'users',
        selection: [],
    },
    struct: {},
    opts: {
        columns: [
            { prop: 'avatar' , label: '头像', width: '80px', slot: true },
            { prop: 'nickname'  , label: '昵称', width: '120px', slot: true },
            { prop: 'description' , label: '描述', width: '200px', slot: true },
            { prop: 'source' , label: '来源', width: '100px', slot: true },
            { prop: 'gender' , label: '性别', width: '80px', slot: true },
            { prop: 'status' , label: '状态', width: '80px', slot: true },
            { prop: 'create_time', label: '创建时间', width: '160px', slot: true },
        ],
    },
})

const optsConfig = computed(() => {
    return {
        url: '/api/users/all',
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
        router.push({ path: '/admin/users/write/' + parseInt(struct.id) })
    },
    handleAvatarError(event) {
        event.target.src = '/static/images/avatar.png'
    },
    async toggleStatus(struct) {
        if (struct.id === 1) {
            alert('系统管理员不能被禁用！')
            return
        }

        const newStatus = struct.status === 1 ? 0 : 1
        const action = newStatus === 1 ? '启用' : '禁用'

        if (!confirm(`确定要${action}用户 "${struct.nickname}" 吗？`)) {
            return
        }

        try {
            const { code, msg } = await axios.put('/api/users/status', {
                id: struct.id,
                status: newStatus
            })

            if (code !== 200) {
                alert(`${action}失败：${msg}`)
                return
            }

            emit('refresh', 'all', 'active', 'disabled')
            await method.init()
        } catch (error) {
            console.error(`${action}用户失败:`, error)
            alert(`${action}用户失败，请重试`)
        }
    },
    async delete(ids = [], isSoft = true) {
        if (utils.is.empty(ids)) return

        const confirmMessage = isSoft ? '确定要将选中的用户移到回收站吗？' : '确定要永久删除选中的用户吗？此操作不可恢复！'
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
        emit('refresh', 'all', 'active', 'disabled')
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
        if (!confirm('确定要清空回收站吗？此操作将永久删除所有回收站中的用户，不可恢复！')) {
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
    formatTime: (timestamp) => {
        if (!timestamp || timestamp === 0) {
            return '无数据'
        }
        const date = new Date(timestamp * 1000)
        const pad = (num) => num.toString().padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    omit: (text = null, length = 20, omission = '...') => {
        if (utils.is.empty(text)) return '-'
        if (text.length <= length) return text
        return text.substring(0, length) + omission
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
.users-table-container {
    width: 100%;
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