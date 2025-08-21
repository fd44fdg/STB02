<template>
	<view class="question-detail">
		<!-- 顶部导航 -->
		<view class="header-nav">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
				<text class="nav-text">返回</text>
			</view>
			<view class="nav-center">
				<text class="nav-title">题目详情</text>
			</view>
			<view class="nav-right" @click="toggleFavorite">
				<text class="favorite-icon" :class="{active: isFavorited}">{{isFavorited ? '★' : '☆'}}</text>
			</view>
		</view>
		
		<!-- 题目信息 -->
		<view v-if="questionData" class="question-container">
			<!-- 题目头部信息 -->
			<view class="question-header">
				<view class="question-meta">
					<view class="meta-item">
						<text class="meta-label">题目编号:</text>
						<text class="meta-value">{{questionData.id}}</text>
					</view>
					<view class="meta-item">
						<text class="meta-label">分类:</text>
						<text class="meta-value category" :style="{color: getCategoryColor(questionData.category)}">{{questionData.category}}</text>
					</view>
					<view class="meta-item">
						<text class="meta-label">难度:</text>
						<text class="meta-value difficulty" :class="'difficulty-' + questionData.difficulty">{{getDifficultyText(questionData.difficulty)}}</text>
					</view>
				</view>
			</view>
			
			<!-- 题目内容 -->
			<view class="question-content">
				<view class="question-title">
					<text class="title-text">{{questionData.title}}</text>
				</view>
				
				<view class="question-description">
					<text class="description-text">{{questionData.description}}</text>
				</view>
				
				<!-- 代码示例（如果有） -->
				<view v-if="questionData.codeExample" class="code-example">
					<view class="code-header">
						<text class="code-title">代码示例:</text>
					</view>
					<view class="code-block">
						<text class="code-text">{{questionData.codeExample}}</text>
					</view>
				</view>
				
				<!-- 选择题选项 -->
				<view v-if="questionData.type === 'choice'" class="question-options">
					<view class="options-title">
						<text class="title-text">请选择正确答案:</text>
					</view>
					<view 
						v-for="(option, index) in questionData.options" 
						:key="index"
						class="option-item" 
						:class="{selected: selectedOption === index, correct: showAnswer && option.isCorrect, wrong: showAnswer && selectedOption === index && !option.isCorrect}"
						@click="selectOption(index)"
					>
						<view class="option-label">
							<text class="label-text">{{String.fromCharCode(65 + index)}}</text>
						</view>
						<view class="option-content">
							<text class="option-text">{{option.text}}</text>
						</view>
						<view v-if="showAnswer" class="option-status">
							<text v-if="option.isCorrect" class="status-icon correct">✓</text>
							<text v-else-if="selectedOption === index" class="status-icon wrong">✗</text>
						</view>
					</view>
				</view>
				
				<!-- 填空题 -->
				<view v-if="questionData.type === 'fill'" class="question-fill">
					<view class="fill-title">
						<text class="title-text">请填写答案:</text>
					</view>
					<view class="fill-input-container">
						<textarea 
							class="fill-input" 
							v-model="userAnswer" 
							placeholder="请输入您的答案"
							:disabled="showAnswer"
						></textarea>
					</view>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<view v-if="!showAnswer" class="submit-btn" @click="submitAnswer">
					<text class="btn-text">提交答案</text>
				</view>
				<view v-else class="action-group">
					<view class="reset-btn" @click="resetAnswer">
						<text class="btn-text">重新作答</text>
					</view>
					<view class="favorite-btn" @click="toggleFavorite">
						<text class="favorite-icon">{{isFavorited ? '★' : '☆'}}</text>
						<text class="btn-text">{{isFavorited ? '已收藏' : '收藏'}}</text>
					</view>
					<view class="next-btn" @click="nextQuestion">
						<text class="btn-text">下一题</text>
					</view>
				</view>
			</view>
			
			<!-- 答案解析 -->
			<view v-if="showAnswer" class="answer-section">
				<view class="answer-header">
					<text class="answer-title">答案解析</text>
				</view>
				
				<view class="correct-answer">
					<view class="answer-label">
						<text class="label-text">正确答案:</text>
					</view>
					<view class="answer-content">
						<text class="answer-text">{{questionData.correctAnswer}}</text>
					</view>
				</view>
				
				<view class="explanation">
					<view class="explanation-label">
						<text class="label-text">详细解析:</text>
					</view>
					<view class="explanation-content">
						<text class="explanation-text">{{questionData.explanation}}</text>
					</view>
				</view>
				
				<!-- 知识点标签 -->
				<view v-if="questionData.tags && questionData.tags.length > 0" class="knowledge-tags">
					<view class="tags-label">
						<text class="label-text">相关知识点:</text>
					</view>
					<view class="tags-list">
						<view 
							v-for="tag in questionData.tags" 
							:key="tag"
							class="tag-item"
							@click="searchByTag(tag)"
						>
							<text class="tag-text">{{tag}}</text>
						</view>
					</view>
				</view>
			</view>
			

		</view>
		
		<!-- 加载状态 -->
		<view v-else class="loading-container">
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				questionId: null,
				questionData: null,
				selectedOption: null,
				userAnswer: '',
				showAnswer: false,
				isFavorited: false,
				currentIndex: 0,
				totalQuestions: 100,
				// 模拟题目数据
				mockQuestionData: {
					id: 1,
					title: 'JavaScript中的闭包是什么？',
					description: '请选择关于JavaScript闭包最准确的描述。闭包是JavaScript中一个重要的概念，理解闭包对于掌握JavaScript至关重要。',
					type: 'choice', // choice, fill, code
					category: 'Javascript',
					difficulty: 3,
					codeExample: `function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 输出什么？`,
					options: [
						{ text: '闭包是一种特殊的对象，用于存储变量', isCorrect: false },
						{ text: '闭包是函数和其词法环境的组合，可以访问外部函数的变量', isCorrect: true },
						{ text: '闭包是一种循环结构，用于重复执行代码', isCorrect: false },
						{ text: '闭包是JavaScript中的一种数据类型', isCorrect: false }
					],
					correctAnswer: 'B. 闭包是函数和其词法环境的组合，可以访问外部函数的变量',
					explanation: '闭包是JavaScript中的一个重要概念。当一个函数能够访问并使用其外部（封闭）函数的变量时，就形成了闭包。在上面的例子中，innerFunction可以访问outerFunction的参数x，即使outerFunction已经执行完毕。这使得addFive(3)能够返回8（5+3）。闭包常用于数据封装、模块化编程和回调函数中。',
					tags: ['闭包', '函数', '作用域', '词法环境']
				}
			}
		},
		computed: {
			hasPrevious() {
				return this.currentIndex > 0
			},
			hasNext() {
				return this.currentIndex < this.totalQuestions - 1
			}
		},
		onLoad(options) {
			// 确保options对象存在，防止TypeError
			if (!options) {
				options = {}
			}
			console.log('Question Detail页面onLoad options:', options)
			
			if (options.id) {
				this.questionId = parseInt(options.id)
			}
			if (options.index) {
				this.currentIndex = parseInt(options.index)
			}
			this.loadQuestionData()
			this.checkFavoriteStatus()
		},
		methods: {
			// 加载题目数据
			async loadQuestionData() {
				try {
					// 模拟API调用
					await this.simulateApiCall()
					this.questionData = { ...this.mockQuestionData, id: this.questionId }
				} catch (error) {
					console.error('加载题目失败:', error)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
			},
			
			// 模拟API调用
			simulateApiCall() {
				return new Promise((resolve) => {
					setTimeout(resolve, 500)
				})
			},
			
			// 选择选项
			selectOption(index) {
				if (this.showAnswer) return
				this.selectedOption = index
			},
			
			// 提交答案
			submitAnswer() {
				if (this.questionData.type === 'choice' && this.selectedOption === null) {
					uni.showToast({
						title: '请选择答案',
						icon: 'none'
					})
					return
				}
				
				if (this.questionData.type === 'fill' && !this.userAnswer.trim()) {
					uni.showToast({
						title: '请填写答案',
						icon: 'none'
					})
					return
				}
				
				this.showAnswer = true
				
				// 检查答案正确性
				let isCorrect = false
				if (this.questionData.type === 'choice') {
					isCorrect = this.questionData.options[this.selectedOption]?.isCorrect
				}
				
				// 显示结果提示
				uni.showToast({
					title: isCorrect ? '回答正确！' : '答案错误',
					icon: isCorrect ? 'success' : 'none'
				})
				
				// 提交答案到后端
				try {
					const answerData = {
						questionId: this.questionId,
						answer: this.questionData.type === 'choice' ? this.selectedOption : this.userAnswer,
						isCorrect,
						answerTime: Date.now(),
						questionType: this.questionData.type
					};
					
					// 调用API提交答案
					// await submitAnswer(answerData);
					console.log('答案提交成功:', answerData);
					
					// 如果答案错误，记录到错题本
					if (!isCorrect) {
						// await addToWrongQuestions(this.questionId);
						console.log('已添加到错题本');
					}
				} catch (error) {
					console.error('提交答案失败:', error);
					uni.showToast({
						title: '提交失败，请重试',
						icon: 'none'
					});
				}
			},
			
			// 重新作答
			resetAnswer() {
				this.selectedOption = null
				this.userAnswer = ''
				this.showAnswer = false
			},
			
			// 上一题
			previousQuestion() {
				if (!this.hasPrevious) return
				
				const prevId = this.questionId - 1
				const prevIndex = this.currentIndex - 1
				
				uni.redirectTo({
					url: `/pages/question/detail?id=${prevId}&index=${prevIndex}`
				})
			},
			
			// 下一题
			nextQuestion() {
				if (!this.hasNext) {
					uni.showModal({
						title: '提示',
						content: '已经是最后一题了，是否返回题目列表？',
						success: (res) => {
							if (res.confirm) {
								this.goBack()
							}
						}
					})
					return
				}
				
				const nextId = this.questionId + 1
				const nextIndex = this.currentIndex + 1
				
				uni.redirectTo({
					url: `/pages/question/detail?id=${nextId}&index=${nextIndex}`
				})
			},
			
			// 切换收藏状态
			async toggleFavorite() {
				try {
					if (this.isFavorited) {
						await removeFavorite(this.questionId)
						this.isFavorited = false
						uni.showToast({
							title: '已取消收藏',
							icon: 'none'
						})
					} else {
						await addFavorite(this.questionId)
						this.isFavorited = true
						uni.showToast({
							title: '已收藏',
							icon: 'success'
						})
					}
				} catch (error) {
					console.error('收藏操作失败:', error)
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					})
				}
			},
			
			// 检查收藏状态
			async checkFavoriteStatus() {
				try {
					const res = await checkFavorite(this.questionId)
					this.isFavorited = res.data.isFavorited
				} catch (error) {
					console.error('检查收藏状态失败:', error)
					// 降级到本地存储检查
					try {
						const favorites = uni.getStorageSync('favoriteQuestions') || []
						this.isFavorited = favorites.includes(this.questionId)
					} catch (localError) {
						console.error('本地检查收藏状态失败:', localError)
					}
				}
			},
			
			// 保存收藏状态
			saveFavoriteStatus() {
				try {
					let favorites = uni.getStorageSync('favoriteQuestions') || []
					
					if (this.isFavorited) {
						if (!favorites.includes(this.questionId)) {
							favorites.push(this.questionId)
						}
					} else {
						favorites = favorites.filter(id => id !== this.questionId)
					}
					
					uni.setStorageSync('favoriteQuestions', favorites)
				} catch (error) {
					console.error('保存收藏状态失败:', error)
				}
			},
			
			// 根据标签搜索
			searchByTag(tag) {
				uni.navigateTo({
					url: `/pages/search/search?keyword=${encodeURIComponent(tag)}`
				})
			},
			
			// 返回
			goBack() {
				uni.navigateBack()
			},
			
			// 获取分类颜色
			getCategoryColor(category) {
				const colorMap = {
					'HTML': '#E34F26',
					'CSS': '#1572B6',
					'Javascript': '#F7DF1E',
					'Ajax': '#61DAFB',
					'Nodejs': '#339933',
					'React': '#61DAFB',
					'web前端': '#4A90E2'
				}
				return colorMap[category] || '#4A90E2'
			},
			
			// 获取难度文本
			getDifficultyText(difficulty) {
				const difficultyMap = {
					1: '入门',
					2: '初级',
					3: '中级',
					4: '高级',
					5: '专家'
				}
				return difficultyMap[difficulty] || '未知'
			}
		}
	}
</script>

<style scoped>
	.question-detail {
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	/* 顶部导航 */
	.header-nav {
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
	
	.nav-left {
		display: flex;
		align-items: center;
	}
	
	.nav-icon {
		font-size: 40rpx;
		color: #4A90E2;
		margin-right: 10rpx;
	}
	
	.nav-text {
		font-size: 28rpx;
		color: #4A90E2;
	}
	
	.nav-center {
		flex: 1;
		text-align: center;
	}
	
	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.nav-right {
		width: 80rpx;
		text-align: right;
	}
	
	.favorite-icon {
		font-size: 40rpx;
		color: #cccccc;
		transition: color 0.3s ease;
	}
	
	.favorite-icon.active {
		color: #FFD700;
	}
	
	/* 题目容器 */
	.question-container {
		padding: 30rpx;
	}
	
	/* 题目头部信息 */
	.question-header {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.question-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 30rpx;
	}
	
	.meta-item {
		display: flex;
		align-items: center;
	}
	
	.meta-label {
		font-size: 24rpx;
		color: #999999;
		margin-right: 10rpx;
	}
	
	.meta-value {
		font-size: 26rpx;
		color: #333333;
		font-weight: bold;
	}
	
	.meta-value.category {
		padding: 8rpx 16rpx;
		background-color: rgba(74, 144, 226, 0.1);
		border-radius: 12rpx;
	}
	
	.meta-value.difficulty {
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
	}
	
	.difficulty-1 { background-color: #d4edda; color: #155724; }
	.difficulty-2 { background-color: #cce5ff; color: #004085; }
	.difficulty-3 { background-color: #fff3cd; color: #856404; }
	.difficulty-4 { background-color: #f8d7da; color: #721c24; }
	.difficulty-5 { background-color: #e2e3e5; color: #383d41; }
	
	/* 题目内容 */
	.question-content {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.question-title {
		margin-bottom: 20rpx;
	}
	
	.title-text {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		line-height: 1.5;
	}
	
	.question-description {
		margin-bottom: 30rpx;
	}
	
	.description-text {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.6;
	}
	
	/* 代码示例 */
	.code-example {
		margin-bottom: 30rpx;
	}
	
	.code-header {
		margin-bottom: 15rpx;
	}
	
	.code-title {
		font-size: 26rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.code-block {
		background-color: #f8f9fa;
		border: 1rpx solid #e9ecef;
		border-radius: 8rpx;
		padding: 20rpx;
		overflow-x: auto;
	}
	
	.code-text {
		font-family: 'Courier New', monospace;
		font-size: 24rpx;
		color: #333333;
		line-height: 1.4;
		white-space: pre;
	}
	
	/* 选择题选项 */
	.question-options {
		margin-bottom: 30rpx;
	}
	
	.options-title {
		margin-bottom: 20rpx;
	}
	
	.option-item {
		display: flex;
		align-items: center;
		padding: 25rpx;
		margin-bottom: 15rpx;
		background-color: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		transition: all 0.3s ease;
	}
	
	.option-item.selected {
		background-color: #e3f2fd;
		border-color: #4A90E2;
	}
	
	.option-item.correct {
		background-color: #d4edda;
		border-color: #28a745;
	}
	
	.option-item.wrong {
		background-color: #f8d7da;
		border-color: #dc3545;
	}
	
	.option-label {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #4A90E2;
		border-radius: 50%;
		margin-right: 20rpx;
	}
	
	.label-text {
		font-size: 24rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.option-content {
		flex: 1;
	}
	
	.option-text {
		font-size: 26rpx;
		color: #333333;
		line-height: 1.5;
	}
	
	.option-status {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.status-icon {
		font-size: 28rpx;
		font-weight: bold;
	}
	
	.status-icon.correct {
		color: #28a745;
	}
	
	.status-icon.wrong {
		color: #dc3545;
	}
	
	/* 填空题 */
	.question-fill {
		margin-bottom: 30rpx;
	}
	
	.fill-title {
		margin-bottom: 20rpx;
	}
	
	.fill-input-container {
		background-color: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		padding: 20rpx;
	}
	
	.fill-input {
		width: 100%;
		min-height: 200rpx;
		font-size: 26rpx;
		color: #333333;
		background-color: transparent;
		border: none;
		outline: none;
		resize: none;
	}
	
	/* 操作按钮 */
	.action-buttons {
		margin-bottom: 30rpx;
	}
	
	.submit-btn {
		width: 100%;
		padding: 30rpx;
		background-color: #4A90E2;
		border-radius: 16rpx;
		text-align: center;
	}
	
	.action-group {
		display: flex;
		gap: 20rpx;
	}
	
	.reset-btn,
	.favorite-btn,
	.next-btn {
		flex: 1;
		padding: 30rpx;
		border-radius: 16rpx;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.reset-btn {
		background-color: #6c757d;
	}
	
	.favorite-btn {
		background-color: #FFD700;
		flex-direction: column;
		padding: 20rpx;
	}
	
	.favorite-icon {
		font-size: 32rpx;
		color: #ffffff;
		margin-bottom: 5rpx;
	}
	
	.next-btn {
		background-color: #28a745;
	}
	
	.btn-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	/* 答案解析 */
	.answer-section {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}
	
	.answer-header {
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #e9ecef;
	}
	
	.answer-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.correct-answer,
	.explanation,
	.knowledge-tags {
		margin-bottom: 30rpx;
	}
	
	.answer-label,
	.explanation-label,
	.tags-label {
		margin-bottom: 15rpx;
	}
	
	.label-text {
		font-size: 26rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.answer-content,
	.explanation-content {
		padding: 20rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		border-left: 4rpx solid #4A90E2;
	}
	
	.answer-text,
	.explanation-text {
		font-size: 26rpx;
		color: #333333;
		line-height: 1.6;
	}
	
	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}
	
	.tag-item {
		padding: 12rpx 20rpx;
		background-color: #e3f2fd;
		border: 1rpx solid #4A90E2;
		border-radius: 20rpx;
		transition: all 0.3s ease;
	}
	
	.tag-item:active {
		background-color: #4A90E2;
	}
	
	.tag-item:active .tag-text {
		color: #ffffff;
	}
	
	.tag-text {
		font-size: 22rpx;
		color: #4A90E2;
	}
	

	
	/* 加载状态 */
	.loading-container {
		padding: 200rpx 0;
		text-align: center;
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #999999;
	}
</style>