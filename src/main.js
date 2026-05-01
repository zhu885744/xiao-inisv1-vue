import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { useCommStore } from './store/comm'
import iSvg from './comps/custom/i-svg.vue'

import './assets/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/css/buyu.style.css'
import 'virtual:svg-icons-register'

import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import Toast from './utils/toast'
import socket from './utils/socket'
import API from './api'

const DEV = import.meta.env.DEV

const log = (...args) => {
  if (DEV) {
    console.log('[Init]', ...args)
  }
}

const logError = (...args) => {
  console.error('[Init Error]', ...args)
}

const setupGlobalTools = (app) => {
  if (typeof window !== 'undefined') {
    window.bootstrap = bootstrap
  }
  
  Toast.config({})
  app.config.globalProperties.$toast = Toast
  app.provide('$toast', Toast)
  
  if (typeof window !== 'undefined') {
    window.Toast = Toast
  }
  
  app.provide('socket', socket)
  app.config.globalProperties.$socket = socket
  app.config.globalProperties.$api = API
}

const setupSiteInfo = async (isRetry = false) => {
  try {
    log(isRetry ? '重试获取站点信息...' : '正在获取站点信息...')
    const commStore = useCommStore()
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
  
  setupGlobalTools(app)
  
  await setupSiteInfo(isRetry)
  
  await router.isReady()
  app.mount('#app')
  
  Fancybox.bind("[data-fancybox]", {})
  
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