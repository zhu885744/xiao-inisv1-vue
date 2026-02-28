import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import { useCommStore } from '@/store/comm'
import config from '@/utils/config'
import { setupRouteTitle } from '@/utils/usePageTitle'

/**
 * 路由管理配置
 * 优化点：
 * 1. 分组路由配置，按功能模块组织
 * 2. 优化路由懒加载
 * 3. 增强路由守卫和错误处理
 * 4. 添加详细的类型定义和注释
 * 5. 优化路由配置的可维护性
 */

// 读取配置
const ROUTER_BASE = config.getSync('base_url') || '/'
// 从配置文件同步获取路由模式
const ROUTER_MODE = config.getSync('router_mode') || 'hash'

console.log('路由模式:', ROUTER_MODE)

// 1. 定义路由规则，按功能模块分组
const routes = [
  // 重定向路由
  {
    path: '/index',
    redirect: '/'
  },

  // 核心路由
  {
    path: '/',
    name: '首页',
    component: () => import('@/views/index/pages/index.vue'),
    meta: { 
      title: '首页', 
      requiresAuth: false,
      keepAlive: true
    }
  },
  // 用户相关路由
  {
    path: '/user',
    name: '用户设置',
    component: () => import('@/views/index/pages/user.vue'),
    meta: { 
      title: '用户设置', 
      requiresAuth: true
    }
  },
  {
    path: '/author/:id',
    name: '用户主页',
    component: () => import('@/views/index/pages/author.vue'),
    meta: { 
      title: '用户主页', 
      requiresAuth: false
    },
    props: true
  },

  // 文章相关路由
  {
    path: '/archives/:id',
    name: '文章详情',
    component: () => import('@/views/index/pages/archives.vue'),
    meta: { 
      title: '文章详情', 
      requiresAuth: false
    },
    props: true
  },

  // 分类相关路由
  {
    path: '/category/:id',
    name: '分类页面',
    component: () => import('@/views/index/pages/category.vue'),
    meta: { 
      title: '分类页面', 
      requiresAuth: false
    },
    props: true
  },

  // 标签相关路由
  {
    path: '/tags',
    name: '标签页面',
    component: () => import('@/views/index/pages/tags.vue'),
    meta: { 
      title: '标签', 
      requiresAuth: false
    }
  },
  {
    path: '/tag/:id',
    name: '单个标签页面',
    component: () => import('@/views/index/pages/tags.vue'),
    meta: { 
      title: '单个标签页面', 
      requiresAuth: false
    },
    props: true
  },

  // 独立页面路由
  {
    path: '/archive',
    name: '归档页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { 
      title: '网站统计', 
      requiresAuth: false
    },
    props: { pageKey: 'archive' }
  },
  {
    path: '/links',
    name: '友链页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { 
      title: '友链', 
      requiresAuth: false
    },
    props: { pageKey: 'links' }
  },
  {
    path: '/:key',
    name: '独立页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { 
      title: '独立页面', 
      requiresAuth: false
    },
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

  // 管理相关路由
  {
    path: '/functions',
    name: '主题设置',
    component: () => import('@/views/index/pages/functions.vue'),
    meta: { 
      title: '主题设置', 
      requiresAuth: true, 
      isAdmin: true
    }
  },
  {
    path: '/upgrade/theme',
    name: '版本更新',
    component: () => import('@/views/index/pages/theme-upgrade.vue'),
    meta: { 
      title: '版本更新', 
      requiresAuth: true
    }
  },

  // 管理相关路由
  {
    path: '/functions',
    name: '主题设置',
    component: () => import('@/views/index/pages/functions.vue'),
    meta: { 
      title: '主题设置', 
      requiresAuth: true, 
      isAdmin: true
    }
  },
  {
    path: '/upgrade/theme',
    name: '版本更新',
    component: () => import('@/views/index/pages/theme-upgrade.vue'),
    meta: { 
      title: '版本更新', 
      requiresAuth: true
    }
  },

  // Admin路由系统
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/layout/base.vue'),
    meta: { 
      title: '后台管理', 
      requiresAuth: true, 
      isAdmin: true
    },
    children: [
      {
        path: '',
        name: 'admin-home',
        meta: { title: '控制台' },
        component: () => import('@/views/admin/pages/index.vue'),
      },
      {
        path: 'index',
        redirect: ''
      },
      {
        path: 'users',
        name: 'admin-users',
        meta: { title: '用户管理' },
        component: () => import('@/views/admin/pages/users.vue'),
      },
      {
        path: 'banner',
        name: 'admin-banner',
        meta: { title: '轮播管理' },
        component: () => import('@/views/admin/pages/banner.vue'),
      },
      {
        path: 'links',
        name: 'admin-links',
        meta: { title: '友链管理' },
        component: () => import('@/views/admin/pages/links.vue'),
      },
      {
        path: 'tags',
        name: 'admin-tags',
        meta: { title: '标签管理' },
        component: () => import('@/views/admin/pages/tags.vue'),
      },
      {
        path: 'placard',
        name: 'admin-placard',
        meta: { title: '公告管理' },
        component: () => import('@/views/admin/pages/placard.vue'),
      },
      {
        path: 'level',
        name: 'admin-level',
        meta: { title: '等级管理' },
        component: () => import('@/views/admin/pages/level.vue'),
      },
      {
        path: 'comment',
        name: 'admin-comment',
        meta: { title: '评论管理' },
        component: () => import('@/views/admin/pages/comment.vue'),
      },
      {
        path: 'article',
        name: 'admin-article',
        meta: { title: '文章列表' },
        component: () => import('@/views/admin/pages/article.vue'),
      },
      {
        path: 'article/write/:id?',
        name: 'admin-article-write',
        meta: { title: '撰写文章' },
        component: () => import('@/views/admin/pages/article-write[id].vue'),
      },
      {
        path: 'article/group',
        name: 'admin-article-group',
        meta: { title: '文章分组' },
        component: () => import('@/views/admin/pages/article-group.vue'),
      },
      {
        path: 'pages',
        name: 'admin-pages',
        meta: { title: '页面列表' },
        component: () => import('@/views/admin/pages/pages.vue'),
      },
      {
        path: 'pages/write/:id?',
        name: 'admin-pages-write',
        meta: { title: '撰写页面' },
        component: () => import('@/views/admin/pages/pages-write[id].vue'),
      },
      {
        path: 'links/group',
        name: 'admin-links-group',
        meta: { title: '友链分组' },
        component: () => import('@/views/admin/pages/links-group.vue'),
      },
      {
        path: 'auth/rules',
        name: 'admin-auth-rules',
        meta: { title: '权限规则' },
        component: () => import('@/views/admin/pages/auth-rules.vue'),
      },
      {
        path: 'auth/group',
        name: 'admin-auth-group',
        meta: { title: '权限分组' },
        component: () => import('@/views/admin/pages/auth-group.vue'),
      },
      {
        path: 'auth/pages',
        name: 'admin-auth-pages',
        meta: { title: '管理页面' },
        component: () => import('@/views/admin/pages/auth-pages.vue'),
      },
      {
        path: 'api/keys',
        name: 'admin-api-keys',
        meta: { title: '接口密钥' },
        component: () => import('@/views/admin/pages/api-keys.vue'),
      },
      {
        path: 'system',
        name: 'admin-system',
        meta: { title: '系统配置' },
        component: () => import('@/views/admin/pages/system.vue'),
      },
      {
        path: 'ip/black',
        name: 'admin-ip-black',
        meta: { title: 'IP黑名单' },
        component: () => import('@/views/admin/pages/ip-black.vue'),
      },
      {
        path: 'qps/warn',
        name: 'admin-qps-warn',
        meta: { title: 'QPS预警' },
        component: () => import('@/views/admin/pages/qps-warn.vue'),
      }
    ]
  },

  // 404 兜底路由（必须放在最后！）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error.vue'),
    meta: { 
      title: '页面不存在', 
      requiresAuth: false
    }
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

// 3. 创建路由实例
const router = createRouter({
  history: createRouterHistory(),
  routes,
  // 路由跳转后回到顶部
  scrollBehavior: (to, from, savedPosition) => {
    // 只有在真正的路由跳转时才滚动到顶部
    // 避免Fancybox等模态框关闭时触发滚动
    if (savedPosition) {
      return savedPosition
    } else {
      // 只有当路由路径发生变化时才滚动到顶部
      if (to.path !== from.path) {
        return { top: 0, left: 0 }
      }
    }
  }
})

// 全局前置守卫：通用权限校验
router.beforeEach((to, from, next) => {
  // 权限校验
  if (to.meta.requiresAuth) {
    const commStore = useCommStore()
    const userInfo = commStore.getLogin.user
    const isLogin = !utils.is.empty(userInfo)

    if (!isLogin) {
      next('/')
      return
    }

    // 管理员权限校验
    if (to.meta.isAdmin) {
      // 尝试从缓存中获取管理员权限状态，减少重复计算
      const cachedAdminStatus = cache.get(`admin_status_${userInfo.id || 'unknown'}`)
      let isAdmin
      
      if (cachedAdminStatus !== null) {
        isAdmin = cachedAdminStatus
      } else {
        isAdmin = checkAdminPermission(userInfo)
        // 缓存管理员权限状态，有效期1小时
        cache.set(`admin_status_${userInfo.id || 'unknown'}`, isAdmin, 60)
      }
      
      if (!isAdmin) {
        next('/')
        return
      }
    }
  }

  next()
})

// 全局后置守卫：缓存路由历史
router.afterEach((to) => {
  // 缓存路由历史，保存最近10条
  const historyKey = 'router_history'
  const history = cache.get(historyKey) || []
  
  // 移除重复的路由记录
  const filteredHistory = history.filter(item => item.path !== to.path)
  
  // 添加当前路由到历史记录开头
  filteredHistory.unshift({
    path: to.path,
    name: to.name,
    meta: to.meta,
    timestamp: Date.now()
  })
  
  // 只保留最近10条记录
  const limitedHistory = filteredHistory.slice(0, 10)
  
  // 缓存路由历史，有效期7天
  cache.set(historyKey, limitedHistory, 24 * 7)
})

// 全局错误处理（捕获路由加载/跳转错误）
router.onError((error) => {
  console.error(`[路由错误] ${error.type}: ${error.message}`)
  // 处理组件加载错误
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    console.error('组件加载失败，可能是网络问题或文件不存在')
    // 跳转到404页面
    router.push('/404').catch(() => {})
  }
})

// 检查管理员权限
const checkAdminPermission = (userInfo) => {
  if (!userInfo) return false
  
  // 检查不同可能的用户信息结构
  const userAuth = userInfo.result?.auth || userInfo?.auth
  const userGroups = userAuth?.group?.list || userInfo?.group?.list || []
  
  // 检查是否为管理员
  return userAuth?.all || userGroups.some(group => group.key === 'admin')
}

// 设置路由标题管理
setupRouteTitle(router);

// 导出路由实例
export default router