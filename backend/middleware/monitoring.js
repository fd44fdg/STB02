const os = require('os');
const process = require('process');
const db = require('../config/db');
const logger = require('../utils/logger');

// Production-grade monitoring and health check system
class MonitoringService {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.dbQueryCount = 0;
    this.responseTimeSum = 0;
    this.lastHealthCheck = null;
  }

  // Request tracking middleware
  requestTracker() {
    return (req, res, next) => {
      const startTime = Date.now();
      this.requestCount++;

      // Track response
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.responseTimeSum += responseTime;

        // Log slow requests
        if (responseTime > 1000) {
          logger.performance('Slow request detected', {
            method: req.method,
            path: req.path,
            responseTime,
            statusCode: res.statusCode
          });
        }

        // Log errors
        if (res.statusCode >= 400) {
          this.errorCount++;
          logger.api(req.method, req.path, res.statusCode, responseTime, {
            userAgent: req.get('User-Agent'),
            ip: req.ip
          });
        }
      });

      next();
    };
  }

  // Comprehensive health check
  async healthCheck() {
    const checkStart = Date.now();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {}
    };

    try {
      // Database connectivity check
      health.checks.database = await this.checkDatabase();
      
      // Memory usage check
      health.checks.memory = this.checkMemory();
      
      // CPU usage check
      health.checks.cpu = this.checkCPU();
      
      // Disk space check (if applicable)
      health.checks.disk = this.checkDisk();
      
      // Application metrics
      health.checks.application = this.getApplicationMetrics();

      // Determine overall health status
      const failedChecks = Object.values(health.checks).filter(check => !check.healthy);
      if (failedChecks.length > 0) {
        health.status = 'unhealthy';
        logger.warn('Health check failed', { failedChecks: failedChecks.length });
      }

      health.responseTime = Date.now() - checkStart;
      this.lastHealthCheck = health;

      return health;
    } catch (error) {
      logger.error('Health check error', { error: error.message });
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: Date.now() - checkStart
      };
    }
  }

  // Database health check
  async checkDatabase() {
    try {
      const start = Date.now();
      await db.raw('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        healthy: responseTime < 1000,
        responseTime,
        status: responseTime < 1000 ? 'connected' : 'slow'
      };
    } catch (error) {
      logger.error('Database health check failed', { error: error.message });
      return {
        healthy: false,
        error: error.message,
        status: 'disconnected'
      };
    }
  }

  // Memory usage check
  checkMemory() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const memoryPercentage = (usedMem / totalMem) * 100;
    const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    const healthy = memoryPercentage < 85 && heapPercentage < 85;

    if (!healthy) {
      logger.warn('High memory usage detected', {
        memoryPercentage: memoryPercentage.toFixed(2),
        heapPercentage: heapPercentage.toFixed(2)
      });
    }

    return {
      healthy,
      memoryUsage: {
        total: Math.round(totalMem / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024),
        percentage: Math.round(memoryPercentage)
      },
      heap: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        percentage: Math.round(heapPercentage)
      }
    };
  }

  // CPU usage check
  checkCPU() {
    const cpus = os.cpus();
    const loadAverage = os.loadavg();
    
    // Get 1-minute load average
    const loadPercentage = (loadAverage[0] / cpus.length) * 100;
    const healthy = loadPercentage < 80;

    if (!healthy) {
      logger.warn('High CPU usage detected', {
        loadPercentage: loadPercentage.toFixed(2),
        loadAverage: loadAverage[0]
      });
    }

    return {
      healthy,
      cores: cpus.length,
      loadAverage: loadAverage.map(avg => Math.round(avg * 100) / 100),
      loadPercentage: Math.round(loadPercentage)
    };
  }

  // Disk space check
  checkDisk() {
    // This is a simplified check - in production you'd want to check actual disk usage
    // using a library like 'diskusage' or system commands
    return {
      healthy: true,
      note: 'Disk check not implemented - configure for production'
    };
  }

  // Application-specific metrics
  getApplicationMetrics() {
    const avgResponseTime = this.requestCount > 0 ? 
      Math.round(this.responseTimeSum / this.requestCount) : 0;
    
    const errorRate = this.requestCount > 0 ? 
      (this.errorCount / this.requestCount) * 100 : 0;

    const healthy = errorRate < 5 && avgResponseTime < 500;

    return {
      healthy,
      metrics: {
        totalRequests: this.requestCount,
        totalErrors: this.errorCount,
        errorRate: Math.round(errorRate * 100) / 100,
        averageResponseTime: avgResponseTime,
        dbQueries: this.dbQueryCount,
        uptime: Math.round(process.uptime())
      }
    };
  }

  // Get detailed metrics for monitoring systems
  getMetrics() {
    const memUsage = process.memoryUsage();
    
    return {
      timestamp: new Date().toISOString(),
      application: {
        uptime: process.uptime(),
        requests_total: this.requestCount,
        errors_total: this.errorCount,
        db_queries_total: this.dbQueryCount,
        avg_response_time: this.requestCount > 0 ? 
          Math.round(this.responseTimeSum / this.requestCount) : 0
      },
      system: {
        memory_usage_bytes: memUsage.rss,
        heap_usage_bytes: memUsage.heapUsed,
        heap_total_bytes: memUsage.heapTotal,
        cpu_cores: os.cpus().length,
        load_average: os.loadavg(),
        free_memory_bytes: os.freemem(),
        total_memory_bytes: os.totalmem()
      },
      nodejs: {
        version: process.version,
        pid: process.pid,
        platform: process.platform,
        arch: process.arch
      }
    };
  }

  // Reset metrics (useful for development/testing)
  resetMetrics() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.dbQueryCount = 0;
    this.responseTimeSum = 0;
    logger.info('Metrics reset');
  }

  // Graceful shutdown handler
  setupGracefulShutdown() {
    const shutdown = (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);
      
      // Close database connections
      if (db && db.destroy) {
        db.destroy().catch(err => {
          logger.error('Error closing database connections', { error: err.message });
        });
      }
      
      // Give ongoing requests time to complete
      setTimeout(() => {
        logger.info('Graceful shutdown completed');
        process.exit(0);
      }, 5000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { 
        error: error.message,
        stack: error.stack 
      });
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection', { 
        reason: reason?.message || reason,
        promise: promise?.toString()
      });
      process.exit(1);
    });
  }
}

// Create singleton instance
const monitoring = new MonitoringService();

module.exports = {
  monitoring,
  healthCheckMiddleware: (req, res, next) => {
    if (req.path === '/health' || req.path === '/health/') {
      monitoring.healthCheck()
        .then(health => res.json(health))
        .catch(error => {
          logger.error('Health check endpoint error', { error: error.message });
          res.status(503).json({
            status: 'error',
            message: 'Health check failed'
          });
        });
    } else {
      next();
    }
  },
  metricsMiddleware: (req, res, next) => {
    if (req.path === '/metrics' || req.path === '/metrics/') {
      const metrics = monitoring.getMetrics();
      res.json(metrics);
    } else {
      next();
    }
  },
  requestTracker: monitoring.requestTracker.bind(monitoring)
};