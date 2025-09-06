<template>
  <div class="ads-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>广告管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增广告
          </el-button>
        </div>
      </template>
      
      <!-- 搜索筛选 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.title"
          placeholder="请输入广告标题"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter="handleFilter"
        />
        <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
        <el-button class="filter-item" type="primary" icon="Search" @click="handleFilter">
          搜索
        </el-button>
        <el-button class="filter-item" type="default" @click="resetFilter">
          重置
        </el-button>
      </div>

      <!-- 广告列表 -->
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column align="center" label="ID" width="95">
          <template #default="{row}">
            {{ row.id }}
          </template>
        </el-table-column>
        <el-table-column label="广告图片" width="150" align="center">
          <template #default="{row}">
            <el-image
              v-if="row.image"
              :src="row.image"
              :preview-src-list="[row.image]"
              style="width: 100px; height: 60px"
              fit="cover"
            />
            <span v-else>暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column label="广告标题">
          <template #default="{row}">
            {{ row.title }}
          </template>
        </el-table-column>
        <el-table-column label="广告位置" width="120" align="center">
          <template #default="{row}">
            <el-tag :type="getPositionType(row.position)">{{ getPositionText(row.position) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="点击次数" width="100" align="center">
          <template #default="{row}">
            {{ row.clickCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{row}">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{row}">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="{row, $index}">
            <el-button type="primary" size="small" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row, $index)">
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
    </el-card>

    <!-- 广告编辑对话框 -->
    <el-dialog :title="textMap[dialogStatus]" v-model="dialogFormVisible" width="600px">
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="广告标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入广告标题" />
        </el-form-item>
        <el-form-item label="广告图片" prop="image">
          <el-input v-model="temp.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="temp.link" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="广告位置" prop="position">
          <el-select v-model="temp.position" placeholder="请选择广告位置">
            <el-option label="首页轮播" value="home_banner" />
            <el-option label="侧边栏" value="sidebar" />
            <el-option label="文章详情页" value="article_detail" />
            <el-option label="题目页面" value="question_page" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="temp.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="temp.description"
            type="textarea"
            :rows="3"
            placeholder="请输入广告描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Pagination from '@/components/Pagination/index.vue'

export default {
  name: 'AdsManagement',
  components: {
    Pagination,
    Plus
  },
  setup() {
    const list = ref([])
    const total = ref(0)
    const listLoading = ref(true)
    const dialogFormVisible = ref(false)
    const dialogStatus = ref('')
    const dataFormRef = ref(null)
    
    const listQuery = reactive({
      page: 1,
      limit: 20,
      title: '',
      status: ''
    })

    const temp = reactive({
      id: undefined,
      title: '',
      image: '',
      link: '',
      position: '',
      sort: 0,
      status: 1,
      description: ''
    })

    const textMap = {
      update: '编辑广告',
      create: '创建广告'
    }

    const rules = {
      title: [{ required: true, message: '广告标题不能为空', trigger: 'blur' }],
      image: [{ required: true, message: '广告图片不能为空', trigger: 'blur' }],
      position: [{ required: true, message: '请选择广告位置', trigger: 'change' }]
    }

    const getList = () => {
      listLoading.value = true
      // 模拟数据
      setTimeout(() => {
        list.value = [
          {
            id: 1,
            title: '首页推广广告',
            image: 'https://via.placeholder.com/300x180',
            link: 'https://example.com',
            position: 'home_banner',
            sort: 1,
            status: 1,
            clickCount: 156,
            description: '首页轮播推广广告',
            createdAt: new Date()
          },
          {
            id: 2,
            title: '侧边栏广告',
            image: '/static/default-avatar.svg',
            link: 'https://example.com',
            position: 'sidebar',
            sort: 2,
            status: 0,
            clickCount: 89,
            description: '侧边栏推广广告',
            createdAt: new Date()
          }
        ]
        total.value = 2
        listLoading.value = false
      }, 1000)
    }

    const handleFilter = () => {
      listQuery.page = 1
      getList()
    }

    const resetFilter = () => {
      listQuery.title = ''
      listQuery.status = ''
      handleFilter()
    }

    const resetTemp = () => {
      temp.id = undefined
      temp.title = ''
      temp.image = ''
      temp.link = ''
      temp.position = ''
      temp.sort = 0
      temp.status = 1
      temp.description = ''
    }

    const handleCreate = () => {
      resetTemp()
      dialogStatus.value = 'create'
      dialogFormVisible.value = true
    }

    const handleUpdate = (row) => {
      temp.id = row.id
      temp.title = row.title
      temp.image = row.image
      temp.link = row.link
      temp.position = row.position
      temp.sort = row.sort
      temp.status = row.status
      temp.description = row.description
      dialogStatus.value = 'update'
      dialogFormVisible.value = true
    }

    const createData = () => {
      dataFormRef.value.validate((valid) => {
        if (valid) {
          // 这里应该调用API创建广告
          ElMessage.success('创建成功')
          dialogFormVisible.value = false
          getList()
        }
      })
    }

    const updateData = () => {
      dataFormRef.value.validate((valid) => {
        if (valid) {
          // 这里应该调用API更新广告
          ElMessage.success('更新成功')
          dialogFormVisible.value = false
          getList()
        }
      })
    }

    const handleDelete = (row, index) => {
      ElMessageBox.confirm('此操作将永久删除该广告, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里应该调用API删除广告
        list.value.splice(index, 1)
        ElMessage.success('删除成功')
      })
    }

    const handleStatusChange = (row) => {
      // 这里应该调用API更新状态
      ElMessage.success(`${row.status ? '启用' : '禁用'}成功`)
    }

    const getPositionType = (position) => {
      const typeMap = {
        'home_banner': 'success',
        'sidebar': 'info',
        'article_detail': 'warning',
        'question_page': 'danger'
      }
      return typeMap[position] || 'info'
    }

    const getPositionText = (position) => {
      const textMap = {
        'home_banner': '首页轮播',
        'sidebar': '侧边栏',
        'article_detail': '文章详情页',
        'question_page': '题目页面'
      }
      return textMap[position] || position
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString()
    }

    onMounted(() => {
      getList()
    })

    return {
      list,
      total,
      listLoading,
      listQuery,
      dialogFormVisible,
      dialogStatus,
      dataFormRef,
      temp,
      textMap,
      rules,
      getList,
      handleFilter,
      resetFilter,
      handleCreate,
      handleUpdate,
      createData,
      updateData,
      handleDelete,
      handleStatusChange,
      getPositionType,
      getPositionText,
      formatDate
    }
  }
}
</script>

<style lang="scss" scoped>
.ads-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.dialog-footer {
  text-align: right;
}
</style>