/**
 * 配置管理工具
 * 仅支持基于app.toml配置文件的配置系统
 */

// 默认配置
const defaultConfig = {
  // 站点配置
  title: '朱某的生活印记',
  api_uri: '',
  socket_uri: '',
  router_mode: 'hash',
  api_key: '',
  base_url: '/',
  token_name: 'INIS_LOGIN_TOKEN',
  
  // 功能配置
  enable_socket: true,
  socket_debug: false,
  lazy_time: 500
}

// 加载配置文件
export const loadConfigFile = async () => {
  try {
    const response = await fetch('/config/app.toml')
    if (response.ok) {
      const content = await response.text()
      // 检查内容是否为HTML页面
      if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
        console.error('配置文件返回的是HTML页面，不是有效的TOML配置')
        cachedConfig = { ...defaultConfig }
        return null
      }
      // 解析TOML内容
      const config = {}
      content.split('\n').forEach(line => {
        line = line.trim()
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=').map(item => item.trim())
          if (key && value) {
            // 移除引号
            const cleanedValue = value.replace(/^['"]|['"]$/g, '')
            // 转换布尔值和数字
            if (cleanedValue === 'true') {
              config[key] = true
            } else if (cleanedValue === 'false') {
              config[key] = false
            } else if (!isNaN(cleanedValue)) {
              config[key] = Number(cleanedValue)
            } else {
              config[key] = cleanedValue
            }
          }
        }
      })
      // 检查是否解析出了有效的配置项
      if (Object.keys(config).length === 0) {
        console.error('配置文件内容为空或无效')
        cachedConfig = { ...defaultConfig }
        return null
      }
      // 更新缓存的配置
      cachedConfig = config
      return config
    }
  } catch (error) {
    console.error('加载配置文件失败:', error)
  }
  // 加载失败时使用默认配置
  cachedConfig = { ...defaultConfig }
  return null
}

// 同步获取配置（用于初始化）
export const getConfigSync = (key, defaultValue = null) => {
  // 开发环境优先使用环境变量
  if (import.meta.env.DEV) {
    const envKey = `VITE_${key.toUpperCase()}`
    if (import.meta.env[envKey] !== undefined) {
      return import.meta.env[envKey]
    }
  }

  // 从缓存的配置文件中获取（如果已加载）
  if (cachedConfig && cachedConfig[key] !== undefined) {
    return cachedConfig[key]
  }

  // 从默认配置获取
  if (defaultConfig[key] !== undefined) {
    return defaultConfig[key]
  }

  // 如果都没有，则返回默认值
  return defaultValue
}

// 获取配置
export const getConfig = async (key, defaultValue = null) => {
  // 开发环境优先使用环境变量
  if (import.meta.env.DEV) {
    const envKey = `VITE_${key.toUpperCase()}`
    if (import.meta.env[envKey] !== undefined) {
      return import.meta.env[envKey]
    }
  }

  // 1. 首先从缓存的配置文件中获取
  if (cachedConfig && cachedConfig[key] !== undefined) {
    return cachedConfig[key]
  }

  // 2. 如果配置文件中没有，则从默认配置获取
  if (defaultConfig[key] !== undefined) {
    return defaultConfig[key]
  }

  // 3. 如果都没有，则返回默认值
  return defaultValue
}

// 设置配置
export const setConfig = (key, value) => {
  // 获取当前配置
  const currentConfig = getAllConfig()
  
  // 更新配置
  currentConfig[key] = value
  
  // 注意：不再在单个配置项设置时下载文件
  // 下载操作将在saveAllConfig函数中统一执行
  console.log(`配置项 ${key} 已更新`)
}

// 保存所有配置（新增）
export const saveAllConfig = (config) => {
  // 保存到配置文件（浏览器环境下无法直接写入，仅提供下载功能）
  console.log('配置已更新，需要手动更新 app.toml 文件')
  
  // 生成TOML内容
  const generateTomlContent = (config) => {
    let content = `# 主题配置文件
# 生成时间: ${new Date().toISOString()}\n\n`
    
    // 站点配置
    content += '# 站点配置\n'
    content += `title = "${config.title || '请设置网站名'}"\n`
    content += `api_uri = "${config.api_uri}"\n`
    content += `socket_uri = "${config.socket_uri || ''}"\n`
    content += `router_mode = "${config.router_mode}"\n`
    content += `api_key = "${config.api_key || ''}"\n`
    content += `base_url = "${config.base_url}"\n`
    content += `token_name = "${config.token_name}"\n\n`
    
    // 功能配置
    content += '# 功能配置\n'
    content += `enable_socket = ${config.enable_socket !== undefined ? config.enable_socket : true}\n`
    content += `socket_debug = ${config.socket_debug !== undefined ? config.socket_debug : false}\n`
    content += `lazy_time = ${config.lazy_time}  # 通用交互延迟，单位毫秒\n`
    
    return content
  }
  
  // 下载配置文件
  const content = generateTomlContent(config)
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'app.toml'
  a.click()
  URL.revokeObjectURL(url)
}

// 缓存配置对象
let cachedConfig = null

// 初始化配置
const initConfig = () => {
  // 检查是否为开发环境
  const isDev = import.meta.env.DEV
  
  if (isDev) {
    // 开发环境：跳过配置文件检测，使用默认配置或环境变量
    console.log('开发环境：跳过配置文件检测')
    // 从环境变量读取配置
    const envConfig = {
      title: import.meta.env.VITE_TITLE || defaultConfig.title,
      api_uri: import.meta.env.VITE_API_URI || defaultConfig.api_uri,
      router_mode: import.meta.env.VITE_ROUTER_MODE || defaultConfig.router_mode,
      base_url: import.meta.env.VITE_BASE_URL || defaultConfig.base_url
    }
    cachedConfig = { ...defaultConfig, ...envConfig }
    console.log('开发环境配置:', cachedConfig)
    return
  }
  
  // 生产环境：检测配置文件
  try {
    // 同步加载配置文件
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/config/app.toml', false) // 同步请求
    xhr.send()
    
    if (xhr.status === 200) {
      const content = xhr.responseText
      // 检查内容是否为HTML页面
      if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
        console.error('配置文件返回的是HTML页面，不是有效的TOML配置')
        cachedConfig = { ...defaultConfig }
        return
      }
      // 解析TOML内容
      const config = {}
      content.split('\n').forEach(line => {
        line = line.trim()
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=').map(item => item.trim())
          if (key && value) {
            // 移除引号
            const cleanedValue = value.replace(/^['"]|['"]$/g, '')
            // 转换布尔值和数字
            if (cleanedValue === 'true') {
              config[key] = true
            } else if (cleanedValue === 'false') {
              config[key] = false
            } else if (!isNaN(cleanedValue)) {
              config[key] = Number(cleanedValue)
            } else {
              config[key] = cleanedValue
            }
          }
        }
      })
      // 检查是否解析出了有效的配置项
      if (Object.keys(config).length === 0) {
        // console.error('配置文件内容为空或无效')
        cachedConfig = { ...defaultConfig }
        return
      }
      // 更新缓存的配置
      cachedConfig = config
      // console.log('生产环境：配置文件加载完成:', config)
    } else {
      // console.error('生产环境：加载配置文件失败:', xhr.status)
      cachedConfig = { ...defaultConfig }
    }
  } catch (error) {
    // console.error('生产环境：从配置文件获取配置失败:', error)
    cachedConfig = { ...defaultConfig }
  }
}

// 初始化配置
initConfig()

// 获取所有配置
export const getAllConfig = () => {
  // 如果缓存中没有配置，则返回默认配置
  if (!cachedConfig) {
    return { ...defaultConfig }
  }
  return cachedConfig
}

// 重置配置
export const resetConfig = () => {
  // 生成默认配置的TOML内容
  const generateDefaultTomlContent = () => {
    let content = `# 主题配置文件
# 生成时间: ${new Date().toISOString()}\n\n`
    
    // 站点配置
    content += '# 站点配置\n'
    content += `title = "${defaultConfig.title}"\n`
    content += `api_uri = "${defaultConfig.api_uri}"\n`
    content += `socket_uri = "${defaultConfig.socket_uri}"\n`
    content += `router_mode = "${defaultConfig.router_mode}"\n`
    content += `api_key = "${defaultConfig.api_key}"\n`
    content += `base_url = "${defaultConfig.base_url}"\n`
    content += `token_name = "${defaultConfig.token_name}"\n\n`
    
    // 功能配置
    content += '# 功能配置\n'
    content += `enable_socket = ${defaultConfig.enable_socket}\n`
    content += `socket_debug = ${defaultConfig.socket_debug}\n`
    content += `lazy_time = ${defaultConfig.lazy_time}  # 通用交互延迟，单位毫秒\n`
    
    return content
  }
  
  // 下载默认配置文件
  const content = generateDefaultTomlContent()
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'app.toml'
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('配置已重置为默认值，请手动更新 app.toml 文件')
}

// 导出配置
export const exportConfig = () => {
  const config = getAllConfig()
  const configStr = JSON.stringify(config, null, 2)
  const blob = new Blob([configStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `theme-config-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('配置已导出')
}

// 导入配置
export const importConfig = (configStr) => {
  try {
    const config = JSON.parse(configStr)
    
    // 生成TOML内容
    const generateTomlContent = (config) => {
      let content = `# 主题配置文件
# 生成时间: ${new Date().toISOString()}\n\n`
      
      // 站点配置
      content += '# 站点配置\n'
      content += `title = "${config.title || '请设置网站名'}"\n`
      content += `api_uri = "${config.api_uri}"\n`
      content += `socket_uri = "${config.socket_uri || ''}"\n`
      content += `router_mode = "${config.router_mode}"\n`
      content += `api_key = "${config.api_key || ''}"\n`
      content += `base_url = "${config.base_url}"\n`
      content += `token_name = "${config.token_name}"\n\n`
      
      // 功能配置
      content += '# 功能配置\n'
      content += `enable_socket = ${config.enable_socket !== undefined ? config.enable_socket : true}\n`
      content += `socket_debug = ${config.socket_debug !== undefined ? config.socket_debug : false}\n`
      content += `lazy_time = ${config.lazy_time}  # 通用交互延迟，单位毫秒\n`
      
      return content
    }
    
    // 下载配置文件
    const content = generateTomlContent(config)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'app.toml'
    a.click()
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('导入配置失败:', error)
    return false
  }
}

// 检查配置是否已初始化
export const isConfigInitialized = async () => {
  // 检查配置文件是否存在且包含有效配置
  try {
    const response = await fetch('/config/app.toml')
    if (response.ok) {
      const content = await response.text()
      // 检查内容是否不为空，且包含TOML配置项，且不是HTML页面
      return content.trim() !== '' && 
             (content.includes('title =') || content.includes('api_uri =')) &&
             !content.includes('<!DOCTYPE html>') &&
             !content.includes('<html')
    }
    return false
  } catch (error) {
    return false
  }
}

// 标记配置已初始化
export const markConfigInitialized = () => {
  // 配置文件存在即视为已初始化
  // console.log('配置已标记为初始化')
}

// 重置配置初始化状态
export const resetConfigInitialized = () => {
  // console.log('配置初始化状态已重置')
}

export default {
  get: getConfig,
  getSync: getConfigSync,
  set: setConfig,
  getAll: getAllConfig,
  saveAll: saveAllConfig,
  reset: resetConfig,
  export: exportConfig,
  import: importConfig,
  isInitialized: isConfigInitialized,
  markInitialized: markConfigInitialized,
  resetInitialized: resetConfigInitialized
}