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
                        placeholder="标题 | 内容 | 备注"
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
                    <ul class="nav nav-tabs" id="articleTabs" role="tablist">
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
                                审核通过
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
                                等待审核
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
                                设置
                            </button>
                        </li>
                    </ul>
                    
                    <!-- 标签页内容 -->
                    <div class="tab-content" id="articleTabsContent">
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'all', show: state.item.tabs === 'all' }"
                            id="all" 
                            role="tabpanel" 
                            aria-labelledby="all-tab"
                        >
                            <table-article :params="state.params.all" :init="state.tabs.all" @refresh="method.refresh" :ref="el => refs.all = el"></table-article>
                        </div>
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'check', show: state.item.tabs === 'check' }"
                            id="check" 
                            role="tabpanel" 
                            aria-labelledby="check-tab"
                        >
                            <table-article :params="state.params.check" :init="state.tabs.check" @refresh="method.refresh" :ref="el => refs.check = el"></table-article>
                        </div>
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'audit', show: state.item.tabs === 'audit' }"
                            id="audit" 
                            role="tabpanel" 
                            aria-labelledby="audit-tab"
                        >
                            <table-article :params="state.params.audit" :init="state.tabs.audit" @refresh="method.refresh" :ref="el => refs.audit = el"></table-article>
                        </div>
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'remove', show: state.item.tabs === 'remove' }"
                            id="remove" 
                            role="tabpanel" 
                            aria-labelledby="remove-tab"
                        >
                            <table-article :params="state.params.remove" :init="state.tabs.remove" @refresh="method.refresh" :ref="el => refs.remove = el" type="remove"></table-article>
                        </div>
                        <div 
                            class="tab-pane p-4" 
                            :class="{ active: state.item.tabs === 'setting', show: state.item.tabs === 'setting' }"
                            id="setting" 
                            role="tabpanel" 
                            aria-labelledby="setting-tab"
                        >
                            <div class="row">
                                <div class="col-md-4">
                                    <atom-article :ref="el => refs.article = el"></atom-article>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import utils from '@/utils/utils'
import { push } from '@/utils/route'
import AtomArticle from '@/comps/admin/atom/article.vue'
import TableArticle from '@/comps/admin/table/article.vue'
import cache from '@/utils/cache.js'
import { usePageTitle } from '@/utils/usePageTitle'

// 组件引用
const refs = {
  all: ref(null),
  check: ref(null),
  audit: ref(null),
  remove: ref(null),
  article: ref(null)
}

// 页面标题管理
const { setDynamicTitle } = usePageTitle()

// 设置页面标题
setDynamicTitle('文章管理')

const state  = reactive({
    user: cache.get('user-info'),
    item: {
        timer : null,
        title : '文章列表',
        search: null,
        sort  : '排序',
        tabs  : 'all',
    },
    params: {
        all: {
            order: 'top desc, id desc'
        },
        check: {
            order: 'top desc, id desc',
            where: [['audit','=',1]]
        },
        audit: {
            order: 'top desc, id desc',
            where: [['audit','=',0]]
        },
        remove: {
            order: 'top desc, id desc',
            onlyTrashed: true
        },
    },
    tabs: {
        all: false,
        check: false,
        audit: false,
        remove: false,
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
    add: () => push({ name: 'admin-article-write' }),
    // 刷新
    refresh(...args) {
        // 允许刷新的参数
        let allow = ['all', 'check', 'audit' , 'remove', 'article']
        // 如果没有传参则刷新所有
        if (args.length === 0) args = allow
        // 如果传参则过滤不允许的参数
        else args = args.filter(item => allow.includes(item))
        // 批量刷新
        for (let item of args) {
            if (refs[item]) {
                refs[item].init()
            }
        }
    },
    // 切换 tab
    change: (name) => state.tabs[name] = true
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
})

watch(() => state.item.search, (val) => {
    const allow = ['all', 'check', 'audit', 'remove']

    for (let item of allow) {
        if (!utils.is.empty(val)) state.params[item].like = [
            ['title'  , `%${val}%`],
            ['remark' , `%${val}%`],
            ['content', `%${val}%`],
        ]
        else delete state.params[item].like
    }

    // 防抖 - 没变化的 500ms 后再刷新
    clearTimeout(state.item.timer)
    state.item.timer = setTimeout(() => method.refresh(...allow), globalThis.inis?.lazy_time ?? 500)
})
</script>

<style scoped>
/* 自定义样式 */
.nav-tabs {
    border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-link {
    border: 1px solid transparent;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
}

.nav-tabs .nav-link.active {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
}

.tab-content {
    padding: 1rem;
    background-color: #fff;
}
</style>