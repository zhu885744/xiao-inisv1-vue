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
            <button class="btn btn-primary mt-3" @click="method.init()">重新加载</button>
        </div>
        
        <!-- 表格 -->
        <div v-else class="table-responsive">
            <table class="table table-striped table-hover table-bordered">
                <thead class="table-primary">
                    <tr>
                        <!-- 自定义列 - 开始位置 -->
                        <slot name="start-header"></slot>

                        <!-- 表格列 -->
                        <th 
                            v-for="(column, index) in state.config.opts.columns" 
                            :key="index"
                            :class="[column.class, utils.inArray(column.prop, ['create_time', 'update_time']) ? 'text-center' : column.align || 'text-start']"
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
                        <!-- 自定义列 - 开始位置 -->
                        <slot name="start" :scope="row"></slot>

                        <!-- 表格数据 -->
                        <td 
                            v-for="(column, index) in state.config.opts.columns" 
                            :key="index"
                            :class="[column.class, utils.inArray(column.prop, ['create_time', 'update_time']) ? 'text-center' : column.align || 'text-start']"
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
                        <li class="page-item" :class="{ disabled: state.item.page.code === 1 }">
                            <button class="page-link" @click="handle.currentChange(state.item.page.code - 1)" :disabled="state.item.page.code === 1">
                                上一页
                            </button>
                        </li>
                        
                        <li 
                            v-for="page in pageRange" 
                            :key="page"
                            class="page-item" 
                            :class="{ active: page === state.item.page.code }"
                        >
                            <button class="page-link" @click="handle.currentChange(page)">
                                {{ page }}
                            </button>
                        </li>
                        
                        <li class="page-item" :class="{ disabled: state.item.page.code === state.item.page.total }">
                            <button class="page-link" @click="handle.currentChange(state.item.page.code + 1)" :disabled="state.item.page.code === state.item.page.total">
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

// 计算总列数（包括自定义插槽）
const totalColumns = computed(() => {
    return state.config.opts.columns.length + 2 // 2 是自定义插槽的数量（start 和 end）
})

// 计算页码范围
const pageRange = computed(() => {
    const total = state.item.page.total
    const current = state.item.page.code
    const count = state.config.pagination.count || 5 // 显示5个页码
    
    let start = Math.max(1, current - Math.floor(count / 2))
    let end = Math.min(total, start + count - 1)
    
    // 调整起始位置，确保显示足够的页码
    if (end - start + 1 < count) {
        start = Math.max(1, end - count + 1)
    }
    
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
            state.item.page.total = data.page || 1

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
        method.init(1, state.item.limit)
    },
    // 页码改变
    currentChange: val => method.init(val),
    // 选中
    selectionChange(selection) {
        state.item.selection = selection
        emit('selection:change', selection)
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
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    padding: 1.5rem;
}

/* 表格样式 */
.table {
    margin-bottom: 0;
    border-radius: 0.375rem;
    overflow: hidden;
    transition: all 0.3s ease;
}

.table:hover {
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* 表格头部 */
.table-header {
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

/* 加载状态 */
.loading-state {
    min-height: 200px;
    background-color: #f8f9fa;
    border-radius: 0.375rem;
    transition: all 0.3s ease;
}

/* 错误状态 */
.error-state {
    min-height: 200px;
    background-color: #fff5f5;
    border: 1px solid #f8d7da;
    border-radius: 0.375rem;
    transition: all 0.3s ease;
}

/* 空数据状态 */
.empty-state {
    padding: 2rem 0;
    transition: all 0.3s ease;
}

/* 表格底部 */
.table-footer {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
    margin-top: 1rem;
}

/* 分页样式 */
.pagination {
    margin-bottom: 0;
}

.page-item.active .page-link {
    background-color: #007bff;
    border-color: #007bff;
}

.page-link {
    transition: all 0.2s ease;
}

.page-link:hover {
    background-color: #f8f9fa;
    border-color: #dee2e6;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .table-container {
        padding: 1rem;
    }
    
    .table-responsive {
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
    }
    
    .table-footer {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 1rem !important;
    }
    
    .pagination {
        width: 100%;
        justify-content: center;
    }
    
    .loading-state,
    .error-state {
        min-height: 150px;
        padding: 4rem 2rem;
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

.table,
.loading-state,
.error-state,
.empty-state {
    animation: fadeIn 0.3s ease-in-out;
}
</style>