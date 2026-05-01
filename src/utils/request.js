/**
 * HTTP 请求封装工具
 * 基于 axios 封装，提供统一的请求拦截、响应处理、错误处理和日志记录
 * 
 * 核心特性：
 * - 自动注入 API-Key 和 Token
 * - 请求取消支持
 * - 响应数据自动提取
 * - 统一错误处理
 * - 请求日志记录
 * - 开发/生产环境适配
 */

import axios from 'axios'
import utils from '@/utils/utils'
import config from '@/utils/config'

const DEV = import.meta.env.DEV
const DEFAULT_TIMEOUT = 60 * 1000
const MAX_RETRY = 2

let baseURL = DEV ? '' : config.getSync('api_uri') || ''

const axiosInstance = axios.create({
  timeout: DEFAULT_TIMEOUT,
  withCredentials: false
})

const initBaseURL = async () => {
  if (!DEV) {
    try {
      const api_uri = await config.get('api_uri')
      if (api_uri) {
        baseURL = api_uri
        axiosInstance.defaults.baseURL = api_uri
      }
    } catch (error) {
      console.error('[Request] 初始化API地址失败:', error)
    }
  }
}

initBaseURL()

const logRequest = (method, url, data) => {
  if (DEV) {
    console.log(`[Request] ${method.toUpperCase()} ${url}`, data || '')
  }
}

const logResponse = (method, url, data, status) => {
  if (DEV) {
    console.log(`[Response] ${method.toUpperCase()} ${url} [${status}]`, data || '')
  }
}

const logError = (method, url, error) => {
  console.error(`[Request Error] ${method.toUpperCase()} ${url}`, error)
}

const handleError = (error) => {
  const response = error.response
  const message = response?.data?.msg || response?.statusText || error.message || '请求失败'
  
  const errorInfo = {
    code: response?.status || -1,
    message,
    data: response?.data,
    url: error.config?.url
  }
  
  console.error('[Request] 请求错误:', errorInfo)
  return Promise.reject(errorInfo)
}

const createCancelToken = () => {
  return axios.CancelToken.source()
}

const requestWithRetry = async (method, url, dataOrParams, options = {}) => {
  let attempts = 0
  let lastError = null
  
  while (attempts <= MAX_RETRY) {
    try {
      const cancelToken = createCancelToken()
      const requestConfig = {
        baseURL: options.baseURL || baseURL,
        cancelToken: cancelToken.token,
        ...options
      }

      if (!DEV && !requestConfig.baseURL) {
        throw new Error('请在配置文件中设置后端API地址（api_uri）')
      }

      logRequest(method, url, dataOrParams)
      
      let response
      switch (method.toLowerCase()) {
        case 'get':
        case 'delete':
          response = await axiosInstance[method](url, { params: dataOrParams, ...requestConfig })
          break
        case 'post':
        case 'put':
        case 'patch':
          response = await axiosInstance[method](url, dataOrParams, requestConfig)
          break
        default:
          throw new Error(`不支持的请求方法: ${method}`)
      }

      logResponse(method, url, response, response.status)
      return response.data
      
    } catch (error) {
      lastError = error
      attempts++
      
      if (error?.code === 'ERR_CANCELED') {
        throw error
      }

      if (attempts > MAX_RETRY || !isRetryable(error)) {
        logError(method, url, error)
        return handleError(error)
      }

      const delay = Math.pow(2, attempts) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return handleError(lastError)
}

const isRetryable = (error) => {
  if (error?.response) {
    const status = error.response.status
    return status >= 500 || status === 429
  }
  return error?.code === 'ECONNABORTED' || !error?.response
}

axiosInstance.interceptors.request.use(
  axiosConfig => {
    const apiKey = config.getSync('api_key') || globalThis?.inis?.api?.key
    if (!utils.is.empty(apiKey)) {
      axiosConfig.headers['i-api-key'] = apiKey
    }

    const TOKEN_NAME = config.getSync('token_name') || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
    if (utils.has.cookie(TOKEN_NAME)) {
      const token = utils.get.cookie(TOKEN_NAME)
      if (!utils.is.empty(token)) {
        axiosConfig.headers.Authorization = token
      }
    }

    return axiosConfig
  },
  error => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

const request = {
  get: async (url, params = {}, options = {}) => {
    return requestWithRetry('get', url, params, options)
  },

  delete: async (url, params = {}, options = {}) => {
    return requestWithRetry('delete', url, params, options)
  },

  put: async (url, data = {}, options = {}) => {
    return requestWithRetry('put', url, data, options)
  },

  post: async (url, data = {}, options = {}) => {
    return requestWithRetry('post', url, data, options)
  },

  patch: async (url, data = {}, options = {}) => {
    return requestWithRetry('patch', url, data, options)
  },

  all: async (array) => {
    if (!DEV && !baseURL) {
      return Promise.reject(new Error('请在配置文件中设置后端API地址（api_uri）'))
    }
    return axios.all(array)
  },

  createCancelToken,

  getBaseURL: () => baseURL,

  setBaseURL: (url) => {
    baseURL = url
    axiosInstance.defaults.baseURL = url
  },

  axios: axiosInstance
}

export default request