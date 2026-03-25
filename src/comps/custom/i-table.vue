<!-- 后台管理自定义表格组件 -->
<template>
    <div class="table-container">
        <!-- 加载状态 -->
        <div v-if="state.item.loading.data" class="loading-state d-flex flex-column justify-content-center align-items-center py-8">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">数据加载中...</span>
            </div>
            <p class="mt-3 text-muted">正在加载数据，请稍候...</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state d-flex flex-column justify-content-center align-items-center py-8">
            <div class="text-danger mb-3">
                <i class="bi bi-exclamation-circle" style="font-size: 2rem;"></i>
            </div>
            <p class="text-danger">{{ errorMessage }}</p>
            <button class="btn btn-primary mt-3" @click="method.init">重新加载</button>
        </div>
        
        <!-- 表格 -->
        <div v-else>
            <!-- 批量操作工具栏 -->
            <div v-if="state.config.opts.selection" class="batch-operation mb-3">
                <div class="d-flex align-items-center gap-2">
                    <span class="text-muted">已选择 {{ state.item.selection.length }} 项</span>
                    <button 
                        v-if="state.item.selection.length > 0" 
                        class="btn btn-outline-secondary btn-sm" 
                        @click="handle.clearSelection"
                        :disabled="state.item.loading.data"
                    >
                        清除选择
                    </button>
                    <slot name="batch-operations" :disabled="state.item.selection.length === 0 || state.item.loading.data"></slot>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-striped table-hover table-bordered">
                <thead class="table-primary">
                    <tr>
                        <!-- 多选列 -->
                        <th v-if="state.config.opts.selection" class="text-center" style="width: 50px;">
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
                        </th>

                        <!-- 自定义列 - 结束位置 -->
                        <slot name="end-header"></slot>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in state.item.data" :key="rowIndex">
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
                        <td :colspan="totalColumns" class="text-center py-5">
                            <div class="empty-state">
                                <i class="bi bi-database" style="font-size: 2rem; color: #ced4da;"></i>
                                <p class="mt-2 text-muted">暂无数据</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
        
        <!-- 分页和统计信息 -->
        <div v-if="!state.item.loading.data && !error" class="table-footer mt-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <!-- 统计信息 -->
            <div v-if="state.item.count > 0" class="text-muted">
                共 <strong>{{ state.item.count }}</strong> 条数据
            </div>
            
            <!-- 分页控制 -->
            <div class="d-flex align-items-center gap-3">
                <!-- 每页显示条数选择 -->
                <div class="d-flex align-items-center">
                    <select id="pageSize" class="form-select form-select-sm" v-model="state.item.limit" @change="handle.sizeChange">
                        <option v-for="size in state.config.pagination.sizes" :key="size" :value="size">
                            {{ size }}
                        </option>
                    </select>
                </div>
                
                <!-- 分页导航 -->
                <nav v-if="state.item.page.total > 1" aria-label="Page navigation">
                    <ul class="pagination mb-0">
                        <li class="page-item" :class="{ disabled: (state.item.page.code || 1) === 1 }">
                            <button class="page-link" @click="() => handle.currentChange((state.item.page.code || 1) - 1)" :disabled="(state.item.page.code || 1) === 1">
                                上一页
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
                                下一页
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import utils from '@/utils/utils'
import axios from '@/utils/request'

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
            style: {
                background: `rgba(var(--theme-color), calc(var(--theme-opacity) * 0.15))`,
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

// 响应式状态
const error = ref(false)
const errorMessage = ref('')

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
            style: {
                background: `rgba(var(--theme-color), calc(var(--theme-opacity) * 0.15))`,
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
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
    const total = state.item.page.total || 1
    const current = state.item.page.code || 1
    const count = state.config.pagination.count || 5 // 显示5个页码
    
    // 处理总页数为0的情况
    if (total <= 0) {
        return []
    }
    
    // 计算起始页码
    let start = Math.max(1, current - Math.floor(count / 2))
    // 计算结束页码
    let end = Math.min(total, start + count - 1)
    
    // 调整起始位置，确保显示足够的页码
    if (end - start + 1 < count) {
        start = Math.max(1, end - count + 1)
    }
    
    // 生成页码数组
    const range = []
    for (let i = start; i <= end; i++) {
        range.push(i)
    }
    return range
})

const method = {
    init   : async (page = state.item.page.code, limit = state.item.limit) => {

        // 数据加载中
        state.item.loading.data = true
        error.value = false
        errorMessage.value = ''
        // 清空选中项
        state.item.selection = []
        emit('selection:change', [])

        try {
            let response;
            if (state.config.opts.method === 'get') {
                // GET 请求：参数作为 URL 查询参数
                response = await axios[state.config.opts.method](state.config.opts.url, {
                    params: {
                        ...state.config.opts.params,
                        page, 
                        limit, 
                        order: state.item.order
                    }
                });
            } else {
                // 其他请求（包括 DELETE）：参数作为请求体
                response = await axios[state.config.opts.method](state.config.opts.url, {
                    ...state.config.opts.params,
                    page, 
                    limit, 
                    order: state.item.order
                });
            }
            const { data, code, msg } = response;

            // 数据加载失败
            if (!utils.inArray(code, [200, 204])) {
                throw new Error(msg || '数据加载失败')
            }

            state.item.data       = data.data || []
            state.item.count      = data.count || 0
            // 计算总页数，如果后端没有返回 page 字段
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
    }
}

const handle = {
    // 分页大小改变
    sizeChange: () => {
        // 清空选中项
        state.item.selection = []
        emit('selection:change', [])
        method.init(1, state.item.limit)
    },
    // 页码改变
    currentChange: val => {
        // 清空选中项
        state.item.selection = []
        emit('selection:change', [])
        method.init(val)
    },
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

// 主动将子组件方法暴露给父组件
defineExpose({
    init: method.init,
    refresh: () => method.init(),
    loadData: () => method.init(),
})

// 初始化加载数据
method.init()
</script>

<style scoped>
/* 表格容器 */
.table-container {
    width: 100%;
    background-color: var(--bs-body-bg);
    border-radius: 0.75rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    padding: 1.5rem;
    border: 1px solid var(--bs-border-color);
    transition: all 0.3s ease;
}

.table-container:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

/* 批量操作工具栏 */
.batch-operation {
    padding: 1rem;
    background-color: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
}

.batch-operation:hover {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border-color: var(--bs-primary);
}

/* 表格样式 */
.table {
    margin-bottom: 0;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid var(--bs-border-color);
}

.table:hover {
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* 表格头部 */
.table thead {
    background-color: var(--bs-primary);
    color: white;
}

.table thead th {
    border-bottom: none;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
}

/* 表格行 */
.table tbody tr {
    transition: all 0.2s ease;
}

.table tbody tr:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.05);
}

/* 表格单元格 */
.table td,
.table th {
    vertical-align: middle;
    padding: 0.75rem 1rem;
}

/* 加载状态 */
.loading-state {
    min-height: 200px;
    background-color: var(--bs-tertiary-bg);
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    border: 1px solid var(--bs-border-color);
}

/* 错误状态 */
.error-state {
    min-height: 200px;
    background-color: rgba(var(--bs-danger-rgb), 0.1);
    border: 1px solid var(--bs-danger-border-subtle);
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

/* 空数据状态 */
.empty-state {
    padding: 3rem 0;
    transition: all 0.3s ease;
    color: var(--bs-secondary-color);
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

/* 表格底部 */
.table-footer {
    border-top: 1px solid var(--bs-border-color);
    padding-top: 1rem;
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

/* 分页样式 */
.pagination {
    margin-bottom: 0;
}

.page-item.active .page-link {
    background-color: var(--bs-primary);
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.page-link {
    transition: all 0.2s ease;
    color: var(--bs-primary);
    border-color: var(--bs-border-color);
}

.page-link:hover {
    background-color: var(--bs-tertiary-bg);
    border-color: var(--bs-primary);
    transform: translateY(-1px);
}

.page-link:focus {
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .table-container {
        padding: 0.75rem;
        border-radius: 0.5rem;
    }
    
    .table-responsive {
        border: 1px solid var(--bs-border-color);
        border-radius: 0.5rem;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
    }
    
    /* 优化滚动条样式 */
    .table-responsive::-webkit-scrollbar {
        height: 6px;
    }
    
    .table-responsive::-webkit-scrollbar-track {
        background: var(--bs-tertiary-bg);
        border-radius: 3px;
    }
    
    .table-responsive::-webkit-scrollbar-thumb {
        background: var(--bs-border-color);
        border-radius: 3px;
    }
    
    .table-responsive::-webkit-scrollbar-thumb:hover {
        background: var(--bs-secondary-color);
    }
    
    .table-footer {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 0.75rem !important;
        padding-top: 0.75rem;
    }
    
    .pagination {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .page-item {
        margin: 0 2px;
    }
    
    .page-link {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
    }
    
    .loading-state,
    .error-state {
        min-height: 120px;
        padding: 3rem 1.5rem;
    }
    
    .table td,
    .table th {
        padding: 0.5rem 0.625rem;
        font-size: 0.8125rem;
    }
    
    .batch-operation {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
    }
    
    /* 优化空数据状态 */
    .empty-state {
        padding: 2rem 0;
    }
    
    .empty-state i {
        font-size: 2.5rem;
    }
}

/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.table,
.loading-state,
.error-state,
.empty-state {
    animation: fadeIn 0.3s ease-in-out;
}

.loading-state .spinner-border {
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
}

/* 复选框样式 */
.form-check-input {
    transition: all 0.2s ease;
}

.form-check-input:checked {
    background-color: var(--bs-primary);
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.form-check-input:focus {
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}
</style>