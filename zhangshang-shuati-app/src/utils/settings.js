/**
 * 用户设置工具类
 * 统一管理应用设置的读取、保存和应用
 */

class SettingsManager {
  constructor() {
    this.STORAGE_KEY = 'app_settings'
    this.defaultSettings = {
      notification: true,
      sound: true,
      vibration: false,
      difficulty: 'medium',
      questionCount: 20,
      autoNext: false
    }
  }

  /**
   * 获取用户设置
   * @returns {Object} 用户设置对象
   */
  getSettings() {
    try {
      const savedSettings = uni.getStorageSync(this.STORAGE_KEY)
      if (savedSettings) {
        return { ...this.defaultSettings, ...savedSettings }
      }
      return this.defaultSettings
    } catch (error) {
      console.error('获取用户设置失败:', error)
      return this.defaultSettings
    }
  }

  /**
   * 保存用户设置
   * @param {Object} settings 要保存的设置
   */
  saveSettings(settings) {
    try {
      const currentSettings = this.getSettings()
      const newSettings = { ...currentSettings, ...settings }
      uni.setStorageSync(this.STORAGE_KEY, newSettings)
      console.log('设置已保存:', newSettings)
      return true
    } catch (error) {
      console.error('保存用户设置失败:', error)
      return false
    }
  }

  /**
   * 获取特定设置项
   * @param {string} key 设置项键名
   * @returns {any} 设置项值
   */
  getSetting(key) {
    const settings = this.getSettings()
    return settings[key]
  }

  /**
   * 设置特定设置项
   * @param {string} key 设置项键名
   * @param {any} value 设置项值
   */
  setSetting(key, value) {
    const settings = this.getSettings()
    settings[key] = value
    return this.saveSettings(settings)
  }

  /**
   * 播放音效（根据设置）
   * @param {string} type 音效类型：correct, wrong, submit
   */
  playSound(type) {
    try {
      if (!this.getSetting('sound')) return

      const messages = {
        correct: '✓ 回答正确',
        wrong: '✗ 回答错误',
        submit: '✓ 已提交',
        complete: '✓ 完成'
      }

      const message = messages[type] || '✓ 操作成功'
      
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 800
      })
    } catch (error) {
      console.error('播放音效失败:', error)
    }
  }

  /**
   * 震动反馈（根据设置）
   * @param {string} type 震动类型：correct, wrong, submit
   */
  vibrate(type) {
    try {
      if (!this.getSetting('vibration')) return

      switch (type) {
        case 'correct':
          // 正确答案轻震动
          uni.vibrateShort({
            type: 'light'
          })
          break
        case 'wrong':
          // 错误答案重震动
          uni.vibrateLong()
          break
        case 'submit':
        case 'complete':
          // 提交/完成中等震动
          uni.vibrateShort({
            type: 'medium'
          })
          break
        default:
          uni.vibrateShort()
      }
    } catch (error) {
      console.error('震动反馈失败:', error)
    }
  }

  /**
   * 检查是否开启自动下一题
   * @returns {boolean}
   */
  isAutoNextEnabled() {
    return this.getSetting('autoNext')
  }

  /**
   * 获取默认难度对应的索引
   * @returns {number} 难度索引 0:简单 1:中等 2:困难
   */
  getDefaultDifficultyIndex() {
    const difficulty = this.getSetting('difficulty')
    const difficultyMap = { 'easy': 0, 'medium': 1, 'hard': 2 }
    return difficultyMap[difficulty] || 1
  }

  /**
   * 获取默认题数
   * @returns {number}
   */
  getDefaultQuestionCount() {
    return this.getSetting('questionCount') || 20
  }

  /**
   * 检查是否开启通知
   * @returns {boolean}
   */
  isNotificationEnabled() {
    return this.getSetting('notification')
  }

  /**
   * 重置所有设置为默认值
   */
  resetToDefaults() {
    try {
      uni.setStorageSync(this.STORAGE_KEY, this.defaultSettings)
      console.log('设置已重置为默认值')
      return true
    } catch (error) {
      console.error('重置设置失败:', error)
      return false
    }
  }

  /**
   * 导出设置数据
   * @returns {Object} 设置数据
   */
  exportSettings() {
    return {
      settings: this.getSettings(),
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  /**
   * 导入设置数据
   * @param {Object} data 要导入的设置数据
   */
  importSettings(data) {
    try {
      if (data && data.settings) {
        return this.saveSettings(data.settings)
      }
      return false
    } catch (error) {
      console.error('导入设置失败:', error)
      return false
    }
  }
}

// 创建单例实例
const settingsManager = new SettingsManager()

export default settingsManager
