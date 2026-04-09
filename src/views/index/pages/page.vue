<template>
  <!-- 全局外层容器：居中、收窄宽度、统一留白 -->
  <div class="article-page-wrapper">
    <!-- 加载状态：优化尺寸、间距，更协调 -->
    <div v-if="loading" class="page-loading">
      <div class="spinner-border text-info fs-4" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="article-content-wrap card shadow-sm p-3 mt-2">
      <p class="mb-0 fw-normal">{{ errorMsg }}</p>
    </div>

    <!-- 独立页面主体：核心UI重写 -->
    <div v-else class="article-main">
      <!-- 面包屑导航 -->
      <div class="card shadow-sm p-3 mt-2">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 breadcrumb-custom">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-decoration-none">首页</router-link>
            </li>
            <li v-if="isArchivePage" class="breadcrumb-item active" aria-current="page">
              归档
            </li>
            <li v-else-if="isLinksPage" class="breadcrumb-item active" aria-current="page">
              友链
            </li>
            <li v-else-if="isMessagePage" class="breadcrumb-item active" aria-current="page">
              留言板
            </li>
            <li v-else class="breadcrumb-item active" aria-current="page">
              {{ pageInfo.title }}
            </li>
          </ol>
        </nav>
      </div>
      
      <!-- 归档页面统计信息 -->
      <div v-if="isArchivePage">
        <!-- 统计信息卡片区域 -->
          <main class="card shadow-sm mt-2">
            <div class="p-3">
              <h2 class="timeline-title mb-4">数据统计</h2>
              <!-- 统计信息网格 -->
              <div class="stats-grid">
                <!-- 文章总数 -->
                <div class="stat-card">
                  <div class="stat-icon article-icon">
                    <i class="bi bi-file-earmark-text"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-value">{{ archiveStats.articleCount || 0 }}</h3>
                    <p class="stat-label">文章总数</p>
                  </div>
                </div>

                <!-- 文章分类总数 -->
                <div class="stat-card">
                  <div class="stat-icon category-icon">
                    <i class="bi bi-tags"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-value">{{ archiveStats.categoryCount || 0 }}</h3>
                    <p class="stat-label">文章分类总数</p>
                  </div>
                </div>

            <!-- 独立页面总数 -->
            <div class="stat-card">
              <div class="stat-icon page-icon">
                <i class="bi bi-file-earmark"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.pageCount || 0 }}</h3>
                <p class="stat-label">独立页面总数</p>
              </div>
            </div>

            <!-- 标签总数 -->
            <div class="stat-card">
              <div class="stat-icon tag-icon">
                <i class="bi bi-tag"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.tagCount || 0 }}</h3>
                <p class="stat-label">标签总数</p>
              </div>
            </div>

            <!-- 友情链接总数 -->
            <div class="stat-card">
              <div class="stat-icon link-icon">
                <i class="bi bi-link"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.linkCount || 0 }}</h3>
                <p class="stat-label">友情链接总数</p>
              </div>
            </div>

            <!-- 评论总数 -->
            <div class="stat-card">
              <div class="stat-icon comment-icon">
                <i class="bi bi-chat"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.commentCount || 0 }}</h3>
                <p class="stat-label">评论总数</p>
              </div>
            </div>
          </div>

          <!-- 文章归档时间线 -->
          <div class="archive-timeline mt-6">
            <h2 class="timeline-title mb-4">文章归档</h2>
            
            <!-- 加载状态 -->
            <div v-if="articlesLoading" class="d-flex justify-content-center py-5">
              <div class="spinner-border text-info" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <!-- 错误状态 -->
            <div v-else-if="articlesError" class="alert alert-warning d-flex align-items-center mt-2 p-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
              <p class="mb-0">{{ articlesErrorMsg }}</p>
            </div>
            
            <!-- 无文章数据 -->
            <div v-else-if="Object.keys(groupedArticles).length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-file-earmark-text fs-1 mb-3"></i>
              <p class="mb-0">暂无文章数据，敬请期待～</p>
            </div>
            
            <!-- 文章时间线 -->
            <div v-else class="timeline-container">
              <div v-for="(articles, yearMonth) in groupedArticles" :key="yearMonth" class="timeline-year-month">
                <h3 class="timeline-year-month-title">{{ yearMonth }}</h3>
                <div class="timeline-items">
                  <div v-for="article in articles" :key="article.id" class="timeline-item">
                    <div class="timeline-content">
                      <router-link :to="`/archives/${article.id}`" class="timeline-article-title">{{ article.title }}</router-link>
                      <div class="timeline-article-meta">
                        <span class="timeline-article-date d-flex align-items-center">
                          <i class="bi bi-calendar-date me-1"></i>{{ formatTime(article.publish_time) }}
                        </span>
                        <span class="timeline-article-category d-flex align-items-center" v-if="article.result?.group && article.result.group.length > 0">
                          <i class="bi bi-folder me-1"></i>{{ article.result.group[0].name }}
                        </span>
                        <span class="timeline-article-views d-flex align-items-center">
                          <i class="bi bi-eye me-1"></i>{{ article.views || 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 刷新按钮 -->
            <div class="refresh-container">
              <button 
                @click="refreshArchiveStats" 
                class="refresh-btn"
                :disabled="refreshingArchive"
              >
                <i class="bi bi-arrow-clockwise" :class="{ 'spin': refreshingArchive }"></i>
                {{ refreshingArchive ? '刷新中...' : '刷新数据' }}
              </button>
            </div>
            </div>
          </div>
        </main>
      </div>

      <!-- 友链页面 -->
      <div v-else-if="isLinksPage">
        <!-- 全局加载状态 -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
          <div class="spinner-border text-info" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="article-content-wrap card shadow-sm p-3 mt-2">
          <p class="mb-0 fw-normal">{{ errorMsg }}</p>
        </div>

        <!-- 友链页面主体 -->
        <main v-else class="card shadow-sm mt-2">
          <div class="p-3">
          <h2 class="timeline-title mb-4">友情链接</h2>
          <!-- 核心内容区 -->
          <div class="pb-2">
            <!-- 友链介绍 -->
            <div class="article-content text-secondary">
              <i-markdown :model-value="pageInfo.content || '暂无友链介绍，敬请期待～'" />
            </div>

            <!-- 友链数据加载状态 -->
            <div v-if="linksLoading" class="d-flex justify-content-center py-3">
              <div class="spinner-border text-info spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <!-- 友链加载错误 -->
            <div v-else-if="linksError" class="alert alert-warning d-flex align-items-center mt-2 p-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
              <p class="mb-0">{{ linksErrorMsg }}</p>
            </div>
            
            <!-- 无友链数据 -->
            <div v-else-if="links.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-link-45deg fs-1 mb-3"></i>
              <p class="mb-0">暂无友链数据，敬请期待～</p>
            </div>
            
            <!-- 友链分组展示 -->
            <div v-else class="link-list-container">
              <div v-for="(groupLinks, groupName) in groupLinkMap" :key="groupName" class="mb-6">
                <h3 class="link-cate mt-3">{{ groupName }}</h3>
                <!-- 友链小卡片网格布局 -->
                <div class="row g-3">
                  <!-- 友链小卡片 -->
                  <div v-for="link in groupLinks" :key="link.id" class="col-lg-4 col-md-6 col-sm-6 col-12">
                    <a 
                      :href="link.url" 
                      :target="link.target || '_blank'" 
                      class="link-card-small text-decoration-none d-block h-100"
                    >
                      <div class="link-card-inner h-100">
                        <!-- 友链名称 -->
                        <h4 class="link-name mb-2">{{ link.nickname }}</h4>
                        <!-- 友链简介 -->
                        <p class="link-desc mb-2">{{ link.description || '暂无介绍' }}</p>
                        <!-- 友链链接 -->
                        <small class="link-url text-muted text-truncate d-block">
                          <i class="bi bi-link-45deg me-1"></i>{{ link.url }}
                        </small>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- 友链申请按钮 -->
            <div class="m-4 text-center">
              <button 
                v-if="isLogin" 
                @click="openLinkApplyModal"
                :disabled="isSubmitting || isCoolingDown"
                class="btn btn-primary btn-sm"
              >
                <i class="bi bi-link-45deg me-1"></i>
                {{ isCoolingDown ? `冷却中 (${coolingDownTime}s)` : '申请友链' }}
              </button>
              <button 
                v-else 
                @click="handleLogin"
                class="btn btn-outline-primary btn-sm"
                disabled
              >
                <i class="bi bi-person me-1"></i>登录后申请
              </button>
              <p class="text-muted mt-2">请勿重复申请，每个用户只能申请一次</p>
            </div>
          </div>
          </div>
        </main>
        
        <!-- 评论区域 -->
        <div class="mt-4">
          <i-comment 
              :articleId="pageInfo.id" 
              :commentCount="commentCount" 
              :commentList="commentList" 
              :isLogin="isLogin" 
              :isDarkMode="isDarkMode"
              :currentPage="currentPage"
              :pageSize="pageSize"
              :totalComments="totalComments"
              @publishComment="handlePublishComment"
              @replyComment="handleReplyComment"
              @pageChange="handleCommentPageChange"
            />
        </div>
      </div>
      
      <!-- 留言页面 -->
      <div v-else-if="isMessagePage">
        <!-- 留言页面主体 -->
        <main class="mt-2">
          <!-- 核心内容区 -->
          <div class="pb-2">
            <!-- 留言统计 -->
            <div class="message-stats mb-6">
              <div class="card p-4 rounded-3">
                <div class="row flex-nowrap">
                  <div class="col-md-3 col-sm-6 col-3">
                    <div class="text-center">
                      <div class="fs-3 font-bold">{{ commentCount || 0 }}</div>
                      <div class="text-muted">总留言数</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-6 col-3">
                    <div class="text-center">
                      <div class="fs-3 font-bold">{{ uniqueCommenters || 0 }}</div>
                      <div class="text-muted">留言人数</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-6 col-3">
                    <div class="text-center">
                      <div class="fs-3 font-bold">{{ recentMessagesCount || 0 }}</div>
                      <div class="text-muted">最近留言</div>
                    </div>
                  </div>
                  <div class="col-md-3 col-sm-6 col-3">
                    <div class="text-center">
                      <div class="fs-3 font-bold">{{ viewCount || 0 }}</div>
                      <div class="text-muted">页面浏览</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 留言显示模块 -->
            <div class="message-display mb-6 mt-2">
              <div class="card shadow-sm">
                <div class="card-header bg-transparent">
                  <h3 class="h5 fw-bold mt-2">
                    <i class="bi bi-chat-dots me-2"></i>
                    留言列表
                  </h3>
                </div>
                <div class="card-body">
                  <!-- 留言输入框：仅登录状态显示 -->
                  <div class="mb-5" v-if="isLogin">
                    <textarea 
                      v-model="messageInput"
                      class="form-control border border-secondary-subtle bg-body" 
                      rows="3" 
                      placeholder="请输入你的留言..."
                      :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
                    ></textarea>
                    
                    <!-- 表情选择面板 -->
                    <div v-if="showMessageEmojiPicker" class="emoji-picker-container mt-2 p-3 border bg-body mb-3" :class="{ 'bg-dark border-dark-subtle': isDarkMode }">
                      <!-- 表情分类切换 -->
                      <div class="emoji-categories mb-3">
                        <button 
                          v-for="(emojis, category) in owoEmojis" 
                          :key="category"
                          @click="activeEmojiCategory = category"
                          class="btn btn-sm me-2 mb-2"
                          :class="activeEmojiCategory === category ? 'btn-primary' : 'btn-outline-secondary'"
                        >
                          {{ category }}
                        </button>
                      </div>
                      <!-- 表情列表 -->
                      <div class="d-flex flex-wrap gap-2">
                        <button 
                          v-for="(emoji, index) in owoEmojis[activeEmojiCategory].container" 
                          :key="index"
                          @click="insertMessageEmoji(emoji.icon)"
                          class="btn btn-sm btn-outline-secondary rounded-3 emoji-item"
                          :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
                          :title="emoji.text"
                        >
                          {{ emoji.icon }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- 按钮区域：表情按钮和发布留言按钮在同一行 -->
                    <div class="d-flex gap-2 mt-3">
                      <button 
                        @click="toggleMessageEmojiPicker"
                        class="btn btn-outline-secondary btn-sm px-4 emoji-button"
                        :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
                      >
                        <i class="bi bi-emoji-smile me-1"></i> 表情
                      </button>
                      <button 
                          @click="handlePublishMessage"
                          class="btn btn-primary px-4 publish-btn flex-grow-1"
                          :disabled="!messageInput.trim() || isPublishingMessage"
                        >
                          <i class="bi" :class="isPublishingMessage ? 'bi-arrow-clockwise spin' : 'bi-paper-plane-fill'"></i>
                          {{ isPublishingMessage ? ' 发布中...' : ' 发布留言' }}
                        </button>
                    </div>
                  </div>

                  <!-- 未登录引导区 -->
                  <div class="mb-5 p-4 bg-body text-center border" v-else>
                    <i class="bi bi-person-circle fs-3  mb-2"></i>
                    <p class="mb-3 text-muted">登录后即可发表留言～</p>
                    <div class="d-flex gap-2 justify-content-center">
                      <button 
                        @click="handleToLogin()"
                        class="btn btn-primary btn-sm px-4"
                      >
                        登录
                      </button>
                      <button 
                        @click="handleToRegister()"
                        class="btn btn-outline-primary btn-sm px-4"
                      >
                        注册
                      </button>
                    </div>
                  </div>

                  <!-- 留言列表 -->
                  <div v-if="commentList.length > 0">
                    <div ref="messagesGrid" class="messages-grid">
                      <div 
                        class="message-item" 
                        v-for="(message, index) in commentList" 
                        :key="message.id || index"
                      >
                        <!-- 便利贴样式留言卡片 -->
                        <div class="sticky-note card shadow-sm">
                          <div class="card-body">
                            <!-- 留言头部：用户信息和时间 -->
                            <div class="d-flex justify-content-between align-items-start mb-3">
                              <div class="d-flex align-items-center">
                                <img 
                                  :src="message.result?.author?.avatar || message.author?.avatar || message.avatar || 'https://picsum.photos/60/60'" 
                                  class="message-avatar rounded-circle me-3 border border-light shadow-sm" 
                                  alt="用户头像"
                                  style="width: 40px; height: 40px; object-fit: cover;"
                                >
                                <div>
                                  <h6 class="fw-semibold mb-0">
                                    <router-link v-if="message.result?.author?.id || message.author?.id" :to="`/author/${message.result?.author?.id || message.author?.id}`" class="text-decoration-none " @click="closeReplyModal()">
                                      {{ message.result?.author?.nickname || message.author?.nickname || message.nickname || '匿名用户' }}
                                    </router-link>
                                    <span v-else>{{ message.result?.author?.nickname || message.author?.nickname || message.nickname || '匿名用户' }}</span>
                                    <span v-if="message.result?.author?.result?.isAuthor || message.result?.author?.isAuthor || message.author?.result?.isAuthor || message.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
                                  </h6>
                                  <small class="text-muted">{{ formatTime(message.create_time || message.time || message.update_time) }}</small>
                                </div>
                              </div>
                              <!-- 回复图标：点击显示回复弹窗 -->
                              <div class="reply-icon-container">
                                <button 
                                  class="btn btn-sm btn-outline-secondary reply-icon" 
                                  @click="openReplyModal(message)"
                                  data-bs-toggle="modal"
                                  data-bs-target="#replyModal"
                                >
                                  <i class="bi bi-chat-dots"></i>
                                  <span class="ms-1">{{ message.replies?.length || 0 }}</span>
                                </button>
                              </div>
                            </div>
                            <!-- 留言内容 -->
                            <div class="message-content mb-3">
                              <p class="mb-0" v-html="processMessageContent(message.content || '')"></p>
                            </div>
                            <!-- 操作按钮 -->
                            <div class="message-actions">
                              <button 
                                class="btn btn-sm btn-outline-primary reply-btn" 
                                @click="openReplyModal(message)"
                                data-bs-toggle="modal"
                                data-bs-target="#replyModal"
                                v-if="isLogin"
                              >
                                <i class="bi bi-reply-fill me-1"></i> 回复
                              </button>
                              <button 
                                class="btn btn-sm btn-outline-secondary disabled reply-btn" 
                                v-else
                                data-bs-toggle="tooltip"
                                data-bs-title="登录后可回复"
                              >
                                <i class="bi bi-reply-fill me-1"></i> 回复
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 无留言提示 -->
                  <div v-else class="text-center py-5 text-muted">
                    <p class="mb-0 h6">暂无留言，快来抢沙发吧～</p>
                  </div>
                  
                  <!-- 回复弹窗 -->
                  <div class="modal fade" id="replyModal" tabindex="-1" aria-labelledby="replyModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title" id="replyModalLabel">回复列表</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                          <!-- 回复列表 -->
                          <div v-if="selectedMessage && selectedMessage.replies && selectedMessage.replies.length > 0">
                            <div 
                              class="reply-item mb-3 p-3 border rounded-3" 
                              v-for="(reply, index) in selectedMessage.replies" 
                              :key="reply.id || index"
                            >
                              <div class="d-flex align-items-start mb-2">
                                <img 
                                  :src="reply.result?.author?.avatar || reply.author?.avatar || reply.avatar || 'https://picsum.photos/62/62'" 
                                  class="message-avatar rounded-circle me-3 border border-light shadow-sm" 
                                  alt="回复用户头像"
                                  style="width: 35px; height: 35px; object-fit: cover;"
                                >
                                <div class="flex-grow-1">
                                  <h6 class="fw-semibold mb-0">
                                    <router-link v-if="reply.result?.author?.id || reply.author?.id" :to="`/author/${reply.result?.author?.id || reply.author?.id}`" class="text-decoration-none " @click="closeReplyModal()">
                                      {{ reply.result?.author?.nickname || reply.author?.nickname || reply.nickname || '匿名用户' }}
                                    </router-link>
                                    <span v-else>{{ reply.result?.author?.nickname || reply.author?.nickname || reply.nickname || '匿名用户' }}</span>
                                    <span v-if="reply.result?.author?.result?.isAuthor || reply.result?.author?.isAuthor || reply.author?.result?.isAuthor || reply.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
                                  </h6>
                                  <small class="text-muted">{{ formatTime(reply.create_time || reply.time || reply.update_time) }}</small>
                                </div>
                              </div>
                              <p class="mb-0 px-2 py-1 bg-body-tertiary" v-html="processMessageContent(reply.content || '')"></p>
                            </div>
                          </div>
                          <div v-else class="text-center py-3 text-muted">
                            <p class="mb-0">暂无回复</p>
                          </div>
                          
                          <!-- 回复输入框 -->
                          <div class="mt-4" v-if="isLogin">
                            <h6 class="mb-2">回复 {{ selectedMessage?.result?.author?.nickname || selectedMessage?.author?.nickname || selectedMessage?.nickname || '用户' }}:</h6>
                            <textarea 
                              v-model="replyInput"
                              class="form-control border border-secondary-subtle bg-body" 
                              rows="3" 
                              placeholder="请输入你的回复..."
                              :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
                            ></textarea>
                            
                            <!-- 回复表情选择面板 -->
                            <div v-if="showReplyEmojiPicker" class="emoji-picker-container mt-2 mb-3 p-3 border bg-body" :class="{ 'bg-dark border-dark-subtle': isDarkMode }">
                              <!-- 表情分类切换 -->
                              <div class="emoji-categories mb-3">
                                <button 
                                  v-for="(emojis, category) in owoEmojis" 
                                  :key="category"
                                  @click="activeEmojiCategory = category"
                                  class="btn btn-sm me-2 mb-2"
                                  :class="activeEmojiCategory === category ? 'btn-primary' : 'btn-outline-secondary'"
                                >
                                  {{ category }}
                                </button>
                              </div>
                              <!-- 表情列表 -->
                              <div class="d-flex flex-wrap gap-2">
                                <button 
                                  v-for="(emoji, index) in owoEmojis[activeEmojiCategory].container" 
                                  :key="index"
                                  @click="insertReplyEmoji(emoji.icon)"
                                  class="btn btn-sm btn-outline-secondary rounded-3 emoji-item"
                                  :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
                                  :title="emoji.text"
                                >
                                  {{ emoji.icon }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <div class="w-100" v-if="isLogin">
                            <div class="d-flex gap-2">
                              <button 
                                @click="toggleReplyEmojiPicker"
                                class="btn btn-sm btn-outline-secondary px-3 emoji-button"
                                :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
                              >
                                <i class="bi bi-emoji-smile me-1"></i> 表情
                              </button>
                              <button 
                                @click="handleSubmitReply(selectedMessage.id)"
                                class="btn btn-sm btn-primary px-3 flex-grow-1"
                                :disabled="!replyInput.trim() || isPublishingMessage"
                              >
                                <i class="bi" :class="isPublishingMessage ? 'bi-arrow-clockwise spin' : ''"></i>
                                {{ isPublishingMessage ? ' 发送中...' : ' 发送回复' }}
                              </button>
                              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">关闭</button>
                            </div>
                          </div>
                          <button type="button" class="btn btn-secondary" v-else data-bs-dismiss="modal">关闭</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 分页控件 -->
                  <div v-if="totalComments > pageSize" class="mt-4">
                    <nav aria-label="留言分页">
                      <ul class="pagination justify-content-center">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                          <button class="page-link" @click="handleCommentPageChange(currentPage - 1)" :disabled="currentPage === 1">
                            <span aria-hidden="true">&laquo;</span>
                          </button>
                        </li>
                        <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                          <button class="page-link" @click="handleCommentPageChange(page)">
                            {{ page }}
                          </button>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                          <button class="page-link" @click="handleCommentPageChange(currentPage + 1)" :disabled="currentPage === totalPages">
                            <span aria-hidden="true">&raquo;</span>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <!-- 普通独立页面 -->
      <div v-else>
        <!-- 页面内容区：核心阅读区，重写样式 -->
        <main class="article-content-wrap card shadow-sm mt-2">
          <div class="p-3">
          <!-- 页面头部：标题+元信息 -->
            <header class="article-header mt-2">
              <h1 class="article-title text-center fw-bold mb-3">{{ pageInfo.title }}</h1>
              <!-- 文章元信息：居中布局、弱化样式 -->
              <div class="article-meta d-flex flex-wrap justify-content-center align-items-center text-muted gap-4 fs-6">
                <span class="meta-item d-flex align-items-center">
                  <i class="bi bi-person-fill me-2"></i>
                  {{ authorInfo.nickname || '匿名' }}
                </span>
                <span class="meta-item d-flex align-items-center">
                  <i class="bi bi-calendar-fill me-2"></i>
                  {{ formatTime(pageInfo.publish_time || Date.now() / 1000) }}
                </span>
                <span class="meta-item d-flex align-items-center">
                  <i class="bi bi-chat-fill me-2"></i>
                  {{ commentCount || 0 }} 评论
                </span>
                <span class="meta-item d-flex align-items-center">
                  <i class="bi bi-eye-fill me-2"></i>
                  {{ viewCount || 0 }} 浏览
                </span>
              </div>
            </header>
            <div class="article-content mt-4">
              <i-markdown :model-value="pageInfo.content || '暂无页面内容，敬请期待～'" />
            </div>
          </div>
          <!-- 文章底部栏：显示最后更新时间 -->
          <div class="card-footer">
            <div class="d-flex justify-content-end">
              <span class="text-muted d-flex align-items-center">
                <i class="bi bi-clock-fill me-2"></i>
                最后更新：{{ formatTime(pageInfo.update_time || pageInfo.last_update || Date.now() / 1000) }}
              </span>
            </div>
          </div>
        </main>
        
        <!-- 评论区域：优化间距，自然衔接 -->
        <section class="article-comment mt-2 mb-8">
          <i-comment 
            :articleId="pageInfo.id" 
            :commentCount="commentCount" 
            :commentList="commentList" 
            :isLogin="isLogin" 
            :isDarkMode="isDarkMode"
            :articleAuthor="authorInfo"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :totalComments="totalComments"
            @publishComment="handlePublishComment"
            @replyComment="handleReplyComment"
            @pageChange="handleCommentPageChange"
          />
        </section>
      </div>
    </div>
  </div>

  <!-- 友链申请弹窗 -->
  <div class="modal fade" id="linkApplyModal" tabindex="-1" aria-labelledby="linkApplyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="linkApplyModalLabel">
            <i class="bi bi-link-45deg me-2"></i>申请友链
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleLinkApply">
            <div class="mb-3">
              <label for="linkNickname" class="form-label">网站名称</label>
              <input 
                type="text" 
                class="form-control" 
                id="linkNickname" 
                v-model="linkForm.nickname"
                required
                placeholder="请输入您的网站名称"
              >
            </div>
            <div class="mb-3">
              <label for="linkUrl" class="form-label">网站链接</label>
              <input 
                type="url" 
                class="form-control" 
                id="linkUrl" 
                v-model="linkForm.url"
                required
                placeholder="请输入您的网站链接"
              >
            </div>
            <div class="mb-3">
              <label for="linkAvatar" class="form-label">网站图标</label>
              <div class="input-group">
                <input 
                  type="url" 
                  class="form-control" 
                  id="linkAvatar" 
                  v-model="linkForm.avatar"
                  placeholder="请输入您的网站图标链接"
                >
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  @click="handleUploadAvatar"
                >
                  上传
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label for="linkDescription" class="form-label">网站描述</label>
              <textarea 
                class="form-control" 
                id="linkDescription" 
                v-model="linkForm.description"
                rows="3"
                placeholder="请输入您的网站描述"
              ></textarea>
            </div>
            <div class="mb-3">
              <label for="linkGroup" class="form-label">友链分组</label>
              <div v-if="linkGroupsLoading" class="form-control-plaintext">
                <div class="spinner-border spinner-border-sm text-secondary" role="status">
                  <span class="visually-hidden">加载中...</span>
                </div>
                加载分组中...
              </div>
              <select 
                v-else 
                class="form-select" 
                id="linkGroup" 
                v-model="linkForm.group"
              >
                <option value="">请选择友链分组</option>
                <option v-for="group in linkGroups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleLinkApply"
            :disabled="isSubmitting"
          >
            <i v-if="isSubmitting" class="bi bi-arrow-clockwise spin me-1"></i>
            {{ isSubmitting ? '提交中...' : '提交申请' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCommStore } from '@/store/comm'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'
import iComment from '@/comps/custom/i-comment.vue'
import utils from '@/utils/utils'
import cache from '@/utils/cache'
import { usePageTitle } from '@/utils/usePageTitle'
import { goBack } from '@/utils/route'
import { uploadImage } from '@/utils/upload'
import toast from '@/utils/toast'
import OwOData from '@/assets/json/OwO.json'
import Sortable from 'sortablejs'

// 状态管理
const store = useCommStore()

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('加载中...')

// 接收路由传递的页面key：使用pageKey代替key，避免保留关键字冲突
const props = defineProps({
  pageKey: {
    type: String,
    required: false,
    default: '',
  }
})

// 响应式状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageInfo = ref({})

// 友链申请相关
const linkForm = ref({
  nickname: '',
  url: '',
  description: '',
  avatar: '',
  target: '_blank',
  group: ''
})
const linkApplyModal = ref(null)
const isSubmitting = ref(false)
const isCoolingDown = ref(false)
const coolingDownTime = ref(0)
let coolingDownTimer = null

// 友链分组相关
const linkGroups = ref([])
const linkGroupsLoading = ref(false)

// 路由实例
const router = useRouter()
const route = useRoute()

// 评论相关响应式数据
const commentCount = ref(0)
const commentList = ref([])
const isDarkMode = ref(false)
const authorInfo = ref({})
const viewCount = ref(0) // 浏览量
// 评论分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)

// 归档页面相关数据
const archiveStats = ref({
  articleCount: 0,
  categoryCount: 0,
  pageCount: 0,
  tagCount: 0,
  linkCount: 0,
  commentCount: 0
})
const refreshingArchive = ref(false)
let archiveRefreshTimer = null

// 文章归档相关数据
const articles = ref([])
const articlesLoading = ref(false)
const articlesError = ref(false)
const articlesErrorMsg = ref('')
const groupedArticles = ref({})
// 分页相关
const articlePage = ref(1)
const articlePageSize = ref(20)
const articleTotal = ref(0)

// 计算总页数
const articlePageCount = computed(() => {
  return Math.ceil(articleTotal.value / articlePageSize.value)
})

// 友链页面相关数据
const links = ref([])
const linksLoading = ref(false)
const linksError = ref(false)
const linksErrorMsg = ref('')
const linkTotal = ref(0)

// 计算属性
const isLogin = computed(() => store.login.finish && Object.keys(store.login.user).length > 0)

// 判断是否为归档页面
const isArchivePage = computed(() => {
  const currentKey = (props.pageKey || route.params.key || '').trim()
  return currentKey === 'archive'
})

// 判断是否为友链页面
const isLinksPage = computed(() => {
  const currentKey = (props.pageKey || route.params.key || '').trim()
  return currentKey === 'links'
})

// 判断是否为留言页面
const isMessagePage = computed(() => {
  const currentKey = (props.pageKey || route.params.key || '').trim()
  return currentKey === 'message'
})

// 留言统计相关数据
const uniqueCommenters = ref(0)
const recentMessagesCount = ref(0)

// 留言板相关数据
const messageInput = ref('')
const replyInput = ref('')
const showReplyIndex = ref(null)
const replyTarget = ref(null)
const selectedMessage = ref(null)
const messagesGrid = ref(null)
const replyModalMessage = ref(null)
// 表情功能相关状态
const showMessageEmojiPicker = ref(false)
const showReplyEmojiPicker = ref(false)
// 发布状态
const isPublishingMessage = ref(false)

// 表情数据
const owoEmojis = ref(OwOData)
const activeEmojiCategory = ref('颜文字')

// 友链分组聚合
const groupLinkMap = computed(() => {
  const map = {}
  links.value.forEach(link => {
    const groupName = link.result?.group?.name || '未分组'
    if (!map[groupName]) map[groupName] = []
    map[groupName].push(link)
  })
  return map
})

/**
 * 时间格式化：使用utils.js中的timeToDate函数
 */
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  return utils.timeToDate(timestamp, 'Y-m-d')
}

/**
 * Key合法性校验：全量兜底，防止key为undefined/null
 */
const checkPageKey = (key) => {
  // 入参是initPage处理过的currentKey，已做trim，直接判断即可
  if (!key) {
    errorMsg.value = '页面标识不能为空，请检查访问地址'
    return false
  }
  const keyReg = /^[a-zA-Z0-9-_]+$/
  if (!keyReg.test(key)) {
    errorMsg.value = '页面标识不合法，仅允许字母、数字、横杠和下划线'
    return false
  }
  if (key.length > 20) {
    errorMsg.value = '页面标识过长，最大支持20个字符'
    return false
  }
  return true
}

/**
 * 获取独立页面数据：入参加兜底，双重防护
 */
const getPageData = async (pageKey) => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  try {
    // 缓存键
    const cacheKey = `page_detail_${pageKey}`
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取页面数据
    let cachedPage = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedPage) {
      const queryParams = {
        key: String(pageKey || '').trim(), // 兜底空字符串
        cache: false,
        withTrashed: false
      }
      const res = await request.get('/api/pages/one', queryParams)

      if (res.code === 200) {
      if (!res.data || Object.keys(res.data).length === 0) {
        error.value = true
        errorMsg.value = '未找到该独立页面，可能已被删除或访问地址错误'
        setDynamicTitle('页面不存在')
      } else {
        cachedPage = res.data
        // 缓存页面数据
        cache.set(cacheKey, cachedPage, cacheExpire)
        pageInfo.value = cachedPage
        // 更新浏览量
        viewCount.value = res.data.views || 0
        error.value = false
        setDynamicTitle(pageInfo.value.title)
      }
    } else {
      error.value = true
      errorMsg.value = res.msg || '获取独立页面数据失败'
      setDynamicTitle('获取页面失败')
    }
  } else {
      // 使用缓存数据
      pageInfo.value = cachedPage
      // 更新浏览量
      viewCount.value = cachedPage.views || 0
      error.value = false
      setDynamicTitle(pageInfo.value.title)
    }
} catch (err) {
  error.value = true
  errorMsg.value = '网络异常，请检查网络后刷新页面'
  // console.error('[独立页面接口异常]：', err)
  setDynamicTitle('网络异常')
} finally {
  loading.value = false
}
}

/**
 * 页面初始化：封装校验+请求逻辑，加兜底
 */
const initPage = async () => {
  // 优先使用props.pageKey，然后使用route.params.key，最后兜底空字符串
  const currentKey = (props.pageKey || route.params.key || '').trim()
  
  // 如果是归档页面，直接加载统计信息
  if (currentKey === 'archive') {
    setDynamicTitle('加载中...')
    await getArchivePageData()
    fetchArchiveStats()
    await fetchArticles()
    startArchiveAutoRefresh()
  } 
  // 如果是友链页面，加载友链数据
  else if (currentKey === 'links') {
    setDynamicTitle('加载中...')
    await getLinksPageData()
    await fetchLinks()
    await getLinksComments(currentPage.value, pageSize.value)
  } 
  // 如果是留言页面，加载留言页面数据
  else if (currentKey === 'message') {
    setDynamicTitle('加载中...')
    await getMessagePageData()
    await getComments(pageInfo.value.id, currentPage.value, pageSize.value)
    await calculateMessageStats()
  } else if (checkPageKey(currentKey)) {
    // 普通独立页面
    getPageData(currentKey)
  } else {
    error.value = true
    loading.value = false
    setDynamicTitle('页面标识不合法')
    setTimeout(() => goBack(), 3000)
  }
}

// 监听路由参数变化：加新参数兜底，避免undefined
watch(
  () => route.params.key,
  () => {
    initPage() // 直接执行，内部会取最新的key并校验
  },
  { immediate: false }
)

// 监听props.pageKey变化：确保切换到归档或友链页面时数据自动刷新
watch(
  () => props.pageKey,
  () => {
    initPage() // 直接执行，内部会取最新的pageKey并校验
  },
  { immediate: false }
)

// 初始化拖拽功能
const initSortable = () => {
  console.log('Initializing Sortable...');
  console.log('isMessagePage:', isMessagePage.value);
  console.log('messagesGrid:', messagesGrid.value);
  
  if (isMessagePage.value && messagesGrid.value) {
    console.log('Sortable initialized successfully!');
    // 移除之前的Sortable实例
    if (window.sortableInstance) {
      window.sortableInstance.destroy();
    }
    
    try {
      // 直接初始化，不需要nextTick
      window.sortableInstance = new Sortable(messagesGrid.value, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        // 移除handle配置，让整个元素都可以拖拽
        // handle: '.sticky-note',
        onStart: function(evt) {
          console.log('Drag started:', evt);
        },
        onEnd: function(evt) {
          // 可以在这里处理拖拽结束后的逻辑，比如保存排序
          console.log('Dragged element:', evt.item);
          console.log('Old index:', evt.oldIndex);
          console.log('New index:', evt.newIndex);
        }
      });
      console.log('Sortable instance:', window.sortableInstance);
    } catch (error) {
      console.error('Error initializing Sortable:', error);
    }
  } else {
    console.log('Sortable not initialized. Conditions not met.');
  }
}

// 初始化页面
onMounted(() => {
  initPage()
})

// 监听留言列表变化，重新初始化拖拽功能
watch(
  () => commentList.value.length,
  (newLength) => {
    console.log('Comment list length changed:', newLength);
    if (newLength > 0) {
      // 延迟一下，确保DOM已经更新
      setTimeout(() => {
        initSortable();
      }, 500);
    }
  }
)

// 监听isMessagePage变化
watch(
  () => isMessagePage.value,
  (newValue) => {
    console.log('isMessagePage changed:', newValue);
    if (newValue && commentList.value.length > 0) {
      setTimeout(() => {
        initSortable();
      }, 500);
    }
  }
)

// 获取页面评论
const getComments = async (pageId, page = 1, limit = 10) => {
  try {
    // 缓存键
    const cacheKey = `page_comments_${pageId}_${page}_${limit}`
    const cacheExpire = 5 // 缓存5分钟
    
    // 尝试从缓存获取评论数据
    let cachedComments = cache.get(cacheKey)
    
    if (!cachedComments) {
      const res = await request.get('/api/comment/flat', {
        bind_id: pageId,
        bind_type: 'page',
        page: page,
        limit: limit,
        order: 'create_time desc'
      })
      
      if (res.code === 200) {
        commentCount.value = res.data?.count || 0
        commentList.value = res.data?.data || []
        totalComments.value = res.data?.count || 0
        currentPage.value = page
        pageSize.value = limit
        // 缓存评论数据
        cache.set(cacheKey, {
          count: res.data?.count || 0,
          data: res.data?.data || [],
          page: page,
          limit: limit
        }, cacheExpire)
      }
    } else {
      commentCount.value = cachedComments.count || 0
      commentList.value = cachedComments.data || []
      totalComments.value = cachedComments.count || 0
      currentPage.value = cachedComments.page || page
      pageSize.value = cachedComments.limit || limit
    }
  } catch (error) {
    // console.error('获取评论失败：', error)
  }
}

// 获取作者信息
const getAuthorInfo = async (authorId) => {
  try {
    const res = await request.get('/api/users/one', {
      id: authorId
    })
    
    if (res.code === 200 && res.data) {
      authorInfo.value = res.data
    }
  } catch (error) {
    // console.error('获取作者信息失败：', error)
  }
}

// 发布评论
const handlePublishComment = async (data) => {
  try {
    // 检查当前是否为友链页面
    const currentKey = (props.pageKey || route.params.key || '').trim()
    const isLinksPage = currentKey === 'links'
    
    const commentData = {
      content: data.content,
      bind_type: 'page',
      bind_id: pageInfo.value.id
    }
    
    const res = await request.post('/api/comment/create', commentData)
    
    if (res.code === 200) {
      // 清除评论缓存
      const pageId = pageInfo.value.id
      const cacheKeys = []
      
      if (isLinksPage) {
        cacheKeys.push(
          `links_comments_${pageId}_1_10`,
          `links_comments_${pageId}_${currentPage.value}_${pageSize.value}`
        )
      } else {
        cacheKeys.push(
          `page_comments_${pageId}_1_10`,
          `page_comments_${pageId}_${currentPage.value}_${pageSize.value}`
        )
      }
      
      cache.delMultiple(cacheKeys)
      // 重新获取评论列表
      if (isLinksPage) {
        await getLinksComments(currentPage.value, pageSize.value)
      } else {
        await getComments(pageInfo.value.id, currentPage.value, pageSize.value)
      }
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('评论发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '评论发布失败')
      }
    }
  } catch (error) {
    // console.error('发布评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，评论发布失败')
    }
  }
}

// 回复评论
const handleReplyComment = async (data) => {
  try {
    // 检查当前是否为友链页面
    const currentKey = (props.pageKey || route.params.key || '').trim()
    const isLinksPage = currentKey === 'links'
    
    const commentData = {
      content: data.content,
      bind_type: 'page',
      bind_id: pageInfo.value.id,
      pid: data.commentId
    }
    
    const res = await request.post('/api/comment/create', commentData)
    
    if (res.code === 200) {
      // 清除评论缓存
      const pageId = pageInfo.value.id
      const cacheKeys = []
      
      if (isLinksPage) {
        cacheKeys.push(
          `links_comments_${pageId}_1_10`,
          `links_comments_${pageId}_${currentPage.value}_${pageSize.value}`
        )
      } else {
        cacheKeys.push(
          `page_comments_${pageId}_1_10`,
          `page_comments_${pageId}_${currentPage.value}_${pageSize.value}`
        )
      }
      
      cache.delMultiple(cacheKeys)
      // 重新获取评论列表
      if (isLinksPage) {
        await getLinksComments(currentPage.value, pageSize.value)
      } else {
        await getComments(pageInfo.value.id, currentPage.value, pageSize.value)
      }
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('回复发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '回复发布失败')
      }
    }
  } catch (error) {
    // console.error('回复评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，回复发布失败')
    }
  }
}

// 处理评论分页
const handleCommentPageChange = async (page) => {
  try {
    // 检查当前是否为友链页面
    const currentKey = (props.pageKey || route.params.key || '').trim()
    const isLinksPage = currentKey === 'links'
    
    if (isLinksPage) {
      await getLinksComments(page, pageSize.value)
    } else if (pageInfo.value.id) {
      await getComments(pageInfo.value.id, page, pageSize.value)
    }
  } catch (error) {
    // console.error('评论分页切换失败：', error)
  }
}

// 获取文章总数
const getArticleCount = async () => {
  try {
    const res = await request.get('/api/article/count')
    if (res.code === 200) {
      archiveStats.value.articleCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取文章总数失败：', error)
  }
}

// 获取文章分类总数
const getCategoryCount = async () => {
  try {
    const res = await request.get('/api/article-group/count')
    if (res.code === 200) {
      archiveStats.value.categoryCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取文章分类总数失败：', error)
  }
}

// 获取独立页面总数
const getPageCount = async () => {
  try {
    const res = await request.get('/api/pages/count', {
      onlyTrashed: false
    })
    if (res.code === 200) {
      archiveStats.value.pageCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取独立页面总数失败：', error)
  }
}

// 获取标签总数
const getTagCount = async () => {
  try {
    const res = await request.get('/api/tags/count')
    if (res.code === 200) {
      archiveStats.value.tagCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取标签总数失败：', error)
  }
}

// 获取友情链接总数
const getLinkCount = async () => {
  try {
    const res = await request.get('/api/links/count', {
      onlyTrashed: false
    })
    if (res.code === 200) {
      archiveStats.value.linkCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取友情链接总数失败：', error)
  }
}

// 获取评论总数
const getCommentCount = async () => {
  try {
    const res = await request.get('/api/comment/count')
    if (res.code === 200) {
      archiveStats.value.commentCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取评论总数失败：', error)
  }
}

// 获取所有归档统计数据
const fetchArchiveStats = async () => {
  try {
    // 缓存键
    const cacheKey = 'archive_stats'
    const cacheExpire = 30 // 缓存30分钟
    
    // 尝试从缓存获取归档统计数据
    let cachedStats = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedStats) {
      await Promise.all([
        getArticleCount(),
        getCategoryCount(),
        getPageCount(),
        getTagCount(),
        getLinkCount(),
        getCommentCount()
      ])
      // 缓存归档统计数据
      cache.set(cacheKey, archiveStats.value, cacheExpire)
    } else {
      // 使用缓存数据
      archiveStats.value = cachedStats
    }
  } catch (error) {
    // console.error('获取归档统计数据失败：', error)
  } finally {
    loading.value = false
    refreshingArchive.value = false
  }
}

// 手动刷新归档统计数据
const refreshArchiveStats = async () => {
  refreshingArchive.value = true
  // 清除缓存，确保获取最新数据
  cache.del('archive_stats')
  await fetchArchiveStats()
  if (window.Toast) {
    window.Toast.success('数据刷新成功')
  }
}

// 启动归档页面自动刷新
const startArchiveAutoRefresh = () => {
  // 清除之前的定时器
  if (archiveRefreshTimer) {
    clearInterval(archiveRefreshTimer)
  }
  // 每5分钟刷新一次
  archiveRefreshTimer = setInterval(() => {
    fetchArchiveStats()
  }, 5 * 60 * 1000)
}

// 获取友链页面基础数据
const getLinksPageData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/pages/one?key=links', {
      params: {
        key: 'links',
        cache: false,
        withTrashed: false
      }
    })
    if (res && res.code === 200 && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
      pageInfo.value = { ...pageInfo.value, ...res.data }
      // 更新浏览量
      viewCount.value = res.data.views || 0
      setDynamicTitle(res.data.title || '友链')
    } else {
      error.value = true
      errorMsg.value = '未找到友链页面配置，请联系管理员检查后台'
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，无法加载友链页面配置'
    console.error('[友链页面基础数据异常]：', err)
  } finally {
    loading.value = false
    // 获取作者信息
    const authorId = pageInfo.value.uid
    if (authorId) {
      getAuthorInfo(authorId)
    }
  }
}

// 获取归档页面基础数据
const getArchivePageData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/pages/one?key=archive', {
      params: {
        key: 'archive',
        cache: false,
        withTrashed: false
      }
    })
    if (res && res.code === 200 && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
      pageInfo.value = { ...pageInfo.value, ...res.data }
      // 更新浏览量
      viewCount.value = res.data.views || 0
      setDynamicTitle(res.data.title || '归档')
    }
  } catch (err) {
    console.error('[归档页面基础数据异常]：', err)
  } finally {
    loading.value = false
    // 获取作者信息
    const authorId = pageInfo.value.uid
    if (authorId) {
      getAuthorInfo(authorId)
    }
  }
}

// 获取文章列表
const fetchArticles = async () => {
  articlesLoading.value = true
  articlesError.value = false
  articlesErrorMsg.value = ''
  
  try {
    // 直接使用查询字符串，确保参数正确传递
    const res = await request.get('/api/article/all?page=1&limit=9999&order=create_time+desc')
    
    if (res && res.code === 200 && res.data) {
      const { data = [], count = 0 } = res.data
      
      // 打印数据长度，以便调试
      console.log('文章数据长度:', data.length)
      console.log('文章总数:', count)
      
      articles.value = data
      articleTotal.value = count
      
      // 按年月分组
      groupArticlesByYearMonth(articles.value)
      
      // 打印分组后的数据
      console.log('分组后的数据:', groupedArticles.value)
    } else {
      articlesError.value = true
      articlesErrorMsg.value = res?.msg || '获取文章数据失败'
    }
  } catch (err) {
    articlesError.value = true
    articlesErrorMsg.value = '网络异常，无法加载文章数据'
    console.error('[文章数据请求异常]：', err)
  } finally {
    articlesLoading.value = false
  }
}

// 按年月分组文章
const groupArticlesByYearMonth = (articlesData) => {
  const grouped = {}
  
  articlesData.forEach(article => {
    if (article.publish_time) {
      const date = new Date(article.publish_time * 1000)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const yearMonth = `${year}年${month}月`
      
      if (!grouped[yearMonth]) {
        grouped[yearMonth] = []
      }
      
      grouped[yearMonth].push(article)
    }
  })
  
  groupedArticles.value = grouped
}

// 获取全部友链数据
const fetchLinks = async () => {
  linksLoading.value = true
  linksError.value = false
  linksErrorMsg.value = ''
  
  try {
    // 缓存键
    const cacheKey = 'links_list'
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取友链数据
    let cachedLinks = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedLinks) {
      // 直接写死API地址参数，不配置任何动态参数
      const res = await request.get('/api/links/all?page=1&limit=500&order=id+asc')
      if (res && res.code === 200 && res.data) {
        const { data = [], count = 0 } = res.data
        links.value = data     // 直接赋值全部数据
        linkTotal.value = count   // 总条数
        // 缓存友链数据
        cache.set(cacheKey, { data, count }, cacheExpire)
      } else {
        linksError.value = true
        linksErrorMsg.value = res?.msg || '获取友链数据失败'
      }
    } else {
      // 使用缓存数据
      links.value = cachedLinks.data || []
      linkTotal.value = cachedLinks.count || 0
    }
  } catch (err) {
    linksError.value = true
    linksErrorMsg.value = '网络异常，无法加载友链数据'
    console.error('[友链数据请求异常]：', err)
  } finally {
    linksLoading.value = false
  }
}

// 获取友链页面评论
const getLinksComments = async (page = 1, limit = 10) => {
  try {
    // 缓存键
    const cacheKey = `links_comments_${pageInfo.value.id}_${page}_${limit}`
    const cacheExpire = 5 // 缓存5分钟
    
    // 尝试从缓存获取评论数据
    let cachedComments = cache.get(cacheKey)
    
    if (!cachedComments) {
      const res = await request.get('/api/comment/flat', {
        bind_id: pageInfo.value.id,
        bind_type: 'page',
        page: page,
        limit: limit,
        order: 'create_time desc'
      })
      
      if (res.code === 200) {
        commentCount.value = res.data?.count || 0
        commentList.value = res.data?.data || []
        totalComments.value = res.data?.count || 0
        currentPage.value = page
        pageSize.value = limit
        // 缓存评论数据
        cache.set(cacheKey, {
          count: res.data?.count || 0,
          data: res.data?.data || [],
          page: page,
          limit: limit
        }, cacheExpire)
      }
    } else {
      commentCount.value = cachedComments.count || 0
      commentList.value = cachedComments.data || []
      totalComments.value = cachedComments.count || 0
      currentPage.value = cachedComments.page || page
      pageSize.value = cachedComments.limit || limit
    }
  } catch (error) {
    console.error('获取评论失败：', error)
  }
}

// 处理友链头像错误
const handleLinkAvatarError = (event) => {
  // 可以设置默认头像
  event.target.src = 'https://img1.zhuxu.asia/2026/L2SIxoK1ss.png'
}



// 获取留言页面基础数据
const getMessagePageData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/pages/one?key=message', {
      params: {
        key: 'message',
        cache: false,
        withTrashed: false
      }
    })
    if (res && res.code === 200 && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
      pageInfo.value = { ...pageInfo.value, ...res.data }
      // 更新浏览量
      viewCount.value = res.data.views || 0
      setDynamicTitle(res.data.title || '留言板')
    } else {
      error.value = true
      errorMsg.value = '未找到留言页面配置，请联系管理员检查后台'
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，无法加载留言页面配置'
    console.error('[留言页面基础数据异常]：', err)
  } finally {
    loading.value = false
    // 获取作者信息
    const authorId = pageInfo.value.uid
    if (authorId) {
      getAuthorInfo(authorId)
    }
  }
}

// 计算留言统计数据
const calculateMessageStats = async () => {
  try {
    if (!pageInfo.value.id) return
    
    // 获取所有留言数据
    const res = await request.get('/api/comment/flat', {
      bind_id: pageInfo.value.id,
      bind_type: 'page',
      page: 1,
      limit: 1000,
      order: 'create_time desc'
    })
    
    if (res.code === 200 && res.data?.data) {
      const allComments = res.data.data
      
      // 计算唯一留言人数
      const uniqueUsers = new Set()
      allComments.forEach(comment => {
        // 尝试从不同位置获取用户ID
        const userId = comment.user_id || comment.result?.author?.id || comment.author?.id
        if (userId) {
          uniqueUsers.add(userId)
        }
      })
      uniqueCommenters.value = uniqueUsers.size
      
      // 计算最近留言数（7天内）
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const recentComments = allComments.filter(comment => {
        return comment.create_time * 1000 >= sevenDaysAgo
      })
      recentMessagesCount.value = recentComments.length
    }
  } catch (error) {
    console.error('计算留言统计数据失败：', error)
  }
}

// 检测深色模式
const detectDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 友链申请相关方法
// 打开友链申请弹窗
const openLinkApplyModal = async () => {
  // 检查是否在冷却期
  if (isCoolingDown.value) {
    toast.warning('请稍后再申请友链')
    return
  }
  
  // 重置表单
  linkForm.value = {
    nickname: '',
    url: '',
    description: '',
    avatar: '',
    target: '_blank', // 固定为新窗口打开
    group: ''
  }
  
  // 获取友链分组
  await fetchLinkGroups()
  
  // 打开弹窗
  if (window.bootstrap) {
    const modal = new window.bootstrap.Modal(document.getElementById('linkApplyModal'))
    modal.show()
  }
}

// 获取友链分组
const fetchLinkGroups = async () => {
  linkGroupsLoading.value = true
  try {
    const res = await request.get('/api/links-group/all', {
      limit: 100, // 获取足够多的分组
      order: 'create_time desc'
    })
    
    if (res.code === 200) {
      // 检查数据结构
      if (res.data && Array.isArray(res.data)) {
        // 如果直接返回数组
        linkGroups.value = res.data
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        // 如果返回的数据包含 data 字段
        linkGroups.value = res.data.data
      } else {
        // 空数组作为默认值
        linkGroups.value = []
      }
    }
  } catch (error) {
    console.error('获取友链分组失败:', error)
    linkGroups.value = []
  } finally {
    linkGroupsLoading.value = false
  }
}

// 上传网站图标
const handleUploadAvatar = () => {
  uploadImage('avatar', (path) => {
    linkForm.value.avatar = path
  })
}

// 提交友链申请
const handleLinkApply = async () => {
  // 验证必填字段
  if (!linkForm.value.nickname.trim() || !linkForm.value.url.trim()) {
    toast.warning('请填写必填字段')
    return
  }
  
  // 验证URL格式
  try {
    new URL(linkForm.value.url)
  } catch {
    toast.warning('请输入正确的网站链接')
    return
  }
  
  isSubmitting.value = true
  
  try {
    // 自动设置为新窗口打开
    const submitData = {
      ...linkForm.value,
      target: '_blank' // 固定为新窗口打开
    }
    
    const res = await request.post('/api/links/create', submitData)
    
    if (res.code === 200) {
      toast.success('友链申请已提交，请等待审核，审核通过后即可在友链中显示')
      
      // 关闭弹窗
      if (window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('linkApplyModal'))
        modal.hide()
      }
      
      // 开始冷却期
      startCoolingDown()
    } else {
      toast.error(res.msg || '提交失败，请重试')
    }
  } catch (err) {
    toast.error('网络错误，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 开始冷却期
const startCoolingDown = () => {
  const COOLDOWN_SECONDS = 300 // 5分钟冷却期
  isCoolingDown.value = true
  coolingDownTime.value = COOLDOWN_SECONDS
  
  // 清除之前的定时器
  if (coolingDownTimer) {
    clearInterval(coolingDownTimer)
  }
  
  // 设置新的定时器
  coolingDownTimer = setInterval(() => {
    coolingDownTime.value--
    if (coolingDownTime.value <= 0) {
      clearInterval(coolingDownTimer)
      isCoolingDown.value = false
      coolingDownTime.value = 0
    }
  }, 1000)
}

// 处理登录
const handleLogin = () => {
  router.push('/login')
}

// 页面挂载初始化
onMounted(() => {
  initPage()
  detectDarkMode()
  
  // 监听深色模式变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode)
})

// 页面卸载清理
onUnmounted(() => {
  // 清除归档页面自动刷新定时器
  if (archiveRefreshTimer) {
    clearInterval(archiveRefreshTimer)
  }
  
  // 清除友链申请冷却定时器
  if (coolingDownTimer) {
    clearInterval(coolingDownTimer)
  }
  
  // 移除深色模式监听
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', detectDarkMode)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalComments.value / pageSize.value)
})

// 处理留言内容，添加@提及效果和换行支持
const processMessageContent = (content) => {
  if (!content) return ''
  // 先将换行符转换为<br>标签
  let processedContent = content.replace(/\n/g, '<br>')
  // 匹配@用户名格式，替换为带颜色的HTML
  return processedContent.replace(/@([\u4e00-\u9fa5\w]+)/g, '<span class="at-mention">@$1</span>')
}

// 发布留言
const handlePublishMessage = async () => {
  const content = messageInput.value.trim()
  if (!content) return
  
  isPublishingMessage.value = true
  
  try {
    // 发布留言
    const commentData = {
      content: content,
      bind_type: 'page',
      bind_id: pageInfo.value.id
    }
    
    const res = await request.post('/api/comment/create', commentData)
    
    if (res.code === 200) {
      // 清除评论缓存
      const pageId = pageInfo.value.id
      const cacheKeys = [
        `page_comments_${pageId}_1_10`,
        `page_comments_${pageId}_${currentPage.value}_${pageSize.value}`
      ]
      
      cache.delMultiple(cacheKeys)
      // 重新获取评论列表
      await getComments(pageInfo.value.id, currentPage.value, pageSize.value)
      // 重新计算统计数据
      await calculateMessageStats()
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('留言发布成功！')
      }
      messageInput.value = ''
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '留言发布失败')
      }
    }
  } catch (error) {
    console.error('发布留言失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，留言发布失败')
    }
  } finally {
    isPublishingMessage.value = false
  }
}

// 切换回复输入框
const toggleReplyForm = (index, replyIndex = null) => {
  // 创建一个唯一的标识符，用于区分不同留言的回复输入框
  const uniqueKey = replyIndex !== null ? `${index}-${replyIndex}` : index
  
  if (showReplyIndex.value === uniqueKey) {
    showReplyIndex.value = null
    replyInput.value = ''
    replyTarget.value = null
  } else {
    showReplyIndex.value = uniqueKey
    let targetComment
    
    if (replyIndex !== null) {
      // 回复二级留言
      const parentComment = commentList.value[index]
      targetComment = parentComment.replies[replyIndex]
    } else {
      // 回复一级留言
      targetComment = commentList.value[index]
    }
    
    replyTarget.value = targetComment
    // 在回复输入框中显示@用户
    const nickname = targetComment.result?.author?.nickname || targetComment.author?.nickname || targetComment.nickname || '匿名用户'
    replyInput.value = `@${nickname} `
  }
}

// 提交回复
const handleSubmitReply = async (commentId) => {
  const content = replyInput.value.trim()
  if (!content || !commentId) return
  
  isPublishingMessage.value = true
  
  try {
    // 提交回复
    const commentData = {
      content: content,
      bind_type: 'page',
      bind_id: pageInfo.value.id,
      pid: commentId
    }
    
    const res = await request.post('/api/comment/create', commentData)
    
    if (res.code === 200) {
      // 清除评论缓存
      const pageId = pageInfo.value.id
      const cacheKeys = [
        `page_comments_${pageId}_1_10`,
        `page_comments_${pageId}_${currentPage.value}_${pageSize.value}`
      ]
      
      cache.delMultiple(cacheKeys)
      // 重新获取评论列表
      await getComments(pageInfo.value.id, currentPage.value, pageSize.value)
      // 重新计算统计数据
      await calculateMessageStats()
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('回复发布成功！')
      }
      // 关闭回复弹窗
      closeReplyModal()
      // 清空回复相关状态
      showReplyIndex.value = null
      replyInput.value = ''
      replyTarget.value = null
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '回复发布失败')
      }
    }
  } catch (error) {
    console.error('提交回复失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，回复发布失败')
    }
  } finally {
    isPublishingMessage.value = false
  }
}

// 取消回复
const cancelReply = () => {
  showReplyIndex.value = null
  replyInput.value = ''
  replyTarget.value = null
  showReplyEmojiPicker.value = false
}

// 表情功能
// 切换留言表情选择面板
const toggleMessageEmojiPicker = () => {
  showMessageEmojiPicker.value = !showMessageEmojiPicker.value
  showReplyEmojiPicker.value = false
}

// 切换回复表情选择面板
const toggleReplyEmojiPicker = () => {
  showReplyEmojiPicker.value = !showReplyEmojiPicker.value
  showMessageEmojiPicker.value = false
}

// 插入表情到留言输入框
const insertMessageEmoji = (emoji) => {
  messageInput.value += emoji
}

// 插入表情到回复输入框
const insertReplyEmoji = (emoji) => {
  replyInput.value += emoji
}

// 处理登录注册
const handleToLogin = () => {
  store.switchAuth('login', true)
}

const handleToRegister = () => {
  store.switchAuth('register', true)
}

// 点击外部关闭表情选择面板
const handleClickOutside = (event) => {
  const emojiPickers = event.target.closest('.emoji-picker-container')
  const emojiButtons = event.target.closest('.emoji-button')
  if (!emojiPickers && !emojiButtons) {
    showMessageEmojiPicker.value = false
    showReplyEmojiPicker.value = false
  }
}

// 打开回复弹窗
const openReplyModal = (message) => {
  selectedMessage.value = message
  // 清空回复输入框
  replyInput.value = ''
  // 隐藏表情选择面板
  showReplyEmojiPicker.value = false
  // 获取回复对象的昵称
  const nickname = message.result?.author?.nickname || message.author?.nickname || message.nickname || '用户'
  // 添加@提及
  replyInput.value = `@${nickname} `
}

// 关闭回复弹窗
const closeReplyModal = () => {
  if (window.bootstrap) {
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('replyModal'))
    if (modal) {
      modal.hide()
    }
  }
  // 清空回复输入框
  replyInput.value = ''
  // 隐藏表情选择面板
  showReplyEmojiPicker.value = false
}

// 监听页面信息变化，获取评论和作者信息
watch(
  () => pageInfo.value.id,
  (newId) => {
    if (newId) {
      getComments(newId, currentPage.value, pageSize.value)
      // 获取作者信息
      const authorId = pageInfo.value.uid
      if (authorId) {
        getAuthorInfo(authorId)
      }
    }
  },
  { immediate: false }
)

// 页面挂载时添加点击外部事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 确保Bootstrap模态框正常工作
  if (window.bootstrap) {
    // 这里可以添加模态框相关的初始化代码
  }
})

// 页面卸载时移除点击外部事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 加载状态：居中、占满视口高度 */
.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* 面包屑导航自定义样式 */
.breadcrumb-custom {
  font-size: 0.85rem;
}

.breadcrumb-custom .breadcrumb-item a {
  color: #333;
  text-decoration: none;
}

.breadcrumb-custom .breadcrumb-item.active {
  color: #666;
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  .breadcrumb-custom .breadcrumb-item a {
    color: #fff;
  }
  
  .breadcrumb-custom .breadcrumb-item.active {
    color: #ccc;
  }
}

/* 错误状态 */
.page-error {
  min-height: 60vh;
}

/* 文章标题：响应式字号、优化行高、居中 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
  color: var(--bs-body-color);
}

/* 文章元信息：弱化样式、统一图标 */
.article-meta {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
  flex-wrap: wrap;
}
.article-meta .meta-item {
  white-space: nowrap;
}
.article-meta .bi {
  font-size: 1em;
  color: var(--bs-tertiary-color);
}

/* 文章内容区：核心阅读样式优化 */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
  color: var(--bs-body-color);
}

/* 适配Markdown渲染的内部样式（核心：保证阅读体验） */
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin: 1.8rem 0 0.8rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--bs-body-color);
}
.article-content :deep(h2) {
  font-size: 1.5rem;
}
.article-content :deep(h3) {
  font-size: 1.25rem;
}
.article-content :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 1.5rem auto;
  display: block;
  box-shadow: var(--bs-shadow-sm);
}
.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1.2rem;
  padding-left: 1.8rem;
  color: var(--bs-body-color);
}
.article-content :deep(li) {
  margin-bottom: 0.5rem;
  color: var(--bs-body-color);
}
.article-content :deep(a) {
  color: var(--bs-link-color);
  text-decoration: none;
}
.article-content :deep(a:hover) {
  color: var(--bs-link-hover-color);
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}
.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.2rem;
  color: var(--bs-body-color);
}
.article-content :deep(td),
.article-content :deep(th) {
  border: 1px solid var(--bs-border-color);
  padding: 0.7rem;
  text-align: left;
}
.article-content :deep(th) {
  background-color: var(--bs-tertiary-bg);
  font-weight: 600;
  color: var(--bs-body-color);
}

/* 评论区容器：基础间距 */
.article-comment {
  width: 100%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .article-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .article-content {
    font-size: 1rem;
  }
  .article-meta {
    font-size: 0.65rem; /* 字号缩小，核心 */
    gap: 0.6rem !important; /* 元信息项之间的间距缩小，!important覆盖bootstrap的gap-4 */
  }
  .article-meta .meta-item .bi {
    font-size: 0.8em; /* 图标字号轻微缩小，更协调 */
    margin-right: 0.3rem !important; /* 图标与文字间距缩小 */
  }
}

/* 归档页面统计信息样式 */
/* 统计信息网格布局 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 统计卡片样式 */
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: var(--bs-card-bg);
  border: 1px solid var(--bs-border-color);
  box-shadow: var(--bs-shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--bs-shadow);
  border-color: var(--bs-border-color-translucent);
}

/* 统计图标样式 */
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

/* 不同统计项的图标颜色 */
.article-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.category-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.page-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.tag-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.link-icon {
  background: linear-gradient(135deg, #ec4899, #db2777);
}

.comment-icon {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

/* 统计内容样式 */
.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--bs-body-color);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
  margin: 0;
}

/* 刷新按钮区域 */
.refresh-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--bs-border-color);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  background-color: var(--bs-button-bg);
  color: var(--bs-button-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: var(--bs-button-hover-bg);
  border-color: var(--bs-button-hover-border-color);
  color: var(--bs-button-hover-color);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-info {
  font-size: 0.75rem;
  color: var(--bs-tertiary-color);
  margin: 0;
}

/* 加载动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 归档页面响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .refresh-container {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* 归档页面平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 文章归档时间线样式 */
.archive-timeline {
  margin-top: 2rem;
}

.timeline-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bs-body-color);
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--bs-border-color);
}

.timeline-container {
  position: relative;
}

.timeline-year-month {
  margin-bottom: 2.5rem;
}

.timeline-year-month-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--bs-primary);
  margin-bottom: 1.5rem;
  padding-left: 2rem;
  position: relative;
}

.timeline-year-month-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--bs-primary);
  box-shadow: 0 0 0 4px rgba(var(--bs-primary-rgb), 0.1);
}

.timeline-items {
  position: relative;
}

.timeline-items::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--bs-border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.timeline-content {
  background-color: var(--bs-card-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.75rem;
  padding: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.timeline-content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--bs-primary);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s ease;
}

.timeline-content:hover {
  box-shadow: var(--bs-shadow-lg);
  transform: translateY(-3px);
  border-color: var(--bs-primary);
}

.timeline-content:hover::before {
  transform: scaleY(1);
}

.timeline-article-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--bs-body-color);
  text-decoration: none;
  margin-bottom: 0.75rem;
  display: block;
  transition: color 0.2s ease;
  line-height: 1.4;
}

.timeline-article-title:hover {
  color: var(--bs-primary);
  text-decoration: none;
}

.timeline-article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  margin-top: 0.5rem;
}

.timeline-article-date,
.timeline-article-category,
.timeline-article-views {
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.timeline-content:hover .timeline-article-date,
.timeline-content:hover .timeline-article-category,
.timeline-content:hover .timeline-article-views {
  color: var(--bs-primary);
}

.timeline-article-date i,
.timeline-article-category i,
.timeline-article-views i {
  margin-right: 0.5rem;
  font-size: 0.85rem;
}

/* 文章归档时间线响应式设计 */
@media (max-width: 768px) {
  .timeline-title {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  .timeline-year-month {
    margin-bottom: 2rem;
  }
  
  .timeline-year-month-title {
    font-size: 1.1rem;
    padding-left: 1.5rem;
  }
  
  .timeline-year-month-title::before {
    width: 10px;
    height: 10px;
  }
  
  .timeline-item {
    padding-left: 1.25rem;
    margin-bottom: 1.25rem;
  }
  
  .timeline-content {
    padding: 1rem;
    border-radius: 0.5rem;
  }
  
  .timeline-article-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .timeline-article-meta {
    font-size: 0.8rem;
    gap: 0.75rem;
  }
  
  .timeline-article-date i,
  .timeline-article-category i,
  .timeline-article-views i {
    font-size: 0.75rem;
  }
}

/* 文章归档时间线平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .timeline-title {
    font-size: 1.4rem;
  }
  
  .timeline-year-month-title {
    font-size: 1.2rem;
  }
  
  .timeline-content {
    padding: 1.1rem;
  }
  
  .timeline-article-title {
    font-size: 1.1rem;
  }
}

/* 分页样式 */
.pagination-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

/* 分页响应式设计 */
@media (max-width: 768px) {
  .pagination-container {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

/* 友链页面样式 */
/* 友链头部 */
.links-header {
  margin-bottom: 2rem;
}

.links-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.links-description {
  font-size: 1rem;
  color: #6b7280;
}

/* 友链网格布局 */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* 友链卡片样式 */
.link-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 友链头像 */
.link-avatar-container {
  margin-bottom: 1rem;
}

.link-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  transition: transform 0.3s ease;
}

.link-card:hover .link-avatar {
  transform: scale(1.05);
}

/* 友链名称 */
.link-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

/* 友链描述 */
.link-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.4;
}

/* 友链URL */
.link-url {
  font-size: 0.85rem;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
  word-break: break-all;
}

.link-url:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* 友链页面响应式设计 */
@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .link-card {
    padding: 1.25rem;
  }

  .links-title {
    font-size: 1.5rem;
  }

  .links-description {
    font-size: 0.9rem;
  }

  .link-name {
    font-size: 1rem;
  }

  .link-description {
    font-size: 0.85rem;
  }

  .link-url {
    font-size: 0.8rem;
  }
}

/* 友链页面平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 友链页面样式 */
/* 页面标题样式 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}

/* 友链分组标题 */
.link-cate {
  font-size: 1.2rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--bs-border-color);
  margin-bottom: 1rem !important;
  color: var(--bs-body-color);
}

/* 核心：现代化友链卡片样式 */
.link-card {
  border: 1px solid var(--bs-border-color);
  border-radius: 0.875rem;
  transition: all 0.3s ease;
  background-color: var(--bs-card-bg);
  min-height: 120px; /* 长方形高度 */
}

/* 卡片悬浮效果 */
.link-card:hover {
  box-shadow: var(--bs-shadow-lg);
  border-color: var(--bs-border-color-translucent);
  transform: translateY(-3px);
}

/* 头像样式（现代化卡片中适当放大） */
.link-avatar {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border: 2px solid var(--bs-tertiary-bg);
}

/* 名称样式 */
.link-name {
  font-weight: 600;
  color: var(--bs-body-color);
  transition: color 0.2s ease;
}

.link-name:hover {
  color: var(--bs-primary);
}

/* 描述样式 - 现代化文本截断 */
.link-desc {
  line-height: 1.5;
  font-size: 0.875rem;
  overflow: hidden;
  text-align: left;
  color: var(--bs-secondary-color);
  /* 标准属性 + 多浏览器前缀兼容 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -moz-box;
  -moz-line-clamp: 2;
  -moz-box-orient: vertical;
  display: box;
  box-orient: vertical;
}

/* 通用Markdown样式 */
.article-content h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  font-weight: 600;
  border-bottom: 1px solid var(--bs-border-color);
  padding-bottom: 0.5rem;
  color: var(--bs-body-color);
}

.article-content a {
  color: var(--bs-link-color);
  text-decoration: none;
}

.article-content a:hover {
  color: var(--bs-link-hover-color);
  text-decoration: underline;
}

.article-content p {
  margin-bottom: 1rem;
  color: var(--bs-body-color);
}

/* 加载状态 */
.py-10 {
  padding-top: 10rem;
  padding-bottom: 10rem;
}

/* 响应式适配 - 长方形卡片专属 */
@media (max-width: 992px) {
  .article-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .article-content h2 {
    font-size: 1.25rem;
  }
  .link-cate {
    font-size: 1.1rem;
  }
  .link-avatar {
    width: 50px;
    height: 50px;
  }
  .link-card {
    min-height: 100px;
    padding: 1.5rem !important;
  }
}

@media (max-width: 768px) {
  .link-cate {
    font-size: 1rem;
  }
  .link-avatar {
    width: 45px;
    height: 45px;
  }
  .link-card {
    min-height: 90px;
    padding: 1.2rem !important;
  }
  .link-name {
    font-size: 1rem !important;
  }
  /* 响应式调整文本截断字号 */
  .link-desc {
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .link-avatar {
    width: 40px;
    height: 40px;
  }
  .link-card {
    min-height: 80px;
    padding: 1rem !important;
  }
  .link-cate {
    font-size: 0.95rem;
  }
  .link-desc {
    font-size: 0.85rem;
  }
  /* 手机端单列展示 */
  .link-list-container .row > div {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* 友链小卡片样式 */
.link-card-small {
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: var(--bs-card-bg);
  transition: all 0.3s ease;
}

.link-card-small:hover {
  transform: translateY(-3px);
  box-shadow: var(--bs-shadow-lg);
  border-color: var(--bs-primary);
}

.link-card-small .link-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bs-body-color);
}

.link-card-small .link-desc {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link-card-small .link-url {
  font-size: 0.75rem;
  color: var(--bs-tertiary-color);
}

/* 留言板页面样式 */
/* 留言统计区域 */
.message-stats .card {
  border: 1px solid var(--bs-border-color);
  transition: all 0.3s ease;
}

.message-stats .card:hover {
  box-shadow: var(--bs-shadow-lg);
  border-color: var(--bs-border-color-translucent);
}

.message-stats .fs-3 {
  font-weight: 700;
  color: var(--bs-body-color);
}

.message-stats .text-muted {
  font-size: 0.875rem;
}

/* 留言区域 */
.article-comment {
  margin-top: 2rem;
  margin-bottom: 3rem;
}

/* 留言板响应式设计 */
@media (max-width: 768px) {
  .message-stats .card {
    padding: 1.5rem !important;
  }
  
  .message-stats .fs-3 {
    font-size: 1.5rem !important;
  }
  
  .message-stats .text-muted {
    font-size: 0.8rem;
  }
  
  .article-comment {
    margin-top: 1.5rem;
    margin-bottom: 2rem;
  }
}

@media (max-width: 576px) {
  .message-stats .card {
    padding: 1.25rem !important;
  }
  
  .message-stats .fs-3 {
    font-size: 1.25rem !important;
  }
  
  .message-stats .text-muted {
    font-size: 0.75rem;
  }
}

/* 网格式留言板样式 */
.messages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 20px 0;
  min-height: 500px;
}

.message-item {
  transition: all 0.3s ease;
  transform: rotate(-1deg);
}

.message-item:nth-child(even) {
  transform: rotate(1deg);
}

.message-item:nth-child(3n) {
  transform: rotate(-0.5deg);
}

.message-item:nth-child(4n) {
  transform: rotate(0.5deg);
}

/* 便利贴样式增强 */
.sticky-note {
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: move;
  background-color: #fff9c4;
  border: none;
  min-height: 180px;
  position: relative;
  overflow: hidden;
}

.sticky-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(135deg, #ffeb3b, #fbc02d);
  border-bottom: 1px solid #f57f17;
}

.sticky-note .card-body {
  padding: 25px 20px 20px;
  position: relative;
  z-index: 1;
}

.sticky-note:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px) rotate(0deg) !important;
}

/* 拖拽相关样式 */
.sortable-ghost {
  opacity: 0.5;
  background: #fff9c4;
  transform: rotate(0deg) !important;
}

.sortable-chosen {
  background: #fff9c4;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.sortable-drag {
  opacity: 0.9;
  z-index: 1000;
  transform: rotate(5deg) scale(1.02) !important;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}

/* 响应式网格布局 */
@media (max-width: 768px) {
  .messages-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .sticky-note {
    min-height: 160px;
  }
}

@media (max-width: 576px) {
  .messages-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .sticky-note {
    min-height: 140px;
  }
}

/* 留言板样式 */
/* 留言显示模块 */
.message-display {
  margin-bottom: 2rem;
}

.message-display .card {
  border: 1px solid var(--bs-border-color);
  transition: all 0.3s ease;
}

.message-display .card:hover {
  box-shadow: var(--bs-shadow-lg);
  border-color: var(--bs-border-color-translucent);
}

/* 便利贴样式 */
.sticky-note {
  position: relative;
  border-radius: 0.5rem;
  background-color: #fff9c4;
  border: 1px solid #f5f5f5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sticky-note:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 留言头像 */
.message-avatar {
  border: 2px solid rgba(var(--bs-primary-rgb), 0.1);
}

.message-avatar:hover {
  border-color: rgba(var(--bs-primary-rgb), 0.3);
}

/* 留言内容 */
.message-content {
  line-height: 1.6;
  font-size: 0.95rem;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.5);
}

.message-content:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  .sticky-note {
    background-color: #33332a;
    border: 1px solid #444;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .sticky-note:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .message-content {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .message-content:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .message-avatar {
    border: 2px solid rgba(var(--bs-primary-rgb), 0.2);
  }
  
  .message-avatar:hover {
    border-color: rgba(var(--bs-primary-rgb), 0.4);
  }
  
  .reply-icon:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.2);
  }
  
  #replyModal .modal-content {
    background-color: var(--bs-dark);
    border-color: var(--bs-border-color);
  }
  
  #replyModal .modal-header,
  #replyModal .modal-footer {
    border-color: var(--bs-border-color);
  }
  
  #replyModal .reply-item {
    background-color: rgba(var(--bs-primary-rgb), 0.1);
  }
  
  #replyModal .reply-item:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.15);
  }
  
  .reply-form {
    background-color: rgba(var(--bs-primary-rgb), 0.05);
  }
  
  /* 留言统计适配 */
  .message-stats .card {
    background-color: var(--bs-dark);
    border-color: var(--bs-border-color);
  }
  
  .message-stats .fs-3 {
    color: var(--bs-light);
  }
  
  .message-stats .text-muted {
    color: var(--bs-secondary-color) !important;
  }
}

/* 回复图标 */
.reply-icon-container {
  transition: all 0.3s ease;
}

.reply-icon {
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.reply-icon:hover {
  transform: scale(1.1);
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}

/* 操作按钮 */
.message-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.reply-btn {
  transition: all 0.3s ease;
}

.reply-btn:hover {
  transform: translateY(-1px);
}

/* 回复弹窗样式 */
#replyModal .modal-content {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

#replyModal .modal-header {
  border-bottom: 1px solid var(--bs-border-color);
}

#replyModal .modal-footer {
  border-top: 1px solid var(--bs-border-color);
}

#replyModal .reply-item {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

#replyModal .reply-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}

/* 回复输入框 */
.reply-form {
  border-radius: 8px;
  padding: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.02);
}

/* 回复项 */
.reply-item {
  border-left: 3px solid rgba(var(--bs-primary-rgb), 0.2);
  padding-left: 1rem;
  margin-top: 0.75rem;
}

.reply-item:hover {
  border-left-color: rgba(var(--bs-primary-rgb), 0.4);
}

/* @提及样式 */
:deep(.at-mention) {
  color: var(--bs-primary);
  font-weight: 600;
  text-decoration: none;
}

/* 发布留言按钮 */
.publish-btn {
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--bs-primary-rgb), 0.3);
}

.publish-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 表情功能 */
.emoji-button {
  transition: all 0.3s ease;
  z-index: 10;
}

.emoji-button:hover {
  transform: scale(1.05);
  border-color: var(--bs-primary);
}

.emoji-picker-container {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.emoji-item {
  transition: all 0.3s ease;
  font-size: 1.2rem;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.emoji-item:hover {
  transform: scale(1.05);
  border-color: var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}

/* 表情选择面板滚动条 */
.emoji-picker-container::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker-container::-webkit-scrollbar-track {
  background: rgba(var(--bs-primary-rgb), 0.1);
  border-radius: 3px;
}

.emoji-picker-container::-webkit-scrollbar-thumb {
  background: rgba(var(--bs-primary-rgb), 0.3);
  border-radius: 3px;
}

.emoji-picker-container::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--bs-primary-rgb), 0.5);
}

/* 深色模式表情样式 */
:deep(.bg-dark) .emoji-item {
  border-color: #444;
  color: #fff;
}

:deep(.bg-dark) .emoji-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.2);
}

/* 加载动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 留言板响应式设计 */
@media (max-width: 768px) {
  .message-display .card {
    border-radius: 0.5rem;
  }
  
  .message-item {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .message-item p {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .message-avatar {
    width: 40px !important;
    height: 40px !important;
  }
  
  .reply-item {
    margin-left: 0.75rem;
    padding-left: 0.75rem;
  }
  
  .emoji-picker-container {
    max-height: 150px;
  }
  
  .emoji-item {
    font-size: 1rem;
    min-width: 32px;
    height: 32px;
  }
}
</style>