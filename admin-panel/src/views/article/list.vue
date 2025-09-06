
<template>
  <TablePage
    :data="list"
    :loading="listLoading"
    :total="total"
    v-model:page="listQuery.page"
    v-model:limit="listQuery.limit"
    @pagination="getList"
  >
    <template #title>文章列表</template>
    <template #actions>
      <el-button type="primary" :icon="Plus" @click="handleCreate">撰写新文章</el-button>
    </template>

    <template #filters>
      <el-select v-model="listQuery.category_id" placeholder="按分类筛选" clearable class="filter-item" style="width: 200px" @change="handleFilter">
        <el-option v-for="category in categoryOptions" :key="category.id" :label="category.name" :value="category.id" />
      </el-select>
    </template>

    <el-table-column label="ID" prop="id" align="center" width="80" />
    <el-table-column label="文章标题" prop="title" />
    <el-table-column label="分类" prop="category_name" width="150px" align="center" />
    <el-table-column label="作者" prop="author_name" width="150px" align="center" />
    <el-table-column label="状态" width="100px" align="center">
        <template #default="{row}">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
    </el-table-column>
    <el-table-column label="浏览量" prop="views" align="center" width="100" />
    <el-table-column label="发布时间" prop="created_at" align="center" width="180">
        <template #default="{row}">{{ new Date(row.created_at).toLocaleString() }}</template>
    </el-table-column>
    <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
      <template #default="{row}">
        <el-button type="primary" size="small" @click="handleUpdate(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </TablePage>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getArticles, deleteArticle, getArticleCategories } from '@/api/article'
import TablePage from '@/components/TablePage/index.vue'

const router = useRouter()

const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const categoryOptions = ref([])

const listQuery = reactive({
  page: 1,
  limit: 10,
  category_id: undefined
})

const fetchCategories = async () => {
  const response = await getArticleCategories()
  categoryOptions.value = response.data
}

const getList = async () => {
  listLoading.value = true
  try {
    const response = await getArticles(listQuery)
    list.value = response.data.items
    total.value = response.data.total
  } finally {
    listLoading.value = false
  }
}

const handleFilter = () => {
  listQuery.page = 1
  getList()
}

const handleCreate = () => {
  router.push({ name: 'ArticleEdit', params: { id: 'new' } })
}

const handleUpdate = (row) => {
  router.push({ name: 'ArticleEdit', params: { id: row.id } })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除文章 "${row.title}"?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteArticle(row.id)
    ElNotification({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
    getList()
  }).catch(() => {})
}

onMounted(() => {
  fetchCategories()
  getList()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-container { padding-bottom: 10px; }
</style>
