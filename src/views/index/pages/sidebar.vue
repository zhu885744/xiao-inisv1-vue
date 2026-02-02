<!-- 全局侧边栏组件 -->
<template>
    <div class="card mt-2">
        <div class="card-header">
          个人信息
        </div>
        <div class="card-body">
            <div class="text-center mb-3">
                <img src="@/assets/img/avatar.png" alt="头像" class="rounded-circle" width="80" height="80">
                <div class="fw-bold mt-2">HI！请登录</div>
                <hr>
                <div class="mt-4">
                  <button type="button" class="btn btn-success me-2">登录</button>
                  <button type="button" class="btn btn-danger">注册</button>
                </div>
            </div>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header">
          热门文章
        </div>
        <div class="card-body">
            <ol class="list-group list-group-numbered">
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">新系统启用公告</div>
                        无摘要
                    </div>
                    <span class="badge text-bg-primary rounded-pill">14</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">Git基础</div>
                        无摘要
                    </div>
                    <span class="badge text-bg-primary rounded-pill">7</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">2025年终总结</div>
                        无摘要
                    </div>
                    <span class="badge text-bg-primary rounded-pill">3</span>
                </li>
            </ol>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header">
          最新评论
        </div>
        <div class="card-body">
            <div class="card mt-2">
              <div class="card-body">
                狗子：2025年终总结
              </div>
            </div>
            <div class="card mt-2">
              <div class="card-body">
                狗不理：真是一篇好文章啊
              </div>
            </div>
        </div>
    </div>
    <div class="card mt-2">
        <div class="card-header">
          标签云
        </div>
        <div class="card-body">
            <span class="badge text-bg-primary me-2">Primary</span>
            <span class="badge text-bg-secondary me-2">Secondary</span>
            <span class="badge text-bg-success me-2">Success</span>
            <span class="badge text-bg-danger me-2">Danger</span>
            <span class="badge text-bg-secondary me-2">Secondary</span>
            <span class="badge text-bg-warning me-2">Warning</span>
            <span class="badge text-bg-success me-2">Success</span>
            <span class="badge text-bg-danger me-2">Danger</span>
            <span class="badge text-bg-secondary me-2">Secondary</span>
            <span class="badge text-bg-warning me-2">Warning</span>
            <span class="badge text-bg-success me-2">Success</span>
            <span class="badge text-bg-secondary me-2">Secondary</span>
            <span class="badge text-bg-danger me-2">Danger</span>
            <span class="badge text-bg-warning me-2">Warning</span>
            <span class="badge text-bg-info me-2">Info</span>
            <span class="badge text-bg-dark me-2">Dark</span>
        </div>
    </div>
</template>