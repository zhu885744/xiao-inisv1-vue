<template>
    <div class="card mt-2">
        <div class="card-body">
            <div class="row d-none d-lg-flex">
                <div class="col-lg-6 d-flex align-items-center">
                    <button type="button" class="btn btn-outline-secondary me-2" disabled>{{ state.item.title }}</button>
                    <div class="dropdown me-2">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            {{ state.item.sort }}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                            <li><button class="dropdown-item" @click="method.order('create_time desc', '最新')">最新</button></li>
                            <li><button class="dropdown-item" @click="method.order('create_time asc', '最早')">最早</button></li>
                        </ul>
                    </div>
                    <div class="me-2 flex-grow-1" style="max-width: 200px;">
                        <input 
                            v-model="state.item.search" 
                            class="form-control" 
                            type="text" 
                            placeholder="分组名称 | 描述"
                            autocomplete="off"
                        >
                    </div>
                    <button class="btn btn-outline-secondary me-2" @click="method.refresh()">刷新</button>
                    <button class="btn btn-primary" @click="method.showGroupModal()">添加分组</button>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col-12">
            <div class="border rounded-3 overflow-hidden">
                <!-- 标签页导航 -->
                <ul class="nav nav-tabs" id="groupTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button 
                            class="nav-link" 
                            :class="{ active: state.item.tabs === 'all' }"
                            id="all-tab" 
                            data-bs-toggle="tab" 
                            data-bs-target="#all" 
                            type="button" 
                            role="tab" 
                            aria-controls="all" 
                            aria-selected="true"
                            @click="state.item.tabs = 'all'; method.change('all')"
                        >
                            全部
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button 
                            class="nav-link" 
                            :class="{ active: state.item.tabs === 'remove' }"
                            id="remove-tab" 
                            data-bs-toggle="tab" 
                            data-bs-target="#remove" 
                            type="button" 
                            role="tab" 
                            aria-controls="remove"
                            @click="state.item.tabs = 'remove'; method.change('remove')"
                        >
                            回收站
                        </button>
                    </li>
                </ul>
                
                <!-- 标签页内容 -->
                <div class="tab-content" id="groupTabsContent">
                    <div 
                        class="tab-pane" 
                        :class="{ active: state.item.tabs === 'all', show: state.item.tabs === 'all' }"
                        id="all" 
                        role="tabpanel" 
                        aria-labelledby="all-tab"
                    >
                        <div class="p-4">
                            <div class="table-responsive">
                                <table class="table table-hover table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>分组名称</th>
                                            <th>描述</th>
                                            <th>图标</th>
                                            <th>创建时间</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="group in state.groups" :key="group.id">
                                            <td>{{ group.id }}</td>
                                            <td>{{ group.name }}</td>
                                            <td>{{ group.description || '无' }}</td>
                                            <td>
                                                <img v-if="group.avatar" :src="group.avatar" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;" :alt="group.name">
                                                <span v-else class="d-inline-block rounded-circle bg-gray-200 text-gray-500 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                                                    <i class="bi bi-folder"></i>
                                                </span>
                                            </td>
                                            <td>{{ method.formatTime(group.create_time) }}</td>
                                            <td>
                                                <div class="btn-group" role="group">
                                                    <button class="btn btn-sm btn-outline-primary" @click="method.showGroupModal(group)">
                                                        <i class="bi bi-pencil"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-danger ms-1" @click="method.deleteGroup(group.id, true)">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- 分页 -->
                            <div v-if="state.item.count > 0" class="mt-4 d-flex justify-content-between align-items-center">
                                <div class="text-muted">共 <strong>{{ state.item.count }}</strong> 个分组</div>
                                <nav v-if="state.item.page.total > 1" aria-label="Page navigation">
                                    <ul class="pagination mb-0">
                                        <li class="page-item" :class="{ disabled: state.item.page.code === 1 }">
                                            <button class="page-link" @click="method.changePage(state.item.page.code - 1)" :disabled="state.item.page.code === 1">
                                                上一页
                                            </button>
                                        </li>
                                        <li 
                                            v-for="page in state.item.page.range" 
                                            :key="page"
                                            class="page-item" 
                                            :class="{ active: page === state.item.page.code }"
                                        >
                                            <button class="page-link" @click="method.changePage(page)">{{ page }}</button>
                                        </li>
                                        <li class="page-item" :class="{ disabled: state.item.page.code === state.item.page.total }">
                                            <button class="page-link" @click="method.changePage(state.item.page.code + 1)" :disabled="state.item.page.code === state.item.page.total">
                                                下一页
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                    <div 
                        class="tab-pane" 
                        :class="{ active: state.item.tabs === 'remove', show: state.item.tabs === 'remove' }"
                        id="remove" 
                        role="tabpanel" 
                        aria-labelledby="remove-tab"
                    >
                        <div class="p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="mb-0">回收站</h6>
                                <button class="btn btn-sm btn-outline-danger" @click="method.clearRecycle">
                                    <i class="bi bi-trash3 me-1"></i> 清空回收站
                                </button>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>分组名称</th>
                                            <th>描述</th>
                                            <th>图标</th>
                                            <th>删除时间</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="group in state.recycleGroups" :key="group.id">
                                            <td>{{ group.id }}</td>
                                            <td>{{ group.name }}</td>
                                            <td>{{ group.description || '无' }}</td>
                                            <td>
                                                <img v-if="group.avatar" :src="group.avatar" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;" :alt="group.name">
                                                <span v-else class="d-inline-block rounded-circle bg-gray-200 text-gray-500 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                                                    <i class="bi bi-folder"></i>
                                                </span>
                                            </td>
                                            <td>{{ method.formatTime(group.delete_time) }}</td>
                                            <td>
                                                <div class="btn-group" role="group">
                                                    <button class="btn btn-sm btn-outline-success" @click="method.restoreGroup(group.id)">
                                                        <i class="bi bi-arrow-clockwise"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-danger ms-1" @click="method.deleteGroup(group.id, false)">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 分组管理模态框 -->
    <div class="modal fade" id="groupModal" tabindex="-1" aria-labelledby="groupModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="groupModalLabel">{{ state.groupModal.id ? '编辑分组' : '添加分组' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="method.saveGroup">
                        <div class="mb-3">
                            <label for="groupName" class="form-label">
                                <span class="text-danger me-1">*</span>
                                <span>分组名称</span>
                            </label>
                            <input type="text" class="form-control" id="groupName" v-model="state.groupModal.name" required>
                        </div>
                        <div class="mb-3">
                            <label for="groupDescription" class="form-label">描述</label>
                            <textarea class="form-control" id="groupDescription" v-model="state.groupModal.description" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="groupAvatar" class="form-label">图标</label>
                            <input type="text" class="form-control" id="groupAvatar" v-model="state.groupModal.avatar" placeholder="输入图标URL">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                            <button type="submit" class="btn btn-primary">{{ state.groupModal.id ? '更新' : '保存' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import utils from '@/utils/utils'
import axios from '@/utils/request.js'
import { usePageTitle } from '@/utils/usePageTitle'

// 页面标题管理
const { setDynamicTitle } = usePageTitle()

// 设置页面标题
setDynamicTitle('友链分组管理')

const state  = reactive({
    item: {
        timer : null,
        title : '友链分组管理',
        search: null,
        sort  : '排序',
        tabs  : 'all',
        limit: 10,
        page: {
            code: 1,
            total: 1,
            range: []
        },
        count: 0
    },
    groups: [],
    recycleGroups: [],
    groupModal: {
        id: null,
        name: '',
        description: '',
        avatar: ''
    },
    params: {
        all: {
            order: 'create_time desc'
        },
        remove: {
            order: 'create_time desc',
            withTrashed: true
        },
    }
})

// 方法
const method = {
    // 设置排序方式
    order(order = 'create_time asc', sort = '排序') {
        state.item.sort = sort
        state.params.all.order = order
        state.params.remove.order = order
        // 刷新数据
        method.loadGroups()
    },
    // 切换 tab
    change: (name) => {
        state.item.tabs = name
        if (name === 'all') {
            method.loadGroups()
        } else if (name === 'remove') {
            method.loadRecycleGroups()
        }
    },
    // 加载分组数据
    loadGroups: async () => {
        try {
            const params = {
                page: state.item.page.code,
                limit: state.item.limit,
                order: state.params.all.order
            }
            
            if (!utils.is.empty(state.item.search)) {
                params.like = [
                    ['name', `%${state.item.search}%`],
                    ['description', `%${state.item.search}%`]
                ]
            }
            
            const { data, code } = await axios.get('/api/links-group/all', { params })
            if (code === 200) {
                state.groups = data.data || []
                state.item.count = data.count || 0
                state.item.page.total = data.page || 1
                state.item.page.range = method.getPageRange()
            }
        } catch (error) {
            console.error('加载分组失败:', error)
        }
    },
    // 加载回收站分组数据
    loadRecycleGroups: async () => {
        try {
            const params = {
                order: state.params.remove.order,
                withTrashed: true
            }
            
            if (!utils.is.empty(state.item.search)) {
                params.like = [
                    ['name', `%${state.item.search}%`],
                    ['description', `%${state.item.search}%`]
                ]
            }
            
            const { data, code } = await axios.get('/api/links-group/all', { params })
            if (code === 200) {
                state.recycleGroups = data.data || []
            }
        } catch (error) {
            console.error('加载回收站分组失败:', error)
        }
    },
    // 显示分组模态框
    showGroupModal: (group = null) => {
        if (group) {
            state.groupModal = { ...group }
        } else {
            state.groupModal = {
                id: null,
                name: '',
                description: '',
                avatar: ''
            }
        }
        // 初始化模态框
        if (window.bootstrap) {
            const modalElement = document.getElementById('groupModal')
            const modal = new window.bootstrap.Modal(modalElement)
            modal.show()
        }
    },
    // 保存分组
    saveGroup: async () => {
        try {
            // 验证必填字段
            if (utils.is.empty(state.groupModal.name)) {
                alert('请输入分组名称')
                return
            }
            
            let response
            if (state.groupModal.id) {
                // 更新分组
                response = await axios.put('/api/links-group/update', state.groupModal)
            } else {
                // 创建分组
                response = await axios.post('/api/links-group/create', state.groupModal)
            }
            
            if (response.code === 200) {
                // 关闭模态框
                if (window.bootstrap) {
                    const modalElement = document.getElementById('groupModal')
                    const modal = window.bootstrap.Modal.getInstance(modalElement)
                    modal.hide()
                }
                // 重新加载分组数据
                method.loadGroups()
            } else {
                alert('操作失败：' + response.msg)
            }
        } catch (error) {
            console.error('保存分组失败:', error)
            alert('操作失败：' + error.message)
        }
    },
    // 删除分组
    deleteGroup: async (id, isSoft = true) => {
        if (!confirm(isSoft ? '确定要将选中的分组移到回收站吗？' : '确定要永久删除选中的分组吗？此操作不可恢复！')) return
        
        try {
            const uri = `/api/links-group/${isSoft ? 'remove' : 'delete'}`
            const { code, msg } = await axios.del(uri, { ids: [id] })
            if (code === 200) {
                // 重新加载分组数据
                method.loadGroups()
                method.loadRecycleGroups()
            } else {
                alert('删除失败：' + msg)
            }
        } catch (error) {
            console.error('删除分组失败:', error)
            alert('删除失败：' + error.message)
        }
    },
    // 恢复分组
    restoreGroup: async (id) => {
        try {
            const { code, msg } = await axios.put('/api/links-group/restore', { ids: [id] })
            if (code === 200) {
                // 重新加载分组数据
                method.loadGroups()
                method.loadRecycleGroups()
            } else {
                alert('恢复失败：' + msg)
            }
        } catch (error) {
            console.error('恢复分组失败:', error)
            alert('恢复失败：' + error.message)
        }
    },
    // 清空回收站
    clearRecycle: async () => {
        if (!confirm('确定要清空回收站吗？此操作将永久删除所有回收站中的分组，不可恢复！')) return
        
        try {
            const { code, msg } = await axios.del('/api/links-group/clear')
            if (code === 200) {
                // 重新加载回收站数据
                method.loadRecycleGroups()
            } else {
                alert('清空失败：' + msg)
            }
        } catch (error) {
            console.error('清空回收站失败:', error)
            alert('清空失败：' + error.message)
        }
    },
    // 刷新数据
    refresh: () => {
        method.loadGroups()
        if (state.item.tabs === 'remove') {
            method.loadRecycleGroups()
        }
    },
    // 切换页码
    changePage: (page) => {
        state.item.page.code = page
        method.loadGroups()
    },
    // 获取页码范围
    getPageRange: () => {
        const total = state.item.page.total
        const current = state.item.page.code
        const count = 5
        
        let start = Math.max(1, current - Math.floor(count / 2))
        let end = Math.min(total, start + count - 1)
        
        if (end - start + 1 < count) {
            start = Math.max(1, end - count + 1)
        }
        
        const range = []
        for (let i = start; i <= end; i++) {
            range.push(i)
        }
        return range
    },
    // 格式化时间戳为YYYY-MM-DD HH:mm:ss
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
    // 初始化Bootstrap组件
    if (window.bootstrap) {
        // 初始化下拉菜单
        const dropdownElementList = document.querySelectorAll('.dropdown-toggle')
        const dropdownList = [...dropdownElementList].map(dropdownToggleEl => new window.bootstrap.Dropdown(dropdownToggleEl))
        
        // 初始化标签页
        const tabElementList = document.querySelectorAll('button[data-bs-toggle="tab"]')
        const tabList = [...tabElementList].map(tabToggleEl => new window.bootstrap.Tab(tabToggleEl))
    }

    // 加载分组数据
    await method.loadGroups()
})

watch(() => state.item.search, (val) => {
    // 防抖 - 没变化的 500ms 后再刷新
    clearTimeout(state.item.timer)
    state.item.timer = setTimeout(() => {
        method.loadGroups()
        if (state.item.tabs === 'remove') {
            method.loadRecycleGroups()
        }
    }, globalThis.inis?.lazy_time ?? 500)
})
</script>