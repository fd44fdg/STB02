<template>
	<view class="home-container mp-bg mp-semantic">
		<!-- 用户欢迎区域 -->
		<view class="welcome-section">
			<view class="welcome-card">
				<view class="user-info">
					<image class="avatar" :src="(userInfo && userInfo.avatar) || '/static/images/avatar-placeholder.png'" mode="aspectFill" :alt="(userInfo && userInfo.nickname) || '用户头像'"></image>
					<view class="user-text">
						<text class="greeting">{{ greeting }}</text>
						<text class="username">{{ (userInfo && userInfo.nickname) || '未登录用户' }}</text>
					</view>
				</view>
				<view class="streak-info">
					<text class="streak-number">{{ userStats.continuousDays || 0 }}</text>
					<text class="streak-label">连续学习天数</text>
				</view>
			</view>
		</view>

		<!-- 轮播图 -->
		<view class="swiper-section" v-if="banners.length > 0">
			<swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
				<swiper-item v-for="(item, index) in banners" :key="index" @click="handleBannerClick(item)">
					<view class="swiper-item">
						<image :src="item.image_url" class="swiper-image" mode="aspectFill" :alt="item.title" />
						<view class="swiper-title-wrapper">
							<text class="swiper-title">{{ item.title }}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 签到组件 -->
		<check-in></check-in>

		<!-- 今日统计 -->
		<view class="today-stats">
			<view class="stats-header">
				<text class="section-title">今日学习</text>
				<text class="date-text">{{ currentDate }}</text>
			</view>
			<view class="stats-grid">
				<view class="stats-item">
					<text class="stats-number">{{ todayStats.questionsCount }}</text>
					<text class="stats-label">已刷题数</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ todayStats.correctRate }}%</text>
					<text class="stats-label">正确率</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ todayStats.studyTime }}</text>
					<text class="stats-label">学习时长</text>
				</view>
			</view>
		</view>

		<!-- 快速开始 -->
		<view class="quick-start">
			<text class="section-title">快速开始</text>
			<view class="action-buttons">
				<view class="action-btn" @click="startPractice">
					<view class="btn-icon">📚</view>
					<view class="btn-text">
						<text class="btn-title">刷题练习</text>
						<text class="btn-desc">巩固知识点</text>
					</view>
				</view>
				<view class="action-btn" @click="startExam">
					<view class="btn-icon">🎯</view>
					<view class="btn-text">
						<text class="btn-title">模拟考试</text>
						<text class="btn-desc">检验学习成果</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 知识点进度 -->
		<view class="knowledge-progress" v-if="knowledgeProgress.length > 0">
			<view class="section-header">
				<text class="section-title">学习进度</text>
				<text class="view-all" @click="viewAllProgress">查看全部</text>
			</view>
			<view class="progress-list">
				<view v-for="item in knowledgeProgress" :key="item.id" class="progress-item" @click="startKnowledgeStudy(item)">
					<view class="progress-info">
						<text class="progress-title">{{ item.title }}</text>
						<view class="progress-bar">
							<view class="progress-fill" :style="{ width: item.progress + '%' }"></view>
						</view>
						<text class="progress-text">{{ item.progress }}% ({{ item.completedCount }}/{{ item.totalCount }})</text>
					</view>
					<view class="progress-action">
						<text class="continue-text">继续学习</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 最近错题 -->
		<view class="recent-mistakes" v-if="recentMistakes.length > 0">
			<view class="section-header">
				<text class="section-title">最近错题</text>
				<text class="view-all" @click="viewAllMistakes">错题本</text>
			</view>
			<view class="mistakes-list">
				<view v-for="mistake in recentMistakes" :key="mistake.id" class="mistake-item" @click="reviewMistake(mistake)">
					<view class="mistake-content">
						<text class="mistake-title">{{ mistake.title }}</text>
						<text class="mistake-type">{{ mistake.type }}</text>
					</view>
					<view class="mistake-action">
						<text class="review-text">复习</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 推荐学习 -->
		<view class="recommendations">
			<text class="section-title">推荐学习</text>
			<view class="recommendation-list">
				<view v-for="item in recommendations" :key="item.id" class="recommendation-item" @click="startRecommendation(item)">
					<view class="recommendation-icon">{{ item.icon }}</view>
					<view class="recommendation-content">
						<text class="recommendation-title">{{ item.title }}</text>
						<text class="recommendation-desc">{{ item.description }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import CheckIn from '@/components/CheckIn.vue';
	import { getUserStats } from '@/api/user';
	import { getStatsSummary, getKnowledgeProgress, getRecentMistakes } from '@/api/stats';
	import { getVisibleBanners } from '@/api/banner.js';
	import { mockBanners } from '@/mock/banners.js';
	import { mapGetters } from 'vuex';
	
	export default {
		name: "Home",
		components: {
			CheckIn
		},
		data() {
				return {
					banners: [],
				userStats: { continuousDays: 0 },
				todayStats: { questionsCount: 0, correctRate: 0, studyTime: '0分钟' },
				knowledgeProgress: [],
				recentMistakes: [],
				recommendations: [
					{ id: 1, icon: "🔥", title: "热门题目", description: "最受欢迎的练习题目" },
					{ id: 2, icon: "⭐", title: "每日一题", description: "精选每日挑战题目" },
					{ id: 3, icon: "📖", title: "知识点复习", description: "系统化复习重点知识" }
				]
			}
		},
		computed: {
			...mapGetters('user', ['userInfo', 'isLoggedIn']),
			greeting() {
				const hour = new Date().getHours();
				if (hour < 6) return "深夜好";
				if (hour < 9) return "早上好";
				if (hour < 12) return "上午好";
				if (hour < 14) return "中午好";
				if (hour < 17) return "下午好";
				if (hour < 19) return "傍晚好";
				return "晚上好";
			},
			currentDate() {
				const now = new Date();
				const month = now.getMonth() + 1;
				const day = now.getDate();
				return `${month}月${day}日`;
			}
		},
		onLoad() {
				this.loadAllData();
			},
		methods: {
			async loadAllData() {
				this.loadBanners();
				if (!this.isLoggedIn) {
					console.warn('用户未登录，仅加载公共数据');
					return;
				}
				Promise.all([
					this.loadUserStats(),
					this.loadTodayStats(),
					this.loadKnowledgeProgress(),
					this.loadRecentMistakes()
				]);
			},
			async loadBanners() {
				try {
					const response = await getVisibleBanners();
					if (response && response.success && response.data && response.data.length > 0) {
						this.banners = response.data;
					} else {
						if (process.env.VUE_APP_USE_MOCK_BANNERS === 'true') { this.banners = mockBanners; } else { this.banners = []; }

					}
				} catch (error) {
					console.error('加载轮播图失败:', error);
					if (process.env.VUE_APP_USE_MOCK_BANNERS === 'true') { this.banners = mockBanners; } else { this.banners = []; }
				}
				// 确保至少有一个默认轮播图，避免组件消失
				if (!this.banners || this.banners.length === 0) {
					this.banners = [{ id: 0, title: '欢迎使用掌上刷题宝', image_url: '/static/images/avatar-placeholder.svg', link_url: '' }];
				}
			},
			async loadUserStats() { /* ... */ },
			async loadTodayStats() { /* ... */ },
			async loadKnowledgeProgress() { /* ... */ },
			async loadRecentMistakes() { /* ... */ },
			handleBannerClick(banner) {
				if (!banner.link_url) return;
				uni.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent(banner.link_url) });
			},
			startPractice() { uni.switchTab({ url: '/pages/practice/practice' }); },
			startExam() { uni.switchTab({ url: '/pages/exam/exam' }); },
			viewAllProgress() { uni.navigateTo({ url: '/pages/study-records/index' }); },
			startKnowledgeStudy(item) { uni.reLaunch({ url: `/pages/practice/practice?category=${encodeURIComponent(item.title)}` }); },
			viewAllMistakes() { uni.navigateTo({ url: '/pages/wrong-questions/index' }); },
			reviewMistake(mistake) { uni.navigateTo({ url: `/pages/question/detail?id=${mistake.id}&from=mistakes` }); },
			startRecommendation(item) {
				uni.showLoading({ title: '正在进入...' });
				let url = '';
				switch(item.id) {
					case 1: url = '/pages/question/standalone?mode=popular'; break;
					case 2: url = '/pages/question/standalone?mode=daily'; break;
					case 3: url = '/pages/review/review'; break;
					default:
						uni.hideLoading();
						uni.showToast({ title: '功能暂未开放', icon: 'none' });
						return;
				}
				uni.navigateTo({
					url: url,
					complete: () => { uni.hideLoading(); }
				});
			}
		}
	}
</script>

<style scoped>
	.home-container { background-color: var(--bg-color, #f5f5f5); min-height: 100vh; padding-bottom: 20rpx; }
	/* #ifdef MP-WEIXIN */
	.home-container { background:#f5f5f5; }
	.today-stats, .quick-start, .knowledge-progress, .recent-mistakes, .recommendations, .action-btn, .recommendation-item { background:#ffffff; }
	.recommendation-item { border:1rpx solid #e9ecef; }
	.section-title, .btn-title, .progress-title, .recommendation-title { color:#333333; }
	.btn-desc, .progress-text, .recommendation-desc, .date-text { color:#666666; }
	/* #endif */
	.welcome-section { padding: 20rpx; margin-bottom: 20rpx; }
	.welcome-card { background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 16rpx; padding: 30rpx; display: flex; justify-content: space-between; align-items: center; }
	.user-info { display: flex; align-items: center; }
	.avatar { width: 80rpx; height: 80rpx; border-radius: 40rpx; margin-right: 20rpx; border: 3rpx solid rgba(255, 255, 255, 0.3); }
	.user-text { display: flex; flex-direction: column; }
	.greeting { color: rgba(255, 255, 255, 0.9); font-size: 24rpx; margin-bottom: 4rpx; }
	.username { color: white; font-size: 32rpx; font-weight: bold; }
	.streak-info { text-align: center; }
	.streak-number { display: block; color: white; font-size: 48rpx; font-weight: bold; }
	.streak-label { color: rgba(255, 255, 255, 0.9); font-size: 24rpx; }

	/* 轮播图 */
	.swiper-section { margin: 0 20rpx 20rpx; }
	.swiper { height: 300rpx; border-radius: 16rpx; overflow: hidden; transform: translateZ(0); }
	.swiper-item { position: relative; width: 100%; height: 100%; }
	.swiper-image { width: 100%; height: 100%; }
	.swiper-title-wrapper { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%); padding: 20rpx; padding-top: 40rpx; }
	.swiper-title { color: white; font-size: 28rpx; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }

	/* 通用区块 */
	.today-stats, .quick-start, .knowledge-progress, .recent-mistakes, .recommendations { margin: 0 20rpx 20rpx; }
	.section-title { font-size: 32rpx; font-weight: bold; color: var(--text-primary, #333); }
	.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
	.view-all { font-size: 24rpx; color: #4A90E2; }

	/* 今日统计 */
	.today-stats { background-color: var(--card-bg, white); border-radius: 16rpx; padding: 30rpx; box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05)); }
	.date-text { font-size: 24rpx; color: #666; }
	.stats-grid { display: flex; justify-content: space-between; }
	.stats-item { text-align: center; flex: 1; }
	.stats-number { display: block; font-size: 36rpx; font-weight: bold; color: #4A90E2; margin-bottom: 8rpx; }
	.stats-label { font-size: 24rpx; color: #666; }

	/* 快速开始 */
	.action-buttons { display: flex; gap: 16rpx; margin-top: 20rpx; }
	.action-btn { flex: 1; background-color: var(--card-bg, white); border-radius: 16rpx; padding: 24rpx; display: flex; align-items: center; box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05)); }
	.btn-icon { font-size: 48rpx; margin-right: 16rpx; }
	.btn-text { display: flex; flex-direction: column; }
	.btn-title { font-size: 28rpx; font-weight: bold; color: var(--text-primary, #333); margin-bottom: 4rpx; }
	.btn-desc { font-size: 22rpx; color: var(--text-secondary, #666); }

	/* 知识点进度 */
	.knowledge-progress { background-color: var(--card-bg, white); border-radius: 16rpx; padding: 30rpx; box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05)); }
	.progress-list { display: flex; flex-direction: column; gap: 20rpx; }
	.progress-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; }
	.progress-info { flex: 1; }
	.progress-title { font-size: 28rpx; color: var(--text-primary, #333); font-weight: bold; margin-bottom: 8rpx; display: block; }
	.progress-bar { width: 100%; height: 8rpx; background-color: var(--muted-border, #f0f0f0); border-radius: 4rpx; margin-bottom: 8rpx; overflow: hidden; }
	.progress-fill { height: 100%; background: linear-gradient(90deg, #4A90E2 0%, #357ABD 100%); border-radius: 4rpx; transition: width 0.3s ease; }
	.progress-text { font-size: 22rpx; color: var(--text-secondary, #666); }
	.progress-action { margin-left: 20rpx; }
	.continue-text { font-size: 24rpx; color: #4A90E2; }

	/* 最近错题 */
	.recent-mistakes { background-color: var(--card-bg, white); border-radius: 16rpx; padding: 30rpx; box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05)); }
	.mistakes-list { display: flex; flex-direction: column; gap: 16rpx; }
	.mistake-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx; background-color: var(--danger-bg, #fff7f7); border-radius: 12rpx; border-left: 4rpx solid #ff6b6b; }
	.mistake-content { flex: 1; }
	.mistake-title { font-size: 26rpx; color: #333; font-weight: bold; margin-bottom: 4rpx; display: block; }
	.mistake-type { font-size: 22rpx; color: #666; }
	.mistake-action { margin-left: 20rpx; }
	.review-text { font-size: 24rpx; color: var(--danger, #ff6b6b); }

	/* 推荐学习 */
	.recommendations { background-color: var(--card-bg, white); border-radius: 16rpx; padding: 30rpx; box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.05)); }
	.recommendation-list { display: flex; flex-direction: column; gap: 16rpx; }
	.recommendation-item { display: flex; align-items: center; padding: 20rpx; background-color: var(--card-bg-2, #f8f9fa); border: 1rpx solid var(--muted-border, #e9ecef); border-radius: 12rpx; }
	.recommendation-icon { font-size: 32rpx; margin-right: 16rpx; }
	.recommendation-content { flex: 1; }
	.recommendation-title { font-size: 26rpx; color: var(--text-primary, #333); font-weight: bold; margin-bottom: 4rpx; display: block; }
	.recommendation-desc { font-size: 22rpx; color: var(--text-secondary, #666); }
</style>