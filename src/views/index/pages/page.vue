<!-- 独立页面 -->
<template>
  <div class="card mt-2">
    <div class="card-header py-3">
      <h5 class="mb-0">Qmsg 消息提示框 - 全功能测试</h5>
    </div>
    <div class="card-body">
      <!-- 基础类型测试组 -->
      <div class="mb-4">
        <h6 class="text-muted mb-3">✨ 基础类型（默认配置）</h6>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-success btn-sm" @click="testSuccess">成功提示</button>
          <button class="btn btn-danger btn-sm" @click="testError">错误提示</button>
          <button class="btn btn-warning btn-sm" @click="testWarning">警告提示</button>
          <button class="btn btn-primary btn-sm" @click="testInfo">信息提示</button>
          <button class="btn btn-info btn-sm" @click="testLoading">加载提示</button>
        </div>
      </div>

      <!-- 自定义配置测试组 -->
      <div class="mb-4">
        <h6 class="text-muted mb-3">⚙️ 自定义配置（显示关闭按钮/修改超时/改变位置）</h6>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-secondary btn-sm" @click="testShowClose">显示关闭按钮</button>
          <button class="btn btn-secondary btn-sm" @click="testLongTimeout">5秒后自动关闭</button>
          <button class="btn btn-secondary btn-sm" @click="testLeftPosition">左对齐显示</button>
          <button class="btn btn-secondary btn-sm" @click="testRightPosition">右对齐显示</button>
          <button class="btn btn-secondary btn-sm" @click="testNoAutoClose">不自动关闭</button>
        </div>
      </div>

      <!-- 高级功能测试组 -->
      <div class="mb-4">
        <h6 class="text-muted mb-3">🚀 高级功能（手动关闭/重复消息/批量关闭）</h6>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-dark btn-sm" @click="testManualClose">手动关闭提示</button>
          <button class="btn btn-dark btn-sm" @click="testRepeatMsg">重复点击测试（去重计数）</button>
          <button class="btn btn-dark btn-sm" @click="testCloseAll">关闭所有提示</button>
        </div>
      </div>

      <!-- 测试说明 -->
      <div class="mt-4 p-3 rounded">
        <small class="text-muted">
          📌 说明：1. 鼠标悬浮提示框可暂停倒计时；2. 重复点击「重复消息测试」会显示计数；3. 超过5条提示会自动关闭最早的；4. 加载提示需手动关闭
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组合式API 引入Qmsg（如果用选项式API可直接用this.$Qmsg，无需这行）
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const $Qmsg = proxy.$Qmsg

// 存储重复消息实例，用于测试去重计数
let repeatMsgInstance = null

// ========== 基础类型测试 ==========
const testSuccess = () => {
  $Qmsg.success('操作成功！博客保存完成')
}
const testError = () => {
  $Qmsg.error('操作失败！请检查表单内容')
}
const testWarning = () => {
  $Qmsg.warning('温馨提示！此操作不可逆，请谨慎')
}
const testInfo = () => {
  $Qmsg.info('系统通知！3分钟后将进行服务器维护')
}
const testLoading = () => {
  $Qmsg.loading('正在加载中...请稍候')
}

// ========== 自定义配置测试 ==========
const testShowClose = () => {
  $Qmsg.success('显示关闭按钮的成功提示', { showClose: true })
}
const testLongTimeout = () => {
  $Qmsg.info('5秒后自动关闭的信息提示', { timeout: 5000 })
}
const testLeftPosition = () => {
  $Qmsg.warning('左对齐的警告提示', { position: 'left', showClose: true })
}
const testRightPosition = () => {
  $Qmsg.error('右对齐的错误提示', { position: 'right', showClose: true })
}
const testNoAutoClose = () => {
  $Qmsg.info('不会自动关闭的提示，需手动点击关闭', { autoClose: false, showClose: true })
}

// ========== 高级功能测试 ==========
const testManualClose = () => {
  // 保存提示实例，2秒后手动关闭（模拟接口请求完成后关闭）
  const msgInstance = $Qmsg.loading('正在请求接口...', { showClose: true })
  setTimeout(() => {
    msgInstance.close()
    $Qmsg.success('接口请求完成！手动关闭了加载提示')
  }, 2000)
}
const testRepeatMsg = () => {
  // 重复创建相同配置的消息，测试去重和计数功能
  repeatMsgInstance = $Qmsg.info('这是一条重复消息，点击多次会显示计数', { showClose: true })
}
const testCloseAll = () => {
  $Qmsg.closeAll()
  $Qmsg.success('所有提示已全部关闭！', { timeout: 1500 })
}
</script>

<script>
// 选项式API 写法（二选一，和上面的setup选一个即可）
export default {
  name: 'QmsgTest',
  methods: {
    // 示例：选项式API直接用this.$Qmsg
    // testSuccess() {
    //   this.$Qmsg.success('操作成功！博客保存完成')
    // }
  }
}
</script>

<style scoped>

</style>