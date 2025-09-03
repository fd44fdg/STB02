const db = require('../config/db');

class SystemService {
  async getSystemSettings() {
    try {
      const settings = await db.query('SELECT * FROM system_settings ORDER BY id DESC LIMIT 1');
      
      if (settings[0] && settings[0].length > 0) {
        const systemSettings = {
          ...settings[0][0],
          config: JSON.parse(settings[0][0].config || '{}')
        };
        return systemSettings;
      } else {
        return this.getDefaultSettings();
      }
    } catch (error) {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      id: 1,
      app_name: '掌上刷题宝',
      app_version: '1.0.0',
      maintenance_mode: false,
      registration_enabled: true,
      max_login_attempts: 5,
      session_timeout: 3600,
      config: {
        theme: 'default',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        features: {
          user_registration: true,
          password_reset: true,
          email_verification: false
        }
      },
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  async getHealthCheck() {
    let databaseStatus = 'disconnected';
    let databaseError = null;
    
    try {
      await db.query('SELECT 1');
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'error';
      databaseError = error.message;
    }
    
    const healthCheck = {
      uptime: process.uptime(),
      message: databaseStatus === 'connected' ? 'OK' : 'Database connection issue',
      timestamp: Date.now(),
      database: databaseStatus,
      databaseError: databaseError,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0'
    };
    
    return {
      healthCheck,
      isHealthy: databaseStatus === 'connected'
    };
  }
}

module.exports = new SystemService();