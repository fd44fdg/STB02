<template>
  <div class="dashboard-container">
    <div class="dashboard-text">欢迎使用掌上刷题宝管理后台</div>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <StatsCard 
          icon="User" 
          label="用户总数" 
          :value="stats.userCount" 
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard 
          icon="Document" 
          label="题目总数" 
          :value="stats.questionCount" 
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard 
          icon="Folder" 
          label="分类总数" 
          :value="stats.categoryCount" 
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard 
          icon="EditPen" 
          label="答题总数" 
          :value="stats.answerCount" 
          color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>用户注册趋势</span>
          </template>
          <UserGrowthChart :chart-data="userGrowthData" />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>题目分类分布</span>
          </template>
          <CategoryDistributionChart :chart-data="categoryData" />
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近活动 -->
    <el-row :gutter="20" class="activity-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>最近活动</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.time"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { fetchSystemStats, fetchRecentActivities, fetchUserGrowthData, fetchCategoryDistribution } from '@/api/admin'
import StatsCard from '@/components/StatsCard/index.vue'
import UserGrowthChart from '@/components/Charts/UserGrowthChart.vue'
import CategoryDistributionChart from '@/components/Charts/CategoryDistributionChart.vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Dashboard',
  components: {
    StatsCard,
    UserGrowthChart,
    CategoryDistributionChart
  },
  setup() {
    const stats = reactive({ userCount: 0, questionCount: 0, categoryCount: 0, answerCount: 0 })
    const recentActivities = ref([])
    const userGrowthData = ref({ months: [], data: [] })
    const categoryData = ref([])
    const loading = ref(false)
    
    const loadDashboardData = async () => {
      loading.value = true
      try {
        const [statsRes, activitiesRes, growthRes, categoryRes] = await Promise.all([
          fetchSystemStats(),
          fetchRecentActivities(),
          fetchUserGrowthData(),
          fetchCategoryDistribution()
        ])
        
        if (statsRes.data) Object.assign(stats, statsRes.data)
        if (activitiesRes.data) recentActivities.value = activitiesRes.data
        if (growthRes.data) userGrowthData.value = growthRes.data
        if (categoryRes.data) categoryData.value = categoryRes.data

      } catch (error) {
        console.error('加载仪表板数据失败:', error)
        ElMessage.error('加载仪表板数据失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      loadDashboardData()
    })
    
    return {
      stats,
      recentActivities,
      userGrowthData,
      categoryData,
      loading
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-text {
  font-size: 30px;
  line-height: 46px;
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
}

.stats-row, .charts-row, .activity-row {
  margin-bottom: 30px;
}
</style>