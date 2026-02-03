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

// 1. 定义完整路由规则（保留所有原有业务逻辑，无修改）
const routes = [
  // 根路径重定向到首页
  { path: '/index', redirect: '/' },

  // 核心业务页面
  {
    path: '/',
    name: '首页',
    component: () => import('@/views/index/pages/index.vue'),
    meta: { title: '首页', requiresAuth: false }
  },
  // 用户设置页（仅登录可访问）
  {
    path: '/user',
    name: '用户',
    component: () => import('@/views/index/pages/user.vue'),
    meta: { title: '个人设置', requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const commStore = useCommStore()
      const isLogin = !utils.is.empty(commStore.getLogin.user)
      isLogin ? next() : next('/') // 未登录跳首页
    }
  },
  // 文章详情页 /archives/{id}
  {
    path: '/archives/:id',
    name: '文章详情',
    component: () => import('@/views/index/pages/archives.vue'),
    meta: { title: '文章详情', requiresAuth: false },
    props: true // 自动注入id参数到组件props
  },
  // 独立页面 /{key}（友链/归档等，需放在非通配路由后）
  {
    path: '/:key',
    name: '独立页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { title: '独立页面', requiresAuth: false },
    props: true,
    // 排除已定义的路由（避免覆盖）
    beforeEnter: (to, from, next) => {
      const excludeKeys = ['user', 'index'] // 已定义的路由name/key
      excludeKeys.includes(to.params.key) ? next('/404') : next()
    }
  },
  // 作者页面 /author/{id}
  {
    path: '/author/:id',
    name: '作者主页',
    component: () => import('@/views/index/pages/author.vue'),
    meta: { title: '作者主页', requiresAuth: false },
    props: true
  },
  // 主题设置（仅管理员可访问）
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

// 全局前置守卫：统一标题 + 通用权限校验（保留原有逻辑，增强体验）
router.beforeEach((to, from, next) => {
  // 统一设置页面标题：路由标题 + 项目总标题（如「首页 - 朱某的生活印记」）
  const pageTitle = to.meta.title || to.name || '未知页面'
  document.title = `${pageTitle} - ${APP_TITLE}`

  // 通用登录/管理员校验（仅对标记requiresAuth的路由生效）
  if (to.meta.requiresAuth) {
    const commStore = useCommStore()
    const userInfo = commStore.getLogin.user
    const isLogin = !utils.is.empty(userInfo)

    // 未登录直接跳首页
    if (!isLogin) {
      next('/')
      return
    }

    // 管理员路由额外校验（兜底，和beforeEnter双重校验更安全）
    if (to.meta.isAdmin) {
      const isAdmin = userInfo.isAdmin || false // 按实际后端返回字段调整
      if (!isAdmin) {
        next('/') // 非管理员跳首页
        return
      }
    }
  }

  next()
})

// 全局错误处理（捕获路由加载/跳转错误，避免项目崩溃）
router.onError((error) => {
  console.error(`[路由错误] ${error.type}: ${error.message}`)
  // 路由组件加载失败时，跳404页面
  if (error.type === 'load-component') {
    router.push('/:pathMatch(.*)*')
  }
})

// 导出路由实例
export default router