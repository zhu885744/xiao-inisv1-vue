import CryptoJS from 'crypto-js'

// 读取VITE环境变量：从.env获取加密密钥/向量，避免硬编码（核心优化）
const VITE_ENV = import.meta.env
// AES默认密钥/向量：从环境变量读取，兜底默认值（生产需在.env配置安全的随机串）
const DEFAULT_AES_KEY = VITE_ENV.VITE_AES_KEY || 'default_aes_key_16bit' // 建议16/24/32位
const DEFAULT_AES_IV = VITE_ENV.VITE_IV || 'default_iv_16bit'         // CBC模式必须16位
// 最小/最大token长度限制：避免非法长度导致的异常
const MIN_TOKEN_LENGTH = 8
const MAX_TOKEN_LENGTH = 64

/**
 * AES-CBC对称加密类（基于CryptoJS）
 * 特性：边界校验、异常捕获、环境变量默认密钥、CBC模式+Pkcs7填充（通用标准）
 * 要求：key建议16/24/32位（对应AES-128/192/256），iv必须16位（CBC模式强制）
 */
class AES {
  /**
   * 构造函数：初始化密钥/向量（自动UTF8解析）
   * @param {string} key - 加密密钥，默认使用环境变量VITE_AES_KEY
   * @param {string} iv - 加密向量，默认使用环境变量VITE_IV（CBC模式必须16位）
   */
  constructor(key = DEFAULT_AES_KEY, iv = DEFAULT_AES_IV) {
    // 校验CryptoJS是否加载成功
    if (!CryptoJS || !CryptoJS.enc || !CryptoJS.AES) {
      throw new Error('CryptoJS加载失败，无法初始化AES加密')
    }
    // 密钥/向量非空校验，兜底默认值
    this._keyStr = typeof key === 'string' && key.trim() !== '' ? key.trim() : DEFAULT_AES_KEY
    this._ivStr = typeof iv === 'string' && iv.trim() !== '' ? iv.trim() : DEFAULT_AES_IV
    // 解析为CryptoJS可识别的Utf8格式（核心步骤，避免加密乱码）
    this.iv = CryptoJS.enc.Utf8.parse(this._ivStr)
    this.key = CryptoJS.enc.Utf8.parse(this._keyStr)
    // 校验iv长度（CBC模式强制16位，否则加密会异常）
    this._checkIvLength()
  }

  /**
   * 私有方法：校验IV长度（CBC模式必须16位），内部使用
   */
  _checkIvLength() {
    const ivLength = this._ivStr.length
    if (ivLength !== 16) {
      console.warn(`[AES警告] CBC模式要求IV必须16位，当前为${ivLength}位，可能导致加密/解密异常`)
    }
  }

  /**
   * 加密方法：明文转AES-CBC加密串（Base64格式）
   * @param {string} text - 要加密的明文（非字符串自动转为字符串）
   * @returns {string} 加密后的Base64字符串，异常则返回空串
   */
  encrypt(text) {
    try {
      // 明文非空+类型处理：非字符串转为JSON字符串，避免原始类型加密乱码
      const plainText = typeof text === 'string' ? text : JSON.stringify(text)
      if (plainText === '') return ''
      // 执行AES-CBC加密（CBC模式+Pkcs7填充，通用标准）
      const cipher = CryptoJS.AES.encrypt(plainText, this.key, {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      // 返回Base64格式的加密串（CryptoJS默认输出）
      return cipher.toString()
    } catch (err) {
      console.error('[AES加密失败]', err.message)
      return ''
    }
  }

  /**
   * 解密方法：AES-CBC加密串转明文
   * @param {string} text - 要解密的Base64加密串
   * @returns {string} 解密后的明文，异常/空值则返回空串
   */
  decrypt(text) {
    try {
      // 加密串非空+类型校验
      if (typeof text !== 'string' || text.trim() === '') return ''
      // 执行AES-CBC解密
      const decipher = CryptoJS.AES.decrypt(text, this.key, {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      // 解析为Utf8明文，去除首尾空白符
      const plainText = decipher.toString(CryptoJS.enc.Utf8).trim()
      return plainText
    } catch (err) {
      console.error('[AES解密失败] 密钥/向量错误或加密串无效', err.message)
      return ''
    }
  }
}

/**
 * 生成指定长度的加密token（基于MD5哈希，不可逆）
 * @param {string|any} value - 原始值（非字符串自动序列化），默认空串
 * @param {number} length - token目标长度，默认32位（限制8-64位）
 * @param {string} prefix - 前缀（拼接在原始值前，增加唯一性），默认空串
 * @returns {string} 固定长度的MD5衍生token，异常则返回空串
 */
const token = (value = '', length = 32, prefix = '') => {
  try {
    // 校验CryptoJS MD5是否可用
    if (!CryptoJS || !CryptoJS.MD5) {
      throw new Error('CryptoJS MD5模块加载失败')
    }
    // 处理前缀：非字符串转为空串
    const validPrefix = typeof prefix === 'string' ? prefix.trim() : ''
    // 处理原始值：非字符串转为JSON字符串，避免原始类型哈希不一致
    const validValue = typeof value === 'string' ? value : JSON.stringify(value)
    // 拼接原始文本（前缀+原始值）
    const rawText = validPrefix + validValue
    // 计算MD5哈希（32位16进制字符串，不可逆）
    const md5Hash = CryptoJS.MD5(rawText).toString()
    // 处理token长度：限制在8-64位，超出则强制兜底
    let validLength = Number(length)
    validLength = isNaN(validLength) ? 32 : Math.max(MIN_TOKEN_LENGTH, Math.min(MAX_TOKEN_LENGTH, validLength))
    // 生成固定长度token：不足则递归拼接自身，超出则截取
    let result = md5Hash.substring(0, validLength)
    while (result.length < validLength) {
      result += token(result, validLength - result.length) // 递归补全长度
    }
    // 最终截取到目标长度（防止递归补全超出）
    return result.substring(0, validLength)
  } catch (err) {
    console.error('[Token生成失败]', err.message)
    return ''
  }
}

// 导出工具：保留原有调用方式，新增默认AES实例（基于环境变量配置）
export default {
  // 生成token方法（调用方式不变）
  token,
  // 创建AES实例（可自定义密钥/向量，调用方式不变）
  AES: (key, iv) => new AES(key, iv),
  // 【新增】默认AES实例（基于.env配置的密钥/向量，直接使用无需传参）
  defaultAes: new AES()
}