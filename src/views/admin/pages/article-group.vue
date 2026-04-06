<template>
  <div class="article-group-page mt-2">
    <!-- 页面标题和操作按钮 -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="page-title fw-bold">文章分类</h1>
          <div class="d-flex gap-2">
            <button 
              class="btn btn-primary" 
              @click="showCreateModal"
            >
              <i class="bi bi-plus me-2"></i>
              新增分类
            </button>
            <button 
              class="btn btn-outline-secondary" 
              @click="handleRefresh"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        <p class="page-description text-muted mt-1">管理文章分类，支持多级分类结构</p>
      </div>
    </div>

    <!-- 分类表格 -->
    <div class="card shadow-sm">
      <div class="card-body">
        <!-- 搜索和筛选 -->
        <div class="search-filter mb-4">
          <div class="d-flex gap-2">
            <input 
              type="text" 
              class="form-control" 
              v-model="searchKeyword"
              placeholder="搜索分类名称"  
              @keyup.enter="handleSearch"
            >
            <button 
              class="btn btn-outline-primary" 
              @click="handleSearch"
            >
              <i class="bi bi-search me-1"></i>
              搜索
            </button>
            <button 
              class="btn btn-outline-secondary" 
              @click="resetSearch"
            >
              重置
            </button>
          </div>
        </div>

        <!-- 表格组件 -->
        <i-table 
          ref="tableRef"
          :opts="tableOptions"
          @selection:change="handleSelectionChange"
        >
          <!-- 批量操作 -->
          <template #batch-operations="{ disabled }">
            <button 
              class="btn btn-outline-danger btn-sm" 
              @click="handleBatchDelete"
              :disabled="disabled"
            >
              <i class="bi bi-trash me-1"></i>
              批量删除
            </button>
          </template>

          <!-- 操作列 -->
          <template #end-header>
            <th class="text-center" style="width: 200px;">操作</th>
          </template>

          <template #end="{ scope }">
            <td class="text-center">
              <div class="d-flex justify-content-center gap-2">
                <button 
                  class="btn btn-sm btn-outline-primary" 
                  @click="showEditModal(scope)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button 
                  class="btn btn-sm btn-outline-danger" 
                  @click="handleDelete(scope.id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </template>
        </i-table>
      </div>
    </div>

    <!-- 新增/编辑分类模态框 -->
    <div class="modal fade" :id="modalId" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">{{ isEdit ? '编辑分类' : '新增分类' }}</h5>
            <button type="button" class="btn-close" @click="hideModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="categoryName" class="form-label">分类名称 <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="categoryName"
                  v-model="formData.name"
                  required
                  placeholder="请输入分类名称"
                >
              </div>
              
              <div class="mb-3">
                <label for="categoryPid" class="form-label">父分类</label>
                <select 
                  class="form-select" 
                  id="categoryPid"
                  v-model="formData.pid"
                >
                  <option value="0">顶级分类</option>
                  <option 
                    v-for="category in categoryTree" 
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="categoryKey" class="form-label">分类标识</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="categoryKey"
                  v-model="formData.key"
                  placeholder="请输入分类标识"
                >
              </div>
              
              <div class="mb-3">
                <label for="categoryDescription" class="form-label">分类描述</label>
                <textarea 
                  class="form-control" 
                  id="categoryDescription"
                  v-model="formData.description"
                  rows="3"
                  placeholder="请输入分类描述"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="categoryAvatar" class="form-label">分类图标</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="categoryAvatar"
                  v-model="formData.avatar"
                  placeholder="请输入分类图标URL"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideModal">关闭</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleSubmit"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ submitting ? '提交中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import iTable from '@/comps/custom/i-table.vue'
import request from '@/utils/request'
import toast from '@/utils/toast'
import { usePageTitle } from '@/utils/usePageTitle'

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('文章分类')

// 响应式数据
const tableRef = ref(null)
const modalId = ref('categoryModal')
const isEdit = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const selectedRows = ref([])
const categoryTree = ref([])

// 表单数据
const formData = reactive({
  id: '',
  pid: '0',
  name: '',
  key: '',
  description: '',
  avatar: '',
  json: {},
  text: ''
})

// 表格配置
const tableOptions = computed(() => {
  return {
    url: '/api/article-group/all',
    method: 'get',
    params: {
      where: searchKeyword.value ? { name: searchKeyword.value } : {}
    },
    columns: [
      {
        prop: 'id',
        label: 'ID',
        width: '80px',
        align: 'text-center'
      },
      {
        prop: 'name',
        label: '分类名称',
        width: '200px'
      },
      {
        prop: 'pid',
        label: '父分类ID',
        width: '100px',
        align: 'text-center'
      },
      {
        prop: 'key',
        label: '分类标识',
        width: '150px'
      },
      {
        prop: 'description',
        label: '分类描述'
      },
      {
        prop: 'create_time',
        label: '创建时间',
        width: '180px'
      },
      {
        prop: 'update_time',
        label: '更新时间',
        width: '180px'
      }
    ],
    selection: true
  }
})

// 方法
// 获取分类树形结构
async function getCategoryTree() {
  try {
    const response = await request.get('/api/article-group/tree')
    if (response.code === 200 && response.data) {
      categoryTree.value = response.data
    }
  } catch (error) {
    console.error('获取分类树形结构失败:', error)
    toast.error('获取分类树形结构失败')
  }
}

// 显示新增模态框
function showCreateModal() {
  isEdit.value = false
  formData.id = ''
  formData.pid = '0'
  formData.name = ''
  formData.key = ''
  formData.description = ''
  formData.avatar = ''
  formData.json = {}
  formData.text = ''
  
  // 显示模态框
  const modal = new bootstrap.Modal(document.getElementById(modalId.value))
  modal.show()
}

// 显示编辑模态框
function showEditModal(category) {
  isEdit.value = true
  formData.id = category.id
  formData.pid = category.pid.toString()
  formData.name = category.name
  formData.key = category.key || ''
  formData.description = category.description || ''
  formData.avatar = category.avatar || ''
  formData.json = category.json || {}
  formData.text = category.text || ''
  
  // 显示模态框
  const modal = new bootstrap.Modal(document.getElementById(modalId.value))
  modal.show()
}

// 隐藏模态框
function hideModal() {
  const modal = bootstrap.Modal.getInstance(document.getElementById(modalId.value))
  if (modal) {
    modal.hide()
  }
}

// 提交表单
async function handleSubmit() {
  if (!formData.name) {
    toast.warning('请输入分类名称')
    return
  }
  
  submitting.value = true
  
  try {
    let response
    if (isEdit.value) {
      // 更新分类
      response = await request.put('/api/article-group/update', formData)
    } else {
      // 创建分类
      response = await request.post('/api/article-group/create', formData)
    }
    
    if (response.code === 200) {
      toast.success(isEdit.value ? '分类更新成功' : '分类创建成功')
      hideModal()
      // 刷新表格数据
      await tableRef.value.refresh()
      // 刷新分类树形结构
      await getCategoryTree()
    } else {
      toast.error(response.msg || (isEdit.value ? '分类更新失败' : '分类创建失败'))
    }
  } catch (error) {
    console.error(isEdit.value ? '更新分类失败:' : '创建分类失败:', error)
    toast.error(isEdit.value ? '分类更新失败' : '分类创建失败')
  } finally {
    submitting.value = false
  }
}

// 删除分类
async function handleDelete(id) {
  if (!confirm('确定要删除这个分类吗？')) {
    return
  }
  
  try {
    const response = await request.delete('/api/article-group/remove', {
      ids: [id]
    })
    
    if (response.code === 200) {
      toast.success('分类删除成功')
      // 刷新表格数据
      await tableRef.value.refresh()
    } else {
      toast.error(response.msg || '分类删除失败')
    }
  } catch (error) {
    console.error('删除分类失败:', error)
    toast.error('分类删除失败')
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    toast.warning('请选择要删除的分类')
    return
  }
  
  if (!confirm(`确定要删除选中的 ${selectedRows.value.length} 个分类吗？`)) {
    return
  }
  
  try {
    const ids = selectedRows.value.map(row => row.id)
    const response = await request.delete('/api/article-group/remove', {
      ids
    })
    
    if (response.code === 200) {
      toast.success('批量删除成功')
      // 刷新表格数据
      await tableRef.value.refresh()
    } else {
      toast.error(response.msg || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败:', error)
    toast.error('批量删除失败')
  }
}

// 处理选择变化
function handleSelectionChange(selection) {
  selectedRows.value = selection
}

// 搜索
function handleSearch() {
  tableRef.value.refresh()
}

// 重置搜索
function resetSearch() {
  searchKeyword.value = ''
  tableRef.value.refresh()
}

// 刷新数据
function handleRefresh() {
  tableRef.value.refresh()
  getCategoryTree()
}

// 初始化
onMounted(async () => {
  // 获取分类树形结构
  await getCategoryTree()
})
</script>

<style scoped>
.page-title {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1rem;
  color: var(--bs-text-muted);
}

.search-filter {
  padding: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.05);
  border-radius: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-group-page {
    padding: 0.5rem;
  }
  
  .d-flex {
    flex-direction: column;
  }
  
  .search-filter .d-flex {
    flex-direction: row;
  }
  
  .search-filter input {
    flex: 1;
  }
}
</style>