<template>
  <view class="favorites-container">
	<!-- 页面标题 -->
	<view class="page-header">
		<view class="header-left">
			<view class="back-button" @tap="goBack">
				<text class="iconfont icon-arrow-left back-icon"></text>
			</view>
		</view>
		<view class="header-title">我的收藏</view>
		<view class="header-right">
			<view class="filter-toggle" @tap="toggleFilterBar">
				<text class="iconfont icon-filter"></text>
			</view>
		</view>
	</view>
	
    <!-- 顶部筛选栏 -->
    <view class="filter-bar" v-show="showFilters">
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
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-buttons" v-if="favoritesList.length > 0">
      <button class="start-practice-btn" @tap="startFavoritePractice">
        <text class="iconfont icon-play"></text>
        开始收藏练习
      </button>
    </view>
    
    <!-- 收藏题目列表 -->
    <view class="favorites-list" v-if="favoritesList.length > 0">
      <view 
        v-for="question in favoritesList" 
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
          <text class="category">{{question.category}}</text>
          <text class="favorited-time">收藏于 {{formatTime(question.favorited_at)}}</text>
        </view>
        
        <view class="question-actions">
          <view class="action-btn" @tap.stop="removeFavorite(question.id)">
            <text class="iconfont icon-delete"></text>
            <text>取消收藏</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <image class="empty-image" src="/static/images/empty-favorites.png" mode="aspectFit"></image>
      <text class="empty-text">暂无收藏题目</text>
      <text class="empty-desc">去做题时点击收藏按钮，题目就会出现在这里</text>
      <button class="go-practice-btn" @tap="goPractice">去刷题</button>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && favoritesList.length > 0">
      <text class="load-more-text" @tap="loadMore">{{loadingMore ? '加载中...' : '加载更多'}}</text>
    </view>
  </view>
</template>

<script>
import { getFavorites, removeFavorite } from '@/api/study';
export default {
  data() {
    return {
      favoritesList: [],
      loading: false,
      loadingMore: false,
      hasMore: true,
      page: 1,
      limit: 10,
      
      // 筛选条件,
      showFilters: false,
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
      ]
    };
  },
  
  onLoad() {
    this.loadFavorites();
  },
  
  onPullDownRefresh() {
    this.refreshFavorites();
  },
  
  onReachBottom() {
    if (this.hasMore && !this.loadingMore) {
      this.loadMore();
    }
  },
  
  methods: {
	toggleFilterBar() {
		this.showFilters = !this.showFilters;
	},
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
	
    async loadFavorites(isRefresh = false) {
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
        
        const res = await getFavorites(params);
        
        if (res.success && res.data && res.data.favorites) {
          const newFavorites = res.data.favorites || [];
          
          if (isRefresh) {
            this.favoritesList = newFavorites;
          } else {
            this.favoritesList = [...this.favoritesList, ...newFavorites];
          }
          
          // 检查是否还有更多数据
          this.hasMore = newFavorites.length === this.limit;
          
          if (this.hasMore) {
            this.page++;
          }
        } else {
          // API调用失败或无数据时，使用默认数据（仅在首次加载时）
          if (isRefresh || this.page === 1) {
            this.favoritesList = this.getDefaultFavorites();
            this.hasMore = false;
          }
        }
      } catch (error) {
        console.error('获取收藏列表失败，使用默认数据:', error);
        // 网络错误时使用默认数据（仅在首次加载时）
        if (isRefresh || this.page === 1) {
          this.favoritesList = this.getDefaultFavorites();
          this.hasMore = false;
        }
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },
    
    async refreshFavorites() {
      await this.loadFavorites(true);
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
        
        const res = await getFavorites(params);
        
        if (res.success) {
          const newFavorites = res.data.favorites || [];
          this.favoritesList = [...this.favoritesList, ...newFavorites];
          
          // 检查是否还有更多数据
          this.hasMore = newFavorites.length === this.limit;
          
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
    
    async removeFavorite(questionId) {
      try {
        uni.showModal({
          title: '确认取消收藏',
          content: '确定要取消收藏这道题目吗？',
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '取消收藏中...' });
              
              const result = await removeFavorite(questionId);
              
              if (result.success) {
                // 从列表中移除
                this.favoritesList = this.favoritesList.filter(item => item.id !== questionId);
                
                uni.showToast({
                  title: '已取消收藏',
                  icon: 'success'
                });
              } else {
                uni.showToast({
                  title: result.message || '取消收藏失败',
                  icon: 'none'
                });
              }
              
              uni.hideLoading();
            }
          }
        });
      } catch (error) {
        console.error('取消收藏失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '取消收藏失败',
          icon: 'none'
        });
      }
    },
    
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.refreshFavorites();
    },
    
    onDifficultyChange(e) {
      this.difficultyIndex = e.detail.value;
      this.refreshFavorites();
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
    
    startFavoritePractice() {
      if (this.favoritesList.length === 0) {
        uni.showToast({
          title: '暂无收藏题目',
          icon: 'none'
        });
        return;
      }
      
      // 跳转到练习页面，传递收藏题目ID列表
      const questionIds = this.favoritesList.map(item => item.id).join(',');
      uni.navigateTo({
        url: `/pages/practice/exercise?mode=favorite&questions=${questionIds}`
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
    
    // 获取默认收藏数据
    getDefaultFavorites() {
      return [
        {
          id: 1,
          content: 'JavaScript闭包的概念和应用场景有哪些？',
          difficulty: 'hard',
          category: 'JavaScript高级',
          favorited_at: new Date().toISOString()
        },
        {
          id: 2,
          content: 'CSS Grid布局与Flexbox布局的区别？',
          difficulty: 'medium',
          category: 'CSS基础',
          favorited_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          content: 'Vue3的Composition API相比Options API有什么优势？',
          difficulty: 'medium',
          category: 'Vue.js',
          favorited_at: new Date(Date.now() - 172800000).toISOString()
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
.favorites-container {
  background-color: var(--bg-color, #f5f7fa);
  min-height: 100vh;
  padding: 30rpx;
}

/* 页面头部样式 */
.page-header {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: var(--card-bg, #fff);
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05));
}

.header-left, .header-right {
	display: flex;
	align-items: center;
}

.header-left { justify-content: flex-start; }
.header-right { justify-content: flex-end; }

.filter-toggle {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: var(--card-bg-2);
	border: 1rpx solid var(--muted-border);
}

.filter-toggle:active {
	opacity: .85;
}

.back-button {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: var(--card-bg-2, #f5f5f5);
	border: 1rpx solid var(--muted-border);
	transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.15s ease;
}

.back-button:active {
	opacity: 0.85;
}
.back-icon {
	font-size: 36rpx;
	color: var(--text-primary, #333);
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: var(--text-primary, #333);
	text-align: center;
}

.filter-bar {
  background-color: var(--card-bg, #fff);
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: var(--shadow, 0 2rpx 8rpx rgba(0, 0, 0, 0.1));
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .filter-item {
    flex: 1;
    margin: 0 10rpx;
    
    .picker-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background-color: var(--card-bg-2, #f8f9fa);
      border-radius: 8rpx;
      font-size: 28rpx;
      color: var(--text-primary, #333);
      
      .iconfont {
        font-size: 24rpx;
        color: var(--text-secondary, #999);
      }
    }
  }
}

.action-buttons {
    padding: 20rpx 30rpx;
    
    .start-practice-btn {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
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


.favorites-list {
  padding: 30rpx;
  
  .question-item {
    background-color: var(--card-bg, #fff);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: var(--shadow, 0 2rpx 12rpx rgba(0, 0, 0, 0.1));
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .question-id {
        font-size: 28rpx;
        color: var(--text-secondary, #666);
        font-weight: bold;
      }
      
      .difficulty-tag {
        font-size: 24rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        
        &.difficulty-easy {
          background-color: var(--success-bg, #e6f7e6);
          color: var(--success, #52c41a);
        }
        
        &.difficulty-medium {
          background-color: var(--warning-bg, #fff7e6);
          color: var(--warning-dark, #fa8c16);
        }
        
        &.difficulty-hard {
          background-color: var(--danger-bg, #fff1f0);
          color: var(--danger, #f5222d);
        }
      }
    }
    
    .question-content {
      margin-bottom: 20rpx;
      
      .content-text {
        font-size: 30rpx;
        line-height: 1.6;
        color: var(--text-primary, #333);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
      }
    }
    
    .question-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .category {
        font-size: 26rpx;
        color: var(--accent, #1890ff);
        background-color: rgba(99, 158, 236, 0.15);
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
      }
      
      .favorited-time {
        font-size: 24rpx;
        color: var(--text-secondary, #999);
      }
    }
    
    .question-actions {
      display: flex;
      justify-content: flex-end;
      
      .action-btn {
        display: flex;
        align-items: center;
        padding: 10rpx 20rpx;
        background-color: var(--danger-bg, #fff2f0);
        color: var(--danger, #f5222d);
        border-radius: 8rpx;
        font-size: 26rpx;
        
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