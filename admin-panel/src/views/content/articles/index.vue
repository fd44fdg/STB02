<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="文章标题"
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
        <el-option label="已下线" value="offline" />
      </el-select>
      <el-select
        v-model="listQuery.category_id"
        placeholder="分类"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option
          v-for="item in categoryOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="filter-item"
        style="width: 240px"
        @change="handleDateChange"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加文章
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        导出
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" />
      <el-table-column label="标题" min-width="200px">
        <template #default="{row}">
          <router-link :to="'/content/articles/edit/'+row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="封面" width="120px" align="center">
        <template #default="{row}">
          <el-image
            v-if="row.cover_image"
            style="width: 60px; height: 40px"
            :src="row.cover_image"
            :preview-src-list="[row.cover_image]"
            fit="cover"
          />
          <span v-else class="no-image">无封面</span>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120px" align="center">
        <template #default="{row}">
          <span>{{ row.category_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="110px" align="center">
        <template #default="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template #default="{row}">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="阅读量" width="100px" align="center">
        <template #default="{row}">
          <span>{{ row.view_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="点赞数" width="100px" align="center">
        <template #default="{row}">
          <span>{{ row.like_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="150px" align="center">
        <template #default="{row}">
          <span>{{ row.published_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template #default="{row, $index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status !== 'published'"
            size="mini"
            type="success"
            @click="handleModifyStatus(row, 'published')"
          >
            发布
          </el-button>
          <el-button
            v-if="row.status === 'published'"
            size="mini"
            type="warning"
            @click="handleModifyStatus(row, 'offline')"
          >
            下线
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      @pagination="getList"
    />

    <!-- 文章详情对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogFormVisible" width="80%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 100%"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="temp.title" placeholder="请输入文章标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文章分类" prop="category_id">
              <el-select v-model="temp.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="temp.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="temp.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="已下线" value="offline" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="文章摘要" prop="summary">
          <el-input
            v-model="temp.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要"
          />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="upload-demo"
            action="#"
            :on-change="handleCoverChange"
            :before-upload="beforeCoverUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
            </template>
          </el-upload>
          <div v-if="temp.cover_image" class="cover-preview">
            <el-image
              style="width: 200px; height: 120px"
              :src="temp.cover_image"
              fit="cover"
            />
            <el-button
              type="danger"
              size="mini"
              @click="removeCover"
              style="margin-top: 10px"
            >
              删除封面
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag
            v-for="tag in temp.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 10px"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            size="mini"
            style="width: 100px"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else size="small" @click="showInput">
            + 新标签
          </el-button>
        </el-form-item>
        <el-form-item label="SEO关键词">
          <el-input v-model="temp.seo_keywords" placeholder="请输入SEO关键词，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="SEO描述">
          <el-input
            v-model="temp.seo_description"
            type="textarea"
            :rows="2"
            placeholder="请输入SEO描述"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="temp.sort_order" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import waves from '@/directive/waves'

export default {
  name: 'ArticleList',
  components: { Pagination },
  directives: { waves },
  setup() {
    const tableKey = ref(0)
    const list = ref([])
    const total = ref(0)
    const listLoading = ref(true)
    const downloadLoading = ref(false)
    const dialogFormVisible = ref(false)
    const dialogStatus = ref('')
    const dialogTitle = ref('')
    const inputVisible = ref(false)
    const inputValue = ref('')
    const dateRange = ref([])
    
    const listQuery = reactive({
      page: 1,
      limit: 20,
      title: undefined,
      status: undefined,
      category_id: undefined,
      start_date: undefined,
      end_date: undefined,
      sort: '+id'
    })
    
    const temp = reactive({
      id: undefined,
      title: '',
      summary: '',
      content: '',
      cover_image: '',
      category_id: undefined,
      author: '',
      status: 'draft',
      tags: [],
      seo_keywords: '',
      seo_description: '',
      sort_order: 0
    })
    
    const categoryOptions = ref([
      { id: 1, name: '技术分享' },
      { id: 2, name: '行业动态' },
      { id: 3, name: '产品介绍' },
      { id: 4, name: '公司新闻' },
      { id: 5, name: '用户案例' }
    ])
    
    const rules = {
      title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
      category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
      author: [{ required: true, message: '作者不能为空', trigger: 'blur' }],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }]
    }
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        title: 'Vue 3.0 新特性详解',
        summary: '本文详细介绍了Vue 3.0的新特性和改进',
        cover_image: '/static/default-avatar.svg',
        category_id: 1,
        category_name: '技术分享',
        author: '张三',
        status: 'published',
        view_count: 1234,
        like_count: 56,
        tags: ['Vue', '前端', 'JavaScript'],
        published_at: '2024-01-15 10:30:00',
        created_at: '2024-01-15 09:00:00'
      },
      {
        id: 2,
        title: 'React Hooks 最佳实践',
        summary: '分享React Hooks的使用技巧和最佳实践',
        cover_image: '/static/default-avatar.svg',
        category_id: 1,
        category_name: '技术分享',
        author: '李四',
        status: 'draft',
        view_count: 0,
        like_count: 0,
        tags: ['React', 'Hooks', '前端'],
        published_at: null,
        created_at: '2024-01-14 15:20:00'
      },
      {
        id: 3,
        title: '2024年前端发展趋势',
        summary: '分析2024年前端技术的发展趋势和方向',
        cover_image: null,
        category_id: 2,
        category_name: '行业动态',
        author: '王五',
        status: 'published',
        view_count: 2345,
        like_count: 89,
        tags: ['前端', '趋势', '技术'],
        published_at: '2024-01-13 14:15:00',
        created_at: '2024-01-13 10:00:00'
      }
    ]
    
    const getList = () => {
      listLoading.value = true
      // 模拟API调用
      setTimeout(() => {
        list.value = mockData
        total.value = mockData.length
        listLoading.value = false
      }, 500)
    }
    
    const handleFilter = () => {
      listQuery.page = 1
      getList()
    }
    
    const handleDateChange = (dates) => {
      if (dates) {
        listQuery.start_date = dates[0]
        listQuery.end_date = dates[1]
      } else {
        listQuery.start_date = undefined
        listQuery.end_date = undefined
      }
    }
    
    const sortChange = (data) => {
      const { prop, order } = data
      if (prop === 'id') {
        listQuery.sort = order === 'ascending' ? '+id' : '-id'
      }
      handleFilter()
    }
    
    const resetTemp = () => {
      Object.assign(temp, {
        id: undefined,
        title: '',
        summary: '',
        content: '',
        cover_image: '',
        category_id: undefined,
        author: '',
        status: 'draft',
        tags: [],
        seo_keywords: '',
        seo_description: '',
        sort_order: 0
      })
    }
    
    const handleCreate = () => {
      resetTemp()
      dialogStatus.value = 'create'
      dialogTitle.value = '创建文章'
      dialogFormVisible.value = true
      nextTick(() => {
        // 清除表单验证
      })
    }
    
    const handleUpdate = (row) => {
      Object.assign(temp, row)
      dialogStatus.value = 'update'
      dialogTitle.value = '编辑文章'
      dialogFormVisible.value = true
      nextTick(() => {
        // 清除表单验证
      })
    }
    
    const createData = () => {
      // 表单验证
      const newArticle = {
        ...temp,
        id: Date.now(),
        view_count: 0,
        like_count: 0,
        created_at: new Date().toLocaleString(),
        published_at: temp.status === 'published' ? new Date().toLocaleString() : null
      }
      
      list.value.unshift(newArticle)
      dialogFormVisible.value = false
      ElMessage({
        message: '创建成功',
        type: 'success'
      })
    }
    
    const updateData = () => {
      const index = list.value.findIndex(v => v.id === temp.id)
      if (index !== -1) {
        list.value.splice(index, 1, { ...temp })
        dialogFormVisible.value = false
        ElMessage({
          message: '更新成功',
          type: 'success'
        })
      }
    }
    
    const handleDelete = (row, index) => {
      ElMessageBox.confirm('此操作将永久删除该文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        list.value.splice(index, 1)
        ElMessage({
          type: 'success',
          message: '删除成功!'
        })
      })
    }
    
    const handleModifyStatus = (row, status) => {
      const statusText = {
        published: '发布',
        draft: '草稿',
        offline: '下线'
      }
      
      row.status = status
      if (status === 'published' && !row.published_at) {
        row.published_at = new Date().toLocaleString()
      }
      
      ElMessage({
        message: `${statusText[status]}成功`,
        type: 'success'
      })
    }
    
    const handleDownload = async () => {
      downloadLoading.value = true
      try {
        ElMessage({
          type: 'info',
          message: '正在准备导出数据...',
          duration: 2000
        })
        
        // 模拟导出过程
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 创建CSV内容
        const csvContent = generateCSVContent()
        
        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `articles_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        ElMessage({
          type: 'success',
          message: '导出成功！',
          duration: 2000
        })
      } catch (error) {
        console.error('导出失败:', error)
        ElMessage({
          type: 'error',
          message: '导出失败，请重试',
          duration: 2000
        })
      } finally {
        downloadLoading.value = false
      }
    }
    
    // 生成CSV内容
    const generateCSVContent = () => {
      const headers = ['ID', '标题', '作者', '分类', '状态', '创建时间']
      const rows = list.value.map(item => [
        item.id,
        `"${item.title}"`,
        `"${item.author}"`,
        `"${item.category_name}"`,
        getStatusText(item.status),
        item.created_at
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    const getStatusType = (status) => {
      const statusMap = {
        published: 'success',
        draft: 'warning',
        offline: 'danger'
      }
      return statusMap[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        published: '已发布',
        draft: '草稿',
        offline: '已下线'
      }
      return statusMap[status] || '未知'
    }
    
    const handleCoverChange = (file) => {
      // 模拟图片上传
      const reader = new FileReader()
      reader.onload = (e) => {
        temp.cover_image = e.target.result
      }
      reader.readAsDataURL(file.raw)
    }
    
    const beforeCoverUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
    
    const removeCover = () => {
      temp.cover_image = ''
    }
    
    const removeTag = (tag) => {
      temp.tags.splice(temp.tags.indexOf(tag), 1)
    }
    
    const showInput = () => {
      inputVisible.value = true
      nextTick(() => {
        // 聚焦输入框
      })
    }
    
    const handleInputConfirm = () => {
      const inputValueTrim = inputValue.value.trim()
      if (inputValueTrim && temp.tags.indexOf(inputValueTrim) === -1) {
        temp.tags.push(inputValueTrim)
      }
      inputVisible.value = false
      inputValue.value = ''
    }
    
    onMounted(() => {
      getList()
    })
    
    return {
      tableKey,
      list,
      total,
      listLoading,
      downloadLoading,
      dialogFormVisible,
      dialogStatus,
      dialogTitle,
      inputVisible,
      inputValue,
      dateRange,
      listQuery,
      temp,
      categoryOptions,
      rules,
      getList,
      handleFilter,
      handleDateChange,
      sortChange,
      handleCreate,
      handleUpdate,
      createData,
      updateData,
      handleDelete,
      handleModifyStatus,
      handleDownload,
      getStatusType,
      getStatusText,
      handleCoverChange,
      beforeCoverUpload,
      removeCover,
      removeTag,
      showInput,
      handleInputConfirm,
      generateCSVContent
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  padding-bottom: 10px;
  
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}

.link-type {
  color: #409eff;
  text-decoration: none;
  
  &:hover {
    color: #66b1ff;
  }
}

.no-image {
  color: #c0c4cc;
  font-size: 12px;
}

.cover-preview {
  margin-top: 10px;
}

.dialog-footer {
  text-align: right;
}

.upload-demo {
  margin-bottom: 10px;
}
</style>