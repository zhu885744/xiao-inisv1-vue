// 全局配置文件 - 打包后可直接修改，刷新页面立即生效【无需重新打包、无需改其他文件】
// 核心注意事项：API和Socket的协议必须严格匹配！
// ✅ 正确搭配：http → ws  |  https → wss
// ❌ 错误搭配：http → wss |  https → ws（会导致连接失败）
globalThis.inis = {
  api: {
    // API服务地址（示例：本地后端http://127.0.0.1:8080 | 线上后端https://cs.zhuxu.asia）
    uri: 'https://cs.zhuxu.asia',
    // 请求密钥 - 后端开启API KEY验证时填写，未开启则留空（''）即可，不要删除key字段
    key: ''
  },
  socket: {
    // Socket服务地址（示例：本地后端ws://127.0.0.1:8080/socket | 线上后端wss://cs.zhuxu.asia/socket）
    uri: 'wss://cs.zhuxu.asia/socket'
  },
  // 通用交互延迟（毫秒），无需修改
  lazy_time: 500,
  // Token存储的Cookie名称，后端未指定则无需修改
  token_name: 'INIS_LOGIN_TOKEN',
  // Socket调试模式：true-开启日志（排查问题用），false-关闭日志（生产用），默认false
  socket_debug: false,
  // 路由模式：hash/history，和前端路由配置保持一致，默认hash（无需修改）
  router_mode: 'hash',
  // 基础路径：和Vite的vite.config.js中base配置一致，默认/（无需修改，除非前端部署时有二级路径）
  base_url: '/'
}