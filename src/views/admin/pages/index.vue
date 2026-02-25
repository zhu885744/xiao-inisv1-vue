<template>
  <div class="index">
    <div class="card mt-2">
      <div class="card-body">
        <h1>系统状态监控</h1>
    
        <div class="refresh-rate">
          刷新频率: <span>{{ refreshRate }} 秒</span>
        </div>
      </div>
    </div>
    <!-- 系统基本信息卡片 -->
    <div class="row mb-4 mt-2">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">系统基本信息</h2>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-2 col-sm-4">
                <div class="info-item">
                  <div class="label">应用名称</div>
                  <div class="value">{{ systemInfoParsed?.app_name || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item">
                  <div class="label">Go 版本</div>
                  <div class="value">{{ systemInfoParsed?.go_version || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item">
                  <div class="label">操作系统</div>
                  <div class="value">{{ systemInfoParsed?.os || '-' }} {{ systemInfoParsed?.arch || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item">
                  <div class="label">CPU 核心</div>
                  <div class="value">{{ systemInfoParsed?.cpu_count || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item">
                  <div class="label">协程数</div>
                  <div class="value">{{ systemInfoParsed?.goroutines || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item">
                  <div class="label">当前时间</div>
                  <div class="value">{{ systemInfoParsed?.current_time || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据库状态卡片 -->
    <div class="row mb-4">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">数据库状态</h2>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 col-sm-6">
                <div class="info-item">
                  <div class="label">连接状态</div>
                  <div :class="['value', databaseStatusParsed?.connected ? 'success' : 'danger']">
                    {{ databaseStatusParsed?.connected ? '正常' : '异常' }}
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item">
                  <div class="label">响应时间</div>
                  <div class="value">{{ databaseStatusParsed?.latency || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item">
                  <div class="label">用户数</div>
                  <div class="value">{{ databaseStatusParsed?.counts?.users || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item">
                  <div class="label">文章数</div>
                  <div class="value">{{ databaseStatusParsed?.counts?.articles || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item">
                  <div class="label">评论数</div>
                  <div class="value">{{ databaseStatusParsed?.counts?.comments || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 缓存状态卡片 -->
    <div class="row mb-4">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">缓存状态</h2>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 col-sm-6">
                <div class="info-item">
                  <div class="label">启用状态</div>
                  <div :class="['value', cacheStatusParsed?.enabled ? 'success' : 'danger']">
                    {{ cacheStatusParsed?.enabled ? '已启用' : '未启用' }}
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6">
                <div class="info-item">
                  <div class="label">缓存类型</div>
                  <div class="value">{{ cacheStatusParsed?.type || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6">
                <div class="info-item">
                  <div class="label">工作状态</div>
                  <div :class="['value', cacheStatusParsed?.working ? 'success' : 'danger']">
                    {{ cacheStatusParsed?.working ? '正常' : '异常' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 系统资源卡片 -->
    <div class="row mb-4">
      <!-- CPU 状态 -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">CPU 状态</h3>
          </div>
          <div class="card-body">
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">使用率</div>
                  <div class="value">{{ systemResourcesParsed?.cpu?.usage || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">CPU 核心</div>
                  <div class="value">{{ systemResourcesParsed?.cpu?.count || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">CPU 型号</div>
                  <div class="value">{{ systemResourcesParsed?.cpu?.model || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">1分钟负载</div>
                  <div class="value">{{ systemResourcesParsed?.cpu?.load_1m || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">5分钟负载</div>
                  <div class="value">{{ systemResourcesParsed?.cpu?.load_5m || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">15分钟负载</div>
                  <div class="value">{{ systemResourcesParsed?.cpu?.load_15m || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="progress mb-2">
              <div 
                class="progress-bar" 
                role="progressbar" 
                :style="{ width: systemResourcesParsed?.cpu?.usage || '0%' }"
                :class="{
                  'bg-success': parseFloat(systemResourcesParsed?.cpu?.usage || 0) < 50,
                  'bg-warning': parseFloat(systemResourcesParsed?.cpu?.usage || 0) >= 50 && parseFloat(systemResourcesParsed?.cpu?.usage || 0) < 80,
                  'bg-danger': parseFloat(systemResourcesParsed?.cpu?.usage || 0) >= 80
                }"
              ></div>
            </div>
            <div class="text-right text-sm text-muted">
              CPU 使用率: {{ systemResourcesParsed?.cpu?.usage || '0%' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 内存状态 -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">内存状态</h3>
          </div>
          <div class="card-body">
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">总量</div>
                  <div class="value">{{ systemResourcesParsed?.memory?.system_total || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">已用</div>
                  <div class="value">{{ systemResourcesParsed?.memory?.system_used || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">可用</div>
                  <div class="value">{{ systemResourcesParsed?.memory?.system_free || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="progress mb-2">
              <div 
                class="progress-bar" 
                role="progressbar" 
                :style="{ width: systemResourcesParsed?.memory?.system_usage || '0%' }"
                :class="{
                  'bg-success': parseFloat(systemResourcesParsed?.memory?.system_usage || 0) < 50,
                  'bg-warning': parseFloat(systemResourcesParsed?.memory?.system_usage || 0) >= 50 && parseFloat(systemResourcesParsed?.memory?.system_usage || 0) < 80,
                  'bg-danger': parseFloat(systemResourcesParsed?.memory?.system_usage || 0) >= 80
                }"
              ></div>
            </div>
            <div class="text-right text-sm text-muted">
              内存使用率: {{ systemResourcesParsed?.memory?.system_usage || '0%' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 磁盘状态 -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">磁盘状态</h3>
          </div>
          <div class="card-body">
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">总量</div>
                  <div class="value">{{ systemResourcesParsed?.disk?.total || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">已用</div>
                  <div class="value">{{ systemResourcesParsed?.disk?.used || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-item">
                  <div class="label">可用</div>
                  <div class="value">{{ systemResourcesParsed?.disk?.free || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="progress mb-2">
              <div 
                class="progress-bar" 
                role="progressbar" 
                :style="{ width: systemResourcesParsed?.disk?.usage || '0%' }"
                :class="{
                  'bg-success': parseFloat(systemResourcesParsed?.disk?.usage || 0) < 50,
                  'bg-warning': parseFloat(systemResourcesParsed?.disk?.usage || 0) >= 50 && parseFloat(systemResourcesParsed?.disk?.usage || 0) < 80,
                  'bg-danger': parseFloat(systemResourcesParsed?.disk?.usage || 0) >= 80
                }"
              ></div>
            </div>
            <div class="text-right text-sm text-muted">
              磁盘使用率: {{ systemResourcesParsed?.disk?.usage || '0%' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 网络状态 -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">网络状态</h3>
          </div>
          <div class="card-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="info-item">
                  <div class="label">发送流量</div>
                  <div class="value">{{ systemResourcesParsed?.network?.bytes_sent || '-' }}</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <div class="label">接收流量</div>
                  <div class="value">{{ systemResourcesParsed?.network?.bytes_recv || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="info-item">
                  <div class="label">发送包数</div>
                  <div class="value">{{ systemResourcesParsed?.network?.packets_sent || '-' }}</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-item">
                  <div class="label">接收包数</div>
                  <div class="value">{{ systemResourcesParsed?.network?.packets_recv || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 系统信息卡片 -->
    <div class="row mb-4">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">系统信息</h2>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 col-sm-6">
                <div class="info-item">
                  <div class="label">操作系统</div>
                  <div class="value">{{ systemResourcesParsed?.system?.os || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item">
                  <div class="label">操作系统版本</div>
                  <div class="value">{{ systemResourcesParsed?.system?.os_version || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item">
                  <div class="label">内核版本</div>
                  <div class="value">{{ systemResourcesParsed?.system?.kernel || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item">
                  <div class="label">启动时间</div>
                  <div class="value">{{ systemResourcesParsed?.system?.boot_time || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import socket from '@/utils/socket';

// 响应式数据
const connected = ref(false);
const connectionStatusText = ref('未连接');
const refreshRate = ref('0');
const systemInfo = ref('加载中...');
const databaseStatus = ref('加载中...');
const cacheStatus = ref('加载中...');
const systemResources = ref('加载中...');

// 解析后的数据
const systemInfoParsed = ref({});
const databaseStatusParsed = ref({});
const cacheStatusParsed = ref({});
const systemResourcesParsed = ref({});

let lastUpdateTime = 0;

// 更新状态
function updateStatus(status) {
  try {
    // 更新系统基本信息
    systemInfo.value = JSON.stringify(status.info, null, 2);
    systemInfoParsed.value = status.info || {};
    
    // 更新数据库状态
    databaseStatus.value = JSON.stringify(status.database, null, 2);
    databaseStatusParsed.value = status.database || {};
    
    // 更新缓存状态
    cacheStatus.value = JSON.stringify(status.cache, null, 2);
    cacheStatusParsed.value = status.cache || {};
    
    // 更新系统资源
    systemResources.value = JSON.stringify(status.resource, null, 2);
    systemResourcesParsed.value = status.resource || {};
  } catch (error) {
    console.error('更新状态失败:', error);
  }
}

// 生命周期钩子
onMounted(() => {
  // 绑定事件
  socket.on('open', () => {
    connected.value = true;
    connectionStatusText.value = '已连接';
    console.log('WebSocket连接已建立');
  });
  
  socket.on('message', (data) => {
    try {
      // 检查数据是否有效
      if (!data) {
        console.warn('收到空的WebSocket消息');
        return;
      }
      
      if (data.type === 'status' && data.content) {
        updateStatus(data.content);
        
        // 计算刷新频率
        const now = Date.now() / 1000;
        if (lastUpdateTime > 0) {
          const rate = (now - lastUpdateTime).toFixed(1);
          refreshRate.value = rate;
        }
        lastUpdateTime = now;
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error);
    }
  });
  
  socket.on('close', () => {
    connected.value = false;
    connectionStatusText.value = '已断开连接，正在重连...';
    console.log('WebSocket连接已关闭');
  });
  
  socket.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
  

  
  // 检查连接状态
  connected.value = socket.isConnected();
  if (connected.value) {
    connectionStatusText.value = '已连接';
  }
});

onBeforeUnmount(() => {
  // 这里不再销毁Socket实例，因为它在App.vue中被管理
});
</script>