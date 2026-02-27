<template>
  <div class="admin">
    <!-- 系统基本信息卡片 -->
    <div class="row mt-2">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-body-secondary border-bottom">
            <h2 class="card-title h5 mb-0"><i class="bi bi-info-circle me-2"></i>系统基本信息</h2>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-2 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">应用名称</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemInfoParsed?.app_name || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">Go 版本</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemInfoParsed?.go_version || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">操作系统</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemInfoParsed?.os || '-' }} {{ systemInfoParsed?.arch || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">CPU 核心</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemInfoParsed?.cpu_count || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">协程数</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemInfoParsed?.goroutines || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">当前时间</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemInfoParsed?.current_time || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据库状态卡片 -->
    <div class="row mt-2">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-body-secondary border-bottom">
            <h2 class="card-title h5 mb-0"><i class="bi bi-database me-2"></i>数据库状态</h2>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">连接状态</div>
                  <div :class="['value fw-semibold', databaseStatusParsed?.connected ? 'text-success' : 'text-danger']">
                    {{ databaseStatusParsed?.connected ? '正常' : '异常' }}
                  </div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">响应时间</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.latency || '-' }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">用户数</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.users || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">文章数</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.articles || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">评论数</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.comments || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">轮播数量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.banners || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">友链数量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.links || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">公告数量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.placards || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">标签数量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.tags || 0 }}</div>
                </div>
              </div>
              <div class="col-md-2 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">独立页面数量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ databaseStatusParsed?.counts?.pages || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 缓存状态卡片 -->
    <div class="row mt-2">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-body-secondary border-bottom">
            <h2 class="card-title h5 mb-0"><i class="bi bi-database me-2"></i>缓存状态</h2>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">启用状态</div>
                  <div :class="['value fw-semibold', cacheStatusParsed?.enabled ? 'text-success' : 'text-danger']">
                    {{ cacheStatusParsed?.enabled ? '已启用' : '未启用' }}
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">缓存类型</div>
                  <div class="value fw-semibold text-body-emphasis">{{ cacheStatusParsed?.type || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">工作状态</div>
                  <div :class="['value fw-semibold', cacheStatusParsed?.working ? 'text-success' : 'text-danger']">
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
    <div class="row mt-2">
      <!-- CPU 状态 -->
      <div class="col-lg-6 col-md-12 mb-2">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-body-secondary border-bottom">
            <h3 class="card-title h6 mb-0"><i class="bi bi-cpu me-2"></i>CPU 状态</h3>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-4 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">使用率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.cpu?.usage || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">CPU 核心</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.cpu?.count || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">CPU 型号</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.cpu?.model || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-md-4 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">1分钟负载</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.cpu?.load_1m || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">5分钟负载</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.cpu?.load_5m || '-' }}</div>
                </div>
              </div>
              <div class="col-md-4 col-sm-4">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">15分钟负载</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.cpu?.load_15m || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="progress mb-2 rounded-2" style="height: 10px;">
              <div 
                class="progress-bar" 
                role="progressbar" 
                :style="{ width: systemResourcesParsed?.cpu?.usage || '0%' }"
                :class="[
                  parseFloat(systemResourcesParsed?.cpu?.usage || 0) < 50 ? 'bg-success' : '',
                  parseFloat(systemResourcesParsed?.cpu?.usage || 0) >= 50 && parseFloat(systemResourcesParsed?.cpu?.usage || 0) < 80 ? 'bg-warning' : '',
                  parseFloat(systemResourcesParsed?.cpu?.usage || 0) >= 80 ? 'bg-danger' : ''
                ]"
                aria-valuenow="parseFloat(systemResourcesParsed?.cpu?.usage || 0)"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div class="text-end text-sm text-body-secondary">
              CPU 使用率: {{ systemResourcesParsed?.cpu?.usage || '0%' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 网络状态 -->
      <div class="col-lg-6 col-md-12 mb-2">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-body-secondary border-bottom">
            <h3 class="card-title h6 mb-0"><i class="bi bi-wifi me-2"></i>网络状态</h3>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">上行速率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.up || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">下行速率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.down || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">总发送量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.total_sent || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">总接收量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.total_received || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="row g-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">发送包数</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.packets_sent || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">接收包数</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.packets_recv || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">发送速率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.sent_per_sec || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">接收速率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.network?.recv_per_sec || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 内存状态 -->
      <div class="col-lg-6 col-md-12 mb-2">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-body-secondary border-bottom">
            <h3 class="card-title h6 mb-0"><i class="bi bi-memory me-2"></i>内存状态</h3>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">总量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.system_total || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">已用</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.system_used || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">可用</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.system_free || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">使用率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.system_usage || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">已分配内存</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.alloc || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">总分配内存</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.total_alloc || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">系统内存</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.sys || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">GC次数</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.memory?.gc_count || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="progress mb-2 rounded-2" style="height: 10px;">
              <div 
                class="progress-bar" 
                role="progressbar" 
                :style="{ width: systemResourcesParsed?.memory?.system_usage || '0%' }"
                :class="[
                  parseFloat(systemResourcesParsed?.memory?.system_usage || 0) < 50 ? 'bg-success' : '',
                  parseFloat(systemResourcesParsed?.memory?.system_usage || 0) >= 50 && parseFloat(systemResourcesParsed?.memory?.system_usage || 0) < 80 ? 'bg-warning' : '',
                  parseFloat(systemResourcesParsed?.memory?.system_usage || 0) >= 80 ? 'bg-danger' : ''
                ]"
                aria-valuenow="parseFloat(systemResourcesParsed?.memory?.system_usage || 0)"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div class="text-end text-sm text-body-secondary">
              内存使用率: {{ systemResourcesParsed?.memory?.system_usage || '0%' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 磁盘状态 -->
      <div class="col-lg-6 col-md-12 mb-2">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-body-secondary border-bottom">
            <h3 class="card-title h6 mb-0"><i class="bi bi-hdd me-2"></i>磁盘状态</h3>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">总量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.total || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">已用</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.used || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">可用</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.free || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">使用率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.usage || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">文件系统</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.fs_type || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">IO延迟</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.io_latency || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">总读取量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.read || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">总写入量</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.write || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="row g-3 mb-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">读取速率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.read_per_sec || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-3 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-1">写入速率</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.disk?.write_per_sec || '-' }}</div>
                </div>
              </div>
            </div>
            <div class="progress mb-2 rounded-2" style="height: 10px;">
              <div 
                class="progress-bar" 
                role="progressbar" 
                :style="{ width: systemResourcesParsed?.disk?.usage || '0%' }"
                :class="[
                  parseFloat(systemResourcesParsed?.disk?.usage || 0) < 50 ? 'bg-success' : '',
                  parseFloat(systemResourcesParsed?.disk?.usage || 0) >= 50 && parseFloat(systemResourcesParsed?.disk?.usage || 0) < 80 ? 'bg-warning' : '',
                  parseFloat(systemResourcesParsed?.disk?.usage || 0) >= 80 ? 'bg-danger' : ''
                ]"
                aria-valuenow="parseFloat(systemResourcesParsed?.disk?.usage || 0)"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div class="text-end text-sm text-body-secondary">
              磁盘使用率: {{ systemResourcesParsed?.disk?.usage || '0%' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 系统信息卡片 -->
    <div class="row mt-2">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-body-secondary border-bottom">
            <h2 class="card-title h5 mb-0"><i class="bi bi-pc-display me-2"></i>系统信息</h2>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">操作系统</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.system?.os || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">操作系统版本</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.system?.os_version || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">内核版本</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.system?.kernel || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3 col-sm-6">
                <div class="info-item bg-body-secondary rounded-2 p-4 text-center h-100">
                  <div class="label text-body-secondary text-uppercase small fw-medium mb-2">启动时间</div>
                  <div class="value fw-semibold text-body-emphasis">{{ systemResourcesParsed?.system?.boot_time || '-' }}</div>
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

<style scoped>
/* 信息项样式 - 仅保留动画效果，颜色由Bootstrap控制 */
.info-item {
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-1px);
}

/* 进度条动画效果 - 保持原有动画，颜色由Bootstrap控制 */
.progress-bar {
  position: relative;
  overflow: hidden;
  transition: width 0.6s ease;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: progress-animation 1s linear infinite;
}

@keyframes progress-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 20px;
  }
}

/* 响应式调整 - 仅调整字体大小，颜色由Bootstrap控制 */
@media (max-width: 768px) {
  .info-item .label {
    font-size: 0.75rem;
  }
  
  .info-item .value {
    font-size: 0.9rem;
  }
}
</style>