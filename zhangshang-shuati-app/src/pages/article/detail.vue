<template>
	<view class="article-detail">
		<!-- 顶部导航 -->
		<view class="nav-header">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
			</view>
			<view class="nav-center">
				<text class="nav-title">文章详情</text>
			</view>
			<view class="nav-right">
				<view class="action-btn" @click="toggleLike">
					<text class="action-icon" :class="{liked: article.isLiked}">♥</text>
				</view>
				<view class="action-btn" @click="shareArticle">
					<text class="action-icon">⤴</text>
				</view>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 文章内容 -->
		<view v-else-if="article" class="article-container">
			<!-- 文章头部 -->
			<view class="article-header">
				<!-- 封面图 -->
				<view class="cover-container">
					<image 
						v-if="article.coverImage" 
						:src="article.coverImage" 
						class="cover-image"
						mode="aspectFill"
					></image>
					<view v-else class="cover-placeholder">
						<text class="placeholder-icon">📄</text>
					</view>
					
					<!-- 文章标签 -->
					<view class="article-tags">
						<view class="tag-item category-tag" :style="{backgroundColor: getCategoryColor(article.category)}">
							<text class="tag-text">{{article.category}}</text>
						</view>
						<view v-if="article.isHot" class="tag-item hot-tag">
							<text class="tag-text">🔥 热门</text>
						</view>
						<view v-if="article.isNew" class="tag-item new-tag">
							<text class="tag-text">🆕 最新</text>
						</view>
					</view>
				</view>
				
				<!-- 文章信息 -->
				<view class="article-info">
					<view class="article-title">
						<text class="title-text">{{article.title}}</text>
					</view>
					
					<view class="article-meta">
						<view class="meta-left">
							<view class="author-info">
								<image class="author-avatar" :src="article.authorAvatar || '/static/default-avatar.png'" mode="aspectFill"></image>
								<text class="author-name">{{article.author}}</text>
							</view>
							<view class="publish-info">
								<text class="publish-time">{{formatDate(article.publishTime)}}</text>
								<text class="meta-separator">·</text>
								<text class="read-time">{{article.readTime}}分钟阅读</text>
							</view>
						</view>
						
						<view class="meta-right">
							<view class="follow-btn" @click="toggleFollow">
								<text class="follow-text" :class="{followed: article.isFollowed}">
									{{article.isFollowed ? '已关注' : '+ 关注'}}
								</text>
							</view>
						</view>
					</view>
					
					<view class="article-stats">
						<view class="stat-item">
							<text class="stat-icon">👁</text>
							<text class="stat-text">{{formatNumber(article.viewCount)}} 阅读</text>
						</view>
						<view class="stat-item">
							<text class="stat-icon">👍</text>
							<text class="stat-text">{{formatNumber(article.likeCount)}} 点赞</text>
						</view>
						<view class="stat-item">
							<text class="stat-icon">💬</text>
							<text class="stat-text">{{formatNumber(article.commentCount)}} 评论</text>
						</view>
						<view class="stat-item">
							<text class="stat-icon">⭐</text>
							<text class="stat-text">{{formatNumber(article.collectCount)}} 收藏</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 文章正文 -->
			<view class="article-content">
				<!-- 文章摘要 -->
				<view v-if="article.summary" class="article-summary">
					<text class="summary-text">{{article.summary}}</text>
				</view>
				
				<!-- 富文本内容 -->
				<view class="rich-content">
					<!-- 使用 rich-text 组件渲染富文本 -->
					<rich-text :nodes="article.content" class="rich-text"></rich-text>
				</view>
				
				<!-- 代码示例 -->
				<view v-if="article.codeExamples && article.codeExamples.length > 0" class="code-examples">
					<view class="section-title">
						<text class="title-text">💻 代码示例</text>
					</view>
					<view 
						v-for="(example, index) in article.codeExamples" 
						:key="index"
						class="code-example"
					>
						<view class="code-header">
							<text class="code-title">{{example.title}}</text>
							<text class="code-language">{{example.language}}</text>
						</view>
						<view class="code-content">
							<text class="code-text">{{example.code}}</text>
						</view>
						<view v-if="example.description" class="code-description">
							<text class="description-text">{{example.description}}</text>
						</view>
					</view>
				</view>
				
				<!-- 相关链接 -->
				<view v-if="article.relatedLinks && article.relatedLinks.length > 0" class="related-links">
					<view class="section-title">
						<text class="title-text">🔗 相关链接</text>
					</view>
					<view 
						v-for="(link, index) in article.relatedLinks" 
						:key="index"
						class="link-item"
						@click="openLink(link.url)"
					>
						<text class="link-title">{{link.title}}</text>
						<text class="link-url">{{link.url}}</text>
						<text class="link-arrow">›</text>
					</view>
				</view>
				
				<!-- 文章标签 -->
				<view v-if="article.tags && article.tags.length > 0" class="article-tags-section">
					<view class="section-title">
						<text class="title-text">🏷 标签</text>
					</view>
					<view class="tags-list">
						<view 
							v-for="tag in article.tags" 
							:key="tag"
							class="tag-chip"
							@click="searchByTag(tag)"
						>
							<text class="chip-text"># {{tag}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部操作栏 -->
			<view class="bottom-actions">
				<view class="action-group">
					<view class="action-item" @click="toggleLike">
						<text class="action-icon" :class="{liked: article.isLiked}">♥</text>
						<text class="action-text">{{article.isLiked ? '已赞' : '点赞'}}</text>
						<text class="action-count">{{formatNumber(article.likeCount)}}</text>
					</view>
					
					<view class="action-item" @click="toggleCollect">
						<text class="action-icon" :class="{collected: article.isCollected}">⭐</text>
						<text class="action-text">{{article.isCollected ? '已收藏' : '收藏'}}</text>
						<text class="action-count">{{formatNumber(article.collectCount)}}</text>
					</view>
					
					<view class="action-item" @click="goToComments">
						<text class="action-icon">💬</text>
						<text class="action-text">评论</text>
						<text class="action-count">{{formatNumber(article.commentCount)}}</text>
					</view>
					
					<view class="action-item" @click="shareArticle">
						<text class="action-icon">⤴</text>
						<text class="action-text">分享</text>
					</view>
				</view>
			</view>
			
			<!-- 评论区 -->
			<view class="comments-section">
				<view class="section-title">
					<text class="title-text">💬 评论 ({{comments.length}})</text>
				</view>
				
				<!-- 发表评论 -->
				<view class="comment-form">
					<view class="form-header">
						<text class="form-title">发表评论</text>
					</view>
					<view class="form-content">
						<textarea 
							class="comment-input"
							v-model="newComment"
							placeholder="写下你的想法..."
							:maxlength="500"
							auto-height
						></textarea>
						<view class="form-footer">
							<text class="char-count">{{newComment.length}}/500</text>
							<view class="submit-btn" :class="{disabled: !newComment.trim()}" @click="submitComment">
								<text class="submit-text">发表</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 评论列表 -->
				<view v-if="comments.length > 0" class="comments-list">
					<view 
						v-for="comment in comments" 
						:key="comment.id"
						class="comment-item"
					>
						<view class="comment-avatar">
							<image 
								v-if="comment.user.avatar" 
								:src="comment.user.avatar" 
								class="avatar-image"
								mode="aspectFill"
							></image>
							<view v-else class="avatar-placeholder">
								<text class="avatar-text">{{comment.user.name.charAt(0)}}</text>
							</view>
						</view>
						
						<view class="comment-content">
							<view class="comment-header">
								<text class="comment-author">{{comment.user.name}}</text>
								<text class="comment-time">{{formatDate(comment.createTime)}}</text>
							</view>
							
							<view class="comment-text">
								<text class="text-content">{{comment.content}}</text>
							</view>
							
							<view class="comment-actions">
								<view class="action-item" @click="toggleCommentLike(comment)">
									<text class="action-icon" :class="{liked: comment.isLiked}">♥</text>
									<text class="action-count">{{comment.likeCount || 0}}</text>
								</view>
								
								<view class="action-item" @click="replyToComment(comment)">
									<text class="action-icon">💬</text>
									<text class="action-text">回复</text>
								</view>
							</view>
							
							<!-- 回复列表 -->
							<view v-if="comment.replies && comment.replies.length > 0" class="replies-list">
								<view 
									v-for="reply in comment.replies" 
									:key="reply.id"
									class="reply-item"
								>
									<view class="reply-avatar">
										<image 
											v-if="reply.user.avatar" 
											:src="reply.user.avatar" 
											class="reply-avatar-image"
											mode="aspectFill"
										></image>
										<view v-else class="reply-avatar-placeholder">
											<text class="reply-avatar-text">{{reply.user.name.charAt(0)}}</text>
										</view>
									</view>
									
									<view class="reply-content">
										<view class="reply-header">
											<text class="reply-author">{{reply.user.name}}</text>
											<text class="reply-time">{{formatDate(reply.createTime)}}</text>
										</view>
										<view class="reply-text">
											<text class="reply-text-content">{{reply.content}}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 评论为空状态 -->
				<view v-else class="comments-empty">
					<text class="empty-icon">💭</text>
					<text class="empty-text">还没有评论，快来发表第一条评论吧！</text>
				</view>
			</view>
			
			<!-- 相关文章推荐 -->
			<view v-if="relatedArticles.length > 0" class="related-articles">
				<view class="section-title">
					<text class="title-text">📚 相关推荐</text>
				</view>
			<view class="related-list">
					<view 
						v-for="relatedArticle in relatedArticles" 
						:key="relatedArticle.id"
						class="related-item"
						@click="goToArticle(relatedArticle.id)"
					>
						<image 
							v-if="relatedArticle.coverImage" 
							:src="relatedArticle.coverImage" 
							class="related-cover"
							mode="aspectFill"
						></image>
						<view v-else class="related-cover-placeholder">
							<text class="placeholder-text">📄</text>
						</view>
						
						<view class="related-content">
							<text class="related-title">{{relatedArticle.title}}</text>
							<view class="related-meta">
								<text class="related-author">{{relatedArticle.author}}</text>
								<text class="meta-separator">·</text>
								<text class="related-views">{{formatNumber(relatedArticle.viewCount)}} 阅读</text>
							</view>
						</view>
						
						<text class="related-arrow">›</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 错误状态 -->
		<view v-else class="error-container">
			<text class="error-icon">😞</text>
			<text class="error-text">文章加载失败</text>
			<view class="retry-btn" @click="loadArticle">
				<text class="retry-text">重新加载</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loading: true,
				articleId: null,
				article: null,
				relatedArticles: [],
				// 评论相关数据
				comments: [],
				newComment: '',
				submittingComment: false
			}
		},
		onLoad(options) {
			// 确保options对象存在，防止TypeError
			if (!options) {
				options = {}
			}
			console.log('Article Detail页面onLoad options:', options)
			
			if (options.id) {
				this.articleId = options.id
			}
			this.loadArticle()
			this.loadRelatedArticles()
			this.loadComments()
		},
		methods: {
			// 加载文章详情
			async loadArticle() {
				this.loading = true
				try {
					// 模拟API调用
					await this.simulateApiCall()
					
					// 文章数据为空，等待从API加载
					this.article = {
						id: this.articleId,
						title: '',
						summary: '',
						author: '',
						authorAvatar: null,
						category: '',
						type: '',
						difficulty: '',
						publishTime: '',
						readTime: 0,
						viewCount: 0,
						likeCount: 0,
						commentCount: 0,
						collectCount: 0,
						isHot: false,
						isNew: false,
						isLiked: false,
						isCollected: false,
						isFollowed: false,
						coverImage: null,
						// 富文本内容（从API加载）
						content: [],
						// 代码示例（从API加载）
						codeExamples: [],
						// 相关链接（从API加载）
						relatedLinks: [],
						// 标签（从API加载）
						tags: []
					}
				} catch (error) {
					console.error('加载文章失败:', error)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			
			// 加载相关文章
			async loadRelatedArticles() {
				try {
					// 模拟相关文章数据
					this.relatedArticles = [
						{
							id: 2,
							title: 'React Hooks 最佳实践指南',
							author: '李四',
							viewCount: 2100,
							coverImage: null
						},
						{
							id: 3,
							title: 'Vue 3 性能优化技巧',
							author: '王五',
							viewCount: 1560,
							coverImage: null
						},
						{
							id: 4,
							title: '现代前端开发工具链',
							author: '赵六',
							viewCount: 890,
							coverImage: null
						}
					]
				} catch (error) {
					console.error('加载相关文章失败:', error)
				}
			},
			
			// 模拟API调用
			simulateApiCall() {
				return new Promise((resolve) => {
					setTimeout(resolve, 1000)
				})
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 切换点赞状态
			toggleLike() {
				this.article.isLiked = !this.article.isLiked
				if (this.article.isLiked) {
					this.article.likeCount++
					uni.showToast({
						title: '点赞成功',
						icon: 'success'
					})
				} else {
					this.article.likeCount--
					uni.showToast({
						title: '取消点赞',
						icon: 'none'
					})
				}
			},
			
			// 切换收藏状态
			toggleCollect() {
				this.article.isCollected = !this.article.isCollected
				if (this.article.isCollected) {
					this.article.collectCount++
					uni.showToast({
						title: '收藏成功',
						icon: 'success'
					})
				} else {
					this.article.collectCount--
					uni.showToast({
						title: '取消收藏',
						icon: 'none'
					})
				}
			},
			
			// 切换关注状态
			toggleFollow() {
				this.article.isFollowed = !this.article.isFollowed
				uni.showToast({
					title: this.article.isFollowed ? '关注成功' : '取消关注',
					icon: this.article.isFollowed ? 'success' : 'none'
				})
			},
			
			// 分享文章
			shareArticle() {
				uni.showActionSheet({
					itemList: ['分享到微信', '分享到朋友圈', '复制链接'],
					success: (res) => {
						const actions = ['微信', '朋友圈', '复制链接']
						uni.showToast({
							title: `分享到${actions[res.tapIndex]}`,
							icon: 'success'
						})
					}
				})
			},
			
			// 跳转到评论页面
			goToComments() {
				// 滚动到评论区
				uni.pageScrollTo({
					selector: '.comments-section',
					duration: 300
				})
			},
			
			// 加载评论列表
			async loadComments() {
				try {
					// 模拟API调用
					await this.simulateApiCall()
					
					// 模拟评论数据
					this.comments = [
						{
							id: 1,
							user: {
								id: 1,
								name: '李四',
								avatar: null
							},
							content: '这篇文章写得很好，对Composition API的讲解很详细，特别是实战部分很有帮助！',
							createTime: '2024-01-15 14:30:00',
							likeCount: 5,
							isLiked: false,
							replies: [
								{
									id: 11,
									user: {
										id: 2,
										name: '王五',
										avatar: null
									},
									content: '同感，作者的代码示例很实用',
									createTime: '2024-01-15 15:20:00'
								}
							]
						},
						{
							id: 2,
							user: {
								id: 3,
								name: '赵六',
								avatar: null
							},
							content: '请问在实际项目中，什么时候选择Composition API，什么时候用Options API？',
							createTime: '2024-01-15 16:45:00',
							likeCount: 2,
							isLiked: true,
							replies: []
						},
						{
							id: 3,
							user: {
								id: 4,
								name: '孙七',
								avatar: null
							},
							content: '收藏了，准备在下个项目中尝试使用Composition API',
							createTime: '2024-01-15 18:10:00',
							likeCount: 1,
							isLiked: false,
							replies: []
						}
					]
				} catch (error) {
					console.error('加载评论失败:', error)
				}
			},
			
			// 提交评论
			async submitComment() {
				if (!this.newComment.trim()) {
					uni.showToast({
						title: '请输入评论内容',
						icon: 'none'
					})
					return
				}
				
				if (this.submittingComment) {
					return
				}
				
				this.submittingComment = true
				
				try {
					// 模拟API调用
					await this.simulateApiCall()
					
					// 创建新评论
					const newComment = {
						id: Date.now(),
						user: {
							id: 999,
							name: '我',
							avatar: null
						},
						content: this.newComment.trim(),
						createTime: new Date().toLocaleString('zh-CN'),
						likeCount: 0,
						isLiked: false,
						replies: []
					}
					
					// 添加到评论列表顶部
					this.comments.unshift(newComment)
					
					// 更新文章评论数
					this.article.commentCount++
					
					// 清空输入框
					this.newComment = ''
					
					uni.showToast({
						title: '评论发表成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('发表评论失败:', error)
					uni.showToast({
						title: '发表失败，请重试',
						icon: 'none'
					})
				} finally {
					this.submittingComment = false
				}
			},
			
			// 切换评论点赞状态
			toggleCommentLike(comment) {
				comment.isLiked = !comment.isLiked
				if (comment.isLiked) {
					comment.likeCount++
				} else {
					comment.likeCount = Math.max(0, comment.likeCount - 1)
				}
			},
			
			// 回复评论
			replyToComment(comment) {
				uni.showModal({
					title: '回复评论',
					content: `回复 @${comment.user.name}`,
					editable: true,
					placeholderText: '请输入回复内容...',
					success: async (res) => {
						if (res.confirm && res.content && res.content.trim()) {
							try {
								// 构建回复数据
								const replyData = {
									articleId: this.articleId,
									parentId: comment.id,
									content: res.content.trim(),
									replyTo: comment.user.name
								};
								
								// 调用API提交回复
								// await replyToComment(replyData);
								
								// 模拟添加回复到本地列表
								const newReply = {
									id: Date.now(),
									user: {
										id: 999,
										name: '我',
										avatar: null
									},
									content: res.content.trim(),
									createTime: new Date().toLocaleString('zh-CN'),
									replyTo: comment.user.name
								};
								
								// 添加到对应评论的回复列表
								if (!comment.replies) {
									comment.replies = [];
								}
								comment.replies.push(newReply);
								
								uni.showToast({
									title: '回复成功',
									icon: 'success'
								});
							} catch (error) {
								console.error('回复失败:', error);
								uni.showToast({
									title: '回复失败，请重试',
									icon: 'none'
								});
							}
						}
					}
				})
			},
			
			// 跳转到其他文章
			goToArticle(articleId) {
				uni.redirectTo({
					url: `/pages/article/detail?id=${articleId}`
				})
			},
			
			// 打开外部链接
			openLink(url) {
				uni.showModal({
					title: '提示',
					content: '即将跳转到外部链接，是否继续？',
					success: (res) => {
						if (res.confirm) {
							// #ifdef H5
							window.open(url, '_blank')
							// #endif
							// #ifndef H5
							uni.showToast({
								title: '请在浏览器中打开',
								icon: 'none'
							})
							// #endif
						}
					}
				})
			},
			
			// 根据标签搜索
			searchByTag(tag) {
				uni.navigateTo({
					url: `/pages/search/search?keyword=${encodeURIComponent(tag)}`
				})
			},
			
			// 获取分类颜色
			getCategoryColor(category) {
				const colorMap = {
					'前端开发': '#4A90E2',
					'后端开发': '#52C41A',
					'移动开发': '#FA8C16',
					'人工智能': '#722ED1',
					'DevOps': '#13C2C2',
					'设计': '#EB2F96'
				}
				return colorMap[category] || '#999999'
			},
			
			// 格式化日期
			formatDate(dateString) {
				const date = new Date(dateString)
				const now = new Date()
				const diff = now - date
				const days = Math.floor(diff / (1000 * 60 * 60 * 24))
				
				if (days === 0) {
					return '今天'
				} else if (days === 1) {
					return '昨天'
				} else if (days < 7) {
					return `${days}天前`
				} else {
					return dateString
				}
			},
			
			// 格式化数字
			formatNumber(num) {
				if (num >= 1000) {
					return (num / 1000).toFixed(1) + 'k'
				}
				return num.toString()
			}
		}
	}
</script>

<style scoped>
	.article-detail {
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	/* 顶部导航 */
	.nav-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		border-bottom: 1rpx solid #e9ecef;
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.nav-left,
	.nav-right {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	
	.nav-icon {
		font-size: 40rpx;
		color: #333333;
		padding: 10rpx;
	}
	
	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.action-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: #f8f9fa;
	}
	
	.action-icon {
		font-size: 28rpx;
		color: #666666;
		transition: color 0.3s ease;
	}
	
	.action-icon.liked {
		color: #ff4757;
	}
	
	/* 加载和错误状态 */
	.loading-container,
	.error-container {
		padding: 100rpx 0;
		text-align: center;
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 16rpx;
	}
	
	.loading-text,
	.error-text {
		font-size: 28rpx;
		color: #999999;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.error-icon {
		font-size: 80rpx;
		color: #cccccc;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.retry-btn {
		padding: 20rpx 40rpx;
		background-color: #4A90E2;
		color: #ffffff;
		border-radius: 25rpx;
		display: inline-block;
		margin-top: 20rpx;
	}
	
	.retry-text {
		font-size: 26rpx;
		color: #ffffff;
	}
	
	/* 文章容器 */
	.article-container {
		padding: 20rpx;
	}
	
	/* 文章头部 */
	.article-header {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	/* 封面容器 */
	.cover-container {
		position: relative;
		height: 400rpx;
		overflow: hidden;
	}
	
	.cover-image {
		width: 100%;
		height: 100%;
	}
	
	.cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.placeholder-icon {
		font-size: 100rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.article-tags {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		display: flex;
		gap: 10rpx;
	}
	
	.tag-item {
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
		backdrop-filter: blur(10rpx);
	}
	
	.category-tag {
		background-color: rgba(255, 255, 255, 0.9);
	}
	
	.hot-tag {
		background-color: rgba(255, 87, 34, 0.9);
	}
	
	.new-tag {
		background-color: rgba(76, 175, 80, 0.9);
	}
	
	.tag-text {
		font-size: 20rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.category-tag .tag-text {
		color: #333333;
	}
	
	/* 文章信息 */
	.article-info {
		padding: 30rpx;
	}
	
	.article-title {
		margin-bottom: 25rpx;
	}
	
	.title-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		line-height: 1.4;
	}
	
	.article-meta {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 25rpx;
	}
	
	.meta-left {
		flex: 1;
	}
	
	.author-info {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.author-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-right: 15rpx;
		background-color: #f0f0f0;
	}
	
	.author-name {
		font-size: 26rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.publish-info {
		display: flex;
		align-items: center;
	}
	
	.publish-time,
	.read-time {
		font-size: 22rpx;
		color: #999999;
	}
	
	.meta-separator {
		margin: 0 10rpx;
		font-size: 22rpx;
		color: #cccccc;
	}
	
	.meta-right {
		display: flex;
		align-items: center;
	}
	
	.follow-btn {
		padding: 12rpx 24rpx;
		background-color: #4A90E2;
		border-radius: 20rpx;
		transition: background-color 0.3s ease;
	}
	
	.follow-text {
		font-size: 22rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.follow-text.followed {
		color: #999999;
	}
	
	.follow-btn:has(.followed) {
		background-color: #f8f9fa;
		border: 1rpx solid #e9ecef;
	}
	
	.article-stats {
		display: flex;
		gap: 30rpx;
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	
	.stat-icon {
		font-size: 24rpx;
	}
	
	.stat-text {
		font-size: 22rpx;
		color: #999999;
	}
	
	/* 文章内容 */
	.article-content {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.article-summary {
		margin-bottom: 30rpx;
		padding: 25rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border-left: 6rpx solid #4A90E2;
	}
	
	.summary-text {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.6;
		font-style: italic;
	}
	
	.rich-content {
		margin-bottom: 40rpx;
	}
	
	.rich-text {
		font-size: 28rpx;
		line-height: 1.8;
		color: #333333;
	}
	
	/* 代码示例 */
	.code-examples {
		margin-bottom: 40rpx;
	}
	
	.section-title {
		margin-bottom: 20rpx;
	}
	
	.title-text {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.code-example {
		margin-bottom: 30rpx;
		border: 1rpx solid #e9ecef;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 25rpx;
		background-color: #2d3748;
	}
	
	.code-title {
		font-size: 24rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.code-language {
		font-size: 20rpx;
		color: #a0aec0;
		padding: 6rpx 12rpx;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 8rpx;
	}
	
	.code-content {
		padding: 25rpx;
		background-color: #1a202c;
		overflow-x: auto;
	}
	
	.code-text {
		font-size: 22rpx;
		color: #e2e8f0;
		font-family: 'Courier New', monospace;
		line-height: 1.6;
		white-space: pre-wrap;
	}
	
	.code-description {
		padding: 20rpx 25rpx;
		background-color: #f7fafc;
		border-top: 1rpx solid #e9ecef;
	}
	
	.description-text {
		font-size: 24rpx;
		color: #666666;
		line-height: 1.5;
	}
	
	/* 相关链接 */
	.related-links {
		margin-bottom: 40rpx;
	}
	
	.link-item {
		display: flex;
		align-items: center;
		padding: 20rpx 25rpx;
		margin-bottom: 15rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border: 1rpx solid #e9ecef;
		transition: all 0.3s ease;
	}
	
	.link-item:active {
		background-color: #e9ecef;
		transform: scale(0.98);
	}
	
	.link-title {
		flex: 1;
		font-size: 26rpx;
		color: #4A90E2;
		font-weight: bold;
		margin-bottom: 5rpx;
	}
	
	.link-url {
		flex: 1;
		font-size: 20rpx;
		color: #999999;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.link-arrow {
		font-size: 28rpx;
		color: #4A90E2;
		margin-left: 15rpx;
	}
	
	/* 文章标签区域 */
	.article-tags-section {
		margin-bottom: 40rpx;
	}
	
	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}
	
	.tag-chip {
		padding: 12rpx 20rpx;
		background-color: #f0f8ff;
		border: 1rpx solid #4A90E2;
		border-radius: 20rpx;
		transition: all 0.3s ease;
	}
	
	.tag-chip:active {
		background-color: #4A90E2;
	}
	
	.chip-text {
		font-size: 22rpx;
		color: #4A90E2;
		font-weight: bold;
	}
	
	.tag-chip:active .chip-text {
		color: #ffffff;
	}
	
	/* 底部操作栏 */
	.bottom-actions {
		position: sticky;
		bottom: 0;
		background-color: #ffffff;
		border-top: 1rpx solid #e9ecef;
		padding: 20rpx 30rpx;
		margin: 0 -20rpx -20rpx -20rpx;
		z-index: 100;
	}
	
	.action-group {
		display: flex;
		justify-content: space-around;
		align-items: center;
	}
	
	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 15rpx;
		border-radius: 12rpx;
		transition: all 0.3s ease;
		min-width: 120rpx;
	}
	
	.action-item:active {
		background-color: #f8f9fa;
		transform: scale(0.95);
	}
	
	.action-item .action-icon {
		font-size: 32rpx;
		color: #666666;
		transition: color 0.3s ease;
	}
	
	.action-item .action-icon.liked,
	.action-item .action-icon.collected {
		color: #ff4757;
	}
	
	.action-text {
		font-size: 20rpx;
		color: #666666;
	}
	
	.action-count {
		font-size: 18rpx;
		color: #999999;
	}
	
	/* 相关文章推荐 */
	.related-articles {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.related-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.related-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border: 1rpx solid #e9ecef;
		transition: all 0.3s ease;
	}
	
	.related-item:active {
		background-color: #e9ecef;
		transform: scale(0.98);
	}
	
	.related-cover,
	.related-cover-placeholder {
		width: 120rpx;
		height: 80rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}
	
	.related-cover-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.placeholder-text {
		font-size: 32rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.related-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.related-title {
		font-size: 26rpx;
		color: #333333;
		font-weight: bold;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.related-meta {
		display: flex;
		align-items: center;
	}
	
	.related-author,
	.related-views {
		font-size: 20rpx;
		color: #999999;
	}
	
	.related-arrow {
		font-size: 28rpx;
		color: #4A90E2;
		margin-left: 15rpx;
	}
	
	/* 评论区样式 */
	.comments-section {
		margin-top: 40rpx;
		padding: 30rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
	}
	
	/* 评论表单样式 */
	.comment-form {
		margin-top: 20rpx;
		padding: 25rpx;
		background-color: #f8f9fa;
		border-radius: 15rpx;
	}
	
	.form-header {
		margin-bottom: 15rpx;
	}
	
	.form-title {
		font-size: 28rpx;
		color: #333333;
		font-weight: 600;
	}
	
	.comment-input {
		width: 100%;
		min-height: 120rpx;
		padding: 20rpx;
		background-color: #ffffff;
		border: 2rpx solid #e9ecef;
		border-radius: 10rpx;
		font-size: 26rpx;
		color: #333333;
		line-height: 1.5;
		box-sizing: border-box;
	}
	
	.comment-input:focus {
		border-color: #4A90E2;
	}
	
	.form-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 15rpx;
	}
	
	.char-count {
		font-size: 22rpx;
		color: #999999;
	}
	
	.submit-btn {
		padding: 12rpx 30rpx;
		background-color: #4A90E2;
		border-radius: 25rpx;
		transition: all 0.3s ease;
	}
	
	.submit-btn.disabled {
		background-color: #cccccc;
		opacity: 0.6;
	}
	
	.submit-text {
		font-size: 24rpx;
		color: #ffffff;
		font-weight: 500;
	}
	
	/* 评论列表样式 */
	.comments-list {
		margin-top: 30rpx;
	}
	
	.comment-item {
		display: flex;
		padding: 25rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.comment-item:last-child {
		border-bottom: none;
	}
	
	.comment-avatar {
		margin-right: 20rpx;
	}
	
	.avatar-image {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
	}
	
	.avatar-placeholder {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		background-color: #4A90E2;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.avatar-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.comment-content {
		flex: 1;
	}
	
	.comment-header {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.comment-author {
		font-size: 26rpx;
		color: #333333;
		font-weight: 600;
		margin-right: 15rpx;
	}
	
	.comment-time {
		font-size: 22rpx;
		color: #999999;
	}
	
	.comment-text {
		margin-bottom: 15rpx;
	}
	
	.text-content {
		font-size: 26rpx;
		color: #333333;
		line-height: 1.6;
	}
	
	.comment-actions {
		display: flex;
		align-items: center;
		gap: 30rpx;
		margin-bottom: 15rpx;
	}
	
	.comment-actions .action-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 15rpx;
		border-radius: 20rpx;
		background-color: #f8f9fa;
		transition: all 0.3s ease;
	}
	
	.comment-actions .action-item:active {
		background-color: #e9ecef;
		transform: scale(0.95);
	}
	
	.comment-actions .action-icon {
		font-size: 24rpx;
		color: #666666;
		transition: color 0.3s ease;
	}
	
	.comment-actions .action-icon.liked {
		color: #ff4757;
	}
	
	.comment-actions .action-text,
	.comment-actions .action-count {
		font-size: 22rpx;
		color: #666666;
	}
	
	/* 回复列表样式 */
	.replies-list {
		margin-top: 15rpx;
		padding-left: 20rpx;
		border-left: 3rpx solid #f0f0f0;
	}
	
	.reply-item {
		display: flex;
		padding: 15rpx 0;
		border-bottom: 1rpx solid #f8f9fa;
	}
	
	.reply-item:last-child {
		border-bottom: none;
	}
	
	.reply-avatar {
		margin-right: 15rpx;
	}
	
	.reply-avatar-image {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
	}
	
	.reply-avatar-placeholder {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		background-color: #6c757d;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.reply-avatar-text {
		font-size: 20rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.reply-content {
		flex: 1;
	}
	
	.reply-header {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
	}
	
	.reply-author {
		font-size: 24rpx;
		color: #333333;
		font-weight: 600;
		margin-right: 12rpx;
	}
	
	.reply-time {
		font-size: 20rpx;
		color: #999999;
	}
	
	.reply-text-content {
		font-size: 24rpx;
		color: #333333;
		line-height: 1.5;
	}
	
	/* 评论为空状态 */
	.comments-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 30rpx;
	}
	
	.empty-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
		opacity: 0.6;
	}
	
	.empty-text {
		font-size: 26rpx;
		color: #999999;
		text-align: center;
		line-height: 1.5;
	}
</style>