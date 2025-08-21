#!/usr/bin/env node

/**
 * Generate additional articles to meet testing requirements
 */

const mysql = require('mysql2/promise');

async function generateMoreArticles() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'zhangshang_shuati_test'
        });

        console.log('🔄 Generating additional articles...');

        // Check current article count
        const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM articles');
        const currentCount = countResult[0].count;
        console.log(`📊 Current articles: ${currentCount}`);

        const targetCount = 15;
        const articlesToAdd = targetCount - currentCount;

        if (articlesToAdd <= 0) {
            console.log('✅ Sufficient articles already exist');
            return;
        }

        console.log(`🎯 Need to add ${articlesToAdd} more articles`);

        // Get categories and users
        const [categories] = await connection.execute('SELECT id, name FROM article_categories');
        const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
        
        if (users.length === 0) {
            throw new Error('No users found for article authorship');
        }
        
        const authorId = users[0].id;

        // Additional article templates
        const articleTemplates = [
            {
                title: "深入理解JavaScript异步编程",
                summary: "全面解析JavaScript中的异步编程概念，包括回调函数、Promise和async/await的使用方法。",
                content: `# 深入理解JavaScript异步编程

JavaScript是一门单线程语言，但通过异步编程可以实现非阻塞的代码执行。本文将深入探讨JavaScript异步编程的各种方式。

## 1. 回调函数

回调函数是最基础的异步编程方式：

\`\`\`javascript
function fetchData(callback) {
    setTimeout(() => {
        callback('数据获取成功');
    }, 1000);
}

fetchData((result) => {
    console.log(result);
});
\`\`\`

## 2. Promise

Promise提供了更优雅的异步处理方式：

\`\`\`javascript
function fetchData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('数据获取成功');
        }, 1000);
    });
}

fetchData().then(result => {
    console.log(result);
});
\`\`\`

## 3. async/await

async/await是基于Promise的语法糖，让异步代码看起来像同步代码：

\`\`\`javascript
async function getData() {
    try {
        const result = await fetchData();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}
\`\`\`

## 总结

掌握异步编程是JavaScript开发的重要技能，选择合适的异步方式可以让代码更加清晰和高效。`,
                tags: JSON.stringify(["JavaScript", "异步编程", "Promise", "async/await"])
            },
            {
                title: "CSS Grid布局完全指南",
                summary: "详细介绍CSS Grid布局系统，从基础概念到高级应用，帮助开发者掌握现代网页布局技术。",
                content: `# CSS Grid布局完全指南

CSS Grid是一个强大的二维布局系统，可以同时处理行和列的布局。

## 基础概念

Grid容器和Grid项目是Grid布局的两个核心概念：

\`\`\`css
.container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 100px 100px;
    gap: 10px;
}
\`\`\`

## 网格线和网格区域

通过网格线可以精确控制项目的位置：

\`\`\`css
.item {
    grid-column: 1 / 3;
    grid-row: 1 / 2;
}
\`\`\`

## 响应式设计

Grid布局天然支持响应式设计：

\`\`\`css
.container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
\`\`\`

Grid布局为现代网页设计提供了强大而灵活的解决方案。`,
                tags: JSON.stringify(["CSS", "Grid", "布局", "响应式设计"])
            },
            {
                title: "React Hooks深度解析",
                summary: "深入探讨React Hooks的原理和最佳实践，包括useState、useEffect等常用Hook的使用技巧。",
                content: `# React Hooks深度解析

React Hooks是React 16.8引入的新特性，让函数组件也能使用状态和其他React特性。

## useState Hook

useState是最基础的Hook，用于管理组件状态：

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>当前计数: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                增加
            </button>
        </div>
    );
}
\`\`\`

## useEffect Hook

useEffect用于处理副作用：

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetchUser(userId).then(setUser);
    }, [userId]);
    
    return user ? <div>{user.name}</div> : <div>加载中...</div>;
}
\`\`\`

## 自定义Hook

创建自定义Hook可以复用状态逻辑：

\`\`\`jsx
function useCounter(initialValue = 0) {
    const [count, setCount] = useState(initialValue);
    
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    
    return { count, increment, decrement };
}
\`\`\`

React Hooks让函数组件更加强大和灵活。`,
                tags: JSON.stringify(["React", "Hooks", "useState", "useEffect"])
            }
        ];

        let articlesAdded = 0;
        
        // Generate articles by repeating templates with variations
        for (let i = 0; i < articlesToAdd; i++) {
            const template = articleTemplates[i % articleTemplates.length];
            const category = categories[Math.floor(Math.random() * categories.length)];
            
            const article = {
                ...template,
                title: `${template.title} (第${Math.floor(i / articleTemplates.length) + 1}部分)`,
                author: "系统管理员",
                author_id: authorId,
                category: category.name,
                category_id: category.id,
                views: Math.floor(Math.random() * 1000) + 100,
                status: 'published'
            };

            try {
                await connection.execute(`
                    INSERT INTO articles (
                        title, summary, content, author, author_id, category, category_id,
                        tags, views, status, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    article.title,
                    article.summary,
                    article.content,
                    article.author,
                    article.author_id,
                    article.category,
                    article.category_id,
                    article.tags,
                    article.views,
                    article.status
                ]);
                
                articlesAdded++;
                
                if (articlesAdded % 5 === 0) {
                    console.log(`✅ Added ${articlesAdded} articles...`);
                }
            } catch (error) {
                console.error(`❌ Failed to add article: ${error.message}`);
            }
        }

        // Check final count
        const [finalCountResult] = await connection.execute('SELECT COUNT(*) as count FROM articles');
        const finalCount = finalCountResult[0].count;
        
        console.log(`🎉 Successfully added ${articlesAdded} articles`);
        console.log(`📊 Total articles now: ${finalCount}`);

    } catch (error) {
        console.error('❌ Error generating articles:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the generator
if (require.main === module) {
    generateMoreArticles().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = generateMoreArticles;