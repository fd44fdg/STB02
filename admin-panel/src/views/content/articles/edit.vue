<template>
  <div class="app-container">
    <div class="edit-header">
      <h2>编辑文章</h2>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="info" @click="saveDraft" :loading="draftLoading">保存草稿</el-button>
        <el-button type="success" @click="previewArticle">预览</el-button>
        <el-button type="primary" @click="updateArticle" :loading="updateLoading">更新文章</el-button>
      </div>
    </div>

    <el-form
      ref="articleForm"
      :model="articleData"
      :rules="rules"
      label-width="100px"
      class="article-form"
      v-loading="pageLoading"
    >
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <div class="article-meta">
              <el-tag type="info" size="small">ID: {{ articleData.id }}</el-tag>
              <el-tag :type="getStatusType(articleData.status)" size="small">
                {{ getStatusText(articleData.status) }}
              </el-tag>
            </div>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="文章标题" prop="title">
              <el-input
                v-model="articleData.title"
                placeholder="请输入文章标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="文章分类" prop="category_id">
              <el-select v-model="articleData.category_id" placeholder="请选择分类" style="width: 100%">
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
              <el-input v-model="articleData.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布状态" prop="status">
              <el-radio-group v-model="articleData.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="published">已发布</el-radio>
                <el-radio label="scheduled">定时发布</el-radio>
                <el-radio label="offline">已下线</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item v-if="articleData.status === 'scheduled'" label="发布时间">
          <el-date-picker
            v-model="articleData.scheduled_at"
            type="datetime"
            placeholder="选择发布时间"
            style="width: 300px"
          />
        </el-form-item>
        
        <el-form-item label="文章摘要" prop="summary">
          <el-input
            v-model="articleData.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要，建议150字以内"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 文章统计信息 -->
        <el-row :gutter="20" class="article-stats">
          <el-col :span="6">
            <div class="stat-item">
              <span class="stat-label">阅读量:</span>
              <span class="stat-value">{{ articleData.view_count || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <span class="stat-label">点赞数:</span>
              <span class="stat-value">{{ articleData.like_count || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <span class="stat-label">评论数:</span>
              <span class="stat-value">{{ articleData.comment_count || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <span class="stat-label">分享数:</span>
              <span class="stat-value">{{ articleData.share_count || 0 }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="form-card">
        <template #header>
          <span>文章内容</span>
        </template>
        
        <el-form-item label="文章内容" prop="content">
          <div class="editor-container">
            <div ref="editorRef" class="editor"></div>
          </div>
        </el-form-item>
      </el-card>

      <el-card class="form-card">
        <template #header>
          <span>封面设置</span>
        </template>
        
        <el-form-item label="封面图片">
          <div class="cover-upload">
            <el-upload
              class="cover-uploader"
              action="#"
              :show-file-list="false"
              :on-change="handleCoverChange"
              :before-upload="beforeCoverUpload"
              accept="image/*"
            >
              <el-image
                v-if="articleData.cover_image"
                :src="articleData.cover_image"
                class="cover-image"
                fit="cover"
              />
              <div v-else class="cover-placeholder">
                <i class="el-icon-plus"></i>
                <div class="upload-text">上传封面</div>
              </div>
            </el-upload>
            <div class="cover-actions" v-if="articleData.cover_image">
              <el-button size="small" @click="previewCover">预览</el-button>
              <el-button size="small" type="danger" @click="removeCover">删除</el-button>
            </div>
          </div>
          <div class="upload-tips">
            <p>• 建议尺寸：800x450像素</p>
            <p>• 支持格式：JPG、PNG</p>
            <p>• 文件大小：不超过2MB</p>
          </div>
        </el-form-item>
      </el-card>

      <el-card class="form-card">
        <template #header>
          <span>标签和SEO</span>
        </template>
        
        <el-form-item label="文章标签">
          <div class="tags-input">
            <el-tag
              v-for="tag in articleData.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="saveTagInput"
              v-model="inputValue"
              size="small"
              class="tag-input"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button v-else size="small" @click="showInput" class="new-tag-btn">
              + 新标签
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="SEO关键词">
          <el-input
            v-model="articleData.seo_keywords"
            placeholder="请输入SEO关键词，多个关键词用逗号分隔"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="SEO描述">
          <el-input
            v-model="articleData.seo_description"
            type="textarea"
            :rows="3"
            placeholder="请输入SEO描述，建议120-160字符"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <el-card class="form-card">
        <template #header>
          <span>高级设置</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序权重">
              <el-input-number
                v-model="articleData.sort_order"
                :min="0"
                :max="9999"
                placeholder="数值越大越靠前"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="允许评论">
              <el-switch v-model="articleData.allow_comment" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="推荐文章">
              <el-switch v-model="articleData.is_featured" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="文章来源">
          <el-input v-model="articleData.source" placeholder="文章来源（可选）" />
        </el-form-item>
        
        <el-form-item label="原文链接">
          <el-input v-model="articleData.source_url" placeholder="原文链接（可选）" />
        </el-form-item>
      </el-card>

      <el-card class="form-card">
        <template #header>
          <span>版本历史</span>
        </template>
        
        <el-table :data="versionHistory" size="small">
          <el-table-column prop="version" label="版本" width="80" />
          <el-table-column prop="updated_by" label="更新人" width="120" />
          <el-table-column prop="updated_at" label="更新时间" width="150" />
          <el-table-column prop="remark" label="更新说明" />
          <el-table-column label="操作" width="100">
            <template #default="{row}">
              <el-button type="text" size="small" @click="viewVersion(row)">
                查看
              </el-button>
              <el-button type="text" size="small" @click="restoreVersion(row)">
                恢复
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-form>

    <!-- 预览对话框 -->
    <el-dialog title="封面预览" v-model="previewVisible" width="50%">
      <el-image
        :src="articleData.cover_image"
        style="width: 100%"
        fit="contain"
      />
    </el-dialog>

    <!-- 文章预览对话框 -->
    <el-dialog title="文章预览" v-model="articlePreviewVisible" width="80%" class="article-preview-dialog">
      <div class="article-preview">
        <div class="preview-header">
          <h1>{{ articleData.title }}</h1>
          <div class="preview-meta">
            <span>作者：{{ articleData.author }}</span>
            <span>发布时间：{{ articleData.published_at || '未发布' }}</span>
            <span>阅读量：{{ articleData.view_count || 0 }}</span>
          </div>
        </div>
        <div class="preview-cover" v-if="articleData.cover_image">
          <el-image :src="articleData.cover_image" fit="cover" />
        </div>
        <div class="preview-content" v-html="articleData.content"></div>
        <div class="preview-tags" v-if="articleData.tags.length">
          <el-tag v-for="tag in articleData.tags" :key="tag" size="small">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createEditor, createToolbar } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

export default {
  name: 'EditArticle',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const editorRef = ref(null)
    const saveTagInput = ref(null)
    const articleForm = ref(null)
    
    let editor = null
    const pageLoading = ref(true)
    const draftLoading = ref(false)
    const updateLoading = ref(false)
    const inputVisible = ref(false)
    const inputValue = ref('')
    const previewVisible = ref(false)
    const articlePreviewVisible = ref(false)
    
    const articleData = reactive({
      id: null,
      title: '',
      summary: '',
      content: '',
      cover_image: '',
      category_id: undefined,
      author: '',
      status: 'draft',
      scheduled_at: null,
      tags: [],
      seo_keywords: '',
      seo_description: '',
      sort_order: 0,
      allow_comment: true,
      is_featured: false,
      source: '',
      source_url: '',
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      share_count: 0,
      published_at: null,
      created_at: null,
      updated_at: null
    })
    
    const categoryOptions = ref([
      { id: 1, name: '技术分享' },
      { id: 2, name: '行业动态' },
      { id: 3, name: '产品介绍' },
      { id: 4, name: '公司新闻' },
      { id: 5, name: '用户案例' }
    ])
    
    const versionHistory = ref([
      {
        version: 'v1.2',
        updated_by: '张三',
        updated_at: '2024-01-15 14:30:00',
        remark: '更新文章内容和封面图片'
      },
      {
        version: 'v1.1',
        updated_by: '李四',
        updated_at: '2024-01-14 10:20:00',
        remark: '修正错别字和格式'
      },
      {
        version: 'v1.0',
        updated_by: '王五',
        updated_at: '2024-01-13 16:15:00',
        remark: '初始版本'
      }
    ])
    
    const rules = {
      title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
      ],
      category_id: [
        { required: true, message: '请选择文章分类', trigger: 'change' }
      ],
      author: [
        { required: true, message: '请输入作者', trigger: 'blur' }
      ],
      summary: [
        { required: true, message: '请输入文章摘要', trigger: 'blur' },
        { max: 300, message: '摘要不能超过300字符', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
      ]
    }
    
    // 获取文章详情
    const getArticleDetail = async () => {
      try {
        pageLoading.value = true
        const articleId = route.params.id
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟数据
        const mockArticle = {
          id: articleId,
          title: 'Vue 3.0 新特性详解',
          summary: '本文详细介绍了Vue 3.0的新特性和改进，包括Composition API、性能优化、TypeScript支持等方面的内容。',
          content: '<h2>Vue 3.0 简介</h2><p>Vue 3.0 是 Vue.js 的最新主要版本，带来了许多激动人心的新特性和改进...</p><h3>主要特性</h3><ul><li>Composition API</li><li>更好的 TypeScript 支持</li><li>性能优化</li></ul>',
          cover_image: '/static/default-avatar.svg',
          category_id: 1,
          author: '张三',
          status: 'published',
          scheduled_at: null,
          tags: ['Vue', '前端', 'JavaScript'],
          seo_keywords: 'Vue 3.0, 前端开发, JavaScript',
          seo_description: 'Vue 3.0 新特性详解，包括Composition API、性能优化等',
          sort_order: 100,
          allow_comment: true,
          is_featured: true,
          source: '官方文档',
          source_url: 'https://vuejs.org',
          view_count: 1234,
          like_count: 56,
          comment_count: 23,
          share_count: 12,
          published_at: '2024-01-15 10:30:00',
          created_at: '2024-01-15 09:00:00',
          updated_at: '2024-01-15 14:30:00'
        }
        
        Object.assign(articleData, mockArticle)
        
        // 设置编辑器内容
        if (editor) {
          editor.setHtml(articleData.content)
        }
      } catch (error) {
        ElMessage.error('获取文章详情失败：' + error.message)
      } finally {
        pageLoading.value = false
      }
    }
    
    // 初始化编辑器
    const initEditor = () => {
      if (!editorRef.value) return
      
      const editorConfig = {
        placeholder: '请输入文章内容...',
        MENU_CONF: {
          uploadImage: {
            server: '/api/upload/image',
            fieldName: 'file',
            maxFileSize: 5 * 1024 * 1024,
            allowedFileTypes: ['image/*'],
            customUpload: (file, insertFn) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                insertFn(e.target.result, file.name, '')
              }
              reader.readAsDataURL(file)
            }
          },
          uploadVideo: {
            server: '/api/upload/video',
            fieldName: 'file',
            maxFileSize: 50 * 1024 * 1024,
            customUpload: (file, insertFn) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                insertFn(e.target.result)
              }
              reader.readAsDataURL(file)
            }
          }
        },
        onChange: (editor) => {
          articleData.content = editor.getHtml()
        }
      }
      
      const toolbarConfig = {
        toolbarKeys: [
          'headerSelect',
          'blockquote',
          '|',
          'bold',
          'italic',
          'underline',
          'through',
          'code',
          'sup',
          'sub',
          'clearStyle',
          '|',
          'color',
          'bgColor',
          '|',
          'fontSize',
          'fontFamily',
          'lineHeight',
          '|',
          'bulletedList',
          'numberedList',
          'todo',
          '|',
          'emotion',
          'insertLink',
          'uploadImage',
          'uploadVideo',
          'insertTable',
          'codeBlock',
          'divider',
          '|',
          'undo',
          'redo',
          '|',
          'fullScreen'
        ]
      }
      
      editor = createEditor({
        selector: editorRef.value,
        config: editorConfig,
        mode: 'default'
      })
      
      const toolbar = createToolbar({
        editor,
        selector: editorRef.value.previousElementSibling || editorRef.value,
        config: toolbarConfig,
        mode: 'default'
      })
      
      // 设置初始内容
      if (articleData.content) {
        editor.setHtml(articleData.content)
      }
    }
    
    const destroyEditor = () => {
      if (editor) {
        editor.destroy()
        editor = null
      }
    }
    
    const goBack = () => {
      router.go(-1)
    }
    
    const saveDraft = async () => {
      try {
        draftLoading.value = true
        
        if (!articleData.title) {
          ElMessage.error('请输入文章标题')
          return
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        ElMessage.success('草稿保存成功')
      } catch (error) {
        ElMessage.error('保存失败：' + error.message)
      } finally {
        draftLoading.value = false
      }
    }
    
    const updateArticle = async () => {
      try {
        const valid = await articleForm.value.validate()
        if (!valid) return
        
        updateLoading.value = true
        
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        ElMessage.success('文章更新成功')
        router.push('/content/articles')
      } catch (error) {
        ElMessage.error('更新失败：' + error.message)
      } finally {
        updateLoading.value = false
      }
    }
    
    const previewArticle = () => {
      articlePreviewVisible.value = true
    }
    
    const getStatusType = (status) => {
      const statusMap = {
        published: 'success',
        draft: 'warning',
        offline: 'danger',
        scheduled: 'info'
      }
      return statusMap[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        published: '已发布',
        draft: '草稿',
        offline: '已下线',
        scheduled: '定时发布'
      }
      return statusMap[status] || '未知'
    }
    
    const handleCoverChange = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        articleData.cover_image = e.target.result
      }
      reader.readAsDataURL(file.raw)
    }
    
    const beforeCoverUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
      }
      return isImage && isLt2M
    }
    
    const previewCover = () => {
      previewVisible.value = true
    }
    
    const removeCover = () => {
      articleData.cover_image = ''
    }
    
    const removeTag = (tag) => {
      const index = articleData.tags.indexOf(tag)
      if (index > -1) {
        articleData.tags.splice(index, 1)
      }
    }
    
    const showInput = () => {
      inputVisible.value = true
      nextTick(() => {
        saveTagInput.value?.focus()
      })
    }
    
    const handleInputConfirm = () => {
      const value = inputValue.value.trim()
      if (value && !articleData.tags.includes(value)) {
        articleData.tags.push(value)
      }
      inputVisible.value = false
      inputValue.value = ''
    }
    
    const viewVersion = (version) => {
      ElMessage.info(`查看版本 ${version.version} 功能开发中...`)
    }
    
    const restoreVersion = (version) => {
      ElMessageBox.confirm(
        `确定要恢复到版本 ${version.version} 吗？当前未保存的修改将丢失。`,
        '确认恢复',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success(`已恢复到版本 ${version.version}`)
      })
    }
    
    onMounted(async () => {
      await getArticleDetail()
      nextTick(() => {
        initEditor()
      })
    })
    
    onBeforeUnmount(() => {
      destroyEditor()
    })
    
    return {
      editorRef,
      saveTagInput,
      articleForm,
      pageLoading,
      draftLoading,
      updateLoading,
      inputVisible,
      inputValue,
      previewVisible,
      articlePreviewVisible,
      articleData,
      categoryOptions,
      versionHistory,
      rules,
      goBack,
      saveDraft,
      updateArticle,
      previewArticle,
      getStatusType,
      getStatusText,
      handleCoverChange,
      beforeCoverUpload,
      previewCover,
      removeCover,
      removeTag,
      showInput,
      handleInputConfirm,
      viewVersion,
      restoreVersion
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  
  h2 {
    margin: 0;
    color: #303133;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.article-form {
  .form-card {
    margin-bottom: 20px;
    
    :deep(.el-card__header) {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .article-meta {
        display: flex;
        gap: 10px;
      }
    }
  }
}

.article-stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  
  .stat-item {
    display: flex;
    align-items: center;
    
    .stat-label {
      color: #909399;
      margin-right: 8px;
    }
    
    .stat-value {
      font-weight: 600;
      color: #409eff;
    }
  }
}

.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  
  .editor {
    min-height: 400px;
    
    :deep(.w-e-text-container) {
      min-height: 400px !important;
    }
  }
}

.cover-upload {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  
  .cover-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s;
      
      &:hover {
        border-color: #409eff;
      }
    }
  }
  
  .cover-image {
    width: 200px;
    height: 120px;
    display: block;
  }
  
  .cover-placeholder {
    width: 200px;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #8c939d;
    
    i {
      font-size: 28px;
      margin-bottom: 8px;
    }
    
    .upload-text {
      font-size: 14px;
    }
  }
  
  .cover-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.upload-tips {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
  
  p {
    margin: 2px 0;
  }
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  
  .tag-item {
    margin: 0;
  }
  
  .tag-input {
    width: 100px;
  }
  
  .new-tag-btn {
    height: 24px;
    line-height: 22px;
    padding: 0 8px;
  }
}

.article-preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.article-preview {
  padding: 30px;
  
  .preview-header {
    text-align: center;
    margin-bottom: 30px;
    
    h1 {
      margin: 0 0 15px 0;
      color: #303133;
      font-size: 28px;
    }
    
    .preview-meta {
      color: #909399;
      font-size: 14px;
      
      span {
        margin: 0 15px;
      }
    }
  }
  
  .preview-cover {
    text-align: center;
    margin-bottom: 30px;
    
    :deep(.el-image) {
      max-width: 100%;
      border-radius: 8px;
    }
  }
  
  .preview-content {
    line-height: 1.8;
    color: #303133;
    
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin: 20px 0 15px 0;
      color: #303133;
    }
    
    :deep(p) {
      margin: 15px 0;
    }
    
    :deep(img) {
      max-width: 100%;
      border-radius: 4px;
    }
  }
  
  .preview-tags {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    
    :deep(.el-tag) {
      margin-right: 10px;
    }
  }
}
</style>