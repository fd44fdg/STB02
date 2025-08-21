const express = require('express');
const { pool } = require('../config/database');
const { sendSuccess } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

/**
 * @route GET /system/settings
 * @description Get system settings
 * @access Public
 */
router.get('/settings', catchAsync(async (req, res) => {
    try {
        // 尝试从数据库获取系统设置
        const [settings] = await pool.execute('SELECT * FROM system_settings ORDER BY id DESC LIMIT 1');
        
        if (settings.length > 0) {
            // 解析JSON配置
            const systemSettings = {
                ...settings[0],
                config: JSON.parse(settings[0].config || '{}')
            };
            sendSuccess(res, systemSettings);
        } else {
            // 如果数据库中没有设置，返回默认设置
            const defaultSettings = {
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
            sendSuccess(res, defaultSettings);
        }
    } catch (error) {
        // 如果系统设置表不存在，返回默认设置
        const defaultSettings = {
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
        sendSuccess(res, defaultSettings);
    }
}));

/**
 * @route GET /system/health-check
 * @description A more detailed health check
 * @access Public
 */
router.get('/health-check', catchAsync(async (req, res) => {
    let databaseStatus = 'disconnected';
    let databaseError = null;
    
    try {
        // 测试数据库连接
        await pool.execute('SELECT 1');
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
    
    // 如果数据库连接有问题，返回503状态码
    if (databaseStatus !== 'connected') {
        return res.status(503).json({
            code: 50300,
            message: 'Service Unavailable',
            data: healthCheck
        });
    }
    
    sendSuccess(res, healthCheck);
}));

module.exports = router; 