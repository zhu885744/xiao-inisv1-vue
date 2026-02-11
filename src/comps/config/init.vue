<template>
  <Teleport to="body">
    <div v-if="showConfigModal" class="config-init-modal">
      <div class="modal-backdrop show"></div>
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">主题配置</h5>
            <button type="button" class="btn-close" @click="skipConfig" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-4">检测到您是首次使用本主题。请完成以下配置：</p>
            
            <!-- 配置表单 -->
            <form @submit.prevent="saveConfig">
              <!-- 后端API地址 -->
              <div class="mb-3">
                <label for="configApiUri" class="form-label">后端API地址</label>
                <input 
                  type="url" 
                  id="configApiUri" 
                  v-model="configForm.api_uri" 
                  class="form-control"
                  placeholder="请输入后端API地址"
                  required
                >
              </div>
              
              <!-- Socket地址 -->
              <div class="mb-3">
                <label for="configSocketUri" class="form-label">Socket地址</label>
                <input 
                  type="url" 
                  id="configSocketUri" 
                  v-model="configForm.socket_uri" 
                  class="form-control"
                  placeholder="请输入Socket地址（可选）"
                >
              </div>
              
              <!-- 路由模式 -->
              <div class="mb-3">
                <label for="configRouterMode" class="form-label">路由模式</label>
                <select 
                  id="configRouterMode" 
                  v-model="configForm.router_mode" 
                  class="form-select"
                  required
                >
                  <option value="history">History</option>
                  <option value="hash">Hash</option>
                </select>
              </div>
              
              <!-- API密钥 -->
              <div class="mb-3">
                <label for="configApiKey" class="form-label">API密钥</label>
                <input 
                  type="text" 
                  id="configApiKey" 
                  v-model="configForm.api_key" 
                  class="form-control"
                  placeholder="请输入API密钥（可选）"
                >
              </div>
              
              <!-- 基础路径 -->
              <div class="mb-3">
                <label for="configBaseUrl" class="form-label">基础路径</label>
                <input 
                  type="text" 
                  id="configBaseUrl" 
                  v-model="configForm.base_url" 
                  class="form-control"
                  placeholder="请输入基础路径，默认为/"
                  required
                >
              </div>
              
              <!-- Token存储的Cookie名称 -->
              <div class="mb-3">
                <label for="configTokenName" class="form-label">Token存储的Cookie名称</label>
                <input 
                  type="text" 
                  id="configTokenName" 
                  v-model="configForm.token_name" 
                  class="form-control"
                  placeholder="请输入Token存储的Cookie名称"
                  required
                  disabled
                >
              </div>
              
              <!-- 通用交互延迟 -->
              <div class="mb-3">
                <label for="configLazyTime" class="form-label">通用交互延迟（毫秒）</label>
                <input 
                  type="number" 
                  id="configLazyTime" 
                  v-model.number="configForm.lazy_time" 
                  class="form-control"
                  placeholder="请输入通用交互延迟"
                  min="0"
                  max="5000"
                  required
                >
              </div>
              
              <button type="submit" class="btn btn-primary w-100">保存配置</button>
            </form>
          </div>
          <div class="modal-footer">
            <div class="w-100">
              <div class="alert alert-info alert-sm p-2 mb-2 text-center">
                <i class="bi bi-arrow-down-up me-1"></i>
                <small>提示：弹窗内容可上下滑动查看</small>
              </div>
              <small class="text-muted d-block text-center">配置完成后请点击保存，将自动下载配置文件，请手动上传到public/config/目录，上传成功后请刷新页面，系统将不再显示主题配置弹窗。</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import config from '@/utils/config'
import toast from '@/utils/toast'

const showConfigModal = ref(false)
const configForm = ref({
  api_uri: 'https://cs.zhuxu.asia',
  socket_uri: '',
  router_mode: 'history',
  api_key: '',
  base_url: '/',
  token_name: 'INIS_LOGIN_TOKEN',
  lazy_time: 500
})

// 监听弹窗显示状态，控制页面滚动
watch(
  () => showConfigModal.value,
  (newVal) => {
    // 显示弹窗时禁止页面滚动
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      // 隐藏弹窗时恢复页面滚动
      document.body.style.overflow = 'auto'
    }
  }
)

// 检查配置文件是否存在
const checkConfigFileExists = async () => {
  try {
    const response = await fetch('/config/app.toml')
    // 检查响应状态码
    if (response.ok) {
      const content = await response.text()
      // 检查内容是否不为空，且包含TOML配置项
      return content.trim() !== '' && 
             (content.includes('title =') || content.includes('api_uri ='))
    }
    return false
  } catch (error) {
    return false
  }
}

// 生成TOML配置内容
const generateTomlContent = (config) => {
  let content = `# 主题配置文件
# 生成时间: ${new Date().toISOString()}\n\n`
  
  // 站点配置
  content += '# 站点配置\n'
  content += `title = "${config.title || '朱某的生活印记'}"\n`
  content += `api_uri = "${config.api_uri}"\n`
  content += `socket_uri = "${config.socket_uri || ''}"\n`
  content += `router_mode = "${config.router_mode}"\n`
  content += `api_key = "${config.api_key || ''}"\n`
  content += `base_url = "${config.base_url}"\n`
  content += `token_name = "${config.token_name}"\n\n`
  
  // 版本检测配置
  content += '# 版本检测配置\n'
  content += `enable_version_check = ${config.enable_version_check !== undefined ? config.enable_version_check : true}\n`
  content += `auto_check_update = ${config.auto_check_update !== undefined ? config.auto_check_update : true}\n`
  content += `check_interval = ${config.check_interval || 86400000}  # 24小时，单位毫秒\n\n`
  
  // 功能配置
  content += '# 功能配置\n'
  content += `enable_socket = ${config.enable_socket !== undefined ? config.enable_socket : true}\n`
  content += `socket_debug = ${config.socket_debug !== undefined ? config.socket_debug : false}\n`
  content += `lazy_time = ${config.lazy_time}  # 通用交互延迟，单位毫秒\n`
  
  return content
}

// 下载配置文件
const downloadConfigFile = (config) => {
  const content = generateTomlContent(config)
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'app.toml'
  a.click()
  URL.revokeObjectURL(url)
}

// 保存配置
const saveConfig = async () => {
  try {
    // 保存配置到本地存储
    Object.keys(configForm.value).forEach(key => {
      config.set(key, configForm.value[key])
    })
    
    // 标记配置已初始化
    config.markInitialized()
    
    // 下载配置文件
    downloadConfigFile({
      ...configForm.value,
      title: '朱某的生活印记',
      enable_version_check: true,
      auto_check_update: true,
      check_interval: 86400000,
      enable_socket: true,
      socket_debug: false
    })
    
    // 隐藏配置模态框
    showConfigModal.value = false
    
    // 显示成功提示
    toast.success('配置保存成功，请将下载的app.toml文件复制到config目录')
    
    // 刷新页面，应用新配置
    setTimeout(() => {
      location.reload()
    }, 2000)
  } catch (error) {
    console.error('保存配置失败:', error)
    toast.error('配置保存失败')
  }
}

// 跳过配置
const skipConfig = () => {
  // 标记配置已初始化（使用默认值）
  config.markInitialized()
  showConfigModal.value = false
  toast.info('已使用默认配置')
}

// 组件挂载时检查配置
onMounted(async () => {
  // 检查配置文件是否存在
  const fileExists = await checkConfigFileExists()
  
  // 检查配置是否已初始化
  const initialized = await config.isInitialized()
  
  // 如果文件不存在或配置未初始化，显示配置模态框
  if (!fileExists || !initialized) {
    // 显示配置模态框
    showConfigModal.value = true
  }
})
</script>

<style scoped>
.config-init-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1055;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  animation: backdropFadeIn 0.3s ease-in-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-dialog {
  position: relative;
  z-index: 1060;
  max-width: 450px;
  width: 85%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-in-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
  border: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
  padding: 1.25rem 1.75rem;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: white;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.75rem;
  background-color: #f8f9fa;
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.modal-body p {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control {
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: white;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  outline: none;
}

.form-select {
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: white;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  outline: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 1rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 1.25rem 1.75rem;
  text-align: center;
  flex-shrink: 0;
}

.modal-footer small {
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-dialog {
    max-width: 95%;
    width: 95%;
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1.25rem 1.5rem;
  }
  
  .modal-title {
    font-size: 1.1rem;
  }
  
  .form-label {
    font-size: 0.9rem;
  }
  
  .form-control {
    font-size: 0.9rem;
    padding: 0.65rem 0.9rem;
  }
  
  .form-select {
    font-size: 0.9rem;
    padding: 0.65rem 0.9rem;
  }
  
  .btn-primary {
    font-size: 0.95rem;
    padding: 0.7rem 1.4rem;
  }
  
  .modal-body p {
    font-size: 0.9rem;
  }
  
  .modal-footer small {
    font-size: 0.8rem;
  }
}
</style>