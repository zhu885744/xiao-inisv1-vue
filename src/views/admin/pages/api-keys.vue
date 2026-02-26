<template>
    <div class="main">
      <div class="card mt-2">
        <div class="card-body">
          <div class="row d-none d-lg-flex mb-4 mt-2">
            <div class="col-lg-6 d-flex align-items-center">
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
                        placeholder="备注" 
                        autocomplete="off"
                    >
                </div>
                <button class="btn btn-outline-secondary me-2" @click="method.refresh()">刷新</button>
                <button class="btn btn-primary" v-if="state.item.tabs === 'all'" @click="method.add()">添加</button>
            </div>
            <div class="col-lg-6 d-flex justify-content-end align-items-center">
                <span class="text-muted">{{ state.item.title }}</span>
            </div>
          </div>
        </div>
      </div>
        <div class="row mt-2">
            <div class="col-12">
                <div class="border rounded-lg overflow-hidden">
                    <!-- 标签页导航 -->
                    <ul class="nav nav-tabs" id="apiKeysTabs" role="tablist">
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
                    <div class="tab-content" id="apiKeysTabsContent">
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'all', show: state.item.tabs === 'all' }"
                            id="all" 
                            role="tabpanel" 
                            aria-labelledby="all-tab"
                        >
                            <table-api-keys :params="state.params.all" :init="state.tabs.all" @refresh="method.refresh" ref="allRef"></table-api-keys>
                        </div>
                        <div 
                            class="tab-pane" 
                            :class="{ active: state.item.tabs === 'remove', show: state.item.tabs === 'remove' }"
                            id="remove" 
                            role="tabpanel" 
                            aria-labelledby="remove-tab"
                        >
                            <table-api-keys :params="state.params.remove" :init="state.tabs.remove" @refresh="method.refresh" ref="removeRef" type="remove"></table-api-keys>
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
                                    <atom-api-key ref="apiKeyRef"></atom-api-key>
                                </div>
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
import AtomApiKey from '@/comps/admin/atom/api-key.vue'
import TableApiKeys from '@/comps/admin/table/api-keys.vue'
import cache from '@/utils/cache.js'

// 组件引用
const allRef = ref(null)
const removeRef = ref(null)
const apiKeyRef = ref(null)

const state  = reactive({
    user: cache.get('user-info'),
    item: {
        timer : null,
        title : '接口密钥',
        search: null,
        sort  : '排序',
        tabs  : 'all',
    },
    params: {
        all: {
            order: 'id asc'
        },
        remove: {
            order: 'id asc',
            onlyTrashed: true
        },
    },
    tabs: {
        all: false,
        remove: false,
        setting: false,
    }
})

// 方法
const method = {
    // 设置排序方式
    order(order = 'create_time asc', sort = '排序') {
        state.item.sort = sort
        for (let item in state.params) state.params[item].order = order
        // 指定刷新
        method.refresh('all', 'remove')
    },
    // 添加
    add: () => allRef.value?.show(),
    // 刷新
    refresh(...args) {
        // 允许刷新的参数
        const refsMap = {
            'all': allRef,
            'remove': removeRef,
            'apiKey': apiKeyRef
        }
        // 如果没有传参则刷新所有
        if (args.length === 0) args = Object.keys(refsMap)
        // 如果传参则过滤不允许的参数
        else args = args.filter(item => Object.keys(refsMap).includes(item))
        // 批量刷新
        for (let item of args) {
            if (refsMap[item]?.value) {
                refsMap[item].value.init()
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

    state.tabs.all = true
})

watch(() => state.item.search, (val) => {
    const allow = ['all', 'remove']

    for (let item of allow) {
        if (!utils.is.empty(val)) state.params[item].like = [
            ['remark', `%${val}%`],
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