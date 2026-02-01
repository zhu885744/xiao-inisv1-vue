<template>
    <!-- 聊天室主卡片 -->
    <div class="card mt-2" style="max-width: 800px; margin: 0 auto; height: 80vh; display: flex; flex-direction: column;">
      <!-- 聊天室头部 -->
      <div class="card-header text-dark d-flex align-items-center p-3">
        <h5 class="m-0">聊天室</h5>
      </div>

      <!-- 聊天消息列表（核心区域，可滚动） -->
      <div class="card-body flex-grow-1 p-4 overflow-auto chat-messages" ref="messageList">
        <!-- 对方消息 -->
        <div class="d-flex mb-3 align-items-start" v-for="(msg, index) in messageList" :key="index" :class="{ 'justify-content-end': msg.isMine }">
          <!-- 对方头像（左侧） -->
          <img 
            v-if="!msg.isMine"
            src="https://picsum.photos/36/36?random=1" 
            alt="对方头像" 
            class="rounded-circle me-2"
            style="width: 36px; height: 36px; object-fit: cover; flex-shrink: 0;"
          >
          <div class="flex-grow-0">
            <!-- 对方消息气泡 -->
            <div 
              class="p-2 rounded" 
              :class="{ 
                'bg-light text-dark border': !msg.isMine, 
                'bg-primary text-white': msg.isMine 
              }"
              style="max-width: 70%;"
            >
              {{ msg.content }}
              <div class="text-xs mt-1 opacity-70" style="font-size: 12px;">
                {{ msg.time }}
              </div>
            </div>
          </div>
          <!-- 自己头像（右侧） -->
          <img 
            v-if="msg.isMine"
            src="https://picsum.photos/36/36?random=2" 
            alt="我的头像" 
            class="rounded-circle ms-2"
            style="width: 36px; height: 36px; object-fit: cover; flex-shrink: 0;"
          >
        </div>
        <!-- 无消息占位 -->
        <div class="text-center text-muted py-5" v-if="messageList.length === 0">
          暂无聊天消息，开始你的第一条对话吧～
        </div>
      </div>

      <!-- 消息输入发送区 -->
      <div class="card-footer p-3 border-top">
        <div class="input-group">
          <input 
            v-model="inputMsg"
            type="text" 
            class="form-control" 
            placeholder="请输入聊天内容..."
            @keyup.enter="sendMessage"
          >
          <button 
            class="btn btn-primary" 
            type="button"
            @click="sendMessage"
            :disabled="!inputMsg.trim()"
          >
            发送
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// 输入框绑定值
const inputMsg = ref('')
// 消息列表数据（isMine：是否自己发送，content：内容，time：时间）
const messageList = ref([
  // 测试默认消息
  { isMine: false, content: '你好呀！', time: '10:00' },
  { isMine: true, content: '你好～', time: '10:01' }
])
// 消息列表DOM引用（用于滚动到底部）
const messageListRef = ref(null)

// 发送消息方法
const sendMessage = () => {
  // 去除首尾空格，空内容不发送
  const content = inputMsg.value.trim()
  if (!content) return

  // 获取当前时间（格式化：时:分）
  const now = new Date()
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const time = `${hour}:${minute}`

  // 添加自己的消息到列表
  messageList.value.push({
    isMine: true,
    content,
    time
  })

  // 模拟对方回复（200ms延迟，模拟接口请求）
  setTimeout(() => {
    const replyList = ['收到～', '哈哈哈哈', '好的好的', '这个问题我也想知道～', '那继续聊呀～']
    const randomReply = replyList[Math.floor(Math.random() * replyList.length)]
    messageList.value.push({
      isMine: false,
      content: randomReply,
      time: `${hour}:${minute}`
    })
  }, 200)

  // 清空输入框
  inputMsg.value = ''
}

// 监听消息列表变化，自动滚动到最新消息
watch(messageList, async () => {
  await nextTick() // 等待DOM更新完成
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}, { deep: true })
</script>

<style scoped>
/* 消息列表滚动条美化（可选） */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
.chat-messages::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>