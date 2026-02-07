import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import { createPinia } from 'pinia'

// ========== 样式引入（按「第三方 → 自定义」顺序） ==========
// Bootstrap 5 样式 + 图标
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
// 自定义全局样式
import './assets/css/buyu.style.css'

// ========== 工具类引入 ==========
// Bootstrap 5 JS（建议放到最后，避免DOM未加载完成时执行）
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
// 自定义工具
import Toast from './utils/toast'
import socket from './utils/socket'
import API from './api'

// ========== 创建并配置应用实例 ==========
const app = createApp(App)

// 1. 注册 Pinia（状态管理）
const pinia = createPinia()
app.use(pinia)

// 2. 注册路由
app.use(router)

// 3. 全局挂载/提供工具（按「通用 → 业务」顺序）
// ✅ 修复：原代码直接用 bootstrap 变量会报错，需通过 import * as 解构后挂载
if (typeof window !== 'undefined') {
  window.bootstrap = bootstrap
}

// ✅ Toast 全局配置 + 挂载（配置优先，再挂载）

// 配置 Toast（可以根据需要添加全局配置）
// Toast.config({})

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

// ========== 挂载应用（确保所有配置完成后挂载） ==========
// 挂载前可等待路由就绪（可选，解决首屏路由白屏）
router.isReady().then(() => {
  app.mount('#app')
})