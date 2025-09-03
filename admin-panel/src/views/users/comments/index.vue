<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索评论内容/用户名"
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
        <el-option label="正常" :value="1" />
        <el-option label="已删除" :value="0" />
        <el-option label="待审核" :value="2" />
      </el-select>
      <el-select
        v-model="listQuery.type"
        placeholder="评论类型"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="题目评论" value="question" />
        <el-option label="文章评论" value="article" />
        <el-option label="系统反馈" value="feedback" />
      </el-select>
      <el-date-picker
        v-model="listQuery.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="filter-item"
        style="width: 240px"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="Search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="Download"
        @click="handleDownload"
      >
        导出
      </el-button>
      <el-button
        class="filter-item"
        type="danger"
        icon="Delete"
        @click="handleBatchDelete"
        :disabled="multipleSelection.length === 0"
      >
        批量删除
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" />
      <el-table-column label="用户信息" min-width="150px">
        <template #default="{row}">
          <div class="user-info">
            <el-avatar :size="30" :src="row.user.avatar" class="user-avatar">
              {{ row.user.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="user-details">
              <div class="username">{{ row.user.username }}</div>
              <div class="user-id">ID: {{ row.user.id }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评论内容" min-width="300px">
        <template #default="{row}">
          <div class="comment-content">
            <p class="content-text">{{ row.content }}</p>
            <div class="comment-meta">
              <el-tag :type="getTypeTagType(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
              <span class="target-info">{{ row.target_title }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="点赞/回复" width="100px" align="center">
        <template #default="{row}">
          <div class="stats">
            <div class="stat-item">
              <i class="el-icon-thumb" style="color: #f56c6c"></i>
              {{ row.likes_count }}
            </div>
            <div class="stat-item">
              <i class="el-icon-chat-dot-round" style="color: #409eff"></i>
              {{ row.replies_count }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template #default="{row}">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" prop="ip_address" width="120px" align="center" />
      <el-table-column label="创建时间" width="150px" align="center">
        <template #default="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="{row, $index}">
          <el-button type="primary" size="mini" @click="handleView(row)">
            查看详情
          </el-button>
          <el-button
            v-if="row.status === 2"
            size="mini"
            type="success"
            @click="handleApprove(row)"
          >
            审核通过
          </el-button>
          <el-button
            v-if="row.status === 1"
            size="mini"
            type="warning"
            @click="handleModifyStatus(row, 0)"
          >
            隐藏
          </el-button>
          <el-button
            v-if="row.status === 0"
            size="mini"
            type="success"
            @click="handleModifyStatus(row, 1)"
          >
            恢复
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

    <!-- 评论详情对话框 -->
    <el-dialog title="评论详情" v-model="dialogDetailVisible" width="800px">
      <div v-if="currentComment" class="comment-detail">
        <div class="detail-section">
          <h4>用户信息</h4>
          <div class="user-info-detail">
            <el-avatar :size="50" :src="currentComment.user.avatar">
              {{ currentComment.user.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="user-details-full">
              <p><strong>用户名：</strong>{{ currentComment.user.username }}</p>
              <p><strong>邮箱：</strong>{{ currentComment.user.email }}</p>
              <p><strong>注册时间：</strong>{{ currentComment.user.created_at }}</p>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>评论信息</h4>
          <p><strong>评论内容：</strong></p>
          <div class="comment-content-full">{{ currentComment.content }}</div>
          <p><strong>评论类型：</strong>{{ getTypeText(currentComment.type) }}</p>
          <p><strong>目标对象：</strong>{{ currentComment.target_title }}</p>
          <p><strong>IP地址：</strong>{{ currentComment.ip_address }}</p>
          <p><strong>用户代理：</strong>{{ currentComment.user_agent }}</p>
          <p><strong>创建时间：</strong>{{ currentComment.created_at }}</p>
        </div>
        
        <div class="detail-section">
          <h4>统计信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-number">{{ currentComment.likes_count }}</div>
                <div class="stat-label">点赞数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-number">{{ currentComment.replies_count }}</div>
                <div class="stat-label">回复数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-number">{{ currentComment.reports_count || 0 }}</div>
                <div class="stat-label">举报数</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div v-if="currentComment.replies && currentComment.replies.length > 0" class="detail-section">
          <h4>回复列表</h4>
          <div class="replies-list">
            <div v-for="reply in currentComment.replies" :key="reply.id" class="reply-item">
              <div class="reply-user">{{ reply.user.username }}</div>
              <div class="reply-content">{{ reply.content }}</div>
              <div class="reply-time">{{ reply.created_at }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogDetailVisible = false">关闭</el-button>
          <el-button type="danger" @click="handleDeleteFromDetail">删除评论</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import waves from '@/directive/waves'

export default {
  name: 'UserComments',
  components: { Pagination },
  directives: { waves },
  setup() {
    const tableKey = ref(0)
    const list = ref([])
    const total = ref(0)
    const listLoading = ref(true)
    const downloadLoading = ref(false)
    const dialogDetailVisible = ref(false)
    const currentComment = ref(null)
    const multipleSelection = ref([])
    
    const listQuery = reactive({
      page: 1,
      limit: 20,
      keyword: undefined,
      status: undefined,
      type: undefined,
      dateRange: null,
      sort: '+id'
    })
    
    // 评论数据（从API获取）
    const mockData = [
      {
        id: 2,
        content: '文章写得很详细，对初学者很友好，建议多写一些这样的教程。',
        type: 'article',
        target_title: 'Vue3组合式API详解',
        status: 1,
        likes_count: 8,
        replies_count: 1,
        reports_count: 0,
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        created_at: '2024-01-14 16:20:00',
        user: {
          id: 102,
          username: '前端新手',
          email: 'newbie@example.com',
          avatar: '',
          created_at: '2024-01-01 09:00:00'
        },
        replies: []
      },
      {
        id: 3,
        content: '系统有个小bug，在移动端答题时偶尔会卡顿，希望能修复一下。',
        type: 'feedback',
        target_title: '系统反馈',
        status: 2,
        likes_count: 2,
        replies_count: 0,
        reports_count: 0,
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        created_at: '2024-01-13 11:45:00',
        user: {
          id: 103,
          username: '移动用户',
          email: 'mobile@example.com',
          avatar: '',
          created_at: '2023-11-15 14:30:00'
        },
        replies: []
      },
      {
        id: 4,
        content: '这个功能很实用，但是界面可以再优化一下，颜色搭配有点不协调。',
        type: 'feedback',
        target_title: '界面优化建议',
        status: 1,
        likes_count: 5,
        replies_count: 2,
        reports_count: 0,
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-12 09:15:00',
        user: {
          id: 104,
          username: 'UI设计师',
          email: 'designer@example.com',
          avatar: '',
          created_at: '2023-10-20 16:00:00'
        },
        replies: [
          {
            id: 21,
            content: '感谢建议，我们会考虑的',
            user: { username: '管理员' },
            created_at: '2024-01-12 10:00:00'
          }
        ]
      },
      {
        id: 5,
        content: '题目难度适中，很适合练习，希望能增加更多类似的题目。',
        type: 'question',
        target_title: 'CSS布局练习题',
        status: 0,
        likes_count: 12,
        replies_count: 4,
        reports_count: 1,
        ip_address: '192.168.1.104',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-11 13:20:00',
        user: {
          id: 105,
          username: 'CSS爱好者',
          email: 'css@example.com',
          avatar: '',
          created_at: '2023-09-10 11:30:00'
        },
        replies: []
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
    
    const sortChange = (data) => {
      const { prop, order } = data
      if (prop === 'id') {
        listQuery.sort = order === 'ascending' ? '+id' : '-id'
      }
      handleFilter()
    }
    
    const handleSelectionChange = (val) => {
      multipleSelection.value = val
    }
    
    const handleView = (row) => {
      currentComment.value = row
      dialogDetailVisible.value = true
    }
    
    const handleApprove = (row) => {
      ElMessageBox.confirm('确认审核通过该评论？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = 1
        ElMessage({
          type: 'success',
          message: '审核通过成功!'
        })
      })
    }
    
    const handleModifyStatus = (row, status) => {
      const statusText = status === 1 ? '恢复' : '隐藏'
      ElMessageBox.confirm(`确认${statusText}该评论？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = status
        ElMessage({
          type: 'success',
          message: `${statusText}成功!`
        })
      })
    }
    
    const handleDelete = (row, index) => {
      ElMessageBox.confirm('此操作将永久删除该评论, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        list.value.splice(index, 1)
        total.value--
        ElMessage({
          type: 'success',
          message: '删除成功!'
        })
      })
    }
    
    const handleDeleteFromDetail = () => {
      ElMessageBox.confirm('此操作将永久删除该评论, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = list.value.findIndex(item => item.id === currentComment.value.id)
        if (index > -1) {
          list.value.splice(index, 1)
          total.value--
        }
        dialogDetailVisible.value = false
        ElMessage({
          type: 'success',
          message: '删除成功!'
        })
      })
    }
    
    const handleBatchDelete = () => {
      const ids = multipleSelection.value.map(item => item.id)
      ElMessageBox.confirm(`此操作将永久删除选中的 ${ids.length} 条评论, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从列表中移除选中的评论
        ids.forEach(id => {
          const index = list.value.findIndex(item => item.id === id)
          if (index > -1) {
            list.value.splice(index, 1)
          }
        })
        total.value -= ids.length
        multipleSelection.value = []
        ElMessage({
          type: 'success',
          message: `成功删除 ${ids.length} 条评论!`
        })
      })
    }
    
    const handleDownload = () => {
      downloadLoading.value = true
      setTimeout(() => {
        downloadLoading.value = false
        ElMessage({
          message: '导出功能开发中...',
          type: 'info'
        })
      }, 1000)
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        0: '已删除',
        1: '正常',
        2: '待审核'
      }
      return statusMap[status] || '未知'
    }
    
    const getStatusTagType = (status) => {
      const typeMap = {
        0: 'danger',
        1: 'success',
        2: 'warning'
      }
      return typeMap[status] || 'info'
    }
    
    const getTypeText = (type) => {
      const typeMap = {
        question: '题目评论',
        article: '文章评论',
        feedback: '系统反馈'
      }
      return typeMap[type] || '未知'
    }
    
    const getTypeTagType = (type) => {
      const typeMap = {
        question: 'primary',
        article: 'success',
        feedback: 'warning'
      }
      return typeMap[type] || 'info'
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
      dialogDetailVisible,
      currentComment,
      multipleSelection,
      listQuery,
      getList,
      handleFilter,
      sortChange,
      handleSelectionChange,
      handleView,
      handleApprove,
      handleModifyStatus,
      handleDelete,
      handleDeleteFromDetail,
      handleBatchDelete,
      handleDownload,
      getStatusText,
      getStatusTagType,
      getTypeText,
      getTypeTagType
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

.user-info {
  display: flex;
  align-items: center;
  
  .user-avatar {
    margin-right: 10px;
  }
  
  .user-details {
    .username {
      font-weight: bold;
      color: #303133;
    }
    
    .user-id {
      font-size: 12px;
      color: #909399;
    }
  }
}

.comment-content {
  .content-text {
    margin: 0 0 8px 0;
    line-height: 1.5;
    color: #303133;
  }
  
  .comment-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .target-info {
      font-size: 12px;
      color: #909399;
    }
  }
}

.stats {
  .stat-item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    font-size: 12px;
    
    i {
      margin-right: 4px;
    }
  }
}

.comment-detail {
  .detail-section {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 10px 0;
      color: #303133;
      border-bottom: 1px solid #ebeef5;
      padding-bottom: 5px;
    }
  }
  
  .user-info-detail {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    
    .user-details-full {
      flex: 1;
      
      p {
        margin: 5px 0;
        color: #606266;
      }
    }
  }
  
  .comment-content-full {
    background: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    margin: 5px 0 10px 0;
    line-height: 1.6;
  }
  
  .stat-card {
    text-align: center;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
    }
    
    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;
    }
  }
  
  .replies-list {
    .reply-item {
      padding: 10px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      margin-bottom: 10px;
      
      .reply-user {
        font-weight: bold;
        color: #409eff;
        margin-bottom: 5px;
      }
      
      .reply-content {
        color: #303133;
        margin-bottom: 5px;
        line-height: 1.5;
      }
      
      .reply-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>