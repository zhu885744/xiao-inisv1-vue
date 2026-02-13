import axios from 'axios'
import utils from '@/utils/utils'
import config from '@/utils/config'

// 设置超时
axios.defaults.timeout = 60 * 1000
// 基础地址：使用配置管理工具中的配置
// 开发环境使用相对路径，通过Vite代理发送请求
// 生产环境会自动使用app.toml中的配置
let baseURL = import.meta.env.DEV ? '' : config.getSync('api_uri') || ''

// 设置axios默认配置
axios.defaults.withCredentials = false

// 异步初始化基础地址（从配置文件获取）
const initBaseURL = async () => {
  if (!import.meta.env.DEV) {
    try {
      const api_uri = await config.get('api_uri')
      if (api_uri) {
        baseURL = api_uri
        axios.defaults.baseURL = api_uri
      }
    } catch (error) {
      console.error('初始化API地址失败:', error)
    }
  }
}

// 初始化基础地址
initBaseURL()

// 请求拦截
// 所有的网络请求都会先走这个方法
axios.interceptors.request.use(
    axiosConfig => {
        // API-Key：从配置管理工具中获取
        const apiKey = config.getSync('api_key') || globalThis?.inis?.api?.key
        if (!utils.is.empty(apiKey)) {
            axiosConfig.headers['i-api-key'] = apiKey
        }
        // Token名称：从配置管理工具中获取
        let TOKEN_NAME = config.getSync('token_name') || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
        if (utils.has.cookie(TOKEN_NAME)) {
            let token = utils.get.cookie(TOKEN_NAME)
            if (!utils.is.empty(token)) {
                axiosConfig.headers.Authorization = token
            }
        }
        return axiosConfig
    },
    error  => Promise.reject(error)
)

// 响应拦截
// 所有的网络请求返回数据之后都会先执行这个方法
axios.interceptors.response.use(
    response => response.data,
    error => Promise.reject(error)
)

export default {
    // all
    all: async array => {
      // 检查是否为开发环境或baseURL是否存在
      if (import.meta.env.DEV || baseURL) {
        return await axios.all(array)
      } else {
        return Promise.reject(new Error('请在配置文件中设置后端API地址（api_uri）'))
      }
    },

    // GET请求：直接传递参数
    get: async (url, params = {}, config = {}) => {
      // 检查是否为开发环境或baseURL是否存在
      if (import.meta.env.DEV || baseURL) {
        return await axios.get(url, { params, baseURL, ...config })
      } else {
        return Promise.reject(new Error('请在配置文件中设置后端API地址（api_uri）'))
      }
    },

    // DELETE请求：保留原有封装方式，不修改
    del: async (url, params = {}, config = {}) => {
      // 检查是否为开发环境或baseURL是否存在
      if (import.meta.env.DEV || baseURL) {
        return await axios.delete(url, { params, baseURL, ...config })
      } else {
        return Promise.reject(new Error('请在配置文件中设置后端API地址（api_uri）'))
      }
    },

    // PUT请求：保留原有封装方式，不修改
    put: async (url, data = {}, config = {}) => {
      // 检查是否为开发环境或baseURL是否存在
      if (import.meta.env.DEV || baseURL) {
        return await axios.put(url, data, { baseURL, ...config })
      } else {
        return Promise.reject(new Error('请在配置文件中设置后端API地址（api_uri）'))
      }
    },

    // POST请求：保留原有封装方式，不修改
    post: async (url, data = {}, config = {}) => {
      // 检查是否为开发环境或baseURL是否存在
      if (import.meta.env.DEV || baseURL) {
        return await axios.post(url, data, { baseURL, ...config })
      } else {
        return Promise.reject(new Error('请在配置文件中设置后端API地址（api_uri）'))
      }
    },

    // 获取当前基础地址
    getBaseURL: () => baseURL,
}