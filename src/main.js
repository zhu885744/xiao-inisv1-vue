import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import { createPinia } from 'pinia'

// Bootstrap 5 全套引入
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// 自定义样式
import './assets/css/buyu.style.css'

// 👉 1. 引入Qmsg样式和封装实例
import './assets/css/buyu.qmsg.css'
import Qmsg from './utils/qmsg'

// 全局依赖：socket + API
import socket from './utils/socket'
import API from './api'

// 创建Vue实例
const app = createApp(App)

// 👉 2. 全局挂载Qmsg，支持组件内this.$Qmsg调用
app.config.globalProperties.$Qmsg = Qmsg;
// 可选：提供给组合式API，支持inject('$Qmsg')
app.provide('$Qmsg', Qmsg);

// 👉 3. 可选：全局配置Qmsg（按需修改，比如默认显示关闭按钮、修改超时时间）
Qmsg.config({
  showClose: true, // 默认显示关闭按钮
  timeout: 3000,   // 默认3秒关闭
  maxNums: 6       // 最多同时显示6条
});

// 全局提供+挂载socket
app.provide('socket', socket)
app.config.globalProperties.$socket = socket

// Pinia注册
const pinia = createPinia()
app.use(pinia)

// 全局挂载API
app.config.globalProperties.$api = API

// 路由注册
app.use(router)

// 挂载应用
app.mount('#app')