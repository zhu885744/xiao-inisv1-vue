<!-- 联系方式设置组件 -->
<template>
  <div class="contact-info-settings">
    <div class="row">
      <!-- 邮箱设置 -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title mb-3">邮箱设置</h6>
            <form @submit.prevent="updateEmail">
              <!-- 邮箱 -->
              <div class="mb-3">
                <label for="email" class="form-label">新邮箱</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="emailForm.email" 
                  class="form-control"
                  placeholder="请输入新邮箱"
                  maxlength="50"
                >
              </div>

              <!-- 验证码 -->
              <div class="mb-3">
                <label for="emailCode" class="form-label">验证码</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    id="emailCode" 
                    v-model="emailForm.code" 
                    class="form-control"
                    placeholder="请输入验证码"
                    maxlength="6"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    @click="sendEmailCode"
                    :disabled="emailSending || emailLoading"
                  >
                    {{ emailSending ? `发送中...` : emailCountdown > 0 ? `${emailCountdown}秒后重发` : '发送验证码' }}
                  </button>
                </div>
              </div>

              <!-- 提交按钮 -->
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="emailLoading"
              >
                <i class="bi bi-save me-2"></i>
                {{ emailLoading ? '保存中...' : '修改邮箱' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- 手机号设置 -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title mb-3">手机号设置</h6>
            <form @submit.prevent="updatePhone">
              <!-- 手机号 -->
              <div class="mb-3">
                <label for="phone" class="form-label">新手机号</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="phoneForm.phone" 
                  class="form-control"
                  placeholder="请输入新手机号"
                  maxlength="11"
                  pattern="^1[3-9]\d{9}$"
                >
              </div>

              <!-- 验证码 -->
              <div class="mb-3">
                <label for="phoneCode" class="form-label">验证码</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    id="phoneCode" 
                    v-model="phoneForm.code" 
                    class="form-control"
                    placeholder="请输入验证码"
                    maxlength="6"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    @click="sendPhoneCode"
                    :disabled="phoneSending || phoneLoading"
                  >
                    {{ phoneSending ? `发送中...` : phoneCountdown > 0 ? `${phoneCountdown}秒后重发` : '发送验证码' }}
                  </button>
                </div>
              </div>

              <!-- 提交按钮 -->
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="phoneLoading"
              >
                <i class="bi bi-save me-2"></i>
                {{ phoneLoading ? '保存中...' : '修改手机号' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全提示 -->
    <div class="card mt-4">
      <div class="card-body">
        <h6 class="card-title mb-3">安全提示</h6>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <i class="bi bi-shield-check text-success me-2"></i>
            邮箱和手机号用于账号找回和安全验证
          </li>
          <li class="list-group-item">
            <i class="bi bi-clock-history text-warning me-2"></i>
            验证码有效期为10分钟，请及时输入
          </li>
          <li class="list-group-item">
            <i class="bi bi-exclamation-triangle text-danger me-2"></i>
            请勿将验证码透露给他人
          </li>
          <li class="list-group-item">
            <i class="bi bi-lock text-info me-2"></i>
            修改联系方式后，系统会自动同步用户信息
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import request from '@/utils/request'
import toast from '@/utils/toast'
import { useCommStore } from '@/store/comm'

const store = useCommStore()

// 邮箱表单数据
const emailForm = reactive({
  email: '',
  code: ''
})

// 手机号表单数据
const phoneForm = reactive({
  phone: '',
  code: ''
})

// 加载状态
const emailLoading = ref(false)
const phoneLoading = ref(false)

// 发送状态
const emailSending = ref(false)
const phoneSending = ref(false)

// 倒计时
const emailCountdown = ref(0)
const phoneCountdown = ref(0)

// 定时器
let emailTimer = null
let phoneTimer = null

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (emailSending.value || emailCountdown.value > 0) return
  
  if (!emailForm.email) {
    toast.error('请输入邮箱')
    return
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    toast.error('请输入有效的邮箱地址')
    return
  }

  emailSending.value = true
  try {
    const res = await request.put('/api/users/email', {
      email: emailForm.email,
      code: '' // 为空自动发送验证码
    })

    if (res.code === 200) {
      toast.success('验证码已发送，请查收')
      // 开始倒计时
      startEmailCountdown()
    } else {
      toast.error(res.msg || '发送验证码失败')
    }
  } catch (error) {
    console.error('发送邮箱验证码失败:', error)
    toast.error('网络错误，请稍后重试')
  } finally {
    emailSending.value = false
  }
}

// 发送手机号验证码
const sendPhoneCode = async () => {
  if (phoneSending.value || phoneCountdown.value > 0) return
  
  if (!phoneForm.phone) {
    toast.error('请输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    toast.error('请输入有效的手机号')
    return
  }

  phoneSending.value = true
  try {
    const res = await request.put('/api/users/phone', {
      phone: phoneForm.phone,
      code: '' // 为空自动发送验证码
    })

    if (res.code === 200) {
      toast.success('验证码已发送，请查收')
      // 开始倒计时
      startPhoneCountdown()
    } else {
      toast.error(res.msg || '发送验证码失败')
    }
  } catch (error) {
    console.error('发送手机号验证码失败:', error)
    toast.error('网络错误，请稍后重试')
  } finally {
    phoneSending.value = false
  }
}

// 开始邮箱倒计时
const startEmailCountdown = () => {
  emailCountdown.value = 60
  
  if (emailTimer) {
    clearInterval(emailTimer)
  }
  
  emailTimer = setInterval(() => {
    if (emailCountdown.value > 0) {
      emailCountdown.value--
    } else {
      clearInterval(emailTimer)
      emailTimer = null
    }
  }, 1000)
}

// 开始手机号倒计时
const startPhoneCountdown = () => {
  phoneCountdown.value = 60
  
  if (phoneTimer) {
    clearInterval(phoneTimer)
  }
  
  phoneTimer = setInterval(() => {
    if (phoneCountdown.value > 0) {
      phoneCountdown.value--
    } else {
      clearInterval(phoneTimer)
      phoneTimer = null
    }
  }, 1000)
}

// 更新邮箱
const updateEmail = async () => {
  if (emailLoading.value) return
  
  if (!emailForm.email) {
    toast.error('请输入邮箱')
    return
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
    toast.error('请输入有效的邮箱地址')
    return
  }
  
  if (!emailForm.code) {
    toast.error('请输入验证码')
    return
  }

  emailLoading.value = true
  try {
    const res = await request.put('/api/users/email', {
      email: emailForm.email,
      code: emailForm.code
    })

    if (res.code === 200) {
      toast.success('邮箱修改成功')
      // 同步用户信息
      await syncUserInfo()
      // 清空表单
      emailForm.email = ''
      emailForm.code = ''
    } else {
      toast.error(res.msg || '邮箱修改失败')
    }
  } catch (error) {
    console.error('修改邮箱失败:', error)
    toast.error('网络错误，请稍后重试')
  } finally {
    emailLoading.value = false
  }
}

// 更新手机号
const updatePhone = async () => {
  if (phoneLoading.value) return
  
  if (!phoneForm.phone) {
    toast.error('请输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    toast.error('请输入有效的手机号')
    return
  }
  
  if (!phoneForm.code) {
    toast.error('请输入验证码')
    return
  }

  phoneLoading.value = true
  try {
    const res = await request.put('/api/users/phone', {
      phone: phoneForm.phone,
      code: phoneForm.code
    })

    if (res.code === 200) {
      toast.success('手机号修改成功')
      // 同步用户信息
      await syncUserInfo()
      // 清空表单
      phoneForm.phone = ''
      phoneForm.code = ''
    } else {
      toast.error(res.msg || '手机号修改失败')
    }
  } catch (error) {
    console.error('修改手机号失败:', error)
    toast.error('网络错误，请稍后重试')
  } finally {
    phoneLoading.value = false
  }
}

// 同步用户信息
const syncUserInfo = async () => {
  try {
    await store.checkLoginState()
  } catch (error) {
    console.error('同步用户信息失败:', error)
  }
}

// 清理定时器
const cleanupTimers = () => {
  if (emailTimer) {
    clearInterval(emailTimer)
    emailTimer = null
  }
  if (phoneTimer) {
    clearInterval(phoneTimer)
    phoneTimer = null
  }
}

// 组件挂载时
onMounted(() => {
  // 从store中获取当前用户的联系方式
  const userInfo = store.getLogin.user
  if (userInfo) {
    // 填充当前用户的邮箱和手机号到表单中
    emailForm.email = userInfo.email || ''
    phoneForm.phone = userInfo.phone || ''
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  cleanupTimers()
})
</script>

<style scoped>
/* 自定义样式 */
.card {
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-control {
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: var(--bs-primary);
}

.btn {
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
}

/* 表单标签 */
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
}

.input-group {
  border-radius: 0.375rem;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
}

.input-group .form-control {
  flex: 1;
  min-width: 0;
}

.input-group .btn {
  white-space: nowrap;
}

/* 安全提示列表 */
.list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0 !important;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.list-group-item:first-child {
  border-top: 0;
}

.list-group-item:last-child {
  border-bottom: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
  
  .mb-4 {
    margin-bottom: 1rem !important;
  }
  
  .mb-3 {
    margin-bottom: 1rem !important;
  }
  
  .card-title {
    font-size: 0.9375rem;
    margin-bottom: 0.75rem !important;
  }
  
  .form-control {
    padding: 0.5rem 0.625rem;
    font-size: 0.8125rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .input-group {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
  }
  
  .input-group .form-control {
    flex: 1;
    min-width: 0;
  }
  
  .input-group .btn {
    white-space: nowrap;
    min-width: 100px;
  }
  
  .col-md-6 {
    width: 100%;
    margin-bottom: 1rem !important;
  }
  
  .list-group-item {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .list-group-item i {
    font-size: 0.9em;
  }
}
</style>