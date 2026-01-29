import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

// 1. 定义基础路由规则（包含业务页面 + 404兜底）
const routes = [
  // 根路径重定向到首页
  { path: '/index', redirect: '/' },

  // 首页
  {
    path: '/',
    name: '首页',
    component: () => import('@/views/index/pages/index.vue')
  },

  // 404 兜底路由（必须放在最后！）
  {
    path: '/:pathMatch(.*)*', // 匹配所有未定义的路由
    name: 'NotFound',
    component: () => import('@/views/error.vue'), // 404页面组件路径
    meta: {
      title: '页面不存在' // 可选：设置404页面标题
    }
  }
]

// 2. 路由配置参数（可根据环境调整）
const base = '/'
const mode = 'hash' // 可选：hash / history

// 3. 创建路由实例（避免重复定义router）
const router = createRouter({
  base: base,
  history: mode === 'history' ? createWebHistory(base) : createWebHashHistory(base),
  routes: routes
})

// 可选：路由守卫（示例：统一设置页面标题）
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || to.name || '默认标题'
  next()
})

// 导出路由实例
export default router