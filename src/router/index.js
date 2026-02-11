import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import axios from '@/utils/request'
import { useCommStore } from '@/store/comm'

// 读取Vite环境变量（统一管理，和.env配置匹配）
const VITE_ENV = import.meta.env
// 路由基础路径：优先读环境变量VITE_BASE_URL，兜底VITE内置BASE_URL
const ROUTER_BASE = VITE_ENV.VITE_BASE_URL || VITE_ENV.BASE_URL || '/'
// 路由模式：转小写+兜底hash，防止配置错误
const ROUTER_MODE = (VITE_ENV.VITE_ROUTER_MODE || 'hash').toLowerCase()
// 项目标题：从环境变量读取，用于页面标题拼接
const APP_TITLE = VITE_ENV.VITE_TITLE || '朱某的生活印记'

// 1. 定义完整路由规则：新增/links专属路由
const routes = [
  // 根路径重定向到首页
  { path: '/index', redirect: '/' },

  // 核心固定路由/带参数路由：按业务顺序排
  {
    path: '/',
    name: '首页',
    component: () => import('@/views/index/pages/index.vue'),
    meta: { title: '首页', requiresAuth: false }
  },
  {
    path: '/user',
    name: '用户',
    component: () => import('@/views/index/pages/user.vue'),
    meta: { title: '个人设置', requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const commStore = useCommStore()
      const isLogin = !utils.is.empty(commStore.getLogin.user)
      isLogin ? next() : next('/')
    }
  },
  {
    path: '/archives/:id',
    name: '文章详情 ',
    component: () => import('@/views/index/pages/archives.vue'),
    meta: { title: '文章详情', requiresAuth: false },
    props: true
  },
  {
    path: '/author/:id',
    name: '作者主页',
    component: () => import('@/views/index/pages/author.vue'),
    meta: { title: '作者主页', requiresAuth: false },
    props: true
  },
  {
    path: '/category/:id',
    name: '分类页面',
    component: () => import('@/views/index/pages/category.vue'),
    meta: { title: '分类页面', requiresAuth: false },
    props: true
  },
  {
    path: '/functions',
    name: '主题设置',
    component: () => import('@/views/index/pages/functions.vue'),
    meta: { title: '主题设置', requiresAuth: true, isAdmin: true },
    beforeEnter: (to, from, next) => {
      const commStore = useCommStore()
      const user = commStore.getLogin.user
      const isLogin = !utils.is.empty(user)
      const isAdmin = user.isAdmin || false 
      (isLogin && isAdmin) ? next() : next('/')
    }
  },
  // 🌟 归档页面路由，指向独立页面组件
  {
    path: '/archive',
    name: '归档页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { title: '网站统计', requiresAuth: false },
    props: { pageKey: 'archive' }
  },
  // 友链页面路由
  {
    path: '/links',
    name: '友链页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { title: '友链', requiresAuth: false },
    props: { pageKey: 'links' }
  },
  // 版本更新页面路由
  {
    path: '/upgrade/theme',
    name: '版本更新',
    component: () => import('@/views/index/pages/theme-upgrade.vue'),
    meta: { title: '版本更新', requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const commStore = useCommStore()
      const isLogin = !utils.is.empty(commStore.getLogin.user)
      isLogin ? next() : next('/')
    }
  },

  // 独立页动态路由：匹配/xxx（如/about），排除/links（已精准匹配）
  {
    path: '/:key',
    name: '独立页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { title: '独立页面', requiresAuth: false },
    props: true,
    beforeEnter: (to, from, next) => {
      const currentKey = (to.params.key || '').trim()
      if (!currentKey) {
        next('/404')
      } else {
        next()
      }
    }
  },

  // 404 兜底路由（必须放在最后！）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  }
]

// 2. 动态创建路由历史对象（适配两种模式）
const routerHistory = ROUTER_MODE === 'history'
  ? createWebHistory(ROUTER_BASE)
  : createWebHashHistory(ROUTER_BASE)

// 3. 创建路由实例（精简配置，规范写法）
const router = createRouter({
  history: routerHistory,
  routes,
  // 路由跳转后回到顶部（提升体验，可选）
  scrollBehavior: (to, from, savedPosition) => {
    return savedPosition || { top: 0, left: 0 }
  }
})

// 全局前置守卫：统一标题 + 通用权限校验（保留原有逻辑）
router.beforeEach((to, from, next) => {
  const pageTitle = to.meta.title || to.name || '未知页面'
  document.title = `${pageTitle} - ${APP_TITLE}`

  if (to.meta.requiresAuth) {
    const commStore = useCommStore()
    const userInfo = commStore.getLogin.user
    const isLogin = !utils.is.empty(userInfo)

    if (!isLogin) {
      next('/')
      return
    }

    if (to.meta.isAdmin) {
      const isAdmin = userInfo.isAdmin || false
      if (!isAdmin) {
        next('/')
        return
      }
    }
  }

  next()
})

// 全局错误处理（捕获路由加载/跳转错误）
router.onError((error) => {
  console.error(`[路由错误] ${error.type}: ${error.message}`)
  if (error.type === 'load-component') {
    router.push('/404') // 修正：直接跳/404，而非原路径
  }
})

// 导出路由实例
export default router