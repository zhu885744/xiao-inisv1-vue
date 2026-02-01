import axios from 'axios'
import utils from '@/utils/utils'

// 读取Vite环境变量：新增，用于配置优先读取
const VITE_ENV = import.meta.env

// 设置超时
axios.defaults.timeout = 60 * 1000
// 基础地址：环境变量优先，全局inis.api.uri兜底，最后兜底空字符串（保留原有兜底逻辑）
axios.defaults.baseURL = VITE_ENV.VITE_API_URI || globalThis?.inis?.api?.uri || ''

// 请求拦截
// 所有的网络请求都会先走这个方法
axios.interceptors.request.use(
    config => {
        // API-Key：环境变量VITE_API_KEY优先，全局inis.api.key兜底（保留原有判断逻辑）
        const apiKey = VITE_ENV.VITE_API_KEY || globalThis?.inis?.api?.key
        if (!utils.is.empty(apiKey)) {
            config.headers['i-api-key'] = apiKey
        }
        // Token名称：环境变量VITE_TOKEN_NAME优先，全局inis.token_name兜底，最后兜底INIS_LOGIN_TOKEN（保留原有兜底逻辑）
        let TOKEN_NAME = VITE_ENV.VITE_TOKEN_NAME || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
        if (utils.has.cookie(TOKEN_NAME)) {
            let token = utils.get.cookie(TOKEN_NAME)
            if (!utils.is.empty(token)) {
                config.headers.Authorization = token
            }
        }
        return config
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

    // GET请求：保留原有封装方式，不修改
    get: async (url, params = {}, config = {}) => await axios.get(url, { params, ...config }),

    // DELETE请求：保留原有封装方式，不修改
    del: async (url, params = {}, config = {}) => await axios.delete(url, { params, ...config }),

    // PUT请求：保留原有封装方式，不修改
    put: async (url, data = {}, config = {}) => await axios.put(url, data, config),

    // POST请求：保留原有封装方式，不修改
    post: async (url, data = {}, config = {}) => await axios.post(url, data, config),
}