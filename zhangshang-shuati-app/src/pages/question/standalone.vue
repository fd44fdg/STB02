<template>
	<view class="question-detail-container">
		<!-- 顶部返回按钮 -->
		<view class="question-header">
			<view class="back-button" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="question-title">{{ pageTitle }}</text>
		</view>
		
		<!-- 題目内容 -->
		<view class="question-card" v-if="question">
			<view class="question-type">{{ questionTypeText }}</view>
			<view class="question-content">
				<text class="question-text">{{ question.content }}</text>
				<view v-if="question.image" class="question-image-container">
					<image class="question-image" :src="question.image" mode="widthFix"></image>
				</view>
			</view>
			
			<!-- 选项列表 -->
			<view class="options-list">
				<!-- 单选题 -->
				<view v-if="question.type === 'single'" class="single-choice">
					<view 
						v-for="(option, index) in question.options" 
						:key="index"
						class="option-item"
						:class="{
							'selected': selectedOptions.includes(index),
							'correct': showAnswer && index === question.answer,
							'incorrect': showAnswer && selectedOptions.includes(index) && index !== question.answer
						}"
						@click="selectOption(index)"
					>
						<text class="option-label">{{ optionLabels[index] }}</text>
						<text class="option-text">{{ option }}</text>
					</view>
				</view>
				
				<!-- 多选题 -->
				<view v-else-if="question.type === 'multiple'" class="multiple-choice">
					<view 
						v-for="(option, index) in question.options" 
						:key="index"
						class="option-item"
						:class="{
							'selected': selectedOptions.includes(index),
							'correct': showAnswer && question.answer.includes(index),
							'incorrect': showAnswer && selectedOptions.includes(index) && !question.answer.includes(index)
						}"
						@click="selectMultipleOption(index)"
					>
						<text class="option-label">{{ optionLabels[index] }}</text>
						<text class="option-text">{{ option }}</text>
					</view>
				</view>
				
				<!-- 判断题 -->
				<view v-else-if="question.type === 'boolean'" class="boolean-choice">
					<view 
						class="option-item"
						:class="{
							'selected': selectedOptions.includes(0),
							'correct': showAnswer && question.answer === true && selectedOptions.includes(0),
							'incorrect': showAnswer && question.answer !== true && selectedOptions.includes(0)
						}"
						@click="selectOption(0)"
					>
						<text class="option-label">A</text>
						<text class="option-text">正确</text>
					</view>
					<view 
						class="option-item"
						:class="{
							'selected': selectedOptions.includes(1),
							'correct': showAnswer && question.answer === false && selectedOptions.includes(1),
							'incorrect': showAnswer && question.answer !== false && selectedOptions.includes(1)
						}"
						@click="selectOption(1)"
					>
						<text class="option-label">B</text>
						<text class="option-text">错误</text>
					</view>
				</view>
			</view>
			
			<!-- 答案解析 -->
			<view v-if="showAnswer" class="answer-explanation">
				<view class="explanation-title">答案解析</view>
				<view class="explanation-content">{{ question.explanation }}</view>
			</view>
		</view>
		
		<!-- 加载提示 -->
		<view v-else class="loading-container">
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 底部按钮 -->
		<view class="action-buttons">
			<button 
				v-if="!showAnswer" 
				class="action-button submit-button" 
				@click="checkAnswer"
			>
				提交答案
			</button>
			<button 
				v-else-if="hasMore" 
				class="action-button next-button" 
				@click="nextQuestion"
			>
				下一题
			</button>
			<button 
				v-else 
				class="action-button next-button" 
				@click="goBack"
			>
				返回首页
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				mode: '', // 'daily' 或 'popular'
				pageTitle: '',
				question: null,
				questions: [],
				currentIndex: 0,
				selectedOptions: [],
				showAnswer: false,
				hasMore: false,
				optionLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
			}
		},
		computed: {
			questionTypeText() {
				if (!this.question) return '';
				
				switch(this.question.type) {
					case 'single':
						return '单选题';
					case 'multiple':
						return '多选题';
					case 'boolean':
						return '判断题';
					default:
						return '未知类型';
				}
			}
		},
		onLoad(options) {
			// 从参数中获取模式
			this.mode = options.mode || '';
			
			if (this.mode === 'daily') {
				this.pageTitle = '每日一题';
				this.loadDailyQuestion();
			} else if (this.mode === 'popular') {
				this.pageTitle = '热门题目';
				this.loadPopularQuestions();
			} else {
				this.pageTitle = '题目详情';
				// 处理直接跳转到指定题目的情况
				if (options.id) {
					this.loadQuestion(options.id);
				} else {
					uni.showToast({
						title: '无效的题目信息',
						icon: 'none'
					});
					this.goBack();
				}
			}
		},
		methods: {
			// 加载每日一题
			loadDailyQuestion() {
				// 这里应该调用API获取每日一题
				// 模拟API调用
				setTimeout(() => {
					// 模拟数据
					this.questions = [{
						id: 101,
						type: 'single',
						content: '以下哪个不是JavaScript的基本数据类型？',
						options: ['String', 'Number', 'Boolean', 'Object'],
						answer: 3,
						explanation: 'JavaScript的基本数据类型包括：String、Number、Boolean、Null、Undefined、Symbol(ES6)、BigInt(ES11)。Object是引用数据类型。'
					}];
					
					this.question = this.questions[0];
					this.hasMore = this.questions.length > 1;
				}, 500);
			},
			
			// 加载热门题目
			loadPopularQuestions() {
				// 这里应该调用API获取热门题目列表
				// 模拟API调用
				setTimeout(() => {
					// 模拟数据
					this.questions = [
						{
							id: 201,
							type: 'multiple',
							content: '以下哪些是Vue.js的生命周期钩子？',
							options: ['created', 'onMounted', 'componentDidMount', 'beforeDestroy', 'initialize'],
							answer: [0, 3],
							explanation: 'Vue.js的生命周期钩子包括：beforeCreate、created、beforeMount、mounted、beforeUpdate、updated、beforeDestroy、destroyed等。其中onMounted是Vue 3 Composition API中的钩子，componentDidMount是React的生命周期方法，initialize不是Vue的生命周期钩子。'
						},
						{
							id: 202,
							type: 'single',
							content: 'CSS中，哪个属性用于设置元素的外边距？',
							options: ['padding', 'margin', 'border', 'spacing'],
							answer: 1,
							explanation: 'margin属性用于设置元素的外边距，padding用于设置内边距，border用于设置边框，spacing不是CSS的标准属性。'
						},
						{
							id: 203,
							type: 'boolean',
							content: 'HTTP状态码200表示请求成功。',
							answer: true,
							explanation: 'HTTP状态码200确实表示请求成功。2xx系列的状态码都表示请求成功的不同情况。'
						}
					];
					
					this.question = this.questions[0];
					this.hasMore = this.questions.length > 1;
				}, 500);
			},
			
			// 加载指定题目
			loadQuestion(id) {
				// 这里应该调用API获取指定ID的题目
				// 模拟API调用
				setTimeout(() => {
					// 模拟数据
					this.question = {
						id: parseInt(id),
						type: 'single',
						content: `这是ID为${id}的题目内容`,
						options: ['选项A', '选项B', '选项C', '选项D'],
						answer: 0,
						explanation: '这是题目的解析内容。'
					};
				}, 500);
			},
			
			// 选择单选题选项
			selectOption(index) {
				if (this.showAnswer) return;
				this.selectedOptions = [index];
			},
			
			// 选择多选题选项
			selectMultipleOption(index) {
				if (this.showAnswer) return;
				
				const position = this.selectedOptions.indexOf(index);
				if (position > -1) {
					this.selectedOptions.splice(position, 1);
				} else {
					this.selectedOptions.push(index);
				}
			},
			
			// 检查答案
			checkAnswer() {
				if (this.selectedOptions.length === 0) {
					uni.showToast({
						title: '请选择答案',
						icon: 'none'
					});
					return;
				}
				
				this.showAnswer = true;
				
				// 这里应该调用API记录答题情况
				// 例如：记录用户答题历史、更新错题本等
			},
			
			// 下一题
			nextQuestion() {
				if (this.currentIndex < this.questions.length - 1) {
					this.currentIndex++;
					this.question = this.questions[this.currentIndex];
					this.selectedOptions = [];
					this.showAnswer = false;
					this.hasMore = this.currentIndex < this.questions.length - 1;
				}
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack({
					delta: 1,
					fail: () => {
						// 如果没有上一页，则返回首页
						uni.switchTab({
							url: '/pages/home/home'
						});
					}
				});
			}
		}
	}
</script>

<style>
	/* 使用主题变量，适配浅色/深色模式 */
	.question-detail-container {
		background-color: var(--bg-color, #f5f5f5);
		min-height: 100vh;
		padding-bottom: 120rpx;
	}
	
	/* 头部样式 */
	.question-header {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: var(--card-bg, #ffffff);
		box-shadow: var(--shadow, 0 2rpx 10rpx rgba(0, 0, 0, 0.1));
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.back-button {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--card-bg-3, #f0f0f0);
		border-radius: 50%;
		margin-right: 20rpx;
	}
	
	.back-icon {
		font-size: 34rpx;
		color: var(--text-primary, #333333);
	}
	
	.question-title {
		font-size: 32rpx;
		font-weight: bold;
		color: var(--text-primary, #333333);
	}
	
	/* 题目卡片样式 */
	.question-card {
		background-color: var(--card-bg, #ffffff);
		border-radius: 16rpx;
		margin: 30rpx;
		padding: 30rpx;
		box-shadow: var(--shadow, 0 4rpx 12rpx rgba(0, 0, 0, 0.05));
	}
	
	.question-type {
		display: inline-block;
		background-color: var(--accent, #4A90E2);
		color: #ffffff;
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.question-content {
		margin-bottom: 40rpx;
	}
	
	.question-text {
		font-size: 32rpx;
		color: var(--text-primary, #333333);
		line-height: 1.6;
	}
	
	.question-image-container {
		margin-top: 20rpx;
	}
	
	.question-image {
		width: 100%;
		border-radius: 8rpx;
	}
	
	/* 选项样式 */
	.options-list {
		margin-bottom: 30rpx;
	}
	
	.option-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-radius: 12rpx;
		background-color: var(--card-bg-2, #f8f8f8);
		border: 1rpx solid var(--muted-border, #e9ecef);
		margin-bottom: 20rpx;
		position: relative;
		overflow: hidden;
	}
	
	.option-item.selected {
		background-color: var(--selection-bg, rgba(74, 144, 226, 0.15));
		border: 2rpx solid var(--accent, #4A90E2);
	}
	
	.option-item.correct {
		background-color: var(--success-bg, #e6f7e6);
		border: 2rpx solid var(--success, #52c41a);
	}
	
	.option-item.incorrect {
		background-color: var(--danger-bg, #fff1f0);
		border: 2rpx solid var(--danger, #ff4d4f);
	}
	
	.option-label {
		width: 50rpx;
		height: 50rpx;
		line-height: 50rpx;
		text-align: center;
		border-radius: 50%;
		background-color: var(--card-bg-3, #e0e0e0);
		color: var(--text-primary, #333333);
		font-size: 28rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}
	
	.option-item.selected .option-label {
		background-color: var(--accent, #4A90E2);
		color: #ffffff;
	}
	
	.option-item.correct .option-label {
		background-color: var(--success, #52c41a);
		color: #ffffff;
	}
	
	.option-item.incorrect .option-label {
		background-color: var(--danger, #ff4d4f);
		color: #ffffff;
	}
	
	.option-text {
		flex: 1;
		font-size: 28rpx;
		color: var(--text-primary, #333333);
		line-height: 1.5;
	}
	
	/* 答案解析样式 */
	.answer-explanation {
		background-color: var(--card-bg-2, #f8f8f8);
		padding: 20rpx;
		border-radius: 12rpx;
		margin-top: 30rpx;
		border: 1rpx solid var(--muted-border, #e9ecef);
	}
	
	.explanation-title {
		font-size: 28rpx;
		font-weight: bold;
		color: var(--text-primary, #333333);
		margin-bottom: 10rpx;
	}
	
	.explanation-content {
		font-size: 28rpx;
		color: var(--text-secondary, #666666);
		line-height: 1.6;
	}
	
	/* 底部按钮样式 */
	.action-buttons {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 30rpx;
		background-color: var(--card-bg, #ffffff);
		box-shadow: var(--shadow, 0 -2rpx 10rpx rgba(0, 0, 0, 0.05));
		border-top: 1rpx solid var(--muted-border, #e9ecef);
		z-index: 90;
	}
	
	.action-button {
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.submit-button {
		background: linear-gradient(135deg, #6a8bef 0%, var(--accent, #4a90e2) 100%);
		color: #ffffff;
	}
	
	.next-button {
		background: linear-gradient(135deg, var(--success, #52c41a) 0%, #389e0d 100%);
		color: #ffffff;
	}
	
	/* 加载提示样式 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 400rpx;
	}
	
	.loading-text {
		font-size: 28rpx;
		color: var(--text-secondary, #999999);
	}
</style>