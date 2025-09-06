<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索轮播图标题"
        style="width: 200px;"
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
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
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
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="Plus"
        @click="handleCreate"
      >
        添加轮播图
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template #default="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="轮播图" width="120px" align="center">
        <template #default="{row}">
          <el-image
            style="width: 80px; height: 50px"
            :src="row.image_url"
            :preview-src-list="[row.image_url]"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="150px">
        <template #default="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="链接" min-width="200px">
        <template #default="{row}">
          <span>{{ row.link_url || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="80px" align="center">
        <template #default="{row}">
          <span>{{ row.sort_order }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template #default="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template #default="{row}">
          <span>{{ formatDate(row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template #default="{row, $index}">
          <el-button type="primary" size="small" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status === 1"
            size="small"
            type="warning"
            @click="handleModifyStatus(row, 0)"
          >
            禁用
          </el-button>
          <el-button
            v-else
            size="small"
            type="success"
            @click="handleModifyStatus(row, 1)"
          >
            启用
          </el-button>
          <el-button
            size="small"
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

    <el-dialog :title="textMap[dialogStatus]" v-model="dialogFormVisible" width="600px">
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 500px; margin-left:50px;"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="图片" prop="image_url">
          <el-input v-model="temp.image_url" placeholder="请输入图片URL" />
          <div style="margin-top: 10px;">
            <el-image
              v-if="temp.image_url"
              style="width: 200px; height: 120px"
              :src="temp.image_url"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="链接" prop="link_url">
          <el-input v-model="temp.link_url" placeholder="请输入跳转链接（可选）" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="temp.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="temp.sort_order" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
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
import Pagination from '@/components/Pagination/index.vue'
import waves from '@/directive/waves'

import { fetchAdminBanners, createAdminBanner, updateAdminBanner, deleteAdminBanner } from '@/api/banner'

export default {
  name: 'BannerManagement',
  components: { Pagination },
  directives: { waves },
  setup() {
    const tableKey = ref(0)
    const list = ref([])
    const total = ref(0)
    const listLoading = ref(true)
    const dialogFormVisible = ref(false)
    const dialogStatus = ref('')
    const dataFormRef = ref(null)
    
    const listQuery = reactive({
      page: 1,
      limit: 20,
      keyword: '',
      status: ''
    })
    
    const temp = reactive({
      id: undefined,
      title: '',
      image_url: '',
      link_url: '',
      description: '',
      sort_order: 0,
      status: 1
    })
    
    const textMap = {
      update: '编辑轮播图',
      create: '创建轮播图'
    }
    
    const rules = {
      title: [{ required: true, message: '标题是必填项', trigger: 'blur' }],
      image_url: [{ required: true, message: '图片URL是必填项', trigger: 'blur' }],
      sort_order: [{ required: true, message: '排序是必填项', trigger: 'blur' }]
    }
    
    // 从后端加载列表
    const getList = async () => {
      listLoading.value = true
      try {
        const res = await fetchAdminBanners()
        let data = Array.isArray(res.data) ? res.data : []
        // 映射后端字段到前端展示字段
        data = data.map(item => ({
          id: item.id,
          title: item.title,
          image_url: item.image_url,
          link_url: item.link_url || '',
          description: item.description || '',
          sort_order: item.sort_order || 0,
          status: item.is_visible ? 1 : 0,
          created_at: item.created_at || item.updated_at
        }))

        // 过滤
        if (listQuery.keyword) {
          const kw = listQuery.keyword.toLowerCase()
          data = data.filter(i => (i.title || '').toLowerCase().includes(kw))
        }
        if (listQuery.status !== '') {
          data = data.filter(i => i.status === parseInt(listQuery.status))
        }

        // 本地分页
        total.value = data.length
        const start = (listQuery.page - 1) * listQuery.limit
        const end = start + listQuery.limit
        list.value = data.slice(start, end)
      } catch (e) {
        console.error('加载轮播图失败:', e)
        ElMessage({ type: 'error', message: '加载轮播图失败' })
        list.value = []
        total.value = 0
      } finally {
        listLoading.value = false
      }
    }

    const handleFilter = () => {
      listQuery.page = 1
      getList()
    }

    const resetTemp = () => {
      temp.id = undefined
      temp.title = ''
      temp.image_url = ''
      temp.link_url = ''
      temp.description = ''
      temp.sort_order = 0
      temp.status = 1
    }

    const handleCreate = () => {
      resetTemp()
      dialogStatus.value = 'create'
      dialogFormVisible.value = true
    }

    const createData = () => {
      dataFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const payload = {
              title: temp.title,
              image_url: temp.image_url,
              link_url: temp.link_url || null,
              sort_order: temp.sort_order || 0,
              is_visible: temp.status === 1
            }
            await createAdminBanner(payload)
            dialogFormVisible.value = false
            ElMessage({ message: '创建成功', type: 'success' })
            getList()
          } catch (e) {
            console.error('创建失败', e)
            ElMessage({ message: '创建失败', type: 'error' })
          }
        }
      })
    }

    const handleUpdate = (row) => {
      Object.assign(temp, row)
      dialogStatus.value = 'update'
      dialogFormVisible.value = true
    }

    const updateData = () => {
      dataFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const payload = {
              title: temp.title,
              image_url: temp.image_url,
              link_url: temp.link_url || null,
              sort_order: temp.sort_order || 0,
              is_visible: temp.status === 1
            }
            await updateAdminBanner(temp.id, payload)
            dialogFormVisible.value = false
            ElMessage({ message: '更新成功', type: 'success' })
            getList()
          } catch (e) {
            console.error('更新失败', e)
            ElMessage({ message: '更新失败', type: 'error' })
          }
        }
      })
    }

    const handleDelete = (row, index) => {
      ElMessageBox.confirm('此操作将永久删除该轮播图, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteAdminBanner(row.id)
          ElMessage({ type: 'success', message: '删除成功!' })
          getList()
        } catch (e) {
          console.error('删除失败', e)
          ElMessage({ type: 'error', message: '删除失败' })
        }
      })
    }

    const handleModifyStatus = async (row, status) => {
      try {
        const payload = {
          title: row.title,
          image_url: row.image_url,
          link_url: row.link_url || null,
          sort_order: row.sort_order || 0,
          is_visible: status === 1
        }
        await updateAdminBanner(row.id, payload)
        ElMessage({ message: '状态修改成功', type: 'success' })
        getList()
      } catch (e) {
        console.error('状态修改失败', e)
        ElMessage({ message: '状态修改失败', type: 'error' })
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    onMounted(() => {
      getList()
    })

    return {
      tableKey,
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
      handleCreate,
      createData,
      handleUpdate,
      updateData,
      handleDelete,
      handleModifyStatus,
      formatDate
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
}

.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>