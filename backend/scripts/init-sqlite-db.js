/**
 * SQLite数据库初始化脚本
 * 用于创建本地开发环境的SQLite数据库和基本表结构
 * 避免MySQL配置问题
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

class SQLiteInitializer {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/local.db');
        this.dbDir = path.dirname(this.dbPath);
    }

    /**
     * 初始化SQLite数据库
     */
    async initialize() {
        console.log(chalk.blue('🚀 开始初始化SQLite数据库...'));
        
        try {
            // 1. 确保数据库目录存在
            await this.ensureDbDirectory();
            
            // 2. 创建数据库连接
            const db = await this.createConnection();
            
            // 3. 创建表结构
            await this.createTables(db);
            
            // 4. 插入基础数据
            await this.insertSeedData(db);
            
            // 5. 验证初始化结果
            await this.verifyInitialization(db);
            
            await db.close();
            
            console.log(chalk.green('\n✅ SQLite数据库初始化完成！'));
            console.log(chalk.blue('\n📝 下一步:'));
            console.log('1. 使用 npm run test:sqlite 测试数据库连接');
            console.log('2. 使用 npm run dev 启动后端服务');
            console.log('3. 使用 npm run test:e2e 运行端到端测试');
            
        } catch (error) {
            console.error(chalk.red('\n❌ SQLite数据库初始化失败:'), error.message);
            process.exit(1);
        }
    }

    /**
     * 确保数据库目录存在
     */
    async ensureDbDirectory() {
        if (!fs.existsSync(this.dbDir)) {
            fs.mkdirSync(this.dbDir, { recursive: true });
            console.log(chalk.green(`✅ 创建数据库目录: ${this.dbDir}`));
        }
    }

    /**
     * 创建数据库连接
     */
    async createConnection() {
        console.log(chalk.yellow('\n1. 创建SQLite数据库连接...'));
        
        const db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });
        
        // 启用外键约束
        await db.exec('PRAGMA foreign_keys = ON');
        
        console.log(chalk.green(`✅ SQLite数据库连接成功: ${this.dbPath}`));
        return db;
    }

    /**
     * 创建表结构
     */
    async createTables(db) {
        console.log(chalk.yellow('\n2. 创建表结构...'));
        
        // 创建分类表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL CHECK (type IN ('question', 'article')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log(chalk.green('✅ categories 表创建成功'));

        // 创建用户表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                avatar_url TEXT,
                openid TEXT UNIQUE,
                nickname TEXT,
                continuous_check_in_days INTEGER DEFAULT 0,
                last_check_in_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log(chalk.green('✅ users 表创建成功'));

        // 创建签到表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS check_ins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                check_in_date DATE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, check_in_date)
            )
        `);
        console.log(chalk.green('✅ check_ins 表创建成功'));

        // 创建题目表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('single_choice', 'multiple_choice', 'fill_blank', 'essay')),
                difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
                category_id INTEGER,
                options TEXT, -- JSON string
                correct_answer TEXT,
                explanation TEXT,
                view_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        console.log(chalk.green('✅ questions 表创建成功'));

        // 创建文章表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                summary TEXT,
                category_id INTEGER,
                author TEXT,
                cover_image TEXT,
                view_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        console.log(chalk.green('✅ articles 表创建成功'));

        // 创建学习记录表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS study_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                user_answer TEXT,
                is_correct BOOLEAN,
                time_spent INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            )
        `);
        console.log(chalk.green('✅ study_records 表创建成功'));

        // 创建收藏表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                item_id INTEGER NOT NULL,
                item_type TEXT NOT NULL CHECK (item_type IN ('question', 'article')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, item_id, item_type)
            )
        `);
        console.log(chalk.green('✅ favorites 表创建成功'));

        // 创建错题表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS wrong_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                wrong_count INTEGER DEFAULT 1,
                last_wrong_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_resolved BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                UNIQUE(user_id, question_id)
            )
        `);
        console.log(chalk.green('✅ wrong_questions 表创建成功'));

        // 创建索引
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_study_records_user_question ON study_records(user_id, question_id);
            CREATE INDEX IF NOT EXISTS idx_study_records_created_at ON study_records(created_at);
            CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
            CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
        `);
        console.log(chalk.green('✅ 索引创建成功'));
    }

    /**
     * 插入基础数据
     */
    async insertSeedData(db) {
        console.log(chalk.yellow('\n3. 插入基础数据...'));
        
        // 插入分类数据
        const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
        
        if (categoryCount.count === 0) {
            await db.exec(`
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
        const questionCount = await db.get('SELECT COUNT(*) as count FROM questions');
        
        if (questionCount.count === 0) {
            await db.exec(`
                INSERT INTO questions (title, content, type, difficulty, category_id, options, correct_answer, explanation) VALUES
                ('什么是HTTP协议？', 'HTTP（HyperText Transfer Protocol）是什么？', 'single_choice', 'easy', 1, 
                 '["超文本传输协议", "超文本标记语言", "超文本预处理器", "超文本样式表"]', 
                 '超文本传输协议', 'HTTP是超文本传输协议，用于在Web浏览器和Web服务器之间传输数据。'),
                ('JavaScript中var和let的区别', '请说明JavaScript中var和let关键字的主要区别', 'essay', 'medium', 2, 
                 'null', '', 'var有函数作用域，let有块级作用域；var存在变量提升，let不存在变量提升等。'),
                ('数组排序算法', '以下哪种排序算法的平均时间复杂度是O(n log n)？', 'multiple_choice', 'medium', 3,
                 '["冒泡排序", "快速排序", "归并排序", "选择排序"]',
                 '["快速排序", "归并排序"]', '快速排序和归并排序的平均时间复杂度都是O(n log n)。'),
                ('SQL基础查询', '在SQL中，用于查询数据的关键字是？', 'single_choice', 'easy', 4,
                 '["SELECT", "INSERT", "UPDATE", "DELETE"]',
                 'SELECT', 'SELECT是SQL中用于查询数据的基本关键字。'),
                ('网络协议层次', 'OSI七层模型中，传输层对应的协议主要有？', 'multiple_choice', 'medium', 5,
                 '["TCP", "UDP", "HTTP", "FTP"]',
                 '["TCP", "UDP"]', 'TCP和UDP是传输层的主要协议，HTTP和FTP是应用层协议。')
            `);
            console.log(chalk.green('✅ 示例题目插入成功'));
        } else {
            console.log(chalk.blue('ℹ️ 题目数据已存在'));
        }

        // 插入示例文章
        const articleCount = await db.get('SELECT COUNT(*) as count FROM articles');
        
        if (articleCount.count === 0) {
            await db.exec(`
                INSERT INTO articles (title, content, summary, category_id, author) VALUES
                ('前端开发最佳实践', 
                 '<h1>前端开发最佳实践</h1><p>本文介绍前端开发中的一些最佳实践...</p><h2>代码规范</h2><p>良好的代码规范是团队协作的基础...</p><h2>性能优化</h2><p>前端性能优化包括多个方面：</p><ul><li>减少HTTP请求</li><li>压缩资源文件</li><li>使用CDN</li><li>懒加载</li></ul>',
                 '介绍前端开发中的最佳实践，包括代码规范、性能优化等方面。',
                 6, '技术团队'),
                ('数据库设计原则',
                 '<h1>数据库设计原则</h1><p>数据库设计是软件开发中的重要环节...</p><h2>范式化</h2><p>数据库范式化是减少数据冗余的重要方法...</p><h2>索引设计</h2><p>合理的索引设计可以大大提高查询性能...</p>',
                 '详细介绍数据库设计的基本原则和最佳实践。',
                 6, '数据库专家'),
                ('算法学习指南',
                 '<h1>算法学习指南</h1><p>算法是程序员的基本功...</p><h2>基础算法</h2><p>排序、查找、递归等基础算法...</p><h2>数据结构</h2><p>数组、链表、栈、队列、树、图等...</p>',
                 '全面的算法学习指南，从基础到进阶。',
                 6, '算法专家')
            `);
            console.log(chalk.green('✅ 示例文章插入成功'));
        } else {
            console.log(chalk.blue('ℹ️ 文章数据已存在'));
        }

        // 插入示例用户
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        
        if (userCount.count === 0) {
            await db.exec(`
                INSERT INTO users (username, email, nickname) VALUES
                ('testuser1', 'test1@example.com', '测试用户1'),
                ('testuser2', 'test2@example.com', '测试用户2'),
                ('demo_user', 'demo@example.com', '演示用户')
            `);
            console.log(chalk.green('✅ 示例用户插入成功'));
        } else {
            console.log(chalk.blue('ℹ️ 用户数据已存在'));
        }
    }

    /**
     * 验证初始化结果
     */
    async verifyInitialization(db) {
        console.log(chalk.yellow('\n4. 验证初始化结果...'));
        
        const tables = ['categories', 'users', 'questions', 'articles', 'study_records', 'favorites', 'wrong_questions', 'check_ins'];
        
        for (const table of tables) {
            const result = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
            const count = result.count;
            console.log(chalk.green(`✅ ${table}: ${count} 条记录`));
        }
    }

    /**
     * 测试数据库连接
     */
    async testConnection() {
        console.log(chalk.blue('🔍 测试SQLite数据库连接...'));
        
        try {
            const db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });
            
            const result = await db.get('SELECT COUNT(*) as count FROM questions');
            console.log(chalk.green(`✅ 数据库连接成功，共有 ${result.count} 道题目`));
            
            await db.close();
            return true;
        } catch (error) {
            console.error(chalk.red('❌ 数据库连接失败:'), error.message);
            return false;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const initializer = new SQLiteInitializer();
    
    // 检查命令行参数
    const args = process.argv.slice(2);
    if (args.includes('--test')) {
        initializer.testConnection();
    } else {
        initializer.initialize();
    }
}

module.exports = SQLiteInitializer;
