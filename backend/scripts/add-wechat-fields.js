#!/usr/bin/env node

/**
 * 为用户表添加微信相关字段
 */

const mysql = require('mysql2/promise');

async function addWechatFields() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'zhangshang_shuati'
        });

        console.log('🔄 添加微信相关字段到用户表...');

        // 添加微信相关字段
        const wechatFields = [
            {
                name: 'wechat_openid',
                definition: 'VARCHAR(100) UNIQUE NULL COMMENT "微信OpenID"'
            },
            {
                name: 'wechat_unionid', 
                definition: 'VARCHAR(100) NULL COMMENT "微信UnionID"'
            },
            {
                name: 'wechat_session_key',
                definition: 'VARCHAR(100) NULL COMMENT "微信SessionKey"'
            },
            {
                name: 'phone',
                definition: 'VARCHAR(20) NULL COMMENT "手机号"'
            },
            {
                name: 'city',
                definition: 'VARCHAR(50) NULL COMMENT "城市"'
            },
            {
                name: 'province',
                definition: 'VARCHAR(50) NULL COMMENT "省份"'
            },
            {
                name: 'country',
                definition: 'VARCHAR(50) NULL COMMENT "国家"'
            },
            {
                name: 'avatar',
                definition: 'VARCHAR(255) NULL COMMENT "头像URL"'
            }
        ];

        for (const field of wechatFields) {
            try {
                // 检查字段是否已存在
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'users' 
                    AND COLUMN_NAME = ?
                `, [field.name]);

                if (columns.length === 0) {
                    // 字段不存在，添加字段
                    await connection.execute(`
                        ALTER TABLE users ADD COLUMN ${field.name} ${field.definition}
                    `);
                    console.log(`✅ 添加字段: ${field.name}`);
                } else {
                    console.log(`⚠️  字段已存在: ${field.name}`);
                }
            } catch (error) {
                console.error(`❌ 添加字段失败 ${field.name}:`, error.message);
            }
        }

        // 添加微信OpenID索引
        try {
            await connection.execute(`
                CREATE INDEX idx_wechat_openid ON users(wechat_openid)
            `);
            console.log('✅ 添加微信OpenID索引');
        } catch (error) {
            if (error.code !== 'ER_DUP_KEYNAME') {
                console.error('❌ 添加索引失败:', error.message);
            } else {
                console.log('⚠️  索引已存在: idx_wechat_openid');
            }
        }

        console.log('🎉 微信字段添加完成');

    } catch (error) {
        console.error('❌ 添加微信字段失败:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 运行脚本
if (require.main === module) {
    addWechatFields().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = addWechatFields;