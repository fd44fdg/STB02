<template>
  <view class="wrong-questions-container">
    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item">
        <picker 
          :value="categoryIndex" 
          :range="categories" 
          range-key="name"
          @change="onCategoryChange"
        >
          <view class="picker-text">
            {{categories[categoryIndex].name}}
            <text class="iconfont icon-arrow-down"></text>
          </view>
        </picker>
      </view>
      
      <view class="filter-item">
        <picker 
          :value="difficultyIndex" 
          :range="difficulties" 
          range-key="name"
          @change="onDifficultyChange"
        >
          <view class="picker-text">
            {{difficulties[difficultyIndex].name}}
            <text class="iconfont icon-arrow-down"></text>
          </view>
        </picker>
      </view>
      
      <view class="filter-item">
        <picker 
          :value="masteredIndex" 
          :range="masteredOptions" 
          range-key="name"
          @change="onMasteredChange"
        >
          <view class="picker-text">
            {{masteredOptions[masteredIndex].name}}
            <text class="iconfont icon-arrow-down"></text>
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-buttons" v-if="wrongQuestionsList.length > 0">
      <button class="start-practice-btn" @tap="startWrongPractice">
        <text class="iconfont icon-play"></text>
        开始错题练习
      </button>
    </view>
    
    <!-- 错题列表 -->
    <view class="wrong-questions-list" v-if="wrongQuestionsList.length > 0">
      <view 
        v-for="question in wrongQuestionsList" 
        :key="question.id"
        class="question-item"
        @tap="navigateToQuestion(question.id)"
      >
        <view class="question-header">
          <text class="question-id">#{{question.id}}</text>
          <text :class="['difficulty-tag', `difficulty-${question.difficulty}`]">
            {{getDifficultyText(question.difficulty)}}
          </text>
        </view>
        
        <view class="question-content">
          <text class="content-text">{{question.content}}</text>
        </view>
        
        <view class="question-meta">
          <view class="meta-item">
            <text class="meta-label">错误次数:</text>
            <text class="meta-value">{{question.wrong_count}}</text>
          </view>
          
          <view class="meta-item">
            <text class="meta-label">最近错误:</text>
            <text class="meta-value">{{formatTime(question.last_wrong_time)}}</text>
          </view>
          
          <view class="meta-item">
            <text class="meta-label">状态:</text>
            <text :class="['meta-value', question.is_mastered ? 'mastered' : 'unmastered']">
              {{question.is_mastered ? '已掌握' : '未掌握'}}
            </text>
          </view>
        </view>
        
        <view class="question-actions">
          <view 
            class="action-btn mastered-btn" 
            :class="{'active': question.is_mastered}"
            @tap.stop="toggleMastered(question.id, question.is_mastered)"
          >
            <text class="iconfont" :class="question.is_mastered ? 'icon-check' : 'icon-circle'"></text>
            <text>{{question.is_mastered ? '已掌握' : '标记为已掌握'}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <image class="empty-image" src="/static/images/empty-wrong-questions.png" mode="aspectFit"></image>
      <text class="empty-text">暂无错题记录</text>
      <text class="empty-desc">答错的题目会自动添加到错题本，方便你重点复习</text>
      <button class="go-practice-btn" @tap="goPractice">去刷题</button>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && wrongQuestionsList.length > 0">
      <text class="load-more-text" @tap="loadMore">{{loadingMore ? '加载中...' : '加载更多'}}</text>
    </view>
    
    <!-- 回到顶部按钮 -->
    <BackToTop v-if="wrongQuestionsList.length > 3" />
  </view>
</template>

<script>
import { getWrongQuestions, markWrongQuestionAsMastered, markWrongQuestionAsUnmastered } from '@/api/study';
import BackToTop from '@/components/BackToTop/index.vue';

export default {
  components: {
    BackToTop
  },
  data() {
    return {
      wrongQuestionsList: [],
      loading: false,
      loadingMore: false,
      hasMore: true,
      page: 1,
      limit: 10,
      
      // 筛选条件
      categoryIndex: 0,
      categories: [
        { name: '全部分类', value: '' },
        { name: '数学', value: 'math' },
        { name: '语文', value: 'chinese' },
        { name: '英语', value: 'english' },
        { name: '物理', value: 'physics' },
        { name: '化学', value: 'chemistry' },
        { name: '生物', value: 'biology' },
        { name: '历史', value: 'history' },
        { name: '地理', value: 'geography' },
        { name: '政治', value: 'politics' }
      ],
      
      difficultyIndex: 0,
      difficulties: [
        { name: '全部难度', value: '' },
        { name: '简单', value: 'easy' },
        { name: '中等', value: 'medium' },
        { name: '困难', value: 'hard' }
      ],
      
      masteredIndex: 0,
      masteredOptions: [
        { name: '全部状态', value: '' },
        { name: '未掌握', value: 'false' },
        { name: '已掌握', value: 'true' }
      ]
    };
  },
  
  onLoad() {
    this.loadWrongQuestions();
  },
  
  onPullDownRefresh() {
    this.refreshWrongQuestions();
  },
  
  onReachBottom() {
    if (this.hasMore && !this.loadingMore) {
      this.loadMore();
    }
  },
  
  methods: {
    async loadWrongQuestions(isRefresh = false) {
      if (isRefresh) {
        this.page = 1;
        this.hasMore = true;
      }
      
      this.loading = true;
      
      try {
        const params = {
          page: this.page,
          limit: this.limit
        };
        
        // 添加筛选条件
        if (this.categories[this.categoryIndex].value) {
          params.category = this.categories[this.categoryIndex].value;
        }
        
        if (this.difficulties[this.difficultyIndex].value) {
          params.difficulty = this.difficulties[this.difficultyIndex].value;
        }
        
        if (this.masteredOptions[this.masteredIndex].value !== '') {
          params.mastered = this.masteredOptions[this.masteredIndex].value;
        }
        
        const res = await getWrongQuestions(params);
        
        if (res.success && res.data && res.data.wrongQuestions) {
          const newWrongQuestions = res.data.wrongQuestions || [];
          
          if (isRefresh) {
            this.wrongQuestionsList = newWrongQuestions;
          } else {
            this.wrongQuestionsList = [...this.wrongQuestionsList, ...newWrongQuestions];
          }
          
          // 检查是否还有更多数据
          this.hasMore = newWrongQuestions.length === this.limit;
          
          if (this.hasMore) {
            this.page++;
          }
        } else {
          // API调用失败或无数据时，使用默认数据（仅在首次加载时）
          if (isRefresh || this.page === 1) {
            this.wrongQuestionsList = this.getDefaultWrongQuestions();
            this.hasMore = false;
          }
        }
      } catch (error) {
        console.error('获取错题列表失败，使用默认数据:', error);
        // 网络错误时使用默认数据（仅在首次加载时）
        if (isRefresh || this.page === 1) {
          this.wrongQuestionsList = this.getDefaultWrongQuestions();
          this.hasMore = false;
        }
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },
    
    async refreshWrongQuestions() {
      await this.loadWrongQuestions(true);
    },
    
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return;
      
      this.loadingMore = true;
      
      try {
        const params = {
          page: this.page,
          limit: this.limit
        };
        
        // 添加筛选条件
        if (this.categories[this.categoryIndex].value) {
          params.category = this.categories[this.categoryIndex].value;
        }
        
        if (this.difficulties[this.difficultyIndex].value) {
          params.difficulty = this.difficulties[this.difficultyIndex].value;
        }
        
        if (this.masteredOptions[this.masteredIndex].value !== '') {
          params.mastered = this.masteredOptions[this.masteredIndex].value;
        }
        
        const res = await getWrongQuestions(params);
        
        if (res.success) {
          const newWrongQuestions = res.data.wrongQuestions || [];
          this.wrongQuestionsList = [...this.wrongQuestionsList, ...newWrongQuestions];
          
          // 检查是否还有更多数据
          this.hasMore = newWrongQuestions.length === this.limit;
          
          if (this.hasMore) {
            this.page++;
          }
        }
      } catch (error) {
        console.error('加载更多失败:', error);
      } finally {
        this.loadingMore = false;
      }
    },
    
    async toggleMastered(questionId, isMastered) {
      try {
        uni.showLoading({ title: isMastered ? '标记为未掌握...' : '标记为已掌握...' });
        
        let res;
        if (isMastered) {
          res = await markWrongQuestionAsUnmastered(questionId);
        } else {
          res = await markWrongQuestionAsMastered(questionId);
        }
        
        if (res.success) {
          // 更新列表中的状态
          this.wrongQuestionsList = this.wrongQuestionsList.map(item => {
            if (item.id === questionId) {
              return { ...item, is_mastered: !isMastered };
            }
            return item;
          });
          
          uni.showToast({
            title: isMastered ? '已标记为未掌握' : '已标记为掌握',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: res.message || '操作失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('标记状态失败:', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.refreshWrongQuestions();
    },
    
    onDifficultyChange(e) {
      this.difficultyIndex = e.detail.value;
      this.refreshWrongQuestions();
    },
    
    onMasteredChange(e) {
      this.masteredIndex = e.detail.value;
      this.refreshWrongQuestions();
    },
    
    navigateToQuestion(questionId) {
      uni.navigateTo({
        url: `/pages/question/detail?id=${questionId}`
      });
    },
    
    goPractice() {
      uni.switchTab({
        url: '/pages/practice/practice'
      });
    },
    
    startWrongPractice() {
      if (this.wrongQuestionsList.length === 0) {
        uni.showToast({
          title: '暂无错题',
          icon: 'none'
        });
        return;
      }
      
      // 跳转到练习页面，传递错题ID列表
      const questionIds = this.wrongQuestionsList.map(item => item.id).join(',');
      uni.navigateTo({
        url: `/pages/practice/exercise?mode=wrong&questions=${questionIds}`
      });
    },
    
    getDifficultyText(difficulty) {
      const map = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      };
      return map[difficulty] || '未知';
    },
    
    // 获取默认错题数据
    getDefaultWrongQuestions() {
      return [
        {
          id: 1,
          content: 'JavaScript中var、let、const的区别是什么？',
          difficulty: 'medium',
          wrong_count: 3,
          last_wrong_time: new Date().toISOString(),
          is_mastered: false,
          category: 'JavaScript基础'
        },
        {
          id: 2,
          content: 'CSS中flex布局的主轴和交叉轴如何理解？',
          difficulty: 'medium',
          wrong_count: 2,
          last_wrong_time: new Date(Date.now() - 86400000).toISOString(),
          is_mastered: false,
          category: 'CSS基础'
        },
        {
          id: 3,
          content: 'Vue组件间通信有哪些方式？',
          difficulty: 'hard',
          wrong_count: 1,
          last_wrong_time: new Date(Date.now() - 172800000).toISOString(),
          is_mastered: true,
          category: 'Vue.js'
        }
      ];
    },
    
    formatTime(timeStr) {
      if (!timeStr) return '';
      
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      
      // 小于1小时显示分钟
      if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes}分钟前`;
      }
      
      // 小于1天显示小时
      if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}小时前`;
      }
      
      // 小于7天显示天数
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}天前`;
      }
      
      // 超过7天显示具体日期
      return date.toLocaleDateString();
    }
  }
};
</script>

<style lang="scss" scoped>
.wrong-questions-container {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.filter-bar {
  background-color: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  
  .filter-item {
    flex: 1;
    margin: 0 10rpx;
    
    .picker-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background-color: #f8f9fa;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: #333;
      
      .iconfont {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.action-buttons {
  padding: 20rpx 30rpx;
  
  .start-practice-btn {
    width: 100%;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: white;
    border: none;
    border-radius: 12rpx;
    padding: 24rpx;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      margin-right: 12rpx;
      font-size: 36rpx;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}

.wrong-questions-list {
  padding: 30rpx;
  
  .question-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .question-id {
        font-size: 28rpx;
        color: #666;
        font-weight: bold;
      }
      
      .difficulty-tag {
        font-size: 24rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        
        &.difficulty-easy {
          background-color: #e6f7e6;
          color: #52c41a;
        }
        
        &.difficulty-medium {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        &.difficulty-hard {
          background-color: #fff1f0;
          color: #f5222d;
        }
      }
    }
    
    .question-content {
      margin-bottom: 20rpx;
      
      .content-text {
        font-size: 30rpx;
        line-height: 1.6;
        color: #333;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
      }
    }
    
    .question-meta {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 20rpx;
      
      .meta-item {
        margin-right: 30rpx;
        margin-bottom: 10rpx;
        display: flex;
        align-items: center;
        
        .meta-label {
          font-size: 26rpx;
          color: #666;
          margin-right: 8rpx;
        }
        
        .meta-value {
          font-size: 26rpx;
          color: #333;
          
          &.mastered {
            color: #52c41a;
          }
          
          &.unmastered {
            color: #f5222d;
          }
        }
      }
    }
    
    .question-actions {
      display: flex;
      justify-content: flex-end;
      
      .action-btn {
        display: flex;
        align-items: center;
        padding: 10rpx 20rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
        
        &.mastered-btn {
          background-color: #f6ffed;
          color: #52c41a;
          border: 1rpx solid #b7eb8f;
          
          &.active {
            background-color: #52c41a;
            color: #fff;
            border: 1rpx solid #52c41a;
          }
        }
        
        .iconfont {
          margin-right: 8rpx;
          font-size: 28rpx;
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
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #999;
    text-align: center;
    line-height: 1.5;
    margin-bottom: 60rpx;
  }
  
  .go-practice-btn {
    width: 300rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #1890ff;
    color: #fff;
    font-size: 30rpx;
    border-radius: 40rpx;
  }
}

.load-more {
  padding: 40rpx;
  text-align: center;
  
  .load-more-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>