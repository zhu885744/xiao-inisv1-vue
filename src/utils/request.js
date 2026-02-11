import axios from 'axios'
import utils from '@/utils/utils'
import config from '@/utils/config'

// 设置超时
axios.defaults.timeout = 60 * 1000
// 基础地址：使用配置管理工具中的配置
// 开发环境会自动使用.env.development中的配置
// 生产环境会自动使用app.toml中的配置
let baseURL = import.meta.env.DEV ? '' : config.getSync('api_uri') || ''

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
    all: async array => await axios.all(array),

    // GET请求：直接传递参数
    get: async (url, params = {}) => {
      return await axios.get(url, { params, baseURL })
    },

    // DELETE请求：保留原有封装方式，不修改
    del: async (url, params = {}, config = {}) => await axios.delete(url, { params, baseURL, ...config }),

    // PUT请求：保留原有封装方式，不修改
    put: async (url, data = {}, config = {}) => await axios.put(url, data, { baseURL, ...config }),

    // POST请求：保留原有封装方式，不修改
    post: async (url, data = {}, config = {}) => await axios.post(url, data, { baseURL, ...config }),

    // 获取当前基础地址
    getBaseURL: () => baseURL,
}