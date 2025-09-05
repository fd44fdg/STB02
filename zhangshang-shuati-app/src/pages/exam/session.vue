<template>
  <view class="exam-session-container">
    <!-- 自定义头部：返回 + 标题 + 计时器 -->
    <HeaderBar :title="pageTitle || '模拟考试'" @back="handleExit" :sticky="true">
      <template #right>
        <view class="timer">
          <text class="timer-icon">⏱️</text>
          <text class="timer-text">{{ formatTime(remainingTime) }}</text>
        </view>
      </template>
    </HeaderBar>
    <!-- 进度条 -->
    <view class="progress-bar-container" v-if="questions.length">
      <view class="progress-bar-bg">
        <view class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></view>
      </view>
      <view class="progress-text">{{ currentIndex + 1 }}/{{ questions.length }}</view>
    </view>

    <!-- 题目内容 -->
    <scroll-view scroll-y class="question-scroll" v-if="currentQuestion">
      <view class="question-card">
        <view class="question-type">{{ questionTypeText }}</view>
        <view class="question-content">
          <text class="question-text">{{ currentQuestion.content || currentQuestion.title }}</text>
          <view v-if="currentQuestion.image" class="question-image-container">
            <image class="question-image" :src="currentQuestion.image" mode="widthFix"></image>
          </view>
        </view>

        <!-- 选项列表 -->
        <view class="options-list">
          <!-- 单选题 -->
          <view v-if="currentQuestion.type === 'single'" class="single-choice">
            <view v-for="(option, index) in currentQuestion.options" :key="index" class="option-item" :class="{ 'selected': selectedOptions[currentIndex] === index }" @click="selectOption(index)">
              <text class="option-label">{{ optionLabels[index] }}</text>
              <text class="option-text">{{ option }}</text>
            </view>
          </view>
          <!-- 多选题 -->
          <view v-else-if="currentQuestion.type === 'multiple'" class="multiple-choice">
            <view v-for="(option, index) in currentQuestion.options" :key="index" class="option-item" :class="{ 'selected': isOptionSelected(index) }" @click="selectMultipleOption(index)">
              <text class="option-label">{{ optionLabels[index] }}</text>
              <text class="option-text">{{ option }}</text>
            </view>
          </view>
          <!-- 判断题 -->
          <view v-else-if="currentQuestion.type === 'boolean'" class="boolean-choice">
            <view class="option-item" :class="{ 'selected': selectedOptions[currentIndex] === 0 }" @click="selectOption(0)">
              <text class="option-label">A</text>
              <text class="option-text">正确</text>
            </view>
            <view class="option-item" :class="{ 'selected': selectedOptions[currentIndex] === 1 }" @click="selectOption(1)">
              <text class="option-label">B</text>
              <text class="option-text">错误</text>
            </view>
          </view>
        </view>

        <!-- 解析（交卷后显示） -->
        <view v-if="examCompleted" class="answer-explanation">
          <view class="explanation-title">答案解析</view>
          <view class="explanation-content">{{ currentQuestion.explanation }}</view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作条 -->
    <view class="exam-footer" v-if="questions.length">
      <view class="nav-buttons">
        <button class="nav-button prev-button" @click="prevQuestion" :disabled="currentIndex === 0">上一题</button>
        <button class="nav-button next-button" @click="nextQuestion" :disabled="currentIndex === questions.length - 1">下一题</button>
      </view>
      <button class="submit-button" @click="showSubmitConfirm" :disabled="examCompleted">{{ examCompleted ? '已交卷' : (mode === 'practice' ? '完成练习' : '交卷') }}</button>
    </view>

    <!-- 浮动解析按钮：交卷后且不在结果/解析弹层时显示 -->
    <view v-if="examCompleted && !showReview && !showResultModal" class="floating-review-btn" @click="openReview">解析/答题卡</view>

    <!-- 考试结果 -->
    <view v-if="examCompleted && showResultModal" class="result-modal">
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
            <button class="result-button review-button" @click="toggleReview">查看解析</button>
            <button class="result-button restart-button" @click="restartExam">重新开始</button>
          </view>
          <view class="result-actions" style="margin-top: 16rpx;">
            <button class="result-button" style="background-color:#e0e0e0;color:#333;" @click="exitSession">返回</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 解析/答题卡弹窗 -->
    <view v-if="showReview" class="review-modal">
      <view class="review-card">
        <view class="review-header">
          <text class="review-title">试卷解析/答题卡</text>
          <text class="close-icon" @click="closeReview">✖</text>
        </view>
        <view class="review-mode-tabs">
          <view class="mode-tab" :class="{active: reviewMode==='card'}" @click="reviewMode='card'">答题卡</view>
          <view class="mode-tab" :class="{active: reviewMode==='analysis'}" @click="reviewMode='analysis'">解析</view>
        </view>

        <view class="review-filters" v-if="reviewMode==='card'">
          <view class="filter-tabs">
            <view class="filter-tab" :class="{active: activeFilter === 'all'}" @click="activeFilter='all'">全部</view>
            <view class="filter-tab" :class="{active: activeFilter === 'wrong'}" @click="activeFilter='wrong'">错题</view>
            <view class="filter-tab" :class="{active: activeFilter === 'unanswered'}" @click="activeFilter='unanswered'">未答</view>
            <view class="filter-tab" :class="{active: activeFilter === 'correct'}" @click="activeFilter='correct'">正确</view>
          </view>
        </view>

        <scroll-view class="review-content" scroll-y scroll-with-animation>
          <view v-if="reviewMode==='card'">
            <view class="grid">
              <view 
                v-for="idx in filteredIndexes" 
                :key="idx" 
                class="grid-item"
                :class="getStatusClass(idx)"
                @click="jumpToQuestion(idx)"
              >
                {{ idx + 1 }}
              </view>
            </view>
            <view class="review-tips">点击题号可跳转到对应题目；颜色：绿色=正确，红色=错误，灰色=未答，蓝框=当前题。</view>
          </view>

          <view v-else class="analysis-content">
            <view class="analysis-header">第 {{ currentIndex+1 }} 题 / 共 {{ questions.length }} 题</view>
            <view class="analysis-question">{{ (currentQuestion && (currentQuestion.content || currentQuestion.title)) || '' }}</view>
            <view class="analysis-options">
              <view v-for="(opt,i) in (currentQuestion && currentQuestion.options) || []" :key="i" class="review-option" :class="{correct: isCorrectOption(currentQuestion,i), chosen: isChosen(currentIndex, i)}">
                <text class="opt-label">{{ optionLabels[i] || i }}</text>
                <text class="opt-text">{{ opt }}</text>
              </view>
            </view>
            <view class="analysis-explain" v-if="examCompleted && currentQuestion && currentQuestion.explanation">
              <text class="explain-title">答案解析</text>
              <text class="explain-text">{{ currentQuestion.explanation }}</text>
            </view>
            <view class="analysis-explain" v-else>
              <text class="explain-text muted">交卷后可查看解析</text>
            </view>
            <view class="analysis-actions">
              <button class="analysis-btn" @click="goToQuestion(currentIndex-1)" :disabled="currentIndex===0">上一题</button>
              <button class="analysis-btn" @click="goToQuestion(currentIndex+1)" :disabled="currentIndex===questions.length-1">下一题</button>
              <button class="analysis-btn secondary" @click="reviewMode='card'">返回答题卡</button>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue';
export default {
  components: { HeaderBar },
  data() {
    return {
      activeFilter: 'all',
      reviewMode: 'card',
      pageTitle: '模拟考试',
      selectedSubjectIndex: 0,
      selectedDurationIndex: 1,
      selectedDifficultyIndex: 1,
      questionCount: 50,
      mode: 'exam',
      questions: [],
      currentIndex: 0,
      selectedOptions: [],
      multipleAnswers: Object.create(null),
      examCompleted: false,
      score: 0,
      correctCount: 0,
      usedTime: 0,
      remainingTime: 0,
      timer: null,
      startTime: 0,
      showReview: false,
      showResultModal: true,
      optionLabels: ['A','B','C','D','E','F','G','H'],
      categoryId: null,
      categoryName: ''
    }
  },
  computed: {
    filteredIndexes() {
      if (!this.questions || this.questions.length === 0) return []
      const res = []
      for (let i = 0; i < this.questions.length; i++) {
        const q = this.questions[i]
        const status = this.getQuestionStatus(i, q)
        if (this.activeFilter === 'all' || this.activeFilter === status) res.push(i)
      }
      return res
    },
    currentQuestion() { return this.questions[this.currentIndex] || null },
    progressPercentage() {
      if (!this.questions.length) return 0
      return Math.min(100, ((this.currentIndex + 1) / this.questions.length) * 100)
    },
    totalTime() {
      const durations = [30,60,90,120]
      const m = durations[this.selectedDurationIndex] || 60
      return m * 60
    },
    questionTypeText() {
      const q = this.currentQuestion; if (!q) return ''
      return q.type === 'single' ? '单选题' : q.type === 'multiple' ? '多选题' : '判断题'
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
    let cfg = null;
    try { 
        cfg = uni.getStorageSync('examSessionConfig') || {}; 
        if (cfg) uni.removeStorageSync('examSessionConfig');
    } catch(e) {
        cfg = {};
    }

    this.pageTitle = cfg.pageTitle || '模拟考试';
    this.mode = cfg.mode || 'exam';
    // 读取分类（从 practice 或 favorites 注入）
    this.categoryId = (cfg.config && cfg.config.category) || cfg.categoryId || null;
    const categoryMap = {
      'computer-basics': '计算机基础',
      'data-structures': '数据结构',
      'computer-networks': '计算机网络',
      'operating-system': '操作系统',
      'database-systems': '数据库系统',
      'software-engineering': '软件工程'
    };
    this.categoryName = categoryMap[this.categoryId] || cfg.categoryName || '';
    if (!this.categoryName && this.pageTitle && this.pageTitle.includes('收藏练习')) {
      this.categoryName = '收藏集';
    }
    uni.setNavigationBarTitle({ title: this.pageTitle });

    if (cfg.questions && cfg.questions.length > 0) {
        this.initFromQuestions(cfg.questions);
    } else {
        this.selectedSubjectIndex = (cfg.selectedSubjectIndex !== undefined && cfg.selectedSubjectIndex !== null) ? Number(cfg.selectedSubjectIndex) : 0;
        if (this.mode === 'practice') {
            this.selectedDifficultyIndex = (cfg.selectedDifficultyIndex !== undefined && cfg.selectedDifficultyIndex !== null) ? Number(cfg.selectedDifficultyIndex) : 1;
            this.questionCount = (cfg.questionCount !== undefined && cfg.questionCount !== null) ? Number(cfg.questionCount) : 20;
            this.selectedDurationIndex = 3; // 120 minutes
        } else { // exam mode
            this.selectedDurationIndex = (cfg.selectedDurationIndex !== undefined && cfg.selectedDurationIndex !== null) ? Number(cfg.selectedDurationIndex) : 1;
        }
        this.initQuestions();
    }
  },
  methods: {
    initFromQuestions(questions) {
        this.questions = questions;
        this.selectedOptions = new Array(this.questions.length).fill(null);
        this.multipleAnswers = Object.create(null);
        this.startTime = Date.now();
        this.remainingTime = 3600; // 默认1小时
        this.startTimer();
    },
    handleExit() {
      if (!this.examCompleted && this.questions.length) {
        uni.showModal({
          title: '退出',
          content: `确定要退出当前${this.mode === 'practice' ? '练习' : '考试'}吗？进度将丢失。`,
          success: (res) => {
            if (res.confirm) this.goBack()
          }
        })
      } else {
        this.goBack()
      }
    },
    goBack() {
      if (this.timer) clearInterval(this.timer);
      uni.navigateBack({ delta: 1 });
    },
    exitSession() { this.goBack() },
    async initQuestions() {
      uni.showLoading({ title: '正在生成题目...' })
      try {
        await new Promise(r => setTimeout(r, 300))
        this.questions = this.generateMockExamQuestions()
        this.selectedOptions = new Array(this.questions.length).fill(null)
        this.multipleAnswers = Object.create(null)
        this.startTime = Date.now()
        this.remainingTime = this.totalTime
        this.startTimer()
      } finally {
        uni.hideLoading()
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        this.usedTime = elapsed
        this.remainingTime = Math.max(0, this.totalTime - elapsed)
        if (this.remainingTime <= 0) this.submitExam()
      }, 1000)
    },
    formatTime(seconds) {
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    },
    selectOption(index) { if (this.examCompleted) return; this.$set(this.selectedOptions, this.currentIndex, index) },
    selectMultipleOption(index) {
      if (this.examCompleted) return;
      if (!Array.isArray(this.multipleAnswers[this.currentIndex])) this.$set(this.multipleAnswers, this.currentIndex, [])
      const arr = this.multipleAnswers[this.currentIndex]
      const p = arr.indexOf(index)
      if (p > -1) {
        arr.splice(p, 1)
      } else {
        arr.push(index)
      }
    },
    isOptionSelected(index) {
      const arr = this.multipleAnswers[this.currentIndex]
      return Array.isArray(arr) && arr.includes(index)
    },
    prevQuestion() { if (this.currentIndex > 0) this.currentIndex-- },
    nextQuestion() { if (this.currentIndex < this.questions.length - 1) this.currentIndex++ },
    goToQuestion(idx) { if (idx>=0 && idx<this.questions.length) this.currentIndex = idx },

    showSubmitConfirm() {
      this.$forceUpdate()
      this.$nextTick(() => {
        uni.showModal({
          title: `确认${this.mode === 'practice' ? '完成练习' : '交卷'}`,
          content: `确定要${this.mode === 'practice' ? '完成本次练习' : '提交试卷'}吗？`,
          success: (res) => { if (res.confirm) this.submitExam() }
        })
      })
    },
    submitExam() {
      if (this.timer) clearInterval(this.timer)
      this.calculateScore()
      this.examCompleted = true
    },
    calculateScore() {
      let total = 0, correct = 0
      this.questions.forEach((q, idx) => {
        let ok = false
        if (q.type === 'single' || q.type === 'boolean') {
          const sel = this.selectedOptions[idx]
          if (sel != null) {
            if (q.type === 'boolean') ok = (sel === 0) === q.answer
            else ok = sel === q.answer
          }
        } else if (q.type === 'multiple') {
          const selArr = this.multipleAnswers[idx] || []
          ok = selArr.length === q.answer.length && q.answer.every(a => selArr.includes(a)) && selArr.every(s => q.answer.includes(s))
        }
        if (ok) { total += (q.score || 2); correct++ }
      })
      this.score = total
      this.correctCount = correct
    },
    toggleReview() {
      this.showReview = !this.showReview
      if (this.examCompleted) {
        this.showResultModal = !this.showReview
      }
    },
    openReview(){
      this.showReview = true
      if (this.examCompleted) this.showResultModal = false
    },
    getQuestionStatus(idx, q){
      const qn = q || this.questions[idx]
      if (!qn) return 'unanswered'
      if (qn.type === 'multiple'){
        const selArr = this.multipleAnswers[idx]
        if (!Array.isArray(selArr) || selArr.length === 0) return 'unanswered'
        const ok = selArr.length === qn.answer.length && qn.answer.every(a=>selArr.includes(a)) && selArr.every(s=>qn.answer.includes(s))
        return ok ? 'correct' : 'wrong'
      } else {
        const sel = this.selectedOptions[idx]
        if (sel == null) return 'unanswered'
        const ok = qn.type === 'boolean' ? (sel === 0) === qn.answer : sel === qn.answer
        return ok ? 'correct' : 'wrong'
      }
    },
    getStatusClass(idx){
      const status = this.getQuestionStatus(idx)
      return {
        correct: status === 'correct',
        wrong: status === 'wrong',
        unanswered: status === 'unanswered',
        current: idx === this.currentIndex
      }
    },
    jumpToQuestion(idx){
      this.currentIndex = idx
      this.closeReview()
    },
    closeReview(){
      this.showReview = false
      if (this.examCompleted) this.showResultModal = false
    },
    isCorrectOption(q, i) { return Array.isArray(q.answer) ? q.answer.includes(i) : q.answer === i },
    isChosen(idx, i) {
      const sel = this.selectedOptions[idx]
      if (sel == null) return false
      if (Array.isArray(this.multipleAnswers[idx])) return this.multipleAnswers[idx].includes(i)
      return sel === i
    },
    restartExam() {
      this.examCompleted = false
      this.currentIndex = 0
      this.selectedOptions = new Array(this.questions.length).fill(null)
      this.multipleAnswers = Object.create(null)
      this.startTime = Date.now()
      this.usedTime = 0
      this.remainingTime = this.totalTime
      if (this.timer) clearInterval(this.timer)
      this.startTimer()
    },
    generateMockExamQuestions() {
      const questions = []
      const types = ['single', 'multiple', 'boolean']
      const difficulties = ['简单', '中等', '困难']
      const subject = this.categoryName || ['计算机基础','数据结构','操作系统','计算机网络','数据库'][this.selectedSubjectIndex] || '综合'
      const difficulty = difficulties[this.selectedDifficultyIndex] || '中等'
      const count = this.mode === 'practice' ? this.questionCount : ([50, 40, 45, 40, 35][this.selectedSubjectIndex] || 50)

      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)]
        if (type === 'single') {
          questions.push({ id: i + 1, type: 'single', content: `${subject}单选题（${difficulty}）：这是第${i + 1}道练习题，请选择正确答案。`, options: ['选项A', '选项B', '选项C', '选项D'], answer: Math.floor(Math.random() * 4), explanation: `这是第${i + 1}道题的详细解析。`, score: 2 })
        } else if (type === 'multiple') {
          const answerCount = Math.floor(Math.random() * 3) + 1
          const ans = []; while (ans.length < answerCount) { const n = Math.floor(Math.random() * 4); if (!ans.includes(n)) ans.push(n) }
          questions.push({ id: i + 1, type: 'multiple', content: `${subject}多选题（${difficulty}）：这是第${i + 1}道练习题，请选择所有正确答案。`, options: ['选项A', '选项B', '选项C', '选项D'], answer: ans, explanation: `这是第${i + 1}道题的详细解析。`, score: 4 })
        } else {
          questions.push({ id: i + 1, type: 'boolean', content: `${subject}判断题（${difficulty}）：这是第${i + 1}道练习题，请判断正误。`, answer: Math.random() > 0.5, explanation: `这是第${i + 1}道题的详细解析。`, score: 2 })
        }
      }
      return questions
    }
  },
  beforeDestroy() { if (this.timer) clearInterval(this.timer) }
}
</script>

<style>
.exam-session-container { background-color: var(--bg-color, #f5f5f5); min-height: 100vh; padding-bottom: 160rpx; }
.session-header { display:flex; align-items:center; padding: 20rpx 30rpx; background-color: var(--card-bg,#fff); box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05); position: sticky; top:0; z-index: 100; }
.back-button { width: 60rpx; height: 60rpx; display:flex; align-items:center; justify-content:center; background-color:#f0f0f0; border-radius: 50%; margin-right: 20rpx; }
.back-icon { font-size: 34rpx; color:#333; }
.session-title { font-size: 32rpx; font-weight: bold; color: #333; }
.timer { margin-left: auto; display:flex; align-items:center; gap: 8rpx; }
.timer-icon { font-size: 28rpx; color: var(--text-secondary,#666); }
.timer-text { font-size: 28rpx; color: var(--text-primary,#333); }

.progress-bar-container { padding: 20rpx 30rpx; display:flex; align-items:center; }
.progress-bar-bg { flex:1; height: 12rpx; background-color: var(--muted-border, #e0e0e0); border-radius: 6rpx; overflow:hidden; margin-right: 20rpx; }
.progress-bar-fill { height: 100%; background-color: var(--accent, #4A90E2); border-radius: 6rpx; transition: width .3s; }
.progress-text { width: 80rpx; text-align:right; font-size: 24rpx; color: var(--text-secondary,#666); }

.question-scroll { max-height: calc(100vh - 260rpx); box-sizing: border-box; padding-right: 20rpx; }
.question-card { background-color: var(--card-bg, #fff); border-radius: 16rpx; margin: 30rpx; padding: 30rpx; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05); }
.question-type { display:inline-block; background-color: var(--accent, #4A90E2); color:#fff; font-size:24rpx; padding:8rpx 16rpx; border-radius: 20rpx; margin-bottom: 20rpx; }
.question-content { margin-bottom: 30rpx; }
.question-text { font-size: 32rpx; color: var(--text-primary,#333); line-height: 1.6; }
.question-image-container { margin-top: 20rpx; }
.question-image { width: 100%; border-radius: 8rpx; }

.options-list { margin-bottom: 30rpx; }
.option-item { display:flex; align-items:center; padding:20rpx; background-color: var(--card-bg-2,#f9f9f9); border-radius: 12rpx; margin-bottom: 15rpx; transition: background-color .12s ease, border-color .12s ease; -webkit-tap-highlight-color: rgba(0,0,0,0); }
.option-item.selected { background-color: rgba(74,144,226,.08); border: 2rpx solid var(--accent,#4A90E2); transform: translateZ(0); }
.option-label { width: 50rpx; height: 50rpx; line-height:50rpx; text-align:center; background-color: var(--muted-border,#e0e0e0); color: var(--text-secondary,#666); font-size: 28rpx; border-radius: 50%; margin-right: 20rpx; }
.option-item.selected .option-label { background-color: var(--accent,#4A90E2); color: #fff; }
.option-text { font-size: 28rpx; color: var(--text-primary,#333); flex: 1; }

.answer-explanation { background-color: #FFFBE6; padding: 20rpx; border-radius: 12rpx; border-left: 8rpx solid #FAAD14; }
.explanation-title { font-size: 28rpx; font-weight: bold; color: #D48806; margin-bottom: 10rpx; }
.explanation-content { font-size: 26rpx; color: var(--text-secondary,#666); line-height: 1.5; }

.exam-footer { position: fixed; bottom: 0; left:0; right:0; background-color: #fff; border-top: 1rpx solid #eee; padding: 16rpx 20rpx calc(16rpx + constant(safe-area-inset-bottom)); padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); box-shadow: 0 -2rpx 10rpx rgba(0,0,0,.05); z-index: 90; }
.nav-buttons { display:flex; gap: 12rpx; }
.nav-button { flex:1; background-color: var(--card-bg-2,#f9f9f9); color: var(--text-primary,#333); border-radius: 40rpx; }
.submit-button { width: 100%; margin-top: 12rpx; background-color: var(--accent,#4A90E2); color:#fff; border-radius: 40rpx; }

.result-modal { position: fixed; inset: 0; background: rgba(0,0,0,.6); display:flex; justify-content:center; align-items:center; z-index: 999; }
.result-card { width: 80%; background-color: var(--card-bg,#fff); border-radius: 16rpx; overflow: hidden; }
.result-header { background-color: #4A90E2; padding: 30rpx; text-align: center; }
.result-title { font-size: 36rpx; font-weight: bold; color:#fff; }
.result-content { padding: 30rpx; }
.score-section { display:flex; align-items:center; gap: 24rpx; justify-content:center; margin-bottom: 20rpx; }
.score-circle { width: 140rpx; height: 140rpx; border-radius: 70rpx; display:flex; align-items:center; justify-content:center; color:#fff; background:#4A90E2; }
.score-circle.excellent { background: #10B981; }
.score-circle.good { background: #3B82F6; }
.score-circle.pass { background: #F59E0B; }
.score-circle.fail { background: #EF4444; }
.score-value { font-size: 44rpx; font-weight: bold; }
.score-label { font-size: 24rpx; margin-left: 4rpx; }
.score-status { font-size: 28rpx; color: var(--text-primary,#333); }
.result-stats { display:flex; justify-content: space-around; margin: 20rpx 0 40rpx; }
.stat-item { text-align:center; }
.stat-value { font-size: 40rpx; font-weight:bold; color: var(--accent,#4A90E2); display:block; }
.stat-label { font-size: 24rpx; color: #999; }
.result-actions { display:flex; justify-content: space-between; }
.result-button { width: 45%; height: 80rpx; line-height: 80rpx; text-align:center; border-radius: 40rpx; font-size: 28rpx; }
.review-button { background-color: #FAAD14; color:#fff; }
.restart-button { background-color: #4A90E2; color:#fff; }

/* 浮动解析按钮 */
.floating-review-btn{ position: fixed; right: 24rpx; bottom: calc(120rpx + env(safe-area-inset-bottom)); background: rgba(74,144,226,.95); color:#fff; padding: 20rpx 28rpx; border-radius: 40rpx; box-shadow: 0 8rpx 20rpx rgba(0,0,0,.15); z-index: 95; font-size: 28rpx; }

.review-modal{ position:fixed; inset:0; background: rgba(0,0,0,.55); z-index:1000; display:flex; align-items:center; justify-content:center; }
.review-card{ width:92%; max-width:1000rpx; background: var(--card-bg,#fff); color: var(--text-primary,#333); border-radius: 16rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,.15); display:flex; flex-direction:column; max-height: 80vh; overflow:hidden; }
.review-header{ display:flex; justify-content:space-between; align-items:center; padding:20rpx; border-bottom: 1rpx solid #eee; }
.review-mode-tabs{ display:flex; gap: 12rpx; padding: 16rpx 20rpx 0; }
.mode-tab{ flex:1; text-align:center; padding: 16rpx 0; background: var(--card-bg-2,#f5f5f5); border-radius: 12rpx; color: var(--text-secondary,#666); font-size: 28rpx; }
.mode-tab.active{ background: rgba(74,144,226,.1); color: var(--accent,#4A90E2); border: 2rpx solid var(--accent,#4A90E2); }
.review-filters{ padding: 12rpx 20rpx; }
.filter-tabs{ display:flex; gap: 12rpx; }
.filter-tab{ flex:1; text-align:center; padding: 16rpx 0; background: var(--card-bg-2,#f5f5f5); border-radius: 12rpx; color: var(--text-secondary,#666); font-size: 26rpx; }
.filter-tab.active{ background: rgba(74,144,226,.1); color: var(--accent,#4A90E2); border: 2rpx solid var(--accent,#4A90E2); }
.review-content{ padding: 0 20rpx 20rpx; box-sizing: border-box; }
.grid{ display:grid; grid-template-columns: repeat(6, 1fr); gap: 12rpx; padding-right: 12rpx; }
.grid-item{ display:flex; align-items:center; justify-content:center; height: 80rpx; border-radius: 12rpx; background: var(--card-bg-2,#f9f9f9); color: var(--text-primary,#333); box-sizing: border-box; }
.grid-item.correct{ background: #E7F9ED; border: 2rpx solid #34C759; }
.grid-item.wrong{ background: #FFF1F0; border: 2rpx solid #F5222D; }
.grid-item.unanswered{ background: #f0f0f0; color: #888; }
.grid-item.current{ box-shadow: 0 0 0 2rpx var(--accent,#4A90E2) inset; }
.review-tips{ margin-top: 16rpx; font-size: 24rpx; color: var(--text-secondary,#666); text-align: center; }
.analysis-content{ padding: 12rpx 20rpx 24rpx; }
.analysis-header{ font-size: 28rpx; color: var(--text-secondary,#666); margin-bottom: 12rpx; }
.analysis-question{ font-size: 30rpx; color: var(--text-primary,#333); line-height: 1.6; margin-bottom: 12rpx; }
.analysis-options{ margin: 8rpx 0 12rpx; }
.analysis-explain{ background: #FFFBE6; border-left: 8rpx solid #FAAD14; padding: 16rpx; border-radius: 12rpx; }
.explain-title{ font-weight: bold; color: #D48806; margin-bottom: 8rpx; }
.explain-text{ color: var(--text-secondary,#666); }
.explain-text.muted{ color: #bbb; }
.analysis-actions{ display:flex; gap: 12rpx; margin-top: 16rpx; }
.analysis-btn{ flex: 1; background: var(--card-bg-2,#f5f5f5); color: var(--text-primary,#333); border-radius: 40rpx; }
.analysis-btn.secondary{ background: rgba(74,144,226,.1); color: var(--accent,#4A90E2); border: 2rpx solid var(--accent,#4A90E2); }
</style>