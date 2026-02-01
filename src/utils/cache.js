import utils from './utils'

// 基于localStorage的缓存工具：支持过期时间、JSON自动解析/序列化、过期自动清理
// 过期时间单位：分钟，0为永久存储；存储格式：{data: 原始值, expire: 过期时间戳}（带过期时）
const cache = {
  /**
   * 检查缓存是否存在（未过期+有值）
   * @param {string} key 缓存键
   * @returns {boolean} 存在返回true，否则false
   */
  has(key) {
    // 严格判断key类型+非空，避免传入非字符串key导致的异常
    if (typeof key !== 'string' || key.trim() === '') return false
    return !utils.is.empty(this.get(key))
  },

  /**
   * 获取缓存（自动处理过期、JSON解析，异常兜底）
   * @param {string} key 缓存键
   * @returns {any} 未过期返回缓存值，过期/不存在/异常返回null
   */
  get(key) {
    // 边界1：key非字符串/空，直接返回null
    if (typeof key !== 'string' || key.trim() === '') return null
    // 边界2：localStorage不可用（如浏览器隐私模式），直接返回null
    if (!this.isAvailable()) return null

    const rawVal = localStorage.getItem(key)
    // 边界3：缓存项不存在，直接返回null
    if (rawVal === null || rawVal.trim() === '') {
      this.del(key) // 清理空值缓存，避免脏数据
      return null
    }

    try {
      const parseData = JSON.parse(rawVal)
      // 情况1：带过期时间的包装格式 → 校验是否过期
      if (Object.prototype.toString.call(parseData) === '[object Object]' && parseData.hasOwnProperty('expire')) {
        // 过期：删除缓存并返回null
        if (parseData.expire && typeof parseData.expire === 'number' && Date.now() > parseData.expire) {
          this.del(key)
          return null
        }
        // 未过期：返回原始数据（data字段）
        return parseData.data ?? null
      }
      // 情况2：无过期时间（直接存储的原始值/非包装对象）→ 直接返回解析后的值
      return parseData ?? null
    } catch (e) {
      // 异常：非JSON格式/解析失败 → 直接返回原始字符串，兜底空值
      const val = rawVal === '' ? null : rawVal
      console.warn(`[缓存解析失败] key:${key}，使用原始值`, e.message)
      return val
    }
  },

  /**
   * 设置缓存（自动处理JSON序列化、过期时间包装，边界校验）
   * @param {string} key 缓存键
   * @param {any} value 缓存值（任意可序列化类型，undefined会转为null）
   * @param {number} minutes 过期时间（分钟，0/负数为永久存储）
   */
  set(key, value, minutes = 0) {
    // 边界1：key非字符串/空，直接终止
    if (typeof key !== 'string' || key.trim() === '') return
    // 边界2：localStorage不可用，直接终止
    if (!this.isAvailable()) return
    // 边界3：value为undefined，转为null（避免JSON.stringify(undefined)得到"undefined"）
    const storeValue = value === undefined ? null : value

    let finalData = storeValue
    // 处理过期时间：仅当分钟数为正数时，包装为带expire的对象
    const expireMinutes = Number(minutes)
    if (!isNaN(expireMinutes) && expireMinutes > 0) {
      finalData = {
        data: storeValue,
        expire: Date.now() + expireMinutes * 60 * 1000 // 转换为毫秒时间戳
      }
    }

    try {
      // 序列化存储，适配对象/数组/基本类型
      localStorage.setItem(key, JSON.stringify(finalData))
    } catch (e) {
      // 捕获存储异常（如存储空间不足、值不可序列化）
      console.error(`[缓存设置失败] key:${key}`, e.message)
    }
  },

  /**
   * 删除指定缓存项
   * @param {string} key 缓存键
   */
  del(key) {
    if (typeof key !== 'string' || key.trim() === '' || !this.isAvailable()) return
    localStorage.removeItem(key)
  },

  /**
   * 清空所有本地缓存（谨慎使用！会清除当前域名下所有localStorage）
   */
  clear() {
    if (!this.isAvailable()) return
    localStorage.clear()
  },

  /**
   * 【新增】检测localStorage是否可用（避免浏览器隐私模式/禁用导致的报错）
   * @returns {boolean} 可用返回true，否则false
   */
  isAvailable() {
    try {
      const testKey = '__cache_availability_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      console.warn('[localStorage不可用] 可能处于浏览器隐私模式或已禁用', e.message)
      return false
    }
  }
}

export default cache