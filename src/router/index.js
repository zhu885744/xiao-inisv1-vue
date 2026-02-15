import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import axios from '@/utils/request'
import { useCommStore } from '@/store/comm'
import config from '@/utils/config'

// 读取配置
const ROUTER_BASE = config.getSync('base_url') || '/'
// 从配置文件同步获取路由模式
const ROUTER_MODE = config.getSync('router_mode') || 'hash'

console.log('路由模式:', ROUTER_MODE)

// 从store获取站点标题

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
    meta: { title: '用户设置', requiresAuth: true },
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
    name: '用户主页',
    component: () => import('@/views/index/pages/author.vue'),
    meta: { title: '用户主页', requiresAuth: false },
    props: true
  },
  {
    path: '/category/:id',
    name: '分类页面',
    component: () => import('@/views/index/pages/category.vue'),
    meta: { title: '分类页面', requiresAuth: false },
    props: true
  },
  { path: '/functions',
    name: '主题设置',
    component: () => import('@/views/index/pages/functions.vue'),
    meta: { title: '主题设置', requiresAuth: true, isAdmin: true }
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
  // 标签页面路由
  {
    path: '/tags',
    name: '标签页面',
    component: () => import('@/views/index/pages/tags.vue'),
    meta: { title: '标签', requiresAuth: false }
  },
  // 单个标签页面路由
  {
    path: '/tag/:id',
    name: '单个标签页面',
    component: () => import('@/views/index/pages/tags.vue'),
    meta: { title: '单个标签页面', requiresAuth: false },
    props: true
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
const createRouterHistory = () => {
  // 再次检查路由模式，确保使用最新的配置值
  const currentMode = config.getSync('router_mode') || 'hash'
  console.log('路由模式:', currentMode)
  return currentMode === 'history'
    ? createWebHistory(ROUTER_BASE)
    : createWebHashHistory(ROUTER_BASE)
}

// 3. 创建路由实例（精简配置，规范写法）
const router = createRouter({
  history: createRouterHistory(),
  routes,
  // 路由跳转后回到顶部（提升体验，可选）
  scrollBehavior: (to, from, savedPosition) => {
    return savedPosition || { top: 0, left: 0 }
  }
})

// 全局前置守卫：统一标题 + 通用权限校验（保留原有逻辑）
router.beforeEach((to, from, next) => {
  const commStore = useCommStore()
  const siteTitle = commStore.siteInfo?.title || '网站名称'
  
  // 只有当路由的路径发生变化时才重置页面标题，避免哈希变化导致的标题重置
  if (to.path !== from.path) {
    const pageTitle = to.meta.title || to.name || '未知页面'
    document.title = `${pageTitle} - ${siteTitle}`
  }

  if (to.meta.requiresAuth) {
    const userInfo = commStore.getLogin.user
    const isLogin = !utils.is.empty(userInfo)

    if (!isLogin) {
      next('/')
      return
    }

    if (to.meta.isAdmin) {
      // 检查不同可能的用户信息结构
      const userAuth = userInfo.result?.auth || userInfo?.auth
      const userGroups = userAuth?.group?.list || userInfo?.group?.list || []
      const isAdmin = userAuth?.all || userGroups.some(group => group.key === 'admin')
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