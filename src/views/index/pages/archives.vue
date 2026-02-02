<template>
    <!-- 文章卡片 -->
    <div class="card shadow-sm border-0 rounded-3 mt-2">
      <!-- 文章头部信息 -->
      <div class="card-header border-0 pb-3">
        <span class="card-title fs-2 mb-3">Vue 入门到实战：从基础到项目开发</span>
        
        <!-- 文章元信息 -->
        <div class="d-flex flex-wrap align-items-center text-muted mb-2">
          <span class="me-4">
            <i class="bi bi-person-fill me-1"></i>
            不语
          </span>
          <span class="me-4">
            <i class="bi bi-folder-fill me-1"></i>
            网络
          </span>
          <span class="me-4">
            <i class="bi bi-calendar-fill me-1"></i>
            2024-05-20
          </span>
          <span class="me-4">
            <i class="bi bi-eye-fill me-1"></i>
            1258 浏览
          </span>
          <span>
            <i class="bi bi-chat-fill me-1"></i>
            36 评论
          </span>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="card-body">
        <div class="article-content text-secondary">
          <p class="lead mb-4">
            Vue 是一套用于构建用户界面的渐进式框架，与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用...
          </p>
          <p class="mb-3">
            本教程将从 Vue 的基础语法开始，逐步讲解组件化开发、路由配置、状态管理等核心知识点，最后通过一个实战项目帮助你巩固所学内容...
          </p>
          <p class="mb-3">
            学习 Vue 前建议具备 HTML、CSS、JavaScript 基础，本教程适合前端初学者和想要提升 Vue 开发能力的开发者...
          </p>
          <!-- 占位内容 -->
          <div class="mb-4">
            <img 
              src="https://picsum.photos/1200/400" 
              class="img-fluid rounded-2 w-100" 
              alt="文章配图"
            >
          </div>
          <p>
            更多详细内容请关注后续章节，我们将带你从零搭建一个完整的 Vue 项目，掌握实际开发中的常用技巧和最佳实践...
          </p>
        </div>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="card shadow-sm border-0 rounded-3 mt-2">
      <div class="card-header bg-white border-0 pb-3">
        <h3 class="h5 fw-bold mt-2">
          <i class="bi bi-chat-dots me-2"></i>
          评论 (36)
        </h3>
      </div>
      <div class="card-body">
        <!-- 评论输入框 -->
        <div class="mb-5">
          <textarea 
            class="form-control rounded-2 border border-secondary-subtle" 
            rows="3" 
            placeholder="请输入你的评论..."
          ></textarea>
          <button class="btn btn-primary mt-3 px-4">发布评论</button>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <!-- 评论项1 -->
          <div class="comment-item pb-4 mb-4 border-bottom">
            <div class="d-flex align-items-start mb-3">
              <img 
                src="https://picsum.photos/60/60" 
                class="avatar rounded-circle me-3" 
                alt="用户头像"
              >
              <div class="flex-grow-1">
                <h6 class="fw-semibold mb-1">张三</h6>
                <small class="text-muted">2024-05-21 10:20</small>
              </div>
            </div>
            <p class="text-secondary mb-2">教程写得非常详细，对新手很友好，感谢作者的分享！</p>
            <button class="btn btn-sm btn-outline-primary">回复</button>
          </div>

          <!-- 评论项2 -->
          <div class="comment-item pb-4 mb-4 border-bottom">
            <div class="d-flex align-items-start mb-3">
              <img 
                src="https://picsum.photos/61/61" 
                class="avatar rounded-circle me-3" 
                alt="用户头像"
              >
              <div class="flex-grow-1">
                <h6 class="fw-semibold mb-1">李四</h6>
                <small class="text-muted">2024-05-21 14:35</small>
              </div>
            </div>
            <p class="text-secondary mb-2">请问作者，Vue3 的组合式 API 和选项式 API 哪个更适合新项目？</p>
            <button class="btn btn-sm btn-outline-primary">回复</button>

            <!-- 评论回复 -->
            <div class="ms-5 mt-3 pt-3 border-top">
              <div class="d-flex align-items-start mb-3">
                <img 
                  src="https://picsum.photos/62/62" 
                  class="avatar rounded-circle me-3" 
                  alt="作者头像"
                >
                <div class="flex-grow-1">
                  <h6 class="fw-semibold mb-1">前端开发狮 <span class="badge bg-primary text-white">作者</span></h6>
                  <small class="text-muted">2024-05-21 15:10</small>
                </div>
              </div>
              <p class="text-secondary mb-2">推荐新项目使用组合式 API，更适合大型项目的代码组织和复用～</p>
              <button class="btn btn-sm btn-outline-primary">回复</button>
            </div>
          </div>

          <!-- 评论项3 -->
          <div class="comment-item">
            <div class="d-flex align-items-start mb-3">
              <img 
                src="https://picsum.photos/63/63" 
                class="avatar rounded-circle me-3" 
                alt="用户头像"
              >
              <div class="flex-grow-1">
                <h6 class="fw-semibold mb-1">王五</h6>
                <small class="text-muted">2024-05-22 09:15</small>
              </div>
            </div>
            <p class="text-secondary mb-2">跟着教程做了一遍，成功搭建了第一个 Vue 项目，太有成就感了！</p>
            <button class="btn btn-sm btn-outline-primary">回复</button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
// 仅UI展示，无业务逻辑
</script>

<style scoped>
/* 自定义简约样式 */
.article-content {
  line-height: 1.8;
  font-size: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  object-fit: cover;
}

.comment-item {
  transition: all 0.2s ease;
}

.comment-item:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

/* 适配移动端 */
@media (max-width: 768px) {
  .card-header h1 {
    font-size: 1.5rem;
  }
  
  .article-meta span {
    display: block;
    margin-bottom: 0.5rem;
  }
}
</style>