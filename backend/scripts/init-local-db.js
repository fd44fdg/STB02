/**
 * 本地数据库初始化脚本
 * 用于创建本地开发环境的数据库和基本表结构
 */

const mysql = require('mysql2/promise');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// 加载本地配置
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

class LocalDatabaseInitializer {
    constructor() {
        this.serverConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root123',
            port: process.env.DB_PORT || 3306,
            charset: 'utf8mb4',
            timezone: '+08:00'
        };
        
        this.dbName = process.env.DB_NAME || 'zhangshang_shuati';
        
        this.dbConfig = {
            ...this.serverConfig,
            database: this.dbName
        };
    }

    /**
     * 初始化数据库
     */
    async initialize() {
        console.log(chalk.blue('🚀 开始初始化本地数据库...'));
        
        try {
            // 1. 测试服务器连接
            await this.testServerConnection();
            
            // 2. 创建数据库
            await this.createDatabase();
            
            // 3. 创建表结构
            await this.createTables();
            
            // 4. 插入基础数据
            await this.insertSeedData();
            
            // 5. 验证初始化结果
            await this.verifyInitialization();
            
            console.log(chalk.green('\n✅ 本地数据库初始化完成！'));
            console.log(chalk.blue('\n📝 下一步:'));
            console.log('1. 使用 npm run db:test 测试数据库连接');
            console.log('2. 使用 npm start 启动后端服务');
            console.log('3. 使用 npm run test:e2e 运行端到端测试');
            
        } catch (error) {
            console.error(chalk.red('\n❌ 数据库初始化失败:'), error.message);
            this.showTroubleshootingTips();
            process.exit(1);
        }
    }

    /**
     * 测试服务器连接
     */
    async testServerConnection() {
        console.log(chalk.yellow('\n1. 测试MySQL服务器连接...'));
        
        try {
            const connection = await mysql.createConnection(this.serverConfig);
            await connection.ping();
            console.log(chalk.green('✅ MySQL服务器连接成功'));
            await connection.end();
        } catch (error) {
            if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                throw new Error('数据库用户名或密码错误，请检查.env.local文件中的配置');
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error('无法连接到MySQL服务器，请确保MySQL服务正在运行');
            } else {
                throw new Error(`连接失败: ${error.message}`);
            }
        }
    }

    /**
     * 创建数据库
     */
    async createDatabase() {
        console.log(chalk.yellow('\n2. 创建数据库...'));
        
        const connection = await mysql.createConnection(this.serverConfig);
        
        try {
            // 检查数据库是否存在
            const [databases] = await connection.execute(
                'SHOW DATABASES LIKE ?',
                [this.dbName]
            );
            
            if (databases.length === 0) {
                await connection.execute(
                    `CREATE DATABASE \`${this.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
                );
                console.log(chalk.green(`✅ 数据库 '${this.dbName}' 创建成功`));
            } else {
                console.log(chalk.blue(`ℹ️ 数据库 '${this.dbName}' 已存在`));
            }
        } finally {
            await connection.end();
        }
    }

    /**
     * 创建表结构
     */
    async createTables() {
        console.log(chalk.yellow('\n3. 创建表结构...'));
        
        const connection = await mysql.createConnection(this.dbConfig);
        
        try {
            // 创建分类表
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    type ENUM('question', 'article') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log(chalk.green('✅ categories 表创建成功'));

            // 创建用户表
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE,
                    password_hash VARCHAR(255),
                    avatar_url VARCHAR(255),
                    openid VARCHAR(100) UNIQUE,
                    nickname VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log(chalk.green('✅ users 表创建成功'));

            // 创建题目表
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS questions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    content TEXT NOT NULL,
                    type ENUM('single_choice', 'multiple_choice', 'fill_blank', 'essay') NOT NULL,
                    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
                    category_id INT,
                    options JSON,
                    correct_answer TEXT,
                    explanation TEXT,
                    view_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log(chalk.green('✅ questions 表创建成功'));

            // 创建文章表
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS articles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    content LONGTEXT NOT NULL,
                    summary TEXT,
                    category_id INT,
                    author VARCHAR(100),
                    cover_image VARCHAR(255),
                    view_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log(chalk.green('✅ articles 表创建成功'));

            // 创建学习记录表
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS study_records (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    question_id INT NOT NULL,
                    user_answer TEXT,
                    is_correct BOOLEAN,
                    time_spent INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                    INDEX idx_user_question (user_id, question_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log(chalk.green('✅ study_records 表创建成功'));

            // 创建收藏表
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS favorites (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    item_id INT NOT NULL,
                    item_type ENUM('question', 'article') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_favorite (user_id, item_id, item_type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log(chalk.green('✅ favorites 表创建成功'));

            // 创建错题表
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS wrong_questions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    question_id INT NOT NULL,
                    wrong_count INT DEFAULT 1,
                    last_wrong_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_resolved BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_wrong_question (user_id, question_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log(chalk.green('✅ wrong_questions 表创建成功'));

        } finally {
            await connection.end();
        }
    }

    /**
     * 插入基础数据
     */
    async insertSeedData() {
        console.log(chalk.yellow('\n4. 插入基础数据...'));
        
        const connection = await mysql.createConnection(this.dbConfig);
        
        try {
            // 插入分类数据
            const [categoryResult] = await connection.execute(
                'SELECT COUNT(*) as count FROM categories'
            );
            
            if (categoryResult[0].count === 0) {
                await connection.execute(`
                    INSERT INTO categories (name, description, type) VALUES
                    ('计算机基础', '计算机科学基础知识', 'question'),
                    ('编程语言', '各种编程语言相关题目', 'question'),
                    ('数据结构与算法', '数据结构和算法题目', 'question'),
                    ('数据库', '数据库相关知识', 'question'),
                    ('网络技术', '计算机网络相关', 'question'),
                    ('技术文章', '技术学习文章', 'article'),
                    ('行业资讯', '行业动态和资讯', 'article')
                `);
                console.log(chalk.green('✅ 分类数据插入成功'));
            } else {
                console.log(chalk.blue('ℹ️ 分类数据已存在'));
            }

            // 插入示例题目
            const [questionResult] = await connection.execute(
                'SELECT COUNT(*) as count FROM questions'
            );
            
            if (questionResult[0].count === 0) {
                await connection.execute(`
                    INSERT INTO questions (title, content, type, difficulty, category_id, options, correct_answer, explanation) VALUES
                    ('什么是HTTP协议？', 'HTTP（HyperText Transfer Protocol）是什么？', 'single_choice', 'easy', 1, 
                     '["超文本传输协议", "超文本标记语言", "超文本预处理器", "超文本样式表"]', 
                     '超文本传输协议', 'HTTP是超文本传输协议，用于在Web浏览器和Web服务器之间传输数据。'),
                    ('JavaScript中var和let的区别', '请说明JavaScript中var和let关键字的主要区别', 'essay', 'medium', 2, 
                     'null', '', 'var有函数作用域，let有块级作用域；var存在变量提升，let不存在变量提升等。'),
                    ('数组排序算法', '以下哪种排序算法的平均时间复杂度是O(n log n)？', 'multiple_choice', 'medium', 3,
                     '["冒泡排序", "快速排序", "归并排序", "选择排序"]',
                     '["快速排序", "归并排序"]', '快速排序和归并排序的平均时间复杂度都是O(n log n)。')
                `);
                console.log(chalk.green('✅ 示例题目插入成功'));
            } else {
                console.log(chalk.blue('ℹ️ 题目数据已存在'));
            }

            // 插入示例文章
            const [articleResult] = await connection.execute(
                'SELECT COUNT(*) as count FROM articles'
            );
            
            if (articleResult[0].count === 0) {
                await connection.execute(`
                    INSERT INTO articles (title, content, summary, category_id, author) VALUES
                    ('前端开发最佳实践', 
                     '<h1>前端开发最佳实践</h1><p>本文介绍前端开发中的一些最佳实践...</p><h2>代码规范</h2><p>良好的代码规范是团队协作的基础...</p>',
                     '介绍前端开发中的最佳实践，包括代码规范、性能优化等方面。',
                     6, '技术团队'),
                    ('数据库设计原则',
                     '<h1>数据库设计原则</h1><p>数据库设计是软件开发中的重要环节...</p><h2>范式化</h2><p>数据库范式化是减少数据冗余的重要方法...</p>',
                     '详细介绍数据库设计的基本原则和最佳实践。',
                     6, '数据库专家')
                `);
                console.log(chalk.green('✅ 示例文章插入成功'));
            } else {
                console.log(chalk.blue('ℹ️ 文章数据已存在'));
            }

        } finally {
            await connection.end();
        }
    }

    /**
     * 验证初始化结果
     */
    async verifyInitialization() {
        console.log(chalk.yellow('\n5. 验证初始化结果...'));
        
        const connection = await mysql.createConnection(this.dbConfig);
        
        try {
            const tables = ['categories', 'users', 'questions', 'articles', 'study_records', 'favorites', 'wrong_questions'];
            
            for (const table of tables) {
                const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                const count = result[0].count;
                console.log(chalk.green(`✅ ${table}: ${count} 条记录`));
            }
            
        } finally {
            await connection.end();
        }
    }

    /**
     * 显示故障排除提示
     */
    showTroubleshootingTips() {
        console.log(chalk.blue('\n🔧 故障排除提示:'));
        console.log('1. 确保MySQL服务正在运行');
        console.log('   - Windows: 检查服务管理器中的MySQL服务');
        console.log('   - macOS: brew services start mysql');
        console.log('   - Linux: sudo systemctl start mysql');
        console.log('2. 检查.env.local文件中的数据库配置');
        console.log('3. 确保数据库用户有创建数据库的权限');
        console.log('4. 如果使用XAMPP/WAMP，确保Apache和MySQL都已启动');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const initializer = new LocalDatabaseInitializer();
    initializer.initialize();
}

module.exports = LocalDatabaseInitializer;