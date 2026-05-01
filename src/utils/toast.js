/**
 * Toast 消息提示组件
 * 基于 Bootstrap 5 Toasts 组件封装，提供统一的消息提示能力
 * 
 * 功能特性：
 * - 支持四种消息类型：info、success、warning、error
 * - 自动适配深色/浅色主题
 * - 支持自定义位置、延迟、动画等配置
 * - 支持消息队列和最大显示数量限制
 * - 提供 Vue3 插件和 React Hook 两种使用方式
 */

import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

/**
 * Toast 消息类型配置
 * @type {Record<string, {bgClass: string, borderClass: string, icon: string}>}
 */
const TYPE_CONFIG = {
  info: {
    bgClass: '',
    iconClass: 'bi-info-circle text-info'
  },
  success: {
    bgClass: '',
    iconClass: 'bi-check-circle text-success'
  },
  warning: {
    bgClass: '',
    iconClass: 'bi-exclamation-triangle text-warning'
  },
  error: {
    bgClass: '',
    iconClass: 'bi-x-circle text-danger'
  }
}

/**
 * Toast 位置配置
 * @type {Record<string, string>}
 */
const POSITION_CONFIG = {
  'top-left': 'top-0 start-0',
  'top-center': 'top-0 start-50 translate-middle-x',
  'top-right': 'top-0 end-0',
  'bottom-left': 'bottom-0 start-0',
  'bottom-center': 'bottom-0 start-50 translate-middle-x',
  'bottom-right': 'bottom-0 end-0'
}

class Toast {
  constructor() {
    this.container = null
    this.toasts = new Map()
    this.idCounter = 0
    this.maxToasts = 5
    this.position = 'bottom-right'
    
    this.initContainer()
  }

  /**
   * 初始化消息容器
   */
  initContainer() {
    this.container = document.createElement('div')
    this.updateContainerPosition()
    this.container.className = `toast-container position-fixed ${POSITION_CONFIG[this.position]} p-3 z-50`
    document.body.appendChild(this.container)
  }

  /**
   * 更新容器位置
   */
  updateContainerPosition() {
    if (this.container) {
      Object.values(POSITION_CONFIG).forEach(classNames => {
        classNames.split(' ').forEach(cls => {
          this.container.classList.remove(cls)
        })
      })
      POSITION_CONFIG[this.position].split(' ').forEach(cls => {
        this.container.classList.add(cls)
      })
    }
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一标识
   */
  generateId() {
    return `toast-${Date.now()}-${++this.idCounter}`
  }

  /**
   * 创建Toast元素
   * @param {Object} options - Toast配置选项
   * @param {string} options.message - 消息内容
   * @param {string} [options.title] - 标题
   * @param {number} [options.delay=3000] - 自动关闭延迟(毫秒)
   * @param {boolean} [options.autohide=true] - 是否自动隐藏
   * @param {boolean} [options.showClose=true] - 是否显示关闭按钮
   * @param {boolean} [options.animation=true] - 是否启用动画
   * @param {string} [options.type='info'] - 消息类型(info/success/warning/error)
   * @returns {{id: string, toast: bootstrap.Toast, element: HTMLElement}}
   */
  createToast(options) {
    const id = this.generateId()
    const {
      message,
      title = '',
      delay = 3000,
      autohide = true,
      showClose = true,
      animation = true,
      type = 'info'
    } = options

    const toastElement = document.createElement('div')
    toastElement.id = id
    toastElement.className = `toast ${animation ? 'fade' : ''} ${TYPE_CONFIG[type]?.bgClass || ''}`
    toastElement.role = 'alert'
    toastElement.ariaLive = 'assertive'
    toastElement.ariaAtomic = 'true'

    toastElement.style.width = '320px'
    toastElement.style.borderRadius = '8px'
    toastElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease'
    toastElement.style.marginBottom = '8px'

    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark'
    const headerBgClass = isDarkMode ? 'bg-dark bg-opacity-90' : 'bg-white bg-opacity-90'
    const headerTextClass = isDarkMode ? 'text-light' : 'text-dark'
    const bodyBgClass = isDarkMode ? 'bg-dark bg-opacity-80' : 'bg-white bg-opacity-95'
    const bodyTextClass = isDarkMode ? 'text-light' : 'text-dark'
    const closeBtnClass = isDarkMode ? 'btn-close btn-close-white' : 'btn-close'

    toastElement.innerHTML = `
      <div class="toast-header ${headerBgClass} ${headerTextClass} border-0">
        <i class="bi ${TYPE_CONFIG[type]?.iconClass || ''} flex-shrink-0 me-2"></i>
        <strong class="me-auto">${title || this.getTitleByType(type)}</strong>
        <small class="text-muted">${new Date().toLocaleTimeString()}</small>
        ${showClose ? `
          <button type="button" class="${closeBtnClass}" data-bs-dismiss="toast" aria-label="Close"></button>
        ` : ''}
      </div>
      <div class="toast-body ${bodyBgClass} ${bodyTextClass} p-3">
        ${message}
      </div>
    `

    this.container.appendChild(toastElement)

    const toast = new bootstrap.Toast(toastElement, {
      delay,
      autohide
    })

    this.toasts.set(id, toast)

    toastElement.addEventListener('hidden.bs.toast', () => {
      this.toasts.delete(id)
      toastElement.remove()
    })

    this.enforceMaxToasts()

    return { id, toast, element: toastElement }
  }

  /**
   * 根据类型获取默认标题
   * @param {string} type - 消息类型
   * @returns {string} 标题文本
   */
  getTitleByType(type) {
    const titles = {
      info: '信息',
      success: '成功',
      warning: '警告',
      error: '错误'
    }
    return titles[type] || '通知'
  }

  /**
   * 强制执行最大显示数量限制
   */
  enforceMaxToasts() {
    if (this.toasts.size > this.maxToasts) {
      const oldestId = Array.from(this.toasts.keys()).shift()
      const oldestToast = this.toasts.get(oldestId)
      if (oldestToast) {
        oldestToast.hide()
      }
    }
  }

  /**
   * 显示消息
   * @param {Object} options - Toast配置选项
   * @returns {{id: string, close: () => void}}
   */
  show(options) {
    const { id, toast } = this.createToast(options)
    toast.show()
    return {
      id,
      close: () => toast.hide()
    }
  }

  /**
   * 显示信息消息
   * @param {string} message - 消息内容
   * @param {Object} [options={}] - 可选配置
   * @returns {{id: string, close: () => void}}
   */
  info(message, options = {}) {
    return this.show({ ...options, message, type: 'info' })
  }

  /**
   * 显示成功消息
   * @param {string} message - 消息内容
   * @param {Object} [options={}] - 可选配置
   * @returns {{id: string, close: () => void}}
   */
  success(message, options = {}) {
    return this.show({ ...options, message, type: 'success' })
  }

  /**
   * 显示警告消息
   * @param {string} message - 消息内容
   * @param {Object} [options={}] - 可选配置
   * @returns {{id: string, close: () => void}}
   */
  warning(message, options = {}) {
    return this.show({ ...options, message, type: 'warning' })
  }

  /**
   * 显示错误消息
   * @param {string} message - 消息内容
   * @param {Object} [options={}] - 可选配置
   * @returns {{id: string, close: () => void}}
   */
  error(message, options = {}) {
    return this.show({ ...options, message, type: 'error' })
  }

  /**
   * 关闭所有消息
   */
  closeAll() {
    this.toasts.forEach((toast) => {
      toast.hide()
    })
    this.toasts.clear()
  }

  /**
   * 配置全局选项
   * @param {Object} options - 配置选项
   * @param {number} [options.maxToasts] - 最大显示数量
   * @param {string} [options.position] - 默认位置
   * @returns {Toast}
   */
  config(options) {
    if (options.maxToasts !== undefined) {
      this.maxToasts = options.maxToasts
    }
    if (options.position && POSITION_CONFIG[options.position]) {
      this.position = options.position
      this.updateContainerPosition()
    }
    return this
  }
}

const toastInstance = new Toast()

const ToastPlugin = {
  install(app, options = {}) {
    if (options.config) {
      toastInstance.config(options.config)
    }
    app.config.globalProperties.$toast = toastInstance
    app.provide('$toast', toastInstance)
  }
}

export const useToast = () => {
  return toastInstance
}

export default toastInstance
export { ToastPlugin }