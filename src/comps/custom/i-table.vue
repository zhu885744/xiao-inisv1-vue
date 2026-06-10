<!-- 后台管理自定义表格组件 -->
<template>
    <div class="table-container">
        <!-- 加载状态 -->
        <div v-if="state.item.loading.data" class="loading-state d-flex flex-column justify-content-center align-items-center py-12">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">数据加载中...</span>
            </div>
            <p class="mt-3 text-muted">正在加载数据，请稍候...</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state d-flex flex-column justify-content-center align-items-center py-12">
            <div class="text-danger mb-3">
                <i class="bi bi-exclamation-circle" style="font-size: 2.5rem;"></i>
            </div>
            <p class="text-danger">{{ errorMessage }}</p>
            <button class="btn btn-primary mt-4" @click="method.init">重新加载</button>
        </div>
        
        <!-- 表格 -->
        <div v-else class="table-wrapper">
            <!-- 顶部操作栏 -->
            <div class="table-toolbar">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <!-- 左侧：批量操作 -->
                    <div class="d-flex align-items-center gap-2">
                        <select class="form-select form-select-sm" v-model="state.item.batchAction">
                            <option value="">批量操作</option>
                            <option value="delete">删除选中</option>
                            <option value="export">导出数据</option>
                        </select>
                        <button 
                            class="btn btn-sm btn-primary" 
                            @click="handle.batchAction"
                            :disabled="state.item.selection.length === 0"
                        >
                            应用
                        </button>
                    </div>
                    
                    <!-- 右侧：搜索 -->
                    <slot name="toolbar-right"></slot>
                </div>
            </div>
            
            <!-- 统计信息 -->
            <div class="table-summary">
                <span class="text-muted">全部 ({{ state.item.count }})</span>
                <span v-if="state.item.count > 0" class="text-muted">| 已发布 ({{ state.item.count }})</span>
            </div>
            
            <!-- 表格主体 -->
            <div class="table-content">
                <table class="table">
                    <thead>
                        <tr>
                            <!-- 多选列 -->
                            <th v-if="state.config.opts.selection" class="text-center" style="width: 30px;">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    :checked="isAllSelected" 
                                    @change="handle.selectAll($event)"
                                    :disabled="state.item.loading.data"
                                >
                            </th>

                            <!-- 自定义列 - 开始位置 -->
                            <slot name="start-header"></slot>

                            <!-- 表格列 -->
                            <th 
                                v-for="(column, index) in state.config.opts.columns" 
                                :key="index"
                                :class="[column.class, utils.inArray(column.prop, ['create_time', 'update_time']) ? 'text-center' : (column.align || 'text-start')]"
                                :style="{ width: column.width }"
                            >
                                {{ column.label }}
                                <span v-if="column.sortable" class="sort-icon">
                                    <i class="bi bi-chevron-up"></i>
                                    <i class="bi bi-chevron-down"></i>
                                </span>
                            </th>

                            <!-- 自定义列 - 结束位置 -->
                            <slot name="end-header"></slot>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in state.item.data" :key="rowIndex" :class="{ 'table-row-hover': true }">
                            <!-- 多选列 -->
                            <td v-if="state.config.opts.selection" class="text-center">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    :checked="isSelected(row)" 
                                    @change="() => handle.select(row)"
                                    :disabled="state.item.loading.data"
                                >
                            </td>

                            <!-- 自定义列 - 开始位置 -->
                            <slot name="start" :scope="row"></slot>

                            <!-- 表格数据 -->
                            <td 
                                v-for="(column, index) in state.config.opts.columns" 
                                :key="index"
                                :class="[column.class, utils.inArray(column.prop, ['create_time', 'update_time']) ? 'text-center' : (column.align || 'text-start')]"
                            >
                                <template v-if="column.slot">
                                    <slot :name="'i-' + column.prop" :scope="row"></slot>
                                </template>
                                <template v-else>
                                    <span v-if="utils.inArray(column.prop, ['create_time', 'update_time'])">
                                        <span v-if="!utils.isEmpty(row[column.prop])">
                                            {{ utils.time.nature(row[column.prop]) }}
                                        </span>
                                        <span v-else>-</span>
                                    </span>
                                    <span v-else>
                                        {{ row[column.prop] || '-' }}
                                    </span>
                                </template>
                            </td>

                            <!-- 自定义列 - 结束位置 -->
                            <slot name="end" :scope="row"></slot>
                        </tr>
                        
                        <!-- 空数据状态 -->
                        <tr v-if="state.item.data.length === 0">
                            <td :colspan="totalColumns" class="text-center py-8">
                                <div class="empty-state">
                                    <i class="bi bi-inbox" style="font-size: 2.5rem; color: #adb5bd;"></i>
                                    <p class="mt-3 text-muted">暂无数据</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- 底部操作栏 -->
            <div class="table-footer">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <!-- 左侧：批量操作 -->
                    <div class="d-flex align-items-center gap-2">
                        <select class="form-select form-select-sm" v-model="state.item.batchAction">
                            <option value="">批量操作</option>
                            <option value="delete">删除选中</option>
                            <option value="export">导出数据</option>
                        </select>
                        <button 
                            class="btn btn-sm btn-primary" 
                            @click="handle.batchAction"
                            :disabled="state.item.selection.length === 0"
                        >
                            应用
                        </button>
                        <span class="text-muted text-sm">已选择 {{ state.item.selection.length }} 项</span>
                    </div>
                    
                    <!-- 右侧：分页控制 -->
                    <div class="d-flex align-items-center gap-3">
                        <!-- 统计信息 -->
                        <div v-if="state.item.count > 0" class="text-muted text-sm">
                            {{ state.item.count }} 项
                        </div>
                        
                        <!-- 每页显示条数选择 -->
                        <div class="d-flex align-items-center gap-2">
                            <select id="pageSize" class="form-select form-select-sm" v-model="state.item.limit" @change="handle.sizeChange">
                                <option v-for="size in state.config.pagination.sizes" :key="size" :value="size">
                                    {{ size }}
                                </option>
                            </select>
                        </div>
                        
                        <!-- 分页导航 -->
                        <nav v-if="state.item.page.total > 1" aria-label="Page navigation">
                            <ul class="pagination pagination-sm mb-0">
                                <li class="page-item" :class="{ disabled: (state.item.page.code || 1) === 1 }">
                                    <button class="page-link" @click="() => handle.currentChange((state.item.page.code || 1) - 1)" :disabled="(state.item.page.code || 1) === 1">
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                </li>
                                
                                <li 
                                    v-for="page in pageRange" 
                                    :key="page"
                                    class="page-item" 
                                    :class="{ active: page === (state.item.page.code || 1) }"
                                >
                                    <button class="page-link" @click="() => handle.currentChange(page)">
                                        {{ page }}
                                    </button>
                                </li>
                                
                                <li class="page-item" :class="{ disabled: (state.item.page.code || 1) === (state.item.page.total || 1) }">
                                    <button class="page-link" @click="() => handle.currentChange((state.item.page.code || 1) + 1)" :disabled="(state.item.page.code || 1) === (state.item.page.total || 1)">
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import utils from '@/utils/utils'
import { request } from '@/utils/network'
import { getCurrentInstance } from 'vue'

const emit = defineEmits(['selection:change'])

const props = defineProps({
    opts: {
        type: Object,
        default: {
            url   : '',
            method: 'get',
            params: {},
            headers: {},
            columns: [],
            menu: {},
        },
        required: true
    },
    table: {
        type: Object,
        default: {
            defaultSort: {
                prop: 'id',
                order: 'descending'
            },
            rowStyle: {
                backgroundColor: `rgba(var(--bs-primary-rgb), 0.64)`,
            },
            cellStyle: {
                backgroundColor: 'transparent',
                border: 'unset',
                padding: '10px 0'
            },
            headerRowStyle: {
                backgroundColor: 'transparent !important',
            },
            headerCellStyle: {
                backgroundColor: `rgba(var(--bs-primary-rgb), 0.8)`,
                border: 'unset',
            },
            style: {
                background: `rgba(var(--bs-primary-rgb), 0.12)`,
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
            },
        }
    },
    pagination: {
        type: Object,
        default: {
            count: 5,
            single: true,
            class: 'custom',
            background: true,
            sizes: [10, 50, 100, 500],
            layout: 'sizes, prev, pager, next',
        },
    },
})

const { ctx, proxy } = getCurrentInstance()

const state = reactive({
    item: {
        data: [],
        count: 0,
        page: {
            code: 1,
            total: 1,
        },
        limit: props.pagination.sizes[0],
        order: 'create_time asc',
        loading: {
            data: false,
            page: false,
        },
        selection: [],
    },
    // 配置
    config: {
        table: {
            defaultSort: {
                prop: 'id',
                order: 'descending'
            },
            rowStyle: {
                backgroundColor: `rgba(var(--bs-primary-rgb), 0.64)`,
            },
            cellStyle: {
                backgroundColor: 'transparent',
                border: 'unset',
            },
            headerRowStyle: {
                backgroundColor: 'transparent !important',
            },
            headerCellStyle: {
                backgroundColor: `rgba(var(--bs-primary-rgb), 0.8)`,
                border: 'unset',
            },
            style: {
                background: `rgba(var(--bs-primary-rgb), 0.52)`,
                backdropFilter: 'blur(10px)',
            },
            ...props.table
        },
        pagination: {
            count: 5,
            single: true,
            class: 'custom',
            background: true,
            sizes: [10, 50, 100, 500],
            layout: 'sizes, prev, pager, next',
            ...props.pagination
        },
        opts: {
            url   : '',
            method: 'get',
            params: {},
            headers: {},
            columns: [],
            menu: {},
            ...props.opts
        },
    },
})

const error = ref(false)
const errorMessage = ref('')

const method = {
    init   : async (page = state.item.page.code, limit = state.item.limit) => {
        // 数据加载中
        state.item.loading.data = true
        error.value = false

        try {
            const { data, code, msg } = await request[state.config.opts.method](state.config.opts.url, {
                page, limit, order: state.item.order, ...state.config.opts.params
            })

            // 数据加载失败
            if (!utils.in.array(code, [200, 204])) {
                throw new Error(msg || '数据加载失败')
            }

            state.item.data       = data.data || []
            state.item.count      = data.count || 0
            state.item.page.total = data.page || Math.ceil((data.count || 0) / limit) || 1

            // 更新页码
            state.item.page.code   = page
        } catch (err) {
            console.error('数据加载失败:', err)
            error.value = true
            errorMessage.value = err.message || '网络错误，请稍后重试'
            state.item.data = []
            state.item.count = 0
            state.item.page.total = 1
        } finally {
            // 数据加载动画
            state.item.loading.data = false
            // 页码加载动画
            state.item.loading.page = false
        }
    },
    // 是否为空
    empty  : value => utils.is.empty(value),
    // 是否在数组中
    inArray: (value, array) => utils.in.array(value, array),
    // 格式化数字
    format : value => utils.format.number(value),
    // 时间戳转人性化时间
    nature : value => utils.time.nature(value),
}

const handle = {
    // 分页大小改变
    sizeChange: val => {
        state.item.limit = val
        method.init()
    },
    // 页码改变
    currentChange: val => method.init(val),
    // 选中
    selectionChange(selection) {
        state.item.selection = selection
        emit('selection:change', selection)
    },
    // 选择单行
    select(row) {
        if (state.item.loading.data) return
        const index = state.item.selection.findIndex(item => item.id === row.id)
        if (index > -1) {
            state.item.selection.splice(index, 1)
        } else {
            state.item.selection.push(row)
        }
        emit('selection:change', state.item.selection)
    },
    // 全选/取消全选
    selectAll(e) {
        if (state.item.loading.data) return
        if (e.target.checked) {
            state.item.selection = [...state.item.data]
        } else {
            state.item.selection = []
        }
        emit('selection:change', state.item.selection)
    },
    // 清除选择
    clearSelection() {
        state.item.selection = []
        emit('selection:change', [])
    },
}

// 计算总列数（包括自定义插槽和多选列）
const totalColumns = computed(() => {
    let count = state.config.opts.columns.length + 2 // 2 是自定义插槽的数量（start 和 end）
    if (state.config.opts.selection) {
        count += 1 // 加上多选列
    }
    return count
})

// 计算是否全选
const isAllSelected = computed(() => {
    return state.item.data.length > 0 && state.item.selection.length === state.item.data.length
})

// 检查行是否被选中
const isSelected = (row) => {
    return state.item.selection.some(item => item.id === row.id)
}

// 计算页码范围
const pageRange = computed(() => {
    const current = state.item.page.code || 1
    const total = state.item.page.total || 1
    const delta = Math.floor(state.config.pagination.count / 2)
    const range = []
    
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
    }
    
    if (current - delta > 2) {
        range.unshift('...')
    }
    if (current + delta < total - 1) {
        range.push('...')
    }
    
    range.unshift(1)
    if (total > 1) {
        range.push(total)
    }
    
    return range.filter((v, i, a) => a.indexOf(v) === i)
})

// 主动将子组件方法暴露给父组件
defineExpose({
    init: method.init,
    refresh: () => method.init(1, state.item.limit),
    loadData: () => method.init(),
})

// 监听 opts 配置变化，当参数变化时重新加载数据
watch(() => props.opts, () => {
    // 配置变化时刷新数据（从第一页开始）
    method.init(1, state.item.limit)
}, { deep: true })

// 初始化加载数据
method.init()
</script>

<style scoped>
/* 表格容器 */
.table-container {
    width: 100%;
}

/* 加载状态 */
.loading-state {
    min-height: 400px;
}

/* 错误状态 */
.error-state {
    min-height: 400px;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 2rem;
}

/* 批量操作工具栏 */
.batch-operation {
    padding: 0.75rem;
    background-color: rgba(var(--bs-primary-rgb), 0.1);
    border-radius: 0.375rem;
}

/* 表格样式 */
.table {
    margin-bottom: 0;
    font-size: 0.8rem;
}

.table thead th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    padding: 0.5rem 0.75rem;
}

/* 表格容器 */
.table-container {
    width: 100%;
}

/* 表格包装器 */
.table-wrapper {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    background: white;
}

/* 顶部工具栏 */
.table-toolbar {
    padding: 8px 12px;
    border-bottom: 1px solid #ddd;
    background: #f8f9fa;
    display: flex;
    align-items: center;
}

/* 统计信息 */
.table-summary {
    padding: 6px 12px;
    border-bottom: 1px solid #eee;
    font-size: 12px;
    color: #666;
    background: #fff;
}

/* 表格主体 */
.table-content {
    overflow-x: auto;
}

.table {
    margin-bottom: 0;
    width: 100%;
    border-collapse: collapse;
}

.table thead th {
    padding: 8px 12px;
    font-weight: 600;
    text-align: left;
    font-size: 13px;
    color: #333;
    background: #fff;
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #eee;
    white-space: nowrap;
}

.table thead th:last-child {
    border-right: none;
}

.table tbody td {
    padding: 10px 12px;
    font-size: 13px;
    color: #333;
    border-bottom: 1px solid #eee;
    border-right: 1px solid #eee;
    vertical-align: middle;
}

.table tbody td:last-child {
    border-right: none;
}

.table tbody tr {
    transition: background-color 0.15s ease;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

/* 排序图标 */
.sort-icon {
    display: inline-flex;
    flex-direction: column;
    font-size: 10px;
    color: #999;
    margin-left: 4px;
    opacity: 0.5;
}

.sort-icon i {
    line-height: 7px;
}

/* 底部工具栏 */
.table-footer {
    padding: 8px 12px;
    border-top: 1px solid #ddd;
    background: #f8f9fa;
    display: flex;
    align-items: center;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #999;
}

/* 分页样式 */
.pagination {
    margin: 0;
}

.pagination .page-link {
    padding: 4px 10px;
    font-size: 12px;
    line-height: 1.4;
    border-radius: 3px;
    color: #333;
    border: 1px solid #ddd;
    margin: 0 1px;
}

.pagination .page-item.active .page-link {
    background-color: #0d6efd;
    border-color: #0d6efd;
    color: white;
}

.pagination .page-link:hover {
    background-color: #e9ecef;
}

.pagination .page-item.disabled .page-link {
    color: #999;
    cursor: not-allowed;
}

/* 状态提示 */
.loading-state,
.error-state {
    min-height: 150px;
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
    .table-wrapper {
        border-color: rgba(255, 255, 255, 0.1);
        background: #1a1a1a;
    }

    .table-toolbar {
        border-bottom-color: rgba(255, 255, 255, 0.1);
        background: #222;
    }

    .table-summary {
        border-bottom-color: rgba(255, 255, 255, 0.05);
        background: #1a1a1a;
        color: #999;
    }

    .table thead th {
        background: #1a1a1a;
        border-bottom-color: rgba(255, 255, 255, 0.1);
        border-right-color: rgba(255, 255, 255, 0.05);
        color: #ccc;
    }

    .table tbody td {
        border-bottom-color: rgba(255, 255, 255, 0.05);
        border-right-color: rgba(255, 255, 255, 0.05);
        color: #ccc;
    }

    .table tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .table-footer {
        border-top-color: rgba(255, 255, 255, 0.1);
        background: #222;
    }

    .pagination .page-link {
        border-color: rgba(255, 255, 255, 0.2);
        color: #ccc;
    }

    .pagination .page-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
}
</style>
