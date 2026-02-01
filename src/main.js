import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import { createPinia } from 'pinia'

// Bootstrap 5 CSS 全部样式
import 'bootstrap/dist/css/bootstrap.min.css'
// Bootstrap 5 JS bundle（包含Popper.js，所有JS插件都在这，无需单独导入其他JS）
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Bootstrap 图标库（不变）
import 'bootstrap-icons/font/bootstrap-icons.css'

// 导入自定义样式文件
// import './assets/css/buyu.mode.css'
import './assets/css/buyu.style.css'

// 导入 socket
import socket from './utils/socket'

// API 导入路径
import API from './api'

// 创建 Vue 应用实例
const app = createApp(App)

// 定义socket全局属性
app.provide('socket', socket)

// 创建 Pinia 实例并挂载
const pinia = createPinia()
app.use(pinia)

// 挂载全局属性
app.config.globalProperties.$api = API

// 挂载路由
app.use(router)

// 挂载应用到 DOM
app.mount('#app')