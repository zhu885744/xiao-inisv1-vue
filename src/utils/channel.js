/**
 * 跨标签页通信工具（基于BroadcastChannel）
 * 特性：边界校验、异常捕获、多回调支持、类型标注、手动销毁
 * 兼容：支持BroadcastChannel的浏览器（现代浏览器均支持，IE不兼容）
 */
class Channel {
  /**
   * 构造函数：创建广播信道实例
   * @param {string} name - 信道名称（同名称的信道才能互相通信），兜底'default'
   */
  constructor(name = 'default') {
    // 校验信道名称：非字符串转为字符串，空值兜底'default'
    this.channelName = typeof name === 'string' ? name.trim() || 'default' : 'default'
    // 存储回调函数集合：支持绑定多个监听回调
    this.callbackList = []
    // 初始化广播信道，捕获创建异常
    try {
      this.bc = window.BroadcastChannel ? new BroadcastChannel(this.channelName) : null
      if (!this.bc) throw new Error('浏览器不支持BroadcastChannel')
      // 绑定全局消息监听：统一分发到所有回调
      this._bindGlobalListener()
    } catch (err) {
      console.error(`[跨标签通信初始化失败] 信道:${this.channelName}`, err.message)
      this.bc = null // 初始化失败则置空，避免后续调用报错
    }
  }

  /**
   * 私有方法：绑定全局消息监听，内部使用，不对外暴露
   */
  _bindGlobalListener() {
    if (!this.bc) return
    this.bc.onmessage = (event) => {
      // 仅处理有效数据，避免空数据传递
      if (event?.data === undefined || event?.data === null) return
      // 遍历所有回调，统一分发消息数据
      this.callbackList.forEach((cb) => {
        if (typeof cb === 'function') cb(event.data)
      })
    }
  }

  /**
   * 绑定消息监听回调
   * @param {Function} callback - 消息回调函数，参数为接收到的消息数据
   * @returns {boolean} - 绑定成功返回true，失败（不支持/无回调）返回false
   */
  on(callback) {
    // 校验回调为函数、信道可用
    if (typeof callback !== 'function' || !this.bc) return false
    // 避免重复绑定相同回调
    if (!this.callbackList.includes(callback)) {
      this.callbackList.push(callback)
    }
    return true
  }

  /**
   * 移除指定消息监听回调
   * @param {Function} callback - 要移除的回调函数
   * @returns {boolean} - 移除成功返回true，失败返回false
   */
  off(callback) {
    if (typeof callback !== 'function' || !this.bc || this.callbackList.length === 0) return false
    const index = this.callbackList.findIndex(cb => cb === callback)
    if (index > -1) {
      this.callbackList.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 发送消息到同名称的所有信道
   * @param {any} data - 要发送的消息数据（支持任意可序列化类型：对象/数组/基本类型）
   * @returns {boolean} - 发送成功返回true，失败返回false
   */
  emit(data) {
    // 信道不可用则直接返回失败
    if (!this.bc) return false
    try {
      // 发送数据（BroadcastChannel自动序列化，无需手动JSON处理）
      this.bc.postMessage(data)
      return true
    } catch (err) {
      console.error(`[跨标签通信发送失败] 信道:${this.channelName}`, err.message)
      return false
    }
  }

  /**
   * 关闭广播信道，清理资源（组件销毁/页面卸载时建议调用）
   * 注意：关闭后当前实例无法再发送/接收消息，需重新创建实例
   */
  close() {
    if (!this.bc) return
    // 清空回调集合，避免内存泄漏
    this.callbackList = []
    // 关闭信道并置空
    this.bc.close()
    this.bc = null
  }

  /**
   * 【静态方法】快速创建信道实例（简化调用，无需new）
   * @param {string} name - 信道名称
   * @returns {Channel} - 信道实例
   */
  static create(name = 'default') {
    return new Channel(name)
  }
}

export default Channel