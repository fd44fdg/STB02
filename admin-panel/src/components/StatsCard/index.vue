<template>
  <el-card class="stats-card">
    <div class="stats-content">
      <div class="stats-icon" :style="{ background: color }">
        <el-icon><component :is="icon" /></el-icon>
      </div>
      <div class="stats-info">
        <div class="stats-number">{{ value }}</div>
        <div class="stats-label">{{ label }}</div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { User, Document, Folder, EditPen } from '@element-plus/icons-vue'

export default {
  name: 'StatsCard',
  components: {
    User,
    Document,
    Folder,
    EditPen
  },
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    color: {
      type: String,
      default: '#409EFF'
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-card {
  .stats-content {
    display: flex;
    align-items: center;
    
    .stats-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      
      .el-icon {
        font-size: 24px;
        color: #fff;
      }
    }
    
    .stats-info {
      .stats-number {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
      }
      
      .stats-label {
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
