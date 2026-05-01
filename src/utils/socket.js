/**
 * WebSocket 封装工具
 * 提供稳定的 WebSocket 连接管理，支持自动重连、心跳检测、事件订阅等功能
 * 
 * 核心特性：
 * - 自动重连机制（支持最大重连次数限制）
 * - 心跳检测（防止连接长时间空闲被断开）
 * - 多事件订阅（支持多个回调函数）
 * - 生产环境自动切换 WSS 协议
 * - 完善的错误处理和状态管理
 */

import utils from '@/utils/utils'
import configManager from '@/utils/config'

const config = {
  uri: configManager.getSync('socket_uri') || 'ws://cs.zhuxu.asia/socket',
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  debug: configManager.getSync('socket_debug') === true,
  pingInterval: 30000,
  pingTimeout: 10000
}

class SocketManager {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.reconnectTimer = null
    this.pingTimer = null
    this.pingTimeoutTimer = null
    this.isManualClose = false
    this.listeners = {
      open: [],
      close: [],
      error: [],
      message: [],
      reconnect: []
    }
  }

  formatUri(uri, params) {
    if (utils.is.empty(uri)) {
      console.error('[Socket] 配置错误：请配置 socket_uri')
      return ''
    }

    let formattedUri = uri.trim()

    const [protocol, rest] = formattedUri.split('://')
    if (rest) {
      const [host, ...pathParts] = rest.split('/')
      formattedUri = `${protocol}://${host}/${pathParts.join('/')}`.replace(/\/+$/, '')
    }

    if (!utils.is.empty(params)) {
      let paramStr = ''
      if (typeof params === 'object' && !Array.isArray(params)) {
        paramStr = Object.entries(params)
          .filter(([_, v]) => !utils.is.empty(v))
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join('&')
      } else if (typeof params === 'string' && params.trim() !== '') {
        paramStr = params.trim()
      }
      if (paramStr) {
        formattedUri += formattedUri.includes('?') ? `&${paramStr}` : `?${paramStr}`
      }
    }

    if (import.meta.env.PROD && formattedUri.startsWith('ws://')) {
      formattedUri = formattedUri.replace('ws://', 'wss://')
      this.debugLog(`生产环境强制切换为WSS协议：${formattedUri}`)
    }

    return formattedUri
  }

  debugLog(...args) {
    if (config.debug) {
      console.log('[Socket]', ...args)
    }
  }

  emit(event, ...args) {
    this.listeners[event]?.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`[Socket] 事件 ${event} 回调执行失败:`, error)
      }
    })
  }

  on(event, callback) {
    if (typeof callback !== 'function') {
      console.warn('[Socket] 回调必须是函数')
      return
    }
    if (!this.listeners[event]) {
      console.warn(`[Socket] 不支持的事件类型：${event}`)
      return
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (!this.listeners[event]) return
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    } else {
      this.listeners[event] = []
    }
  }

  startPing() {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.debugLog('发送心跳 ping')
        this.socket.send(JSON.stringify({ type: 'ping' }))
        
        this.pingTimeoutTimer = setTimeout(() => {
          this.debugLog('心跳超时，触发重连')
          this.socket?.close(1000, 'ping timeout')
        }, config.pingTimeout)
      }
    }, config.pingInterval)
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
    if (this.pingTimeoutTimer) {
      clearTimeout(this.pingTimeoutTimer)
      this.pingTimeoutTimer = null
    }
  }

  bindCoreEvents() {
    if (!this.socket) return

    this.socket.onopen = (event) => {
      this.debugLog('连接成功 ✅')
      this.reconnectAttempts = 0
      this.startPing()
      this.emit('open', event)
    }

    this.socket.onclose = (event) => {
      this.debugLog(`连接关闭 ❌，状态码：${event.code}，原因：${event.reason}`)
      this.stopPing()
      this.emit('close', event)

      const canReconnect = !this.isManualClose && 
        (config.maxReconnectAttempts === 0 || this.reconnectAttempts < config.maxReconnectAttempts)
      
      if (canReconnect) {
        this.reconnect()
      } else {
        this.debugLog(`停止重连 🛑`, this.isManualClose ? '（手动关闭）' : `（已达最大重连次数${config.maxReconnectAttempts}）`)
      }
    }

    this.socket.onerror = (event) => {
      this.debugLog('连接错误 ⚠️', event)
      this.emit('error', event)
    }

    this.socket.onmessage = (event) => {
      if (event.data === 'pong') {
        this.debugLog('收到心跳 pong')
        if (this.pingTimeoutTimer) {
          clearTimeout(this.pingTimeoutTimer)
          this.pingTimeoutTimer = null
        }
        return
      }

      this.debugLog('接收消息 📩：', event.data)
      let data = event.data
      try {
        data = JSON.parse(event.data)
      } catch (err) {
        this.debugLog('消息JSON解析失败，返回原始数据')
      }
      this.emit('message', data)
    }
  }

  reconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    this.reconnectAttempts++
    this.debugLog(`准备重连 🔄（第 ${this.reconnectAttempts}/${config.maxReconnectAttempts || '∞'} 次），间隔${config.reconnectInterval}ms`)
    this.emit('reconnect', this.reconnectAttempts)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, config.reconnectInterval)
  }

  connect(uri = null, params = {}, protocols) {
    if (this.isManualClose) {
      this.debugLog('手动关闭状态，禁止创建新连接')
      return null
    }

    const finalUri = this.formatUri(uri || config.uri, params)
    if (utils.is.empty(finalUri)) return null

    if (this.socket) {
      this.socket.close(1000, 'recreate connection')
      this.socket = null
      this.debugLog('关闭旧实例，准备创建新连接')
    }

    try {
      this.socket = new WebSocket(finalUri, protocols)
      this.debugLog(`开始连接：${finalUri}`, protocols ? `子协议：${protocols}` : '')
      this.bindCoreEvents()
      return this.socket
    } catch (error) {
      this.debugLog('连接创建失败：', error.message || error)
      this.reconnect()
      return null
    }
  }

  close(manual = true, code = 1000, reason = 'manual close') {
    this.isManualClose = manual
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.stopPing()
    
    if (this.socket) {
      this.socket.close(code, reason)
      this.socket = null
      this.debugLog(`手动关闭连接 🚪，状态码：${code}，原因：${reason}`)
    }
  }

  send(data = {}, to = '') {
    try {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.debugLog('消息发送失败 ❌：连接未建立/未就绪（状态码：', this.socket?.readyState, '）')
        return false
      }

      const sendData = utils.is.empty(to) ? data : { ...data, to }
      const sendStr = typeof sendData === 'string' ? sendData : JSON.stringify(sendData)
      this.socket.send(sendStr)
      this.debugLog('发送消息 📤：', sendData)
      return true
    } catch (error) {
      this.debugLog('消息发送失败 ❌：', error.message)
      return false
    }
  }

  destroy() {
    this.close(true, 1000, 'destroy instance')
    this.reconnectAttempts = 0
    this.isManualClose = false
    
    Object.keys(this.listeners).forEach(key => {
      this.listeners[key] = []
    })
    
    this.debugLog('实例已销毁 🗑️，所有资源已清理')
  }

  getInstance() {
    return this.socket
  }

  getReconnectAttempts() {
    return this.reconnectAttempts
  }

  isConnected() {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN
  }

  getConfig() {
    return { ...config }
  }
}

const socketManager = new SocketManager()

export default socketManager

export const useSocket = () => socketManager