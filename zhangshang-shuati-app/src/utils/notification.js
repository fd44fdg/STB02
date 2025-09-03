/**
 * 通知管理器
 * 根据用户设置管理应用通知
 */

import settingsManager from './settings.js'

class NotificationManager {
  constructor() {
    this.isSupported = false
    this.permission = 'default'
    this.init()
  }

  /**
   * 初始化通知管理器
   */
  async init() {
    try {
      // 检查平台支持
      // #ifdef H5
      if ('Notification' in window) {
        this.isSupported = true
        this.permission = Notification.permission
      }
      // #endif

      // #ifdef APP-PLUS
      this.isSupported = true
      // #endif

      // #ifdef MP
      this.isSupported = true
      // #endif

      console.log('通知管理器初始化完成:', {
        isSupported: this.isSupported,
        permission: this.permission
      })
    } catch (error) {
      console.error('通知管理器初始化失败:', error)
    }
  }

  /**
   * 请求通知权限
   */
  async requestPermission() {
    if (!settingsManager.isNotificationEnabled()) {
      console.log('用户已关闭通知设置')
      return false
    }

    try {
      // #ifdef H5
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        this.permission = permission
        return permission === 'granted'
      }
      // #endif

      // #ifdef APP-PLUS
      // App环境下的通知权限处理
      return true
      // #endif

      // #ifdef MP
      // 小程序环境下的通知权限处理
      return true
      // #endif

      return false
    } catch (error) {
      console.error('请求通知权限失败:', error)
      return false
    }
  }

  /**
   * 发送通知
   * @param {Object} options 通知选项
   */
  async sendNotification(options = {}) {
    if (!settingsManager.isNotificationEnabled()) {
      console.log('通知已被用户关闭')
      return false
    }

    if (!this.isSupported) {
      console.log('当前平台不支持通知')
      return false
    }

    const {
      title = '掌上刷题宝',
      body = '',
      icon = '/static/logo.png',
      tag = 'default',
      data = {}
    } = options

    try {
      // #ifdef H5
      if ('Notification' in window && this.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon,
          tag,
          data
        })

        // 点击通知的处理
        notification.onclick = () => {
          window.focus()
          notification.close()
          if (data.url) {
            // 可以根据data.url跳转到指定页面
            console.log('通知被点击，跳转到:', data.url)
          }
        }

        // 自动关闭通知
        setTimeout(() => {
          notification.close()
        }, 5000)

        return true
      }
      // #endif

      // #ifdef APP-PLUS
      // App环境下使用plus.push发送本地通知
      if (plus && plus.push) {
        plus.push.createMessage(body, JSON.stringify(data), {
          title,
          icon,
          when: new Date()
        })
        return true
      }
      // #endif

      // #ifdef MP
      // 小程序环境下可以使用订阅消息
      // 这里只是示例，实际需要根据小程序的订阅消息模板来实现
      console.log('小程序通知:', { title, body })
      return true
      // #endif

      return false
    } catch (error) {
      console.error('发送通知失败:', error)
      return false
    }
  }

  /**
   * 发送学习提醒通知
   */
  async sendStudyReminder() {
    return this.sendNotification({
      title: '学习提醒',
      body: '该学习了！坚持每天刷题，提升自己吧！',
      tag: 'study-reminder',
      data: { url: '/pages/practice/practice' }
    })
  }

  /**
   * 发送练习完成通知
   * @param {Object} result 练习结果
   */
  async sendPracticeComplete(result = {}) {
    const { correctCount = 0, totalCount = 0, accuracy = 0 } = result
    
    return this.sendNotification({
      title: '练习完成',
      body: `本次练习答对 ${correctCount}/${totalCount} 题，正确率 ${accuracy}%`,
      tag: 'practice-complete',
      data: { url: '/pages/study-records/index' }
    })
  }

  /**
   * 发送考试完成通知
   * @param {Object} result 考试结果
   */
  async sendExamComplete(result = {}) {
    const { score = 0, status = '完成' } = result
    
    return this.sendNotification({
      title: '考试完成',
      body: `考试得分：${score}分，${status}`,
      tag: 'exam-complete',
      data: { url: '/pages/exam/exam' }
    })
  }

  /**
   * 发送每日签到提醒
   */
  async sendDailyCheckIn() {
    return this.sendNotification({
      title: '每日签到',
      body: '别忘了今天的签到哦！连续签到可以获得更多积分',
      tag: 'daily-checkin',
      data: { url: '/pages/profile/profile' }
    })
  }

  /**
   * 发送错题复习提醒
   * @param {number} wrongCount 错题数量
   */
  async sendWrongQuestionReminder(wrongCount = 0) {
    if (wrongCount === 0) return false
    
    return this.sendNotification({
      title: '错题复习提醒',
      body: `你有 ${wrongCount} 道错题需要复习，及时巩固知识点吧！`,
      tag: 'wrong-question-reminder',
      data: { url: '/pages/wrong-questions/index' }
    })
  }

  /**
   * 清除所有通知
   */
  clearAllNotifications() {
    try {
      // #ifdef H5
      // H5环境下无法直接清除所有通知，只能在创建时设置tag来管理
      console.log('H5环境下通知会自动过期')
      // #endif

      // #ifdef APP-PLUS
      if (plus && plus.push) {
        plus.push.clear()
      }
      // #endif

      console.log('已清除所有通知')
    } catch (error) {
      console.error('清除通知失败:', error)
    }
  }

  /**
   * 设置定时提醒
   * @param {string} type 提醒类型
   * @param {number} interval 间隔时间（毫秒）
   */
  setPeriodicReminder(type, interval) {
    if (!settingsManager.isNotificationEnabled()) {
      return false
    }

    const reminderMap = {
      study: () => this.sendStudyReminder(),
      checkin: () => this.sendDailyCheckIn()
    }

    const reminderFn = reminderMap[type]
    if (!reminderFn) {
      console.error('未知的提醒类型:', type)
      return false
    }

    // 设置定时器
    const timerId = setInterval(reminderFn, interval)
    
    // 保存定时器ID，以便后续清除
    const timerKey = `reminder_${type}`
    uni.setStorageSync(timerKey, timerId)
    
    console.log(`已设置${type}定时提醒，间隔${interval}ms`)
    return timerId
  }

  /**
   * 清除定时提醒
   * @param {string} type 提醒类型
   */
  clearPeriodicReminder(type) {
    const timerKey = `reminder_${type}`
    const timerId = uni.getStorageSync(timerKey)
    
    if (timerId) {
      clearInterval(timerId)
      uni.removeStorageSync(timerKey)
      console.log(`已清除${type}定时提醒`)
      return true
    }
    
    return false
  }
}

// 创建单例实例
const notificationManager = new NotificationManager()

export default notificationManager
