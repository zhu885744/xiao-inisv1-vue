import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { useCommStore } from './store/comm'

// ========== 样式引入（按「第三方 → 自定义」顺序） ==========
// Bootstrap 5 样式 + 图标
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
// 自定义全局样式
import './assets/css/buyu.style.css'

// 动态加载 Bootstrap 定制化样式
const loadBootstrapCustomStyle = () => {
  const commStore = useCommStore()
  const siteInfo = commStore.siteInfo
  
  // 检查是否启用自定义样式，默认为 false
  const enableCustomStyle = siteInfo?.enable_custom_style === true
  
  if (enableCustomStyle) {
    // 动态加载样式文件
    import('./assets/css/bootstrap-custom.css')
    console.log('Bootstrap 定制化样式已加载')
  } else {
    console.log('Bootstrap 定制化样式已禁用')
  }
}

// ========== 工具类引入 ==========
// Bootstrap 5 JS（建议放到最后，避免DOM未加载完成时执行）
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Fancybox 图片灯箱
import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
// 自定义工具
import Toast from './utils/toast'
import socket from './utils/socket'
import API from './api'

// ========== 初始化应用 ==========
async function initApp() {
  try {
    // 1. 配置文件已经在模块加载时通过同步请求加载完成
    console.log('配置文件已加载')
    
    // 2. 创建并配置应用实例
    const app = createApp(App)
    
    // 3. 注册 Pinia（状态管理）
    const pinia = createPinia()
    app.use(pinia)
    
    // 4. 注册路由
    app.use(router)
    
    // 5. 全局挂载/提供工具（按「通用 → 业务」顺序）
    // ✅ 修复：原代码直接用 bootstrap 变量会报错，需通过 import * as 解构后挂载
    if (typeof window !== 'undefined') {
      window.bootstrap = bootstrap
    }
    
    // ✅ Toast 全局配置 + 挂载（配置优先，再挂载）
    
    // 配置 Toast（可以根据需要添加全局配置）
    Toast.config({})
    
    // 挂载到 Vue 实例
    app.config.globalProperties.$toast = Toast
    app.provide('$toast', Toast) // 组合式API用
    
    // 同时挂载到 window 对象，方便其他地方使用
    if (typeof window !== 'undefined') {
      window.Toast = Toast
    }
    
    // ✅ Socket 全局提供
    app.provide('socket', socket)
    app.config.globalProperties.$socket = socket
    
    // ✅ API 全局挂载
    app.config.globalProperties.$api = API
    
    // 6. 提前获取站点信息（在挂载前）
    console.log('正在获取站点信息...')
    const commStore = useCommStore()
    await commStore.fetchSiteInfo()
    console.log('站点信息获取完成')
    
    // 7. 动态加载 Bootstrap 定制化样式
    loadBootstrapCustomStyle()
    
    // 8. 动态设置favicon
    if (commStore.siteInfo?.favicon && typeof window !== 'undefined') {
      const favicon = document.querySelector('link[rel="icon"]')
      if (favicon) {
        favicon.href = commStore.siteInfo.favicon
        console.log('Favicon已更新')
      }
    }
    
    // 7. 挂载应用（确保所有配置完成后挂载）
    // 挂载前可等待路由就绪（可选，解决首屏路由白屏）
    await router.isReady()
    app.mount('#app')
    console.log('应用初始化完成')
    
    // 绑定 Fancybox 图片灯箱
    Fancybox.bind("[data-fancybox]", {
      // Your custom options for a specific gallery
    });
  } catch (error) {
    console.error('应用初始化失败:', error)
    // 即使配置加载失败，也尝试启动应用
    try {
      const app = createApp(App)
      const pinia = createPinia()
      app.use(pinia)
      app.use(router)
      
      if (typeof window !== 'undefined') {
        window.bootstrap = bootstrap
      }
      
      app.config.globalProperties.$toast = Toast
      app.provide('$toast', Toast)
      
      if (typeof window !== 'undefined') {
        window.Toast = Toast
      }
      
      app.provide('socket', socket)
      app.config.globalProperties.$socket = socket
      app.config.globalProperties.$api = API
      
      // 即使出错也尝试获取站点信息
      try {
        const commStore = useCommStore()
        await commStore.fetchSiteInfo()
        
        // 动态加载 Bootstrap 定制化样式
        loadBootstrapCustomStyle()
        
        // 动态设置favicon
        if (commStore.siteInfo?.favicon && typeof window !== 'undefined') {
          const favicon = document.querySelector('link[rel="icon"]')
          if (favicon) {
            favicon.href = commStore.siteInfo.favicon
            console.log('Favicon已更新')
          }
        }
      } catch (siteInfoError) {
        console.error('获取站点信息失败:', siteInfoError)
        // 即使获取站点信息失败，也尝试加载默认样式
        import('./assets/css/bootstrap-custom.css')
        console.log('默认加载 Bootstrap 定制化样式')
      }
      
      await router.isReady()
      app.mount('#app')
      
      // 绑定 Fancybox 图片灯箱
      Fancybox.bind("[data-fancybox]", {
        // Your custom options for a specific gallery
      });
    } catch (innerError) {
      console.error('启动应用失败:', innerError)
    }
  }
}

// 启动应用
initApp()