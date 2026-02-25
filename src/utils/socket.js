import utils from '@/utils/utils'
import configManager from '@/utils/config'

// 从配置管理工具读取配置
const socketUri = configManager.getSync('socket_uri');
console.log('[Socket] 读取到的 socket_uri:', socketUri);

const config = {
  uri: socketUri || 'ws://cs.zhuxu.asia/socket', // Socket基础地址（.ws/.wss）
  reconnectInterval: 3000, // 重连间隔（毫秒）
  maxReconnectAttempts: 10, // 最大重连次数，0为无限重连
  debug: configManager.getSync('socket_debug') === true, // 调试模式（生产建议false）
  routerMode: configManager.getSync('router_mode') || 'hash', // 路由模式（兼容地址拼接）
  baseUrl: (configManager.getSync('base_url') || '/').replace(/\/$/, '') // 基础路径（统一去除末尾斜杠，避免拼接重复）
}

console.log('[Socket] 最终使用的配置:', config);

// Socket 核心状态管理：使用let+私有化，仅通过暴露方法操作
let socket = null // Socket实例
let reconnectAttempts = 0 // 已重连次数
let reconnectTimer = null // 重连定时器
let isManualClose = false // 是否手动关闭（用于区分主动关闭/异常断开）

/**
 * 格式化 Socket 地址（适配基础路径、路由模式、生产环境WSS、参数拼接）
 * @param {string} uri - 原始WS/WSS地址
 * @param {object|string} params - 连接查询参数（{k:v}或query字符串）
 * @returns {string} 格式化后的合法Socket地址，异常返回空串
 */
const formatUri = (uri, params) => {
  // 边界1：原始地址为空，直接报错并返回空串
  if (utils.is.empty(uri)) {
    console.error('[Socket] 配置错误：请在.env文件中配置VITE_SOCKET_URI（如ws://localhost:8080/ws）')
    return ''
  }

  let formattedUri = uri.trim()
  // 优化1：统一基础路径拼接（去除末尾斜杠，避免//重复）
  if (config.baseUrl && !formattedUri.includes(`${config.baseUrl}/`)) {
    const [protocol, rest] = formattedUri.split('://')
    if (rest) {
      const [host, ...pathParts] = rest.split('/')
      formattedUri = `${protocol}://${host}${config.baseUrl}/${pathParts.join('/')}`.replace(/\/+$/, '')
    }
  }

  // 优化2：拼接查询参数（处理对象/字符串两种格式，自动encodeURIComponent）
  if (!utils.is.empty(params)) {
    let paramStr = ''
    if (typeof params === 'object' && !Array.isArray(params)) {
      paramStr = Object.entries(params)
        .filter(([_, v]) => !utils.is.empty(v)) // 过滤空值参数
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&')
    } else if (typeof params === 'string' && params.trim() !== '') {
      paramStr = params.trim()
    }
    // 拼接参数（判断已有?，避免重复）
    if (paramStr) {
      formattedUri += formattedUri.includes('?') ? `&${paramStr}` : `?${paramStr}`
    }
  }

  // 优化3：生产环境强制WSS协议（适配HTTPS站点，避免混合内容错误）
  if (import.meta.env.PROD && formattedUri.startsWith('ws://')) {
    formattedUri = formattedUri.replace('ws://', 'wss://')
    config.debug && console.log('[Socket] 生产环境强制切换为WSS协议：', formattedUri)
  }

  return formattedUri
}

/**
 * 创建 Socket 连接（核心方法，自动处理重连初始化、事件绑定）
 * @param {string} [uri=null] - 自定义连接地址，优先于配置文件地址
 * @param {object|string} [params={}] - 连接查询参数
 * @param {string|string[]} [protocols] - WebSocket子协议（如['protocol1', 'protocol2']）
 * @returns {WebSocket|null} 成功返回Socket实例，失败返回null
 */
const connect = (uri = null, params = {}, protocols) => {
  // 手动关闭状态下，禁止创建新连接
  if (isManualClose) {
    config.debug && console.warn('[Socket] 手动关闭状态，禁止创建新连接')
    return null
  }

  // 格式化最终连接地址
  const finalUri = formatUri(uri || config.uri, params)
  if (utils.is.empty(finalUri)) return null

  // 存在旧实例，先关闭再创建新实例（避免多实例冲突）
  if (socket) {
    socket.close(1000, 'recreate connection') // 正常关闭码，说明是重建连接
    socket = null
    config.debug && console.log('[Socket] 关闭旧实例，准备创建新连接')
  }

  try {
    // 创建WebSocket实例，支持子协议
    socket = new WebSocket(finalUri, protocols)
    config.debug && console.log(`[Socket] 开始连接：${finalUri}`, protocols ? `子协议：${protocols}` : '')
    // 重连次数重置、绑定核心事件
    reconnectAttempts = 0
    bindCoreEvents()
    return socket
  } catch (error) {
    config.debug && console.error('[Socket] 连接创建失败：', error.message || error)
    // 创建失败触发重连
    reconnect()
    return null
  }
}

/**
 * 绑定 Socket 核心事件（onopen/onclose/onerror/onmessage）
 * 内部方法，仅在connect时调用，统一处理事件逻辑+全局回调分发
 */
const bindCoreEvents = () => {
  if (!socket) return

  // 连接成功事件
  socket.onopen = (event) => {
    config.debug && console.log('[Socket] 连接成功 ✅', event)
    // 分发全局open回调
    typeof window.socketOpenCallback === 'function' && window.socketOpenCallback(event)
  }

  // 连接关闭事件
  socket.onclose = (event) => {
    config.debug && console.log('[Socket] 连接关闭 ❌', `状态码：${event.code}，原因：${event.reason}`)
    // 分发全局close回调
    typeof window.socketCloseCallback === 'function' && window.socketCloseCallback(event)
    // 自动重连判断：非手动关闭 + 未达到最大重连次数（0为无限重连）
    const canReconnect = !isManualClose && (config.maxReconnectAttempts === 0 || reconnectAttempts < config.maxReconnectAttempts)
    if (canReconnect) {
      reconnect()
    } else {
      config.debug && console.log(`[Socket] 停止重连 🛑`, isManualClose ? '（手动关闭）' : `（已达最大重连次数${config.maxReconnectAttempts}）`)
    }
  }

  // 连接错误事件
  socket.onerror = (event) => {
    config.debug && console.error('[Socket] 连接错误 ⚠️', event)
    // 分发全局error回调
    typeof window.socketErrorCallback === 'function' && window.socketErrorCallback(event)
  }

  // 接收消息事件（自动尝试JSON解析，失败返回原始数据）
  socket.onmessage = (event) => {
    config.debug && console.log('[Socket] 接收消息 📩：', event.data)
    if (typeof window.socketMessageCallback === 'function') {
      try {
        // 尝试解析JSON（前端Socket通信通用格式）
        const parseData = JSON.parse(event.data)
        window.socketMessageCallback(parseData)
      } catch (err) {
        // 解析失败返回原始数据，仅调试模式打印警告
        config.debug && console.warn('[Socket] 消息JSON解析失败，返回原始数据：', err.message)
        window.socketMessageCallback(event.data)
      }
    }
  }
}

/**
 * 自动重连机制（内部方法，防抖处理，避免多次触发）
 */
const reconnect = () => {
  // 清除旧定时器，防抖
  if (reconnectTimer) clearTimeout(reconnectTimer)
  // 重连次数自增
  reconnectAttempts++
  config.debug && console.log(`[Socket] 准备重连 🔄（第 ${reconnectAttempts}/${config.maxReconnectAttempts || '∞'} 次），间隔${config.reconnectInterval}ms`)
  // 定时触发重连
  reconnectTimer = setTimeout(() => {
    connect() // 使用默认配置重连
  }, config.reconnectInterval)
}

/**
 * 手动关闭 Socket 连接（清理所有定时器，停止重连）
 * @param {boolean} [manual=true] - 是否标记为手动关闭（true=停止重连，false=允许重连）
 * @param {number} [code=1000] - 关闭状态码（1000=正常关闭，其他为异常）
 * @param {string} [reason='manual close'] - 关闭原因
 */
const close = (manual = true, code = 1000, reason = 'manual close') => {
  // 更新状态：标记手动关闭、清理定时器
  isManualClose = manual
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  // 关闭实例（传入标准关闭码和原因）
  if (socket) {
    socket.close(code, reason)
    socket = null
    config.debug && console.log(`[Socket] 手动关闭连接 🚪，状态码：${code}，原因：${reason}`)
  }
}

/**
 * 发送Socket消息（自动校验连接状态，支持单播to参数，自动JSON序列化）
 * @param {object|string} data - 要发送的消息（对象自动序列化，字符串直接发送）
 * @param {string|number} [to=''] - 单播接收方ID，广播则不传
 * @returns {boolean} 发送成功返回true，失败（连接未就绪/异常）返回false
 */
const send = (data = {}, to = '') => {
  try {
    // 校验连接状态：实例存在 + 处于OPEN状态
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      config.debug && console.warn('[Socket] 消息发送失败 ❌：连接未建立/未就绪（状态码：', socket?.readyState, '）')
      return false
    }
    // 构造发送数据：支持单播to参数
    const sendData = utils.is.empty(to) ? data : { ...data, to }
    // 序列化发送（对象转JSON，字符串直接发送）
    const sendStr = typeof sendData === 'string' ? sendData : JSON.stringify(sendData)
    socket.send(sendStr)
    config.debug && console.log('[Socket] 发送消息 📤：', sendData)
    return true
  } catch (error) {
    config.debug && console.error('[Socket] 消息发送失败 ❌：', error.message)
    return false
  }
}

// --------------- 全局事件绑定方法 ---------------
/**
 * 绑定连接成功事件
 * @param {Function} callback - 回调函数，参数为event对象
 */
const onOpen = (callback) => {
  if (typeof callback === 'function') window.socketOpenCallback = callback
}

/**
 * 绑定连接关闭事件
 * @param {Function} callback - 回调函数，参数为event对象
 */
const onClose = (callback) => {
  if (typeof callback === 'function') window.socketCloseCallback = callback
}

/**
 * 绑定连接错误事件
 * @param {Function} callback - 回调函数，参数为event对象
 */
const onError = (callback) => {
  if (typeof callback === 'function') window.socketErrorCallback = callback
}

/**
 * 绑定接收消息事件
 * @param {Function} callback - 回调函数，参数为解析后的数据/原始数据
 */
const onMessage = (callback) => {
  if (typeof callback === 'function') window.socketMessageCallback = callback
}

/**
 * 通用事件绑定方法（统一入口，支持open/close/error/message）
 * @param {string} event - 事件名（小写）
 * @param {Function} callback - 事件回调
 */
const on = (event, callback) => {
  if (!event || typeof callback !== 'function') return
  switch (event.toLowerCase()) {
    case 'open': onOpen(callback); break
    case 'close': onClose(callback); break
    case 'error': onError(callback); break
    case 'message': onMessage(callback); break
    default: config.debug && console.warn(`[Socket] 不支持的事件类型：${event}，仅支持open/close/error/message`)
  }
}

/**
 * 销毁Socket实例（彻底清理所有资源+状态，恢复初始值）
 * 适用于页面卸载/组件销毁时调用，避免内存泄漏
 */
const destroy = () => {
  // 手动关闭连接（标准关闭码）
  close(true, 1000, 'destroy instance')
  // 重置所有状态为初始值
  reconnectAttempts = 0
  isManualClose = false
  // 清空所有全局回调，避免内存泄漏
  window.socketOpenCallback = null
  window.socketCloseCallback = null
  window.socketErrorCallback = null
  window.socketMessageCallback = null
  config.debug && console.log('[Socket] 实例已销毁 🗑️，所有资源已清理')
}

// 暴露对外API：保持原有调用方式，补充状态查询方法，语义清晰
export default {
  connect,    // 创建连接
  close,      // 手动关闭
  send,       // 发送消息
  on,         // 通用事件绑定
  destroy,    // 彻底销毁
  onOpen,     // 单独绑定open事件
  onClose,    // 单独绑定close事件
  onError,    // 单独绑定error事件
  onMessage,  // 单独绑定message事件
  getInstance: () => socket, // 获取当前Socket实例
  getReconnectAttempts: () => reconnectAttempts, // 获取已重连次数
  isConnected: () => !!socket && socket.readyState === WebSocket.OPEN, // 查询是否已连接
  getConfig: () => ({ ...config }) // 【新增】获取当前配置（只读，避免外部修改）
}