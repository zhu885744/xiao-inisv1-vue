/**
 * 配置管理工具
 * 支持基于配置文件的可视化配置系统
 */

// 配置存储键名
const CONFIG_KEY = 'themeConfig'
const CONFIG_COOKIE_KEY = 'THEME_CONFIG'
const CONFIG_INITIALIZED_KEY = 'configInitialized'

// 默认配置
const defaultConfig = {
  // 站点配置
  title: '朱某的生活印记',
  api_uri: '',
  socket_uri: '',
  router_mode: 'history',
  api_key: '',
  base_url: '/',
  token_name: 'INIS_LOGIN_TOKEN',
  
  // 功能配置
  enable_socket: true,
  socket_debug: false,
  lazy_time: 500
}

// 获取Cookie值
const getCookie = (name) => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1]
  return cookieValue ? decodeURIComponent(cookieValue) : null
}

// 设置Cookie值
const setCookie = (name, value, days = 365) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

// 删除Cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// 加载配置文件
export const loadConfigFile = async () => {
  try {
    const response = await fetch('/config/app.toml')
    if (response.ok) {
      const content = await response.text()
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

  // 1. 首先从配置文件获取
  try {
    const configFile = await loadConfigFile()
    if (configFile && configFile[key] !== undefined) {
      return configFile[key]
    }
  } catch (error) {
    console.error('从配置文件获取配置失败:', error)
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
    content += `title = "${config.title || '朱某的生活印记'}"\n`
    content += `api_uri = "${config.api_uri}"\n`
    content += `socket_uri = "${config.socket_uri || ''}"\n`
    content += `router_mode = "${config.router_mode}"\n`
    content += `api_key = "${config.api_key || ''}"\n`
    content += `base_url = "${config.base_url}"\n`
    content += `token_name = "${config.token_name}"\n\n`
    
    // 版本检测配置
    content += '# 版本检测配置\n'
    content += `enable_version_check = ${config.enable_version_check !== undefined ? config.enable_version_check : true}\n`
    content += `auto_check_update = ${config.auto_check_update !== undefined ? config.auto_check_update : true}\n`
    content += `check_interval = ${config.check_interval || 86400000}  # 24小时，单位毫秒\n\n`
    
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
const initConfig = async () => {
  try {
    const configFile = await loadConfigFile()
    if (configFile) {
      cachedConfig = configFile
    }
  } catch (error) {
    console.error('从配置文件获取配置失败:', error)
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
    
    // 版本检测配置
    content += '# 版本检测配置\n'
    content += `enable_version_check = ${defaultConfig.enable_version_check}\n`
    content += `auto_check_update = ${defaultConfig.auto_check_update}\n`
    content += `check_interval = ${defaultConfig.check_interval}  # 24小时，单位毫秒\n\n`
    
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
      content += `title = "${config.title || '朱某的生活印记'}"\n`
      content += `api_uri = "${config.api_uri}"\n`
      content += `socket_uri = "${config.socket_uri || ''}"\n`
      content += `router_mode = "${config.router_mode}"\n`
      content += `api_key = "${config.api_key || ''}"\n`
      content += `base_url = "${config.base_url}"\n`
      content += `token_name = "${config.token_name}"\n\n`
      
      // 版本检测配置
      content += '# 版本检测配置\n'
      content += `enable_version_check = ${config.enable_version_check !== undefined ? config.enable_version_check : true}\n`
      content += `auto_check_update = ${config.auto_check_update !== undefined ? config.auto_check_update : true}\n`
      content += `check_interval = ${config.check_interval || 86400000}  # 24小时，单位毫秒\n\n`
      
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
      // 检查内容是否不为空，且包含TOML配置项
      return content.trim() !== '' && 
             (content.includes('title =') || content.includes('api_uri ='))
    }
    return false
  } catch (error) {
    return false
  }
}

// 标记配置已初始化
export const markConfigInitialized = () => {
  // 配置文件存在即视为已初始化
  console.log('配置已标记为初始化')
}

// 重置配置初始化状态
export const resetConfigInitialized = () => {
  console.log('配置初始化状态已重置')
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