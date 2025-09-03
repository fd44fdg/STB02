#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates all required environment variables and configurations
 * before starting the application in production
 */

const fs = require('fs');
const path = require('path');

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Check if required environment variables are set
  checkRequiredEnvVars() {
    console.log('🔍 Checking required environment variables...');
    
    const useSqlite = process.env.USE_SQLITE === 'true';
    
    const requiredVars = useSqlite ? [
      'JWT_SECRET'
    ] : [
      'DB_HOST',
      'DB_NAME', 
      'DB_USER',
      'DB_PASSWORD',
      'JWT_SECRET'
    ];

    const productionVars = [
      'CORS_ORIGINS',
      'LOG_LEVEL'
    ];

    // Check basic required variables
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        this.errors.push(`Missing required environment variable: ${varName}`);
      }
    });

    // Check production-specific variables
    if (this.isProduction) {
      productionVars.forEach(varName => {
        if (!process.env[varName]) {
          this.errors.push(`Missing required production environment variable: ${varName}`);
        }
      });
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET) {
      if (process.env.JWT_SECRET.length < 32) {
        this.errors.push('JWT_SECRET must be at least 32 characters long');
      }
      
      if (this.isProduction && (
          process.env.JWT_SECRET.includes('dev-only') || 
          process.env.JWT_SECRET.includes('development') ||
          process.env.JWT_SECRET === 'your_super_secret_jwt_key')) {
        this.errors.push('JWT_SECRET appears to be a development/example secret - use a strong production secret');
      }
    }

    // Validate database password
    if (this.isProduction && process.env.DB_PASSWORD) {
      if (process.env.DB_PASSWORD.length < 8) {
        this.warnings.push('Database password should be at least 8 characters long');
      }
      
      if (process.env.DB_PASSWORD === 'CHANGE_ME_IN_PRODUCTION' ||
          process.env.DB_PASSWORD === 'your_database_password') {
        this.errors.push('Database password appears to be a placeholder - set a strong production password');
      }
    }

    // Validate CORS origins for production
    if (this.isProduction && process.env.CORS_ORIGINS) {
      const origins = process.env.CORS_ORIGINS.split(',');
      const hasLocalhostOrigins = origins.some(origin => 
        origin.includes('localhost') || origin.includes('127.0.0.1')
      );
      
      if (hasLocalhostOrigins) {
        this.warnings.push('CORS origins include localhost - ensure this is intentional for production');
      }
    }
  }

  // Check file system permissions and required directories
  checkFileSystem() {
    console.log('📁 Checking file system permissions...');
    
    const requiredDirs = [
      './logs',
      './public',
      './public/uploads'
    ];

    requiredDirs.forEach(dir => {
      const fullPath = path.resolve(dir);
      
      try {
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
          console.log(`✅ Created directory: ${dir}`);
        }
        
        // Test write permissions
        const testFile = path.join(fullPath, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
      } catch (error) {
        this.errors.push(`Cannot write to directory ${dir}: ${error.message}`);
      }
    });
  }

  // Check Node.js version compatibility
  checkNodeVersion() {
    console.log('🟢 Checking Node.js version...');
    
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
    
    if (majorVersion < 16) {
      this.errors.push(`Node.js version ${nodeVersion} is not supported. Minimum required: 16.x`);
    } else if (majorVersion < 18) {
      this.warnings.push(`Node.js version ${nodeVersion} is supported but consider upgrading to 18.x or later`);
    }
  }

  // Check available memory and system resources
  checkSystemResources() {
    console.log('💾 Checking system resources...');
    
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const totalMemoryGB = totalMemory / (1024 ** 3);
    const freeMemoryGB = freeMemory / (1024 ** 3);
    
    if (totalMemoryGB < 1) {
      this.warnings.push(`Low total memory: ${totalMemoryGB.toFixed(2)}GB. Recommend at least 1GB for production`);
    }
    
    if (freeMemoryGB < 0.5) {
      this.warnings.push(`Low free memory: ${freeMemoryGB.toFixed(2)}GB. Monitor memory usage closely`);
    }
  }

  // Check package.json for security issues
  checkPackageSecurity() {
    console.log('🔒 Checking package security...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      
      // Check for development dependencies in production
      if (this.isProduction && packageJson.devDependencies) {
        const devDeps = Object.keys(packageJson.devDependencies);
        if (devDeps.length > 0) {
          this.warnings.push('Development dependencies found in package.json - ensure they are not installed in production');
        }
      }
      
      // Check for known vulnerable package patterns
      const dependencies = packageJson.dependencies || {};
      const potentiallyVulnerable = ['request', 'mongodb@2', 'mongoose@3'];
      
      Object.keys(dependencies).forEach(dep => {
        potentiallyVulnerable.forEach(vuln => {
          if (dep.includes(vuln.split('@')[0])) {
            this.warnings.push(`Potentially vulnerable dependency detected: ${dep}. Please audit and update.`);
          }
        });
      });
      
    } catch (error) {
      this.errors.push(`Cannot read package.json: ${error.message}`);
    }
  }

  // Check SSL/TLS configuration (if applicable)
  checkSSLConfig() {
    if (this.isProduction) {
      console.log('🔐 Checking SSL/TLS configuration...');
      
      // Check if SSL files exist (if SSL is configured)
      const sslPaths = [
        './ssl/cert.pem',
        './ssl/key.pem',
        './ssl/ca.pem'
      ];
      
      let sslConfigured = false;
      sslPaths.forEach(sslPath => {
        if (fs.existsSync(sslPath)) {
          sslConfigured = true;
        }
      });
      
      if (!sslConfigured && !process.env.DISABLE_SSL_CHECK) {
        this.warnings.push('No SSL certificates found. Ensure SSL is configured properly for production');
      }
    }
  }

  // Run all validations
  async validate() {
    console.log('🚀 Starting environment validation...\n');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Node.js version: ${process.version}`);
    console.log(`Platform: ${process.platform}\n`);

    this.checkRequiredEnvVars();
    this.checkFileSystem();
    this.checkNodeVersion();
    this.checkSystemResources();
    this.checkPackageSecurity();
    this.checkSSLConfig();

    // Display results
    console.log('\n' + '='.repeat(50));
    console.log('VALIDATION RESULTS');
    console.log('='.repeat(50));

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All validations passed!');
    } else if (this.errors.length === 0) {
      console.log('\n✅ No critical errors found. Please review warnings.');
    }

    console.log('\n' + '='.repeat(50));

    // Exit with appropriate code
    if (this.errors.length > 0) {
      console.log('\n💥 Environment validation failed. Please fix the errors above before starting the application.');
      process.exit(1);
    } else {
      console.log('\n🎉 Environment validation completed successfully!');
      process.exit(0);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  const validator = new EnvironmentValidator();
  validator.validate().catch(error => {
    console.error('Validation script error:', error);
    process.exit(1);
  });
}

module.exports = EnvironmentValidator;