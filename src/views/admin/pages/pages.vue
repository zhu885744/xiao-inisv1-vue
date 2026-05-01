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
                        placeholder="标题 | 内容"
                        autocomplete="off"
                    >
                </div>
                <button class="btn btn-outline-secondary me-2" @click="method.refresh()">刷新</button>
                <button class="btn btn-primary" @click="method.add()">添加</button>
            </div>
        </div>
        </div>
    </div>
        <div class="row mt-3">
            <div class="col-12">
                <div class="border rounded-3 overflow-hidden">
                    <ul class="nav nav-tabs" id="pageTabs" role="tablist">
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

                    <div class="tab-content" id="pageTabsContent">
                        <div
                            class="tab-pane"
                            :class="{ active: state.item.tabs === 'all', show: state.item.tabs === 'all' }"
                            id="all"
                            role="tabpanel"
                            aria-labelledby="all-tab"
                        >
                            <table-pages :params="state.params.all" :init="state.tabs.all" @refresh="method.refresh" :ref="el => refs.all = el"></table-pages>
                        </div>
                        <div
                            class="tab-pane"
                            :class="{ active: state.item.tabs === 'remove', show: state.item.tabs === 'remove' }"
                            id="remove"
                            role="tabpanel"
                            aria-labelledby="remove-tab"
                        >
                            <table-pages :params="state.params.remove" :init="state.tabs.remove" @refresh="method.refresh" :ref="el => refs.remove = el" type="remove"></table-pages>
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
import TablePages from '@/comps/admin/table/pages.vue'
import cache from '@/utils/cache.js'
import { usePageTitle } from '@/utils/usePageTitle'

const refs = {
  all: ref(null),
  remove: ref(null),
}

const { setDynamicTitle } = usePageTitle()
setDynamicTitle('页面管理')

const state  = reactive({
    user: cache.get('user-info'),
    item: {
        timer : null,
        title : '页面列表',
        search: null,
        sort  : '排序',
        tabs  : 'all',
    },
    params: {
        all: {
            order: 'id desc'
        },
        remove: {
            order: 'id desc',
            withTrashed: true
        },
    },
    tabs: {
        all: false,
        remove: false,
    }
})

const method = {
    order(order = 'create_time asc', sort = '排序') {
        state.item.sort = sort
        for (let item in state.params) state.params[item].order = order
        method.refresh('all', 'remove')
    },
    add: () => push({ name: 'admin-pages-write' }),
    refresh(...args) {
        let allow = ['all', 'remove']
        if (args.length === 0) args = allow
        else args = args.filter(item => allow.includes(item))
        for (let item of args) {
            if (refs[item]) {
                if (typeof refs[item].refresh === 'function') {
                    refs[item].refresh()
                } else {
                    refs[item].init()
                }
            }
        }
    },
    loadData(...args) {
        let allow = ['all', 'remove']
        if (args.length === 0) args = allow
        else args = args.filter(item => allow.includes(item))
        for (let item of args) {
            if (refs[item]) {
                if (typeof refs[item].loadData === 'function') {
                    refs[item].loadData()
                } else {
                    refs[item].init()
                }
            }
        }
    },
    change: (name) => state.tabs[name] = true
}

onMounted(async () => {
    if (window.bootstrap) {
        const dropdownElementList = document.querySelectorAll('.dropdown-toggle')
        const dropdownList = [...dropdownElementList].map(dropdownToggleEl => new window.bootstrap.Dropdown(dropdownToggleEl))

        const tabElementList = document.querySelectorAll('button[data-bs-toggle="tab"]')
        const tabList = [...tabElementList].map(tabToggleEl => new window.bootstrap.Tab(tabToggleEl))
    }

    state.tabs.all = true
})

watch(() => state.item.search, (val) => {
    const allow = ['all', 'remove']

    for (let item of allow) {
        if (!utils.is.empty(val)) state.params[item].like = [
            ['title'  , `%${val}%`],
            ['content', `%${val}%`],
        ]
        else delete state.params[item].like
    }

    clearTimeout(state.item.timer)
    state.item.timer = setTimeout(() => method.refresh(...allow), globalThis.inis?.lazy_time ?? 500)
})
</script>