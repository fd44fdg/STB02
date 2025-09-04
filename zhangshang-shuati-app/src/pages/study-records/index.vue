<template>
  <view class="study-records-container">
	<!-- 页面标题 -->
	<view class="page-header">
		<view class="back-button" @click="goBack">
			<text class="back-icon">‹</text>
		</view>
		<text class="page-title">学习记录</text>
	</view>
	
    <!-- 学习统计卡片 -->
    <view class="stats-card">
      <view class="stats-header">
        <text class="stats-title">学习统计</text>
        <text class="stats-subtitle">累计学习数据</text>
      </view>
      
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{stats.total_questions || 0}}</text>
          <text class="stat-label">总答题数</text>
        </view>
        
        <view class="stat-item">
          <text class="stat-value">{{stats.total_correct || 0}}</text>
          <text class="stat-label">正确题数</text>
        </view>
        
        <view class="stat-item">
          <text class="stat-value">{{formatTime(stats.total_time || 0)}}</text>
          <text class="stat-label">学习时长</text>
        </view>
        
        <view class="stat-item">
          <text class="stat-value">{{stats.study_days || 0}}</text>
          <text class="stat-label">学习天数</text>
        </view>
      </view>
      
      <view class="accuracy-rate">
        <text class="rate-label">正确率</text>
        <view class="rate-bar">
          <view class="rate-progress" :style="{width: accuracyRate + '%'}"></view>
        </view>
        <text class="rate-value">{{accuracyRate.toFixed(1)}}%</text>
      </view>
    </view>
    
    <!-- 日期筛选 -->
    <view class="date-filter">
      <view class="filter-item">
        <text class="filter-label">开始日期:</text>
        <picker mode="date" :value="startDate" @change="onStartDateChange">
          <view class="date-picker">
            <text>{{startDate || '选择日期'}}</text>
            <text class="iconfont icon-calendar"></text>
          </view>
        </picker>
      </view>
      
      <view class="filter-item">
        <text class="filter-label">结束日期:</text>
        <picker mode="date" :value="endDate" @change="onEndDateChange">
          <view class="date-picker">
            <text>{{endDate || '选择日期'}}</text>
            <text class="iconfont icon-calendar"></text>
          </view>
        </picker>
      </view>
      
      <view class="filter-actions">
        <button class="reset-btn" @tap="resetDateFilter">重置</button>
        <button class="apply-btn" @tap="applyDateFilter">应用</button>
      </view>
    </view>
    
    <!-- 学习记录列表 -->
    <view class="records-list" v-if="recordsList.length > 0">
      <view class="list-header">
        <text class="list-title">学习记录</text>
      </view>
      
      <view 
        v-for="record in recordsList" 
        :key="record.id"
        class="record-item"
      >
        <view class="record-header">
          <text class="record-date">{{formatDate(record.study_date)}}</text>
          <text class="record-weekday">{{getWeekday(record.study_date)}}</text>
        </view>
        
        <view class="record-stats">
          <view class="record-stat">
            <text class="stat-icon">📝</text>
            <text class="stat-text">答题 {{record.questions_count}} 道</text>
          </view>
          
          <view class="record-stat">
            <text class="stat-icon">✅</text>
            <text class="stat-text">正确 {{record.correct_count}} 道</text>
          </view>
          
          <view class="record-stat">
            <text class="stat-icon">⏱️</text>
            <text class="stat-text">用时 {{formatTime(record.study_time)}}</text>
          </view>
          
          <view class="record-stat" v-if="record.questions_count > 0">
            <text class="stat-icon">📊</text>
            <text class="stat-text">正确率 {{((record.correct_count / record.questions_count) * 100).toFixed(1)}}%</text>
          </view>
        </view>
        
        <view class="record-categories" v-if="record.categories && record.categories.length > 0">
          <text class="categories-label">学习分类:</text>
          <view class="categories-list">
            <text 
              v-for="category in record.categories" 
              :key="category"
              class="category-tag"
            >
              {{getCategoryName(category)}}
            </text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <image class="empty-image" src="/static/images/empty-records.png" mode="aspectFit"></image>
      <text class="empty-text">暂无学习记录</text>
      <text class="empty-desc">开始刷题后，你的学习数据会显示在这里</text>
      <button class="go-practice-btn" @tap="goPractice">开始刷题</button>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && recordsList.length > 0">
      <text class="load-more-text" @tap="loadMore">{{loadingMore ? '加载中...' : '加载更多'}}</text>
    </view>
  </view>
</template>

<script>
import { getStudyRecords } from '@/api/study';

export default {
  data() {
    return {
      recordsList: [],
      stats: {},
      loading: false,
      loadingMore: false,
      hasMore: true,
      
      // 日期筛选
      startDate: '',
      endDate: '',
      tempStartDate: '',
      tempEndDate: '',
      
      // 分类映射
      categoryMap: {
        math: '数学',
        chinese: '语文',
        english: '英语',
        physics: '物理',
        chemistry: '化学',
        biology: '生物',
        history: '历史',
        geography: '地理',
        politics: '政治'
      }
    };
  },
  
  computed: {
    accuracyRate() {
      const total = this.stats.total_questions || 0;
      const correct = this.stats.total_correct || 0;
      return total > 0 ? (correct / total) * 100 : 0;
    }
  },
  
  onLoad() {
    this.loadStudyRecords();
  },
  
  onPullDownRefresh() {
    this.refreshStudyRecords();
  },
  
  onReachBottom() {
    if (this.hasMore && !this.loadingMore) {
      this.loadMore();
    }
  },
  
  methods: {
	// 返回上一页
	goBack() {
		// 获取当前页面栈
		const pages = getCurrentPages();

		// 如果页面栈只有一个页面，跳转到首页
		if (pages.length <= 1) {
			uni.switchTab({
				url: '/pages/home/home'
			});
		} else {
			// 正常返回上一页
			uni.navigateBack({
				delta: 1
			});
		}
	},
	
    async loadStudyRecords(isRefresh = false) {
      this.loading = true;
      
      try {
        const params = {
          limit: 30
        };
        
        // 添加日期筛选
        if (this.startDate) {
          params.startDate = this.startDate;
        }
        
        if (this.endDate) {
          params.endDate = this.endDate;
        }
        
        const res = await getStudyRecords(params);
        
        if (res.success && res.data) {
          this.recordsList = res.data.records || [];
          this.stats = res.data.stats || {};
          
          // 处理分类数据
          this.recordsList = this.recordsList.map(record => ({
            ...record,
            categories: typeof record.categories === 'string' ? JSON.parse(record.categories) : (record.categories || [])
          }));
          
          this.hasMore = this.recordsList.length >= 30;
        } else {
          // API调用失败或无数据时，使用默认数据
          if (isRefresh || this.recordsList.length === 0) {
            const defaultData = this.getDefaultStudyData();
            this.recordsList = defaultData.records;
            this.stats = defaultData.stats;
            this.hasMore = false;
          }
        }
      } catch (error) {
        console.error('获取学习记录失败，使用默认数据:', error);
        // 网络错误时使用默认数据
        if (isRefresh || this.recordsList.length === 0) {
          const defaultData = this.getDefaultStudyData();
          this.recordsList = defaultData.records;
          this.stats = defaultData.stats;
          this.hasMore = false;
        }
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },
    
    async refreshStudyRecords() {
      await this.loadStudyRecords(true);
    },
    
    async loadMore() {
      // 检查是否需要加载更多学习记录
			if (this.hasMore && !this.loading) {
				this.loadMoreRecords();
			} else {
				// 暂时设置为无更多数据
				this.hasMore = false;
			}
    },
    
    onStartDateChange(e) {
      this.tempStartDate = e.detail.value;
    },
    
    onEndDateChange(e) {
      this.tempEndDate = e.detail.value;
    },
    
    resetDateFilter() {
      this.tempStartDate = '';
      this.tempEndDate = '';
      this.startDate = '';
      this.endDate = '';
      this.loadStudyRecords();
    },
    
    applyDateFilter() {
      // 验证日期范围
      if (this.tempStartDate && this.tempEndDate) {
        if (new Date(this.tempStartDate) > new Date(this.tempEndDate)) {
          uni.showToast({
            title: '开始日期不能晚于结束日期',
            icon: 'none'
          });
          return;
        }
      }
      
      this.startDate = this.tempStartDate;
      this.endDate = this.tempEndDate;
      this.loadStudyRecords();
    },
    
    goPractice() {
      uni.switchTab({
        url: '/pages/practice/practice'
      });
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      return `${month}月${day}日`;
    },
    
    getWeekday(dateStr) {
      if (!dateStr) return '';
      
      const date = new Date(dateStr);
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      
      return weekdays[date.getDay()];
    },
    
    formatTime(seconds) {
      if (!seconds || seconds === 0) return '0分钟';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
      } else {
        return `${minutes}分钟`;
      }
    },
    
    getCategoryName(category) {
      return this.categoryMap[category] || category;
    },
    
    // 加载更多学习记录
    async loadMoreRecords() {
      if (this.loading || !this.hasMore) return;
      
      this.loading = true;
      try {
        // 这里可以调用分页API
        // const nextPage = Math.floor(this.records.length / 10) + 1;
        // const res = await getStudyRecords({ page: nextPage, pageSize: 10 });
        // if (res.code === 200 && res.data.length > 0) {
        //   this.records = [...this.records, ...res.data];
        //   this.hasMore = res.data.length === 10;
        // } else {
        //   this.hasMore = false;
        // }
        
        // 暂时模拟无更多数据
        this.hasMore = false;
        uni.showToast({
          title: '暂无更多数据',
          icon: 'none'
        });
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 获取默认学习数据（空状态）
    getDefaultStudyData() {
      return {
        stats: {
          total_questions: 0,
          total_correct: 0,
          total_time: 0,
          study_days: 0
        },
        records: []
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.study-records-container {
  background-color: var(--bg-color, #f5f7fa);
  min-height: 100vh;
  padding: 30rpx;
}

/* 页面头部样式 */
.page-header {
	display: flex;
	align-items: center;
  padding: 20rpx 30rpx;
  background-color: var(--card-bg, #fff);
	border-radius: 16rpx;
	margin-bottom: 20rpx;
  box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05));
	position: relative;
}

.back-button {
  position: absolute;
  left: 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--border-color, #f5f5f5);
}

.back-icon {
  font-size: 40rpx;
  color: var(--text-primary, #333);
  font-weight: bold;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary, #333);
  flex: 1;
  text-align: center;
}

.stats-card {
  background-color: var(--card-bg, #fff);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: var(--shadow, 0 2rpx 12rpx rgba(0, 0, 0, 0.1));
  
  .stats-header {
    margin-bottom: 30rpx;
    
    .stats-title {
      font-size: 36rpx;
      font-weight: bold;
      color: var(--text-primary, #333);
      display: block;
      margin-bottom: 10rpx;
    }
    
    .stats-subtitle {
      font-size: 28rpx;
      color: var(--text-secondary, #666);
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30rpx;
    margin-bottom: 30rpx;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: 48rpx;
        font-weight: bold;
        color: var(--accent, #1890ff);
        display: block;
        margin-bottom: 10rpx;
      }
      
      .stat-label {
        font-size: 26rpx;
        color: var(--text-secondary, #666);
      }
    }
  }
  
  .accuracy-rate {
    display: flex;
    align-items: center;
    
    .rate-label {
      font-size: 28rpx;
      color: var(--text-primary, #333);
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .rate-bar {
      flex: 1;
      height: 16rpx;
      background-color: var(--border-color, #f0f0f0);
      border-radius: 8rpx;
      margin-right: 20rpx;
      overflow: hidden;
      
      .rate-progress {
        height: 100%;
        background: linear-gradient(90deg, var(--success, #52c41a) 0%, var(--accent, #1890ff) 100%);
        border-radius: 8rpx;
        transition: width 0.3s ease;
      }
    }
    
    .rate-value {
      font-size: 28rpx;
      font-weight: bold;
      color: var(--success, #52c41a);
      flex-shrink: 0;
    }
  }
}

.date-filter {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  
    .filter-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .filter-label {
      font-size: 28rpx;
      color: var(--text-primary, #333);
      width: 150rpx;
      flex-shrink: 0;
    }
    
    .date-picker {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background-color: var(--border-color, #f8f9fa);
      border-radius: 8rpx;
      font-size: 28rpx;
      color: var(--text-primary, #333);
      
      .iconfont {
        font-size: 24rpx;
        color: var(--text-secondary, #999);
      }
    }
  }
  
  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
    
    .reset-btn, .apply-btn {
      padding: 16rpx 32rpx;
      border-radius: 8rpx;
      font-size: 28rpx;
    }
    
    .reset-btn {
      background-color: var(--card-bg-2, #f5f5f5);
      color: var(--text-secondary, #666);
    }
    
    .apply-btn {
      background-color: var(--accent, #1890ff);
      color: #fff;
    }
  }
}

.records-list {
  .list-header {
    margin-bottom: 20rpx;
    
    .list-title {
      font-size: 32rpx;
      font-weight: bold;
      color: var(--text-primary, #333);
    }
  }
  
  .record-item {
    background-color: var(--card-bg, #fff);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: var(--shadow, 0 2rpx 12rpx rgba(0, 0, 0, 0.1));
    
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .record-date {
        font-size: 32rpx;
        font-weight: bold;
        color: var(--text-primary, #333);
      }
      
      .record-weekday {
        font-size: 26rpx;
        color: var(--text-secondary, #666);
        background-color: var(--border-color, #f0f0f0);
        padding: 6rpx 12rpx;
        border-radius: 12rpx;
      }
    }
    
    .record-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20rpx;
      margin-bottom: 20rpx;
      
      .record-stat {
        display: flex;
        align-items: center;
        
        .stat-icon {
          font-size: 28rpx;
          margin-right: 10rpx;
        }
        
        .stat-text {
          font-size: 26rpx;
          color: var(--text-secondary, #666);
        }
      }
    }
    
    .record-categories {
      border-top: 1rpx solid #f0f0f0;
      padding-top: 20rpx;
      
      .categories-label {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .categories-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10rpx;
        
        .category-tag {
          font-size: 24rpx;
          color: var(--accent, #1890ff);
          background-color: var(--card-bg-2, #e6f7ff);
          padding: 6rpx 12rpx;
          border-radius: 12rpx;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 60rpx;
  
  .empty-image {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 40rpx;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: var(--text-primary, #333);
    margin-bottom: 20rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: var(--text-secondary, #999);
    text-align: center;
    line-height: 1.5;
    margin-bottom: 60rpx;
  }
  
  .go-practice-btn {
    width: 300rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: var(--accent, #1890ff);
    color: var(--card-bg, #fff);
    font-size: 30rpx;
    border-radius: 40rpx;
  }
}

.load-more {
  padding: 40rpx;
  text-align: center;
  
    .load-more-text {
    font-size: 28rpx;
    color: var(--text-secondary, #999);
  }
}
</style>