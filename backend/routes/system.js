const express = require('express');
const { sendSuccess } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');
const systemService = require('../services/systemService');

const router = express.Router();

/**
 * @route GET /system/settings
 * @description Get system settings
 * @access Public
 */
router.get('/settings', asyncHandler(async (req, res) => {
    const settings = await systemService.getSystemSettings();
    sendSuccess(res, settings);
}));

/**
 * @route GET /system/health-check
 * @description A more detailed health check
 * @access Public
 */
router.get('/health-check', asyncHandler(async (req, res) => {
    const { healthCheck, isHealthy } = await systemService.getHealthCheck();
    
    if (!isHealthy) {
        return res.status(503).json({
            code: 50300,
            message: 'Service Unavailable',
            data: healthCheck
        });
    }
    
    sendSuccess(res, healthCheck);
}));

module.exports = router; 