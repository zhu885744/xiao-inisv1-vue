/**
 * 路由工具函数封装
 * 提供统一的路由跳转接口和辅助方法，解决原生router的常见问题
 * 
 * 核心功能：
 * 1. 统一封装push/replace，自动处理重复跳转错误
 * 2. 支持单次前置/后置处理器（不污染全局守卫）
 * 3. 提供便捷的路由信息获取方法
 * 4. 兼容历史记录管理
 */

import router from '@/router/index.js'
import utils from '@/utils/utils'

/**
 * 创建路由跳转包装器（工厂函数）
 * 统一处理push和replace的公共逻辑
 * 
 * @param {string} method - 路由方法名（'push' 或 'replace'）
 * @returns {Function} 包装后的路由跳转函数
 */
function createRouteWrapper(method) {
  /**
   * 路由跳转函数
   * 
   * @param {string|Object} options - 路由跳转参数（同router.push/replace）
   * @param {Object} [handlers] - 单次跳转处理器
   * @param {Function} [handlers.beforeHandle] - 跳转前置处理器 (to, from) => void
   * @param {Function} [handlers.afterHandle] - 跳转后置处理器 (to, from) => void
   * @returns {Promise<void>} 跳转Promise
   */
  return function(options, { beforeHandle, afterHandle } = {}) {
    if (utils.is.empty(options)) {
      return Promise.reject(new Error('路由跳转参数不能为空'))
    }

    let removeBeforeEach, removeAfterEach

    // 注册一次性前置守卫
    if (beforeHandle) {
      removeBeforeEach = router.beforeEach((to, from, next) => {
        beforeHandle(to, from)
        next()
        removeBeforeEach() // 执行后立即移除，避免重复注册
      })
    }

    // 注册一次性后置守卫
    if (afterHandle) {
      removeAfterEach = router.afterEach((to, from) => {
        afterHandle(to, from)
        removeAfterEach() // 执行后立即移除，避免重复注册
      })
    }

    return new Promise((resolve, reject) => {
      router[method](options)
        .then(() => resolve())
        .catch((err) => {
          // 过滤重复跳转错误（视为成功）
          if (err.message?.includes('Avoided redundant navigation to current location')) {
            resolve()
          } else {
            console.error(`【路由${method}失败】`, err.message)
            reject(err)
          }
        })
    })
  }
}

/**
 * 路由跳转（push）
 * 向历史记录添加新记录
 * 
 * @param {string|Object} options - 路由跳转参数
 * @param {Object} [handlers] - 单次跳转处理器
 * @returns {Promise<void>}
 * 
 * @example
 * // 字符串路径
 * push('/user')
 * 
 * // 对象形式
 * push({ path: '/user', query: { id: 1 } })
 * 
 * // 带前置/后置处理器
 * push('/user', {
 *   beforeHandle: (to, from) => console.log('跳转前'),
 *   afterHandle: (to, from) => console.log('跳转后')
 * })
 */
export const push = createRouteWrapper('push')

/**
 * 路由替换（replace）
 * 替换当前历史记录，不新增记录
 * 
 * @param {string|Object} options - 路由跳转参数
 * @param {Object} [handlers] - 单次跳转处理器
 * @returns {Promise<void>}
 * 
 * @example
 * // 登录后替换登录页（防止回退）
 * replace('/dashboard')
 */
export const replace = createRouteWrapper('replace')

/**
 * 返回上一页
 * 兼容无历史记录场景（自动跳转首页）
 * 
 * @param {number} [step=1] - 返回步数
 * @returns {Promise<void>}
 * 
 * @example
 * goBack() // 返回上一页
 * goBack(2) // 返回上两页
 */
export function goBack(step = 1) {
  return new Promise((resolve) => {
    if (window.history.length <= 1) {
      push('/').then(() => resolve())
    } else {
      router.go(-step)
      resolve()
    }
  })
}

/**
 * 获取当前路由对象
 * 
 * @returns {RouteLocation} 当前路由信息
 */
export function getCurrentRoute() {
  return router.currentRoute.value
}

/**
 * 获取路由参数（params）
 * 
 * @returns {Record<string, string|number>} 路由参数对象
 * 
 * @example
 * // 路由: /user/:id
 * const params = getRouteParams() // { id: '123' }
 */
export function getRouteParams() {
  return getCurrentRoute().params || {}
}

/**
 * 获取查询参数（query）
 * 
 * @returns {Record<string, string>} 查询参数对象
 * 
 * @example
 * // URL: /search?keyword=vue&page=1
 * const query = getRouteQuery() // { keyword: 'vue', page: '1' }
 */
export function getRouteQuery() {
  return getCurrentRoute().query || {}
}

/**
 * 获取路由元信息（meta）
 * 
 * @returns {Record<string, any>} 路由元信息对象
 * 
 * @example
 * // meta: { title: '首页', requiresAuth: false }
 * const meta = getRouteMeta() // { title: '首页', requiresAuth: false }
 */
export function getRouteMeta() {
  return getCurrentRoute().meta || {}
}

/**
 * 检查指定路径是否为当前激活路由
 * 
 * @param {string} path - 路由路径
 * @returns {boolean} 是否激活
 */
export function isRouteActive(path) {
  return router.currentRoute.value.path === path
}

/**
 * 获取路由历史记录（从localStorage读取）
 * 
 * @returns {Array<{path: string, name: string, meta: object, timestamp: number}>} 历史记录数组
 */
export function getRouteHistory() {
  try {
    return JSON.parse(localStorage.getItem('router_history') || '[]')
  } catch {
    return []
  }
}

/**
 * 清除路由历史记录
 */
export function clearRouteHistory() {
  localStorage.removeItem('router_history')
}

/**
 * 带查询参数的重定向
 * 
 * @param {string} path - 目标路径
 * @param {Record<string, string>} [query] - 查询参数
 * @returns {Promise<void>}
 * 
 * @example
 * redirectWithQuery('/search', { keyword: 'vue' })
 */
export function redirectWithQuery(path, query = {}) {
  return push({ path, query })
}

/**
 * 带命名参数的重定向
 * 
 * @param {string} name - 路由名称
 * @param {Record<string, string|number>} [params] - 路由参数
 * @returns {Promise<void>}
 * 
 * @example
 * redirectWithParams('user', { id: 123 })
 */
export function redirectWithParams(name, params = {}) {
  return push({ name, params })
}