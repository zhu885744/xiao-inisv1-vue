<template>
    <div class="card mt-2">
        <div class="card-body">
        <div class="row d-none d-lg-flex">
            <div class="col-lg-6 d-flex align-items-center">
                <button type="button" class="btn btn-outline-secondary me-2" disabled>{{ state.item.title }}</button>
                <div class="dropdown me-2" v-if="state.item.tabs !== 'setting'">
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
                        placeholder="网站名称 | 链接 | 描述"
                        autocomplete="off"
                    >
                </div>
                <button class="btn btn-outline-secondary me-2" @click="method.refresh()">刷新</button>
                <button class="btn btn-primary" v-if="!utils.in.array(['remove','setting'], state.item.tabs)" @click="method.add()">添加</button>
            </div>
        </div>
        </div>
    </div>    
        <div class="row mt-3">
            <div class="col-12">
                <div class="border rounded-lg overflow-hidden">
                    <!-- 标签页导航 -->
                    <ul class="nav nav-tabs" id="linksTabs" role="tablist">
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
                                :class="{ active: state.item.tabs === 'check' }"
                                id="check-tab" 
                                data-bs-toggle="tab" 
                                data-bs-target="#check" 
                                type="button" 
                                role="tab" 
                                aria-controls="check"
                                @click="state.item.tabs = 'check'; method.change('check')"
                            >
                                已通过
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button 
                                class="nav-link" 
                                :class="{ active: state.item.tabs === 'audit' }"
                                id="audit-tab" 
                                data-bs-toggle="tab" 
                                data-bs-target="#audit" 
                                type="button" 
                                role="tab" 
                                aria-controls="audit"
                                @click="state.item.tabs = 'audit'; method.change('audit')"
                            >
                                待审核
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
                        <li class="nav-item" role="presentation">
                            <button 
                                class="nav-link" 
                                :class="{ active: state.item.tabs === 'setting' }"
                                id="setting-tab" 
                                data-bs-toggle="tab" 
                                data-bs-target="#setting" 
                                type="button" 
                                role="tab" 
                                aria-controls="setting"
                                @click="state.item.tabs = 'setting'; method.change('setting')"
                            >
                                分组管理
                            </button>
                        </li>
                    </ul>
                    
                    <!-- 标签页内容 -->
                    <div class="tab-content" id="linksTabsContent">
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'all', show: state.item.tabs === 'all' }"
                            id="all" 
                            role="tabpanel" 
                            aria-labelledby="all-tab"
                        >
                            <table-links :params="state.params.all" :init="state.tabs.all" @refresh="method.refresh" @edit="method.showLinkModal" :ref="el => refs.all = el" type="all"></table-links>
                        </div>
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'check', show: state.item.tabs === 'check' }"
                            id="check" 
                            role="tabpanel" 
                            aria-labelledby="check-tab"
                        >
                            <table-links :params="state.params.check" :init="state.tabs.check" @refresh="method.refresh" @edit="method.showLinkModal" :ref="el => refs.check = el" type="all"></table-links>
                        </div>
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'audit', show: state.item.tabs === 'audit' }"
                            id="audit" 
                            role="tabpanel" 
                            aria-labelledby="audit-tab"
                        >
                            <table-links :params="state.params.audit" :init="state.tabs.audit" @refresh="method.refresh" @edit="method.showLinkModal" :ref="el => refs.audit = el" type="all"></table-links>
                        </div>
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'remove', show: state.item.tabs === 'remove' }"
                            id="remove" 
                            role="tabpanel" 
                            aria-labelledby="remove-tab"
                        >
                            <table-links :params="state.params.remove" :init="state.tabs.remove" @refresh="method.refresh" @edit="method.showLinkModal" :ref="el => refs.remove = el" type="remove"></table-links>
                        </div>
                        <div 
                            class="tab-pane p-4" 
                            :class="{ active: state.item.tabs === 'setting', show: state.item.tabs === 'setting' }"
                            id="setting" 
                            role="tabpanel" 
                            aria-labelledby="setting-tab"
                        >
                            <div class="row">
                                <div class="col-md-12">
                                    <h5 class="mb-3">友链分组管理</h5>
                                    <div class="card mb-4">
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between align-items-center mb-3">
                                                <h6 class="card-title mb-0">分组列表</h6>
                                                <button class="btn btn-sm btn-primary" @click="method.showGroupModal()">
                                                    <i class="bi bi-plus me-1"></i> 添加分组
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
                                                            <td>
                                                                <div class="btn-group" role="group">
                                                                    <button class="btn btn-sm btn-outline-primary" @click="method.showGroupModal(group)">
                                                                        <i class="bi bi-pencil"></i>
                                                                    </button>
                                                                    <button class="btn btn-sm btn-outline-danger ms-1" @click="method.deleteGroup(group.id)">
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
                                <label for="groupName" class="form-label">分组名称</label>
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

        <!-- 友链编辑模态框 -->
        <div class="modal fade" id="linkModal" tabindex="-1" aria-labelledby="linkModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="linkModalLabel">{{ state.linkModal.id ? '编辑友链' : '添加友链' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="method.saveLink">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="linkNickname" class="form-label">
                                            <span class="text-danger me-1">*</span>
                                            <span>网站名称</span>
                                        </label>
                                        <input type="text" class="form-control" id="linkNickname" v-model="state.linkModal.nickname" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="linkUrl" class="form-label">
                                            <span class="text-danger me-1">*</span>
                                            <span>网站链接</span>
                                        </label>
                                        <input type="url" class="form-control" id="linkUrl" v-model="state.linkModal.url" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="linkAvatar" class="form-label">网站图标</label>
                                        <input type="text" class="form-control" id="linkAvatar" v-model="state.linkModal.avatar" placeholder="输入图标URL">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="linkTarget" class="form-label">打开方式</label>
                                        <select v-model="state.linkModal.target" class="form-select" id="linkTarget">
                                            <option value="_blank">新窗口打开 (_blank)</option>
                                            <option value="_self">当前窗口打开 (_self)</option>
                                            <option value="_parent">父窗口打开 (_parent)</option>
                                            <option value="_top">顶级窗口打开 (_top)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="linkGroup" class="form-label">分组</label>
                                        <select v-model="state.linkModal.group" class="form-select" id="linkGroup">
                                            <option value="">请选择分组</option>
                                            <option v-for="item in state.groups" :key="item.id" :value="item.id">
                                                {{ item.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div v-if="state.user?.result?.auth?.all === true" class="col-md-6">
                                    <div class="mb-3">
                                        <label for="linkAudit" class="form-label">审核状态</label>
                                        <select v-model="state.linkModal.audit" class="form-select" id="linkAudit">
                                            <option value="0">待审核</option>
                                            <option value="1">已通过</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="linkDescription" class="form-label">网站描述</label>
                                        <textarea class="form-control" id="linkDescription" v-model="state.linkModal.description" rows="3"></textarea>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="linkRemark" class="form-label">审核备注</label>
                                        <textarea class="form-control" id="linkRemark" v-model="state.linkModal.remark" rows="2"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                                <button type="submit" class="btn btn-primary">{{ state.linkModal.id ? '更新' : '保存' }}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import utils from '@/utils/utils'
import { push } from '@/utils/route'
import TableLinks from '@/comps/admin/table/links.vue'
import cache from '@/utils/cache.js'
import { usePageTitle } from '@/utils/usePageTitle'
import axios from '@/utils/request.js'

// 组件引用
const refs = {
  all: ref(null),
  check: ref(null),
  audit: ref(null),
  remove: ref(null)
}

// 页面标题管理
const { setDynamicTitle } = usePageTitle()

// 设置页面标题
setDynamicTitle('友链管理')

const state  = reactive({
    user: cache.get('user-info'),
    item: {
        timer : null,
        title : '友链列表',
        search: null,
        sort  : '排序',
        tabs  : 'all',
    },
    params: {
        all: {
            order: 'create_time desc'
        },
        check: {
            order: 'create_time desc',
            where: [['audit','=',1]]
        },
        audit: {
            order: 'create_time desc',
            where: [['audit','=',0]]
        },
        remove: {
            order: 'create_time desc',
            withTrashed: true
        },
    },
    tabs: {
        all: false,
        check: false,
        audit: false,
        remove: false,
    },
    groups: [],
    groupModal: {
        id: null,
        name: '',
        description: '',
        avatar: ''
    },
    linkModal: {
        id: null,
        nickname: '',
        url: '',
        description: '',
        avatar: '',
        target: '_blank',
        group: '',
        audit: 0,
        remark: ''
    }
})

// 方法
const method = {
    // 设置排序方式
    order(order = 'create_time asc', sort = '排序') {
        state.item.sort = sort
        for (let item in state.params) state.params[item].order = order
        // 指定刷新
        method.refresh('all', 'check', 'audit', 'remove')
    },
    // 添加
    add: () => method.showLinkModal(),
    // 显示友链编辑模态框
    showLinkModal: (link = null) => {
        if (link) {
            state.linkModal = { ...link }
        } else {
            state.linkModal = {
                id: null,
                nickname: '',
                url: '',
                description: '',
                avatar: '',
                target: '_blank',
                group: '',
                audit: 0,
                remark: ''
            }
        }
        // 初始化模态框
        if (window.bootstrap) {
            const modalElement = document.getElementById('linkModal')
            const modal = new window.bootstrap.Modal(modalElement)
            modal.show()
        }
    },
    // 保存友链
    saveLink: async () => {
        try {
            // 验证必填字段
            if (utils.is.empty(state.linkModal.nickname)) {
                alert('请输入网站名称')
                return
            }
            if (utils.is.empty(state.linkModal.url)) {
                alert('请输入网站链接')
                return
            }
            
            let response
            if (state.linkModal.id) {
                // 更新友链
                response = await axios.put('/api/links/update', state.linkModal)
            } else {
                // 创建友链
                response = await axios.post('/api/links/create', state.linkModal)
            }
            
            if (response.code === 200) {
                // 关闭模态框
                if (window.bootstrap) {
                    const modalElement = document.getElementById('linkModal')
                    const modal = window.bootstrap.Modal.getInstance(modalElement)
                    modal.hide()
                }
                // 刷新友链数据
                method.refresh('all', 'check', 'audit', 'remove')
            } else {
                alert('操作失败：' + response.msg)
            }
        } catch (error) {
            console.error('保存友链失败:', error)
            alert('操作失败：' + error.message)
        }
    },
    // 刷新
    refresh(...args) {
        // 允许刷新的参数
        let allow = ['all', 'check', 'audit' , 'remove']
        // 如果没有传参则刷新所有
        if (args.length === 0) args = allow
        // 如果传参则过滤不允许的参数
        else args = args.filter(item => allow.includes(item))
        // 批量刷新
        for (let item of args) {
            if (refs[item]) {
                // 优先使用refresh方法
                if (typeof refs[item].refresh === 'function') {
                    refs[item].refresh()
                } else {
                    refs[item].init()
                }
            }
        }
    },
    // 加载数据
    loadData(...args) {
        // 允许加载的参数
        let allow = ['all', 'check', 'audit' , 'remove']
        // 如果没有传参则加载所有
        if (args.length === 0) args = allow
        // 如果传参则过滤不允许的参数
        else args = args.filter(item => allow.includes(item))
        // 批量加载
        for (let item of args) {
            if (refs[item]) {
                // 优先使用loadData方法
                if (typeof refs[item].loadData === 'function') {
                    refs[item].loadData()
                } else {
                    refs[item].init()
                }
            }
        }
    },
    // 切换 tab
    change: (name) => state.tabs[name] = true,
    // 加载分组数据
    loadGroups: async () => {
        try {
            const { data, code } = await axios.get('/api/links-group/all')
            if (code === 200) {
                state.groups = data.data || []
            }
        } catch (error) {
            console.error('加载分组失败:', error)
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
                await method.loadGroups()
            } else {
                alert('操作失败：' + response.msg)
            }
        } catch (error) {
            console.error('保存分组失败:', error)
            alert('操作失败：' + error.message)
        }
    },
    // 删除分组
    deleteGroup: async (id) => {
        if (!confirm('确定要删除这个分组吗？')) return
        
        try {
            const { code, msg } = await axios.del('/api/links-group/remove', { ids: [id] })
            if (code === 200) {
                // 重新加载分组数据
                await method.loadGroups()
            } else {
                alert('删除失败：' + msg)
            }
        } catch (error) {
            console.error('删除分组失败:', error)
            alert('删除失败：' + error.message)
        }
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

    const allow = ['all', 'check', 'audit', 'remove']

    let root = state.user?.result?.auth?.all ?? false
    if (!root) {
        for (let item of allow) state.params[item].where.push(['uid', '=', state.user?.id])
    }

    state.tabs.all = true
    // 加载分组数据
    await method.loadGroups()
})

watch(() => state.item.search, (val) => {
    const allow = ['all', 'check', 'audit', 'remove']

    for (let item of allow) {
        if (!utils.is.empty(val)) state.params[item].like = [
            ['nickname'  , `%${val}%`],
            ['url' , `%${val}%`],
            ['description', `%${val}%`],
        ]
        else delete state.params[item].like
    }

    // 防抖 - 没变化的 500ms 后再刷新
    clearTimeout(state.item.timer)
    state.item.timer = setTimeout(() => method.refresh(...allow), globalThis.inis?.lazy_time ?? 500)
})

// 监听标签页切换，加载分组数据
watch(() => state.item.tabs, (val) => {
    if (val === 'setting') {
        method.loadGroups()
    }
})
</script>