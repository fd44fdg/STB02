<template>
	<view class="practice-container">
		<!-- 配置模式 -->
		<view v-if="!practiceStarted" class="setup-mode">
			<view class="header">
				<text class="header-title">{{ pageTitle || '刷题练习' }}</text>
			</view>
			
			<!-- 模式提示卡片 -->
			<view v-if="currentMode" class="mode-tip-card">
				<view class="mode-icon">{{ getModeIcon() }}</view>
				<view class="mode-content">
					<text class="mode-title">{{ getModeTitle() }}</text>
					<text class="mode-desc">{{ getModeDescription() }}</text>
				</view>
			</view>
			
			<view class="content-section">
				<view class="info-card">
					<text class="info-text">选择你想要练习的题目类型和难度，开始刷题吧！</text>
				</view>
				
				<view class="section">
					<view class="section-title">选择分类</view>
					<view class="category-list">
						<view 
							v-for="(category, index) in categories" 
							:key="index"
							class="category-item"
							:class="{ active: selectedCategory === index }"
							@click="selectCategory(index)"
						>
							<text class="category-name">{{ category }}</text>
						</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">选择难度</view>
					<view class="difficulty-list">
						<view 
							v-for="(difficulty, index) in difficulties" 
							:key="index"
							class="difficulty-item"
							:class="{ active: selectedDifficulty === index }"
							@click="selectDifficulty(index)"
						>
							<text class="difficulty-name">{{ difficulty.name }}</text>
							<text class="difficulty-desc">{{ difficulty.desc }}</text>
						</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">题目数量</view>
					<slider 
						:value="questionCount" 
						:min="5" 
						:max="50" 
						:step="5" 
						:show-value="true"
						@change="onQuestionCountChange"
					/>
				</view>
				
				<view class="button-section">
					<button class="start-button" @click="startPractice">开始练习</button>
				</view>
			</view>
		</view>
		
		<!-- 答题模式 -->
		<view v-else class="practice-mode">
			<!-- 顶部标题 -->
			<view class="practice-header">
				<text class="practice-title">{{ pageTitle || '练习中' }}</text>
			</view>
			
			<!-- 進度条 -->
			<view class="progress-bar-container">
				<view class="progress-bar-bg">
					<view class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></view>
				</view>
				<view class="progress-text">{{ currentIndex + 1 }}/{{ questions.length }}</view>
			</view>
			
			<!-- 题目内容 -->
			<view class="question-card">
				<view class="question-type">{{ currentQuestion.type === 'single' ? '单选题' : currentQuestion.type === 'multiple' ? '多选题' : '判断题' }}</view>
				<view class="question-content">
					<text class="question-text">{{ currentQuestion.content }}</text>
					<view v-if="currentQuestion.image" class="question-image-container">
						<image class="question-image" :src="currentQuestion.image" mode="widthFix"></image>
					</view>
				</view>
				
				<!-- 选项列表 -->
				<view class="options-list">
					<!-- 单选题 -->
					<view v-if="currentQuestion.type === 'single'" class="single-choice">
						<view 
							v-for="(option, index) in currentQuestion.options" 
							:key="index"
							class="option-item"
							:class="{
								'selected': selectedOptions.includes(index),
								'correct': showAnswer && index === currentQuestion.answer,
								'incorrect': showAnswer && selectedOptions.includes(index) && index !== currentQuestion.answer
							}"
							@click="selectOption(index)"
						>
							<text class="option-label">{{ optionLabels[index] }}</text>
							<text class="option-text">{{ option }}</text>
						</view>
					</view>
					
					<!-- 多选题 -->
					<view v-else-if="currentQuestion.type === 'multiple'" class="multiple-choice">
						<view 
							v-for="(option, index) in currentQuestion.options" 
							:key="index"
							class="option-item"
							:class="{
								'selected': selectedOptions.includes(index),
								'correct': showAnswer && currentQuestion.answer.includes(index),
								'incorrect': showAnswer && selectedOptions.includes(index) && !currentQuestion.answer.includes(index)
							}"
							@click="selectMultipleOption(index)"
						>
							<text class="option-label">{{ optionLabels[index] }}</text>
							<text class="option-text">{{ option }}</text>
						</view>
					</view>
					
					<!-- 判断题 -->
					<view v-else-if="currentQuestion.type === 'boolean'" class="boolean-choice">
						<view 
							class="option-item"
							:class="{
								'selected': selectedOptions.includes(0),
								'correct': showAnswer && currentQuestion.answer === true && selectedOptions.includes(0),
								'incorrect': showAnswer && currentQuestion.answer !== true && selectedOptions.includes(0)
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
								'correct': showAnswer && currentQuestion.answer === false && selectedOptions.includes(1),
								'incorrect': showAnswer && currentQuestion.answer !== false && selectedOptions.includes(1)
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
					<view class="explanation-content">{{ currentQuestion.explanation }}</view>
				</view>
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
					v-else 
					class="action-button next-button" 
					@click="nextQuestion"
				>
					{{ isLastQuestion ? '完成练习' : '下一题' }}
				</button>
			</view>
		</view>
		
		<!-- 练习结果 -->
		<view v-if="practiceCompleted" class="result-modal">
			<view class="result-card">
				<view class="result-header">
					<text class="result-title">练习完成</text>
				</view>
				<view class="result-content">
					<view class="result-stats">
						<view class="stat-item">
							<text class="stat-value">{{ correctCount }}</text>
							<text class="stat-label">答对题目</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ questions.length }}</text>
							<text class="stat-label">总题目数</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ Math.round(correctCount / questions.length * 100) }}%</text>
							<text class="stat-label">正确率</text>
						</view>
					</view>
					<view class="result-actions">
						<button class="result-button review-button" @click="reviewQuestions">查看错题</button>
						<button class="result-button restart-button" @click="restartPractice">重新开始</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 配置数据
			categories: ['数学', '语文', '英语', '物理', '化学', '生物'],
			difficulties: [
				{ name: '简单', desc: '基础题型，适合入门' },
				{ name: '中等', desc: '标准题型，适合巩固' },
				{ name: '困难', desc: '挑战题型，适合提高' }
			],
			selectedCategory: 0,
			selectedDifficulty: 1,
			questionCount: 20,
			
			// 练习状态
			practiceStarted: false,
			practiceCompleted: false,
			currentIndex: 0,
			showAnswer: false,
			selectedOptions: [],
			correctCount: 0,
			wrongQuestions: [],
			
			// 选项标签
			optionLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
			
			// 模拟题目数据
			questions: [],

			// 当前模式
			currentMode: '',
			pageTitle: '',

			// 用户设置
			userSettings: null
		}
	},
	onLoad(options) {
		console.log('Practice页面onLoad - 接收到的参数:', options)

		// 确保options对象存在
		if (!options) {
			options = {}
			console.log('options为空，使用默认值')
		}

		// 加载用户设置并应用默认值
		this.loadUserSettings()

		// 处理分类参数
		if (options.category) {
			const categoryIndex = this.categories.indexOf(options.category)
			if (categoryIndex !== -1) {
				this.selectedCategory = categoryIndex
				console.log('设置分类索引:', categoryIndex)
			}
		}

		// 处理URL参数中的模式
		this.handleModeFromOptions(options)
	},
	
	onShow() {
		console.log('Practice页面onShow - 检查存储的模式参数')
		
		// 检查是否有存储的模式参数
		const storedMode = uni.getStorageSync('practiceMode')
		if (storedMode) {
			console.log('从存储读取到模式参数:', storedMode)
			this.handleModeFromOptions(storedMode)
			// 清除存储的参数，避免重复使用
			uni.removeStorageSync('practiceMode')
		}
	},
	computed: {
		currentQuestion() {
			return this.questions[this.currentIndex] || {}
		},
		progressPercentage() {
			return (this.currentIndex / this.questions.length) * 100
		},
		isLastQuestion() {
			return this.currentIndex === this.questions.length - 1
		}
	},
	methods: {
		// 加载用户设置
		loadUserSettings() {
			try {
				const settings = uni.getStorageSync('app_settings')
				if (settings) {
					// 应用默认难度设置
					if (settings.difficulty) {
						const difficultyMap = { 'easy': 0, 'medium': 1, 'hard': 2 }
						this.selectedDifficulty = difficultyMap[settings.difficulty] || 1
						console.log('应用默认难度设置:', settings.difficulty, '→', this.selectedDifficulty)
					}

					// 应用默认题数设置
					if (settings.questionCount) {
						this.questionCount = settings.questionCount
						console.log('应用默认题数设置:', settings.questionCount)
					}

					// 保存设置供答题时使用
					this.userSettings = settings
					console.log('用户设置已加载:', settings)
				}
			} catch (error) {
				console.error('加载用户设置失败:', error)
			}
		},

		// 播放音效
		playSound(type) {
			try {
				const settings = this.userSettings || uni.getStorageSync('app_settings')
				if (!settings || !settings.sound) return

				// 根据类型播放不同音效
				if (type === 'correct') {
					// 正确答案音效
					uni.showToast({
						title: '✓ 回答正确',
						icon: 'none',
						duration: 800
					})
				} else if (type === 'wrong') {
					// 错误答案音效
					uni.showToast({
						title: '✗ 回答错误',
						icon: 'none',
						duration: 800
					})
				}
			} catch (error) {
				console.error('播放音效失败:', error)
			}
		},

		// 震动反馈
		vibrate(type) {
			try {
				const settings = this.userSettings || uni.getStorageSync('app_settings')
				if (!settings || !settings.vibration) return

				// 根据类型进行不同强度的震动
				if (type === 'correct') {
					// 正确答案轻震动
					uni.vibrateShort({
						type: 'light'
					})
				} else if (type === 'wrong') {
					// 错误答案重震动
					uni.vibrateLong()
				}
			} catch (error) {
				console.error('震动反馈失败:', error)
			}
		},

		selectCategory(index) {
			this.selectedCategory = index
		},
		selectDifficulty(index) {
			this.selectedDifficulty = index
		},
		onQuestionCountChange(e) {
			this.questionCount = e.detail.value
		},
		
		// 开始练习
		async startPractice() {
			try {
				uni.showLoading({
					title: '加载题目中...'
				})
				
				// 模拟加载题目数据
				await this.loadQuestions()
				
				this.practiceStarted = true
				this.practiceCompleted = false
				this.currentIndex = 0
				this.showAnswer = false
				this.selectedOptions = []
				this.correctCount = 0
				this.wrongQuestions = []
				
				uni.hideLoading()
			} catch (error) {
				uni.hideLoading()
				uni.showToast({
					title: '加载题目失败',
					icon: 'none'
				})
			}
		},
		
		// 模拟加载题目数据
		async loadQuestions() {
			// 这里应该调用API获取题目，现在使用模拟数据
			return new Promise((resolve) => {
				setTimeout(() => {
					this.questions = this.generateMockQuestions()
					resolve()
				}, 1000)
			})
		},
		
		// 生成模拟题目
		generateMockQuestions() {
			const questions = []
			const types = ['single', 'multiple', 'boolean']
			const category = this.categories[this.selectedCategory]
			const difficulty = this.difficulties[this.selectedDifficulty].name
			
			// 根据模式生成不同的题目内容
			const modePrefix = this.getCurrentModePrefix()
			
			for (let i = 0; i < this.questionCount; i++) {
				const type = types[Math.floor(Math.random() * types.length)]
				
				if (type === 'single') {
					questions.push({
						id: i + 1,
						type: 'single',
						content: `${modePrefix}${category}单选题（${difficulty}）：这是第${i + 1}道${category}练习题，请选择正确答案。`,
						options: ['选项A', '选项B', '选项C', '选项D'],
						answer: Math.floor(Math.random() * 4),
						explanation: `这是第${i + 1}道题的详细解析，解释了为什么这个答案是正确的。`
					})
				} else if (type === 'multiple') {
					const answerCount = Math.floor(Math.random() * 3) + 1
					const answers = []
					while (answers.length < answerCount) {
						const num = Math.floor(Math.random() * 4)
						if (!answers.includes(num)) {
							answers.push(num)
						}
					}
					
					questions.push({
						id: i + 1,
						type: 'multiple',
						content: `${modePrefix}${category}多选题（${difficulty}）：这是第${i + 1}道${category}练习题，请选择所有正确答案。`,
						options: ['选项A', '选项B', '选项C', '选项D'],
						answer: answers,
						explanation: `这是第${i + 1}道题的详细解析，解释了为什么这些答案是正确的。`
					})
				} else {
					questions.push({
						id: i + 1,
						type: 'boolean',
						content: `${modePrefix}${category}判断题（${difficulty}）：这是第${i + 1}道${category}练习题，请判断正误。`,
						answer: Math.random() > 0.5,
						explanation: `这是第${i + 1}道题的详细解析，解释了为什么这个判断是正确或错误的。`
					})
				}
			}
			
			return questions
		},
		
		// 处理模式参数
		handleModeFromOptions(options) {
			if (!options || !options.mode) {
				console.log('没有模式参数，使用默认模式')
				return
			}
			
			console.log('处理模式参数:', options.mode)
			this.currentMode = options.mode
			
			switch(options.mode) {
				case 'popular':
					console.log('初始化热门题目模式')
					this.selectedDifficulty = 1
					this.questionCount = 20
					this.pageTitle = '热门题目练习'
					uni.setNavigationBarTitle({ title: '热门题目练习' })
					break
				case 'daily':
					console.log('初始化每日一题模式')
					this.selectedDifficulty = Math.floor(Math.random() * 3)
					this.questionCount = 10
					this.pageTitle = '每日一题'
					uni.setNavigationBarTitle({ title: '每日一题' })
					break
				case 'review':
					console.log('初始化知识点复习模式')
					this.selectedDifficulty = 0
					this.questionCount = 30
					this.pageTitle = '知识点复习'
					uni.setNavigationBarTitle({ title: '知识点复习' })
					// 注意：知识点复习不自动开始，需要用户配置
					break
				default:
					console.log('未知模式:', options.mode)
			}
			
			// 检查是否需要自动开始（只有热门题目和每日一题才自动开始）
			if ((options.autoStart === true || options.autoStart === 'true') && 
			    (options.mode === 'popular' || options.mode === 'daily')) {
				console.log('自动开始练习')
				setTimeout(() => {
					this.startPractice()
				}, 800)
			}
			
			console.log('模式处理完成 - 当前状态:', {
				currentMode: this.currentMode,
				pageTitle: this.pageTitle,
				selectedDifficulty: this.selectedDifficulty,
				questionCount: this.questionCount
			})
		},
		getCurrentModePrefix() {
			switch(this.currentMode) {
				case 'popular':
					return '🔥热门 - '
				case 'daily':
					return '⭐每日 - '
				case 'review':
					return '📚复习 - '
				default:
					return ''
			}
		},
		
		// 获取模式图标
		getModeIcon() {
			switch(this.currentMode) {
				case 'popular':
					return '🔥'
				case 'daily':
					return '⭐'
				case 'review':
					return '📚'
				default:
					return '📝'
			}
		},
		
		// 获取模式标题
		getModeTitle() {
			switch(this.currentMode) {
				case 'popular':
					return '热门题目练习'
				case 'daily':
					return '每日一题挑战'
				case 'review':
					return '知识点复习'
				default:
					return '自由练习'
			}
		},
		
		// 获取模式描述
		getModeDescription() {
			switch(this.currentMode) {
				case 'popular':
					return '精选热门题目，提升实战能力'
				case 'daily':
					return '每日一道精心选择的题目'
				case 'review':
					return '系统性复习重点知识'
				default:
					return '根据您的需要自由配置'
			}
		},
		
		// 选择单选或判断题选项
		selectOption(index) {
			if (this.showAnswer) return
			this.selectedOptions = [index]
		},
		
		// 选择多选题选项
		selectMultipleOption(index) {
			if (this.showAnswer) return
			
			const position = this.selectedOptions.indexOf(index)
			if (position > -1) {
				this.selectedOptions.splice(position, 1)
			} else {
				this.selectedOptions.push(index)
			}
		},
		
		// 检查答案
		checkAnswer() {
			if (this.selectedOptions.length === 0) {
				uni.showToast({
					title: '请选择答案',
					icon: 'none'
				})
				return
			}
			
			let isCorrect = false
			
			if (this.currentQuestion.type === 'single') {
				isCorrect = this.selectedOptions[0] === this.currentQuestion.answer
			} else if (this.currentQuestion.type === 'multiple') {
				// 检查多选题答案
				if (this.selectedOptions.length !== this.currentQuestion.answer.length) {
					isCorrect = false
				} else {
					isCorrect = this.currentQuestion.answer.every(ans => this.selectedOptions.includes(ans)) &&
						this.selectedOptions.every(sel => this.currentQuestion.answer.includes(sel))
				}
			} else if (this.currentQuestion.type === 'boolean') {
				// 判断题: 0表示"正确"，1表示"错误"
				const selectedValue = this.selectedOptions[0] === 0
				isCorrect = selectedValue === this.currentQuestion.answer
			}
			
			if (isCorrect) {
				this.correctCount++
				// 播放正确音效和震动
				this.playSound('correct')
				this.vibrate('correct')
			} else {
				this.wrongQuestions.push(this.currentIndex)
				// 播放错误音效和震动
				this.playSound('wrong')
				this.vibrate('wrong')
			}

			this.showAnswer = true

			// 检查是否开启自动下一题
			const settings = this.userSettings || uni.getStorageSync('app_settings')
			if (settings && settings.autoNext) {
				// 延迟1.5秒自动跳转下一题
				setTimeout(() => {
					this.nextQuestion()
				}, 1500)
			}
		},
		
		// 下一题
		nextQuestion() {
			if (this.isLastQuestion) {
				this.completePractice()
			} else {
				this.currentIndex++
				this.showAnswer = false
				this.selectedOptions = []
			}
		},
		
		// 完成练习
		completePractice() {
			this.practiceCompleted = true

			// 发送练习完成通知
			this.sendPracticeCompleteNotification()
		},

		// 发送练习完成通知
		async sendPracticeCompleteNotification() {
			try {
				const settings = this.userSettings || uni.getStorageSync('app_settings')
				if (!settings || !settings.notification) return

				const accuracy = Math.round((this.correctCount / this.questions.length) * 100)

				// 导入通知管理器
				const notificationManager = await import('@/utils/notification.js')
				await notificationManager.default.sendPracticeComplete({
					correctCount: this.correctCount,
					totalCount: this.questions.length,
					accuracy: accuracy
				})
			} catch (error) {
				console.error('发送练习完成通知失败:', error)
			}
		},
		
		// 查看错题
		reviewQuestions() {
			// 这里应该实现错题回顾功能
			uni.showToast({
				title: '错题回顾功能开发中',
				icon: 'none'
			})
		},
		
		// 重新开始
		restartPractice() {
			this.practiceStarted = false
			this.practiceCompleted = false
		}
	}
}
</script>

<style>
.practice-container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 配置模式样式 */
.header {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	justify-content: center; /* 居中显示标题 */
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

/* 模式提示卡片 */
.mode-tip-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.3);
}

.mode-icon {
	font-size: 48rpx;
	margin-right: 20rpx;
}

.mode-content {
	flex: 1;
}

.mode-title {
	color: white;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
	display: block;
}

.mode-desc {
	color: rgba(255, 255, 255, 0.9);
	font-size: 24rpx;
	line-height: 1.4;
}

.content-section {
	margin-bottom: 20rpx;
}

.info-card {
	background-color: #4A90E2;
	padding: 30rpx;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
}

.info-text {
	color: #fff;
	font-size: 28rpx;
	line-height: 1.5;
}

.section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.category-list {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -10rpx;
}

.category-item {
	width: calc(33.33% - 20rpx);
	margin: 10rpx;
	padding: 20rpx 0;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	text-align: center;
}

.category-item.active {
	background-color: #4A90E2;
}

.category-name {
	font-size: 28rpx;
	color: #333;
}

.category-item.active .category-name {
	color: #fff;
}

.difficulty-list {
	display: flex;
	flex-direction: column;
}

.difficulty-item {
	padding: 20rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	margin-bottom: 15rpx;
}

.difficulty-item.active {
	background-color: #4A90E2;
}

.difficulty-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 5rpx;
	display: block;
}

.difficulty-desc {
	font-size: 24rpx;
	color: #999;
}

.difficulty-item.active .difficulty-name,
.difficulty-item.active .difficulty-desc {
	color: #fff;
}

.button-section {
	margin-top: 40rpx;
}

.start-button {
	background-color: #4A90E2;
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 45rpx;
	padding: 25rpx 0;
}

/* 答题模式样式 */
.practice-mode {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

/* 答题模式头部 */
.practice-header {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #eee;
	position: sticky;
	top: 0;
	z-index: 100;
	justify-content: center; /* 居中显示标题 */
}

.practice-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.progress-bar-container {
	padding: 20rpx 0;
	display: flex;
	align-items: center;
}

.progress-bar-bg {
	flex: 1;
	height: 12rpx;
	background-color: #e0e0e0;
	border-radius: 6rpx;
	overflow: hidden;
	margin-right: 20rpx;
}

.progress-bar-fill {
	height: 100%;
	background-color: #4A90E2;
	border-radius: 6rpx;
	transition: width 0.3s;
}

.progress-text {
	font-size: 24rpx;
	color: #666;
	width: 80rpx;
	text-align: right;
}

.question-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.question-type {
	display: inline-block;
	background-color: #4A90E2;
	color: #fff;
	font-size: 24rpx;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
}

.question-content {
	margin-bottom: 30rpx;
}

.question-text {
	font-size: 32rpx;
	color: #333;
	line-height: 1.6;
}

.question-image-container {
	margin-top: 20rpx;
}

.question-image {
	width: 100%;
	border-radius: 8rpx;
}

.options-list {
	margin-bottom: 30rpx;
}

.option-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	margin-bottom: 15rpx;
}

.option-item.selected {
	background-color: #E3F0FF;
	border: 2rpx solid #4A90E2;
}

.option-item.correct {
	background-color: #E7F9ED;
	border: 2rpx solid #52C41A;
}

.option-item.incorrect {
	background-color: #FFF1F0;
	border: 2rpx solid #F5222D;
}

.option-label {
	width: 50rpx;
	height: 50rpx;
	line-height: 50rpx;
	text-align: center;
	background-color: #e0e0e0;
	color: #666;
	font-size: 28rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.option-item.selected .option-label {
	background-color: #4A90E2;
	color: #fff;
}

.option-item.correct .option-label {
	background-color: #52C41A;
	color: #fff;
}

.option-item.incorrect .option-label {
	background-color: #F5222D;
	color: #fff;
}

.option-text {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.answer-explanation {
	background-color: #FFFBE6;
	padding: 20rpx;
	border-radius: 12rpx;
	border-left: 8rpx solid #FAAD14;
}

.explanation-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #D48806;
	margin-bottom: 10rpx;
}

.explanation-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.5;
}

.action-buttons {
	margin-top: 20rpx;
	padding: 0 20rpx;
}

.action-button {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	text-align: center;
	border-radius: 45rpx;
	font-size: 32rpx;
	font-weight: bold;
}

.submit-button {
	background-color: #4A90E2;
	color: #fff;
}

.next-button {
	background-color: #52C41A;
	color: #fff;
}

/* 结果模态框样式 */
.result-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 999;
}

.result-card {
	width: 80%;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
}

.result-header {
	background-color: #4A90E2;
	padding: 30rpx;
	text-align: center;
}

.result-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
}

.result-content {
	padding: 30rpx;
}

.result-stats {
	display: flex;
	justify-content: space-around;
	margin-bottom: 40rpx;
}

.stat-item {
	text-align: center;
}

.stat-value {
	font-size: 48rpx;
	font-weight: bold;
	color: #4A90E2;
	display: block;
}

.stat-label {
	font-size: 24rpx;
	color: #999;
}

.result-actions {
	display: flex;
	justify-content: space-between;
}

.result-button {
	width: 45%;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	border-radius: 40rpx;
	font-size: 28rpx;
}

.review-button {
	background-color: #FAAD14;
	color: #fff;
}

.restart-button {
	background-color: #4A90E2;
	color: #fff;
}
</style>