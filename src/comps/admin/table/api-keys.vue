<template>
    <i-table 
        :opts="optsConfig" 
        ref="tableRef"
    >
        <!-- 自定义列 - 结束位置表头 -->
        <template #end-header>
            <th v-if="props.type === 'all'" width="100" class="text-end">操作</th>
            <th v-if="props.type === 'remove'" width="160" class="text-end">操作</th>
        </template>

        <!-- 自定义列 - 结束位置 -->
        <template #end="{ scope }">
            <td v-if="props.type === 'all'" width="100" class="text-end">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary" @click="method.edit(scope)">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" @click="method.delete(scope.id, true)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
            <td v-if="props.type === 'remove'" width="160" class="text-end">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-success" @click="method.restore(scope.id)">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary ms-1" @click="method.edit(scope)">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" @click="method.delete(scope.id, false)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </template>

        <!-- 自定义列 - 密钥 -->
        <template #i-value="{ scope }">
            <span class="pointer" data-bs-toggle="tooltip" :title="'双击复制：' + scope.value" @dblclick="method.copy(scope.value)">{{ method.omit(scope?.value) }}</span>
        </template>

        <!-- 自定义列 - 备注 -->
        <template #i-remark="{ scope }">
            <span class="pointer" data-bs-toggle="tooltip" :title="method.autoWrap(scope.remark)">{{ method.omit(scope?.remark) }}</span>
        </template>
    </i-table>

    <!-- API密钥表单模态框 -->
    <div class="modal fade" id="apiKeyFormModal" tabindex="-1" aria-labelledby="apiKeyFormModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="apiKeyFormModalLabel">{{ utils.is.empty(state.struct.id) ? '添加' : '编辑' }} 接口密钥</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="state.item.dialog = false"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">
                            <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" data-bs-placement="top" title="用于接口访问的密钥">
                                <i class="bi bi-info-circle text-muted me-1"></i>
                                <span class="ms-1">密钥：</span>
                            </span>
                        </label>
                        <div class="input-group">
                            <input type="text" class="form-control" v-model="state.struct.value" placeholder="为空自动生成32位密钥">
                            <button class="btn btn-outline-secondary" type="button" @click="method.rand()">
                                <i class="bi bi-shuffle"></i>
                                <span class="ms-1">随机</span>
                            </button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">
                            <span class="d-inline-flex align-items-center" data-bs-toggle="tooltip" data-bs-placement="top" title="备注而已，页面上不会显示此项">
                                <i class="bi bi-info-circle text-muted me-1"></i>
                                <span class="ms-1">备注：</span>
                            </span>
                        </label>
                        <textarea class="form-control" v-model="state.struct.remark" rows="3" placeholder="备注一下，避免忘记！"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="state.item.dialog = false">取消</button>
                    <button type="button" class="btn btn-primary" @click="method.save()" :disabled="state.item.wait">
                        <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-1"></span>
                        保存
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed, getCurrentInstance } from 'vue'
import utils from '@/utils/utils'
import axios from '@/utils/request'
import Toast from '@/utils/toast'
import ITable from '@/comps/custom/i-table.vue'

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

// table - fixed
const left = computed(() => {
    let result = 'left'
    if (utils.is.mobile()) result = false
    return result
})
// table - fixed
const right = computed(() => {
    let result = 'right'
    if (utils.is.mobile()) result = false
    return result
})

const tableRef = ref(null)
const state  = reactive({
    item: {
        table: 'api-keys',
        dialog: false,
        wait: false,
    },
    struct: {},
    opts: {
        columns: [
            { prop: 'value'  , label: '密钥', width: 150, slot: true, fixed: left },
            { prop: 'remark' , label: '备注', width: 200, slot: true },
            { prop: 'update_time', label: '更新时间', width: 140, sortable: true },
            { prop: 'create_time', label: '创建时间', width: 140, sortable: true },
        ],
    },
})

// API配置
const optsConfig = computed(() => {
    return {
        url: '/api/api-keys/all',
        method: 'get',
        params: props.params,
        columns: state.opts.columns
    }
})

const method = {
    // 刷新数据
    init: async () => {
        // 重新加载数据
        if (tableRef.value && typeof tableRef.value.init === 'function') {
            await tableRef.value.init()
        }
    },
    // 保存数据
    save: async (params = state.struct || {}) => {
        if (utils.is.empty(params)) return Toast.warning('你在想什么？什么都不填！')

        state.item.wait     = true

        const { code, msg } = await axios.post(`/api/${state.item.table}/save`, params)

        state.item.wait     = false

        if (code !== 200) return Toast.error(msg)

        // 关闭对话框
        const modal = bootstrap.Modal.getInstance(document.getElementById('apiKeyFormModal'))
        if (modal) modal.hide()
        state.item.dialog = false
        // 重新加载数据
        await method.init()
    },
    // 编辑数据
    edit: struct => {
        state.struct = struct
        state.item.dialog = true
        nextTick(() => {
            const modalElement = document.getElementById('apiKeyFormModal')
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement)
                modal.show()
            } else {
                console.error('Modal element not found')
            }
        })
    },
    // 显示对话框
    show: () => {
        state.struct = {}
        state.item.dialog = true
        nextTick(() => {
            const modalElement = document.getElementById('apiKeyFormModal')
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement)
                modal.show()
            } else {
                console.error('Modal element not found')
            }
        })
    },
     // 真删 和 软删
    async delete(ids = [], isSoft = true) {
        if (utils.is.empty(ids)) return

        // 拼接服务地址
        const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`

        const { code, msg } = await axios.del(uri, { ids })

        if (code !== 200) return Toast.error(msg)

        // 刷新回收站数据
        emit('refresh', 'remove')

        // 重新加载数据
        await method.init()
    },
    // 恢复数据
    async restore(ids = []) {
        if (utils.is.empty(ids)) return

        const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })

        if (code !== 200) return Toast.error(msg)

        // 刷新全部数据
        emit('refresh', 'all')

        // 重新加载数据
        await method.init()
    },
    // 生成32位随机字符串
    rand(field = 'value') {
        let result  = ''
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const len   = chars.length
        for (let i  = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * len))
        }
        state.struct[field] = result
    },
    // 自动换行
    autoWrap(text = '', length = 40, symbol = '<br>') {
        if (utils.is.empty(text)) return text
        return text.replace(new RegExp(`(.{${length}})`, 'g'), `$1${symbol}`)
    },
    // 复制文本
    copy: (text = null, msg = '复制成功！') => {
        if (utils.is.empty(text)) return
        utils.set.copy.text(text)
        if (!utils.is.empty(msg)) return Toast.info(msg)
    },
    // 省略文本
    omit: (text = null, length = 10, omission = ' ... ', location = 'center') => {
        if (utils.is.empty(text)) return '空'
        return utils.string.omit(text, length, omission, location)
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

watch(() => state.struct?.value, (val) => {
    // 强制转大写
    state.struct.value = val?.toUpperCase()
    // 长度限制32位
    if (val && val.length > 32) state.struct.value = val.slice(0, 32)
})

// 监听对话框状态
watch(() => state.item.dialog, (value) => {
    // 关闭对话框时清空数据
    if (!value) state.struct = {}
})

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
    show: method.show,
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