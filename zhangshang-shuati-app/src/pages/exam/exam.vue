<template>
	<view class="exam-container">
		<!-- 配置模式 -->
		<view v-if="!examStarted" class="setup-mode">
			<view class="header">
				<text class="header-title">模拟考试</text>
			</view>
			
			<view class="content-section">
				<view class="info-card">
					<text class="info-text">选择考试科目和时长，开始模拟考试吧！</text>
				</view>
				
				<view class="section">
					<view class="section-title">选择科目</view>
					<view class="subject-list">
						<view 
							v-for="(subject, index) in subjects" 
							:key="index"
							class="subject-item"
							:class="{ active: selectedSubject === index }"
							@click="selectSubject(index)"
						>
							<text class="subject-name">{{ subject.name }}</text>
							<text class="subject-count">{{ subject.count }}题</text>
						</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">考试时长</view>
					<view class="duration-list">
						<view 
							v-for="(duration, index) in durations" 
							:key="index"
							class="duration-item"
							:class="{ active: selectedDuration === index }"
							@click="selectDuration(index)"
						>
							<text class="duration-value">{{ duration.value }}</text>
							<text class="duration-unit">{{ duration.unit }}</text>
						</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">考试说明</view>
					<view class="exam-info">
						<view class="info-item">
							<text class="info-label">题目数量：</text>
							<text class="info-value">{{ subjects[selectedSubject].count }}题</text>
						</view>
						<view class="info-item">
							<text class="info-label">考试时长：</text>
							<text class="info-value">{{ durations[selectedDuration].value }}{{ durations[selectedDuration].unit }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">试卷总分：</text>
							<text class="info-value">100分</text>
						</view>
						<view class="info-item">
							<text class="info-label">及格分数：</text>
							<text class="info-value">60分</text>
						</view>
					</view>
				</view>
				
				<view class="button-section">
					<button class="start-button" @click="startExam">开始考试</button>
				</view>
			</view>
		</view>
		
		<!-- 考试模式 -->
		<view v-else class="exam-mode">
			<!-- 顶部状态栏 -->
			<view class="exam-header">
				<view class="timer">
					<text class="timer-icon">⏱️</text>
					<text class="timer-text">{{ formatTime(remainingTime) }}</text>
				</view>
				<view class="progress">
					<text class="progress-text">{{ currentIndex + 1 }}/{{ questions.length }}</text>
				</view>
			</view>
			
			<!-- 题目卡片 -->
			<scroll-view scroll-y class="question-scroll">
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
								:class="{ 'selected': selectedOptions[currentIndex] === index }"
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
								:class="{ 'selected': isOptionSelected(index) }"
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
								:class="{ 'selected': selectedOptions[currentIndex] === 0 }"
								@click="selectOption(0)"
							>
								<text class="option-label">A</text>
								<text class="option-text">正确</text>
							</view>
							<view 
								class="option-item"
								:class="{ 'selected': selectedOptions[currentIndex] === 1 }"
								@click="selectOption(1)"
							>
								<text class="option-label">B</text>
								<text class="option-text">错误</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			
			<!-- 底部导航栏 -->
			<view class="exam-footer">
				<view class="nav-buttons">
					<button class="nav-button prev-button" @click="prevQuestion" :disabled="currentIndex === 0">上一题</button>
					<button class="nav-button next-button" @click="nextQuestion" :disabled="currentIndex === questions.length - 1">下一题</button>
				</view>
				<button class="submit-button" @click="showSubmitConfirm">交卷</button>
			</view>
			
			<!-- 答题卡 -->
			<view v-if="showAnswerCard" class="answer-card-modal">
				<view class="answer-card">
					<view class="answer-card-header">
						<text class="answer-card-title">答题卡</text>
						<text class="close-icon" @click="toggleAnswerCard">✖</text>
					</view>
					<view class="answer-card-content">
						<view 
							v-for="(question, index) in questions" 
							:key="index"
							class="answer-card-item"
							:class="{
								'answered': isQuestionAnswered(index),
								'current': index === currentIndex
							}"
							@click="goToQuestion(index)"
						>
							{{ index + 1 }}
						</view>
					</view>
					<view class="answer-card-footer">
						<view class="legend-item">
							<view class="legend-color answered"></view>
							<text class="legend-text">已答</text>
						</view>
						<view class="legend-item">
							<view class="legend-color unanswered"></view>
							<text class="legend-text">未答</text>
						</view>
						<view class="legend-item">
							<view class="legend-color current"></view>
							<text class="legend-text">当前题</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 考试结果 -->
		<view v-if="examCompleted" class="result-modal">
			<view class="result-card">
				<view class="result-header">
					<text class="result-title">考试结果</text>
				</view>
				<view class="result-content">
					<view class="score-section">
						<view class="score-circle" :class="scoreClass">
							<text class="score-value">{{ score }}</text>
							<text class="score-label">分</text>
						</view>
						<text class="score-status">{{ scoreStatus }}</text>
					</view>
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
							<text class="stat-value">{{ formatTime(usedTime) }}</text>
							<text class="stat-label">用时</text>
						</view>
					</view>
					<view class="result-actions">
						<button class="result-button review-button" @click="reviewExam">查看解析</button>
						<button class="result-button restart-button" @click="restartExam">重新开始</button>
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
			subjects: [
				{ name: '计算机基础', count: 50 },
				{ name: '数据结构', count: 40 },
				{ name: '操作系统', count: 45 },
				{ name: '计算机网络', count: 40 },
				{ name: '数据库', count: 35 }
			],
			durations: [
				{ value: 30, unit: '分钟' },
				{ value: 60, unit: '分钟' },
				{ value: 90, unit: '分钟' },
				{ value: 120, unit: '分钟' }
			],
			selectedSubject: 0,
			selectedDuration: 1,
			
			// 考试状态
			examStarted: false,
			examCompleted: false,
			currentIndex: 0,
			questions: [],
			selectedOptions: [], // 存储所有题目的答案
			multipleAnswers: {}, // 存储多选题的答案 {questionIndex: [selectedOptions]}
			
			// 计时器
			timer: null,
			startTime: 0,
			usedTime: 0,
			remainingTime: 0,
			
			// 答题卡
			showAnswerCard: false,
			
			// 选项标签
			optionLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
			
			// 考试结果
			score: 0,
			correctCount: 0,

			// 用户设置
			userSettings: null
		}
	},
	computed: {
		currentQuestion() {
			return this.questions[this.currentIndex] || {}
		},
		totalTime() {
			return this.durations[this.selectedDuration].value * 60
		},
		scoreClass() {
			if (this.score >= 90) return 'excellent'
			if (this.score >= 80) return 'good'
			if (this.score >= 60) return 'pass'
			return 'fail'
		},
		scoreStatus() {
			if (this.score >= 90) return '优秀'
			if (this.score >= 80) return '良好'
			if (this.score >= 60) return '及格'
			return '不及格'
		}
	},
	onLoad() {
		// 加载用户设置
		this.loadUserSettings()
	},
	methods: {
		// 加载用户设置
		loadUserSettings() {
			try {
				const settings = uni.getStorageSync('app_settings')
				if (settings) {
					this.userSettings = settings
					console.log('考试页面 - 用户设置已加载:', settings)
				}
			} catch (error) {
				console.error('加载用户设置失败:', error)
			}
		},

		// 播放音效
		playSound(type) {
			try {
				if (!this.userSettings || !this.userSettings.sound) return

				if (type === 'submit') {
					uni.showToast({
						title: '✓ 试卷已提交',
						icon: 'none',
						duration: 1000
					})
				}
			} catch (error) {
				console.error('播放音效失败:', error)
			}
		},

		// 震动反馈
		vibrate(type) {
			try {
				if (!this.userSettings || !this.userSettings.vibration) return

				if (type === 'submit') {
					uni.vibrateShort({
						type: 'medium'
					})
				}
			} catch (error) {
				console.error('震动反馈失败:', error)
			}
		},
		selectSubject(index) {
			this.selectedSubject = index
		},
		selectDuration(index) {
			this.selectedDuration = index
		},
		
		// 开始考试
		async startExam() {
			try {
				uni.showLoading({
					title: '正在生成试卷...'
				})
				
				// 模拟加载题目数据
				await this.loadExamQuestions()
				
				this.examStarted = true
				this.examCompleted = false
				this.currentIndex = 0
				this.selectedOptions = new Array(this.questions.length).fill(null)
				this.multipleAnswers = {}
				this.score = 0
				this.correctCount = 0
				
				// 初始化计时器
				this.startTime = Date.now()
				this.remainingTime = this.totalTime
				this.startTimer()
				
				uni.hideLoading()
			} catch (error) {
				uni.hideLoading()
				uni.showToast({
					title: '加载试题失败',
					icon: 'none'
				})
			}
		},
		
		// 模拟加载考试题目
		async loadExamQuestions() {
			// 这里应该调用API获取题目，现在使用模拟数据
			return new Promise((resolve) => {
				setTimeout(() => {
					this.questions = this.generateMockExamQuestions()
					resolve()
				}, 1000)
			})
		},
		
		// 生成模拟考试题目
		generateMockExamQuestions() {
			const questions = []
			const types = ['single', 'multiple', 'boolean']
			const subject = this.subjects[this.selectedSubject].name
			const count = this.subjects[this.selectedSubject].count
			
			for (let i = 0; i < count; i++) {
				const type = types[Math.floor(Math.random() * types.length)]
				
				if (type === 'single') {
					questions.push({
						id: i + 1,
						type: 'single',
						content: `${subject}单选题：这是第${i + 1}道${subject}考试题，请选择正确答案。`,
						options: ['选项A', '选项B', '选项C', '选项D'],
						answer: Math.floor(Math.random() * 4),
						explanation: `这是第${i + 1}道题的详细解析，解释了为什么这个答案是正确的。`,
						score: 2
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
						content: `${subject}多选题：这是第${i + 1}道${subject}考试题，请选择所有正确答案。`,
						options: ['选项A', '选项B', '选项C', '选项D'],
						answer: answers,
						explanation: `这是第${i + 1}道题的详细解析，解释了为什么这些答案是正确的。`,
						score: 4
					})
				} else {
					questions.push({
						id: i + 1,
						type: 'boolean',
						content: `${subject}判断题：这是第${i + 1}道${subject}考试题，请判断正误。`,
						answer: Math.random() > 0.5,
						explanation: `这是第${i + 1}道题的详细解析，解释了为什么这个判断是正确或错误的。`,
						score: 2
					})
				}
			}
			
			return questions
		},
		
		// 开始计时器
		startTimer() {
			this.timer = setInterval(() => {
				const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
				this.usedTime = elapsed
				this.remainingTime = Math.max(0, this.totalTime - elapsed)
				
				// 时间到自动交卷
				if (this.remainingTime <= 0) {
					this.submitExam()
				}
			}, 1000)
		},
		
		// 格式化时间
		formatTime(seconds) {
			const hours = Math.floor(seconds / 3600)
			const minutes = Math.floor((seconds % 3600) / 60)
			const secs = seconds % 60
			
			return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
		},
		
		// 选择单选或判断题选项
		selectOption(index) {
			this.selectedOptions[this.currentIndex] = index
		},
		
		// 选择多选题选项
		selectMultipleOption(index) {
			if (!this.multipleAnswers[this.currentIndex]) {
				this.multipleAnswers[this.currentIndex] = []
			}
			
			const position = this.multipleAnswers[this.currentIndex].indexOf(index)
			if (position > -1) {
				this.multipleAnswers[this.currentIndex].splice(position, 1)
			} else {
				this.multipleAnswers[this.currentIndex].push(index)
			}
		},
		
		// 检查多选题选项是否被选中
		isOptionSelected(index) {
			if (!this.multipleAnswers[this.currentIndex]) {
				return false
			}
			return this.multipleAnswers[this.currentIndex].includes(index)
		},
		
		// 上一题
		prevQuestion() {
			if (this.currentIndex > 0) {
				this.currentIndex--
			}
		},
		
		// 下一题
		nextQuestion() {
			if (this.currentIndex < this.questions.length - 1) {
				this.currentIndex++
			}
		},
		
		// 跳转到指定题目
		goToQuestion(index) {
			this.currentIndex = index
			this.showAnswerCard = false
		},
		
		// 切换答题卡显示
		toggleAnswerCard() {
			this.showAnswerCard = !this.showAnswerCard
		},
		
		// 检查题目是否已答
		isQuestionAnswered(index) {
			if (this.questions[index].type === 'multiple') {
				return this.multipleAnswers[index] && this.multipleAnswers[index].length > 0
			} else {
				return this.selectedOptions[index] !== null && this.selectedOptions[index] !== undefined
			}
		},
		
		// 显示交卷确认
		showSubmitConfirm() {
			uni.showModal({
				title: '确认交卷',
				content: '确定要交卷吗？',
				success: (res) => {
					if (res.confirm) {
						this.submitExam()
					}
				}
			})
		},
		
		// 交卷
		submitExam() {
			clearInterval(this.timer)

			// 计算得分
			this.calculateScore()

			// 播放提交音效和震动
			this.playSound('submit')
			this.vibrate('submit')

			// 发送考试完成通知
			this.sendExamCompleteNotification()

			this.examCompleted = true
		},

		// 发送考试完成通知
		async sendExamCompleteNotification() {
			try {
				if (!this.userSettings || !this.userSettings.notification) return

				const status = this.score >= 60 ? '及格' : '不及格'

				// 导入通知管理器
				const notificationManager = await import('@/utils/notification.js')
				await notificationManager.default.sendExamComplete({
					score: this.score,
					status: status
				})
			} catch (error) {
				console.error('发送考试完成通知失败:', error)
			}
		},
		
		// 计算得分
		calculateScore() {
			let totalScore = 0
			let correctCount = 0
			
			this.questions.forEach((question, index) => {
				let isCorrect = false
				
				if (question.type === 'single' || question.type === 'boolean') {
					if (this.selectedOptions[index] !== null && this.selectedOptions[index] !== undefined) {
						if (question.type === 'boolean') {
							// 判断题: 0表示"正确"，1表示"错误"
							const selectedValue = this.selectedOptions[index] === 0
							isCorrect = selectedValue === question.answer
						} else {
							isCorrect = this.selectedOptions[index] === question.answer
						}
					}
				} else if (question.type === 'multiple') {
					const selectedAnswers = this.multipleAnswers[index] || []
					
					if (selectedAnswers.length === question.answer.length) {
						isCorrect = question.answer.every(ans => selectedAnswers.includes(ans)) &&
							selectedAnswers.every(sel => question.answer.includes(sel))
					}
				}
				
				if (isCorrect) {
					totalScore += question.score
					correctCount++
				}
			})
			
			this.score = totalScore
			this.correctCount = correctCount
		},
		
		// 查看解析
		reviewExam() {
			uni.showToast({
				title: '解析功能开发中',
				icon: 'none'
			})
		},
		
		// 重新开始
		restartExam() {
			this.examStarted = false
			this.examCompleted = false
		}
	},
	// 组件销毁时清除计时器
	beforeDestroy() {
		if (this.timer) {
			clearInterval(this.timer)
		}
	}
}
</script>

<style>
.exam-container {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	width: 100%;
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

.subject-list {
	display: flex;
	flex-direction: column;
}

.subject-item {
	display: flex;
	justify-content: space-between;
	padding: 20rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	margin-bottom: 15rpx;
}

.subject-item.active {
	background-color: #4A90E2;
}

.subject-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.subject-count {
	font-size: 24rpx;
	color: #999;
}

.subject-item.active .subject-name,
.subject-item.active .subject-count {
	color: #fff;
}

.duration-list {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -10rpx;
}

.duration-item {
	width: calc(25% - 20rpx);
	margin: 10rpx;
	padding: 20rpx 0;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	text-align: center;
}

.duration-item.active {
	background-color: #4A90E2;
}

.duration-value {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
}

.duration-unit {
	font-size: 24rpx;
	color: #999;
}

.duration-item.active .duration-value,
.duration-item.active .duration-unit {
	color: #fff;
}

.exam-info {
	background-color: #f9f9f9;
	border-radius: 12rpx;
	padding: 20rpx;
}

.info-item {
	display: flex;
	margin-bottom: 15rpx;
}

.info-item:last-child {
	margin-bottom: 0;
}

.info-label {
	font-size: 26rpx;
	color: #666;
	width: 150rpx;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	font-weight: bold;
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
</style>