import { createApp, markRaw } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { useCommStore } from './store/comm'
import iSvg from './comps/custom/i-svg.vue'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/css/buyu.style.css'
import 'virtual:svg-icons-register'

const DEV = import.meta.env.DEV

const log = (...args) => {
  if (DEV) {
    console.log('[Init]', ...args)
  }
}

const logError = (...args) => {
  console.error('[Init Error]', ...args)
}

const setupGlobalTools = async (app) => {
  try {
    const [bootstrapModule, fancyboxModule, toastModule, socketModule, apiModule] = await Promise.all([
      import('bootstrap/dist/js/bootstrap.bundle.min.js'),
      import('@fancyapps/ui/dist/fancybox/'),
      import('./utils/toast'),
      import('./utils/socket'),
      import('./api')
    ])
    
    const { default: bootstrap } = bootstrapModule
    const { Fancybox } = fancyboxModule
    const { default: Toast } = toastModule
    const { default: socket } = socketModule
    const { default: API } = apiModule
    
    if (typeof window !== 'undefined' && bootstrap) {
      window.bootstrap = bootstrap
    }
    
    if (Toast) {
      Toast.config({})
      app.config.globalProperties.$toast = Toast
      app.provide('$toast', Toast)
      
      if (typeof window !== 'undefined') {
        window.Toast = Toast
      }
    }
    
    if (socket) {
      app.provide('socket', socket)
      app.config.globalProperties.$socket = socket
    }
    
    if (API) {
      app.config.globalProperties.$api = API
    }
    
    if (Fancybox) {
      Fancybox.bind("[data-fancybox]", {})
    }
    
    return { Toast, socket, API }
  } catch (error) {
    logError('初始化全局工具失败:', error)
    return {}
  }
}

const setupSiteInfo = async (commStore) => {
  try {
    log('正在获取站点信息...')
    await commStore.fetchSiteInfo()
    
    if (commStore.siteInfo?.favicon && typeof window !== 'undefined') {
      const favicon = document.querySelector('link[rel="icon"]')
      if (favicon) {
        favicon.href = commStore.siteInfo.favicon
        log('Favicon已更新')
      }
    }
    
    const htmlElement = document.documentElement
    htmlElement.setAttribute('data-bs-theme', commStore.isDarkMode ? 'dark' : 'light')
    
    log('站点信息获取完成')
    return true
  } catch (error) {
    logError('获取站点信息失败:', error)
    return false
  }
}

const createAndConfigureApp = async (isRetry = false) => {
  log(isRetry ? '重试初始化应用...' : '开始初始化应用...')
  
  const app = createApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  app.use(router)
  app.component('iSvg', iSvg)
  
  const commStore = useCommStore()
  
  await router.isReady()
  
  app.mount('#app')
  
  await Promise.all([
    setupGlobalTools(app),
    setupSiteInfo(commStore)
  ])
  
  log('应用初始化完成')
}

async function initApp() {
  log('配置文件已加载')
  
  try {
    await createAndConfigureApp()
  } catch (error) {
    logError('应用初始化失败:', error)
    
    try {
      await createAndConfigureApp(true)
    } catch (innerError) {
      logError('重试启动应用失败:', innerError)
    }
  }
}

initApp()