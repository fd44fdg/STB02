#!/usr/bin/env node

/**
 * Generate additional questions to meet testing requirements
 */

const mysql = require('mysql2/promise');

async function generateMoreQuestions() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'zhangshang_shuati_test'
        });

        console.log('🔄 Generating additional questions...');

        // Check current question count
        const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM questions');
        const currentCount = countResult[0].count;
        console.log(`📊 Current questions: ${currentCount}`);

        const targetCount = 60;
        const questionsToAdd = targetCount - currentCount;

        if (questionsToAdd <= 0) {
            console.log('✅ Sufficient questions already exist');
            return;
        }

        console.log(`🎯 Need to add ${questionsToAdd} more questions`);

        // Get categories
        const [categories] = await connection.execute('SELECT id, name FROM question_categories');
        
        // Additional question templates
        const questionTemplates = [
            {
                title: "什么是JavaScript中的闭包？",
                content: "请解释JavaScript中闭包的概念，并说明其应用场景。",
                options: JSON.stringify(["A. 函数内部的变量", "B. 函数能够访问其外部作用域的变量", "C. 全局变量", "D. 局部变量"]),
                correct_answer: "B",
                explanation: "闭包是指函数能够访问其外部作用域中的变量，即使外部函数已经执行完毕。这是JavaScript的一个重要特性。",
                difficulty: "medium",
                subject: "JavaScript",
                type: "single_choice"
            },
            {
                title: "CSS中的盒模型包括哪些部分？",
                content: "请选择CSS盒模型的组成部分。",
                options: JSON.stringify(["A. content, padding, border, margin", "B. width, height, color", "C. display, position, float", "D. font, text, background"]),
                correct_answer: "A",
                explanation: "CSS盒模型由内容(content)、内边距(padding)、边框(border)和外边距(margin)四部分组成。",
                difficulty: "easy",
                subject: "CSS",
                type: "single_choice"
            },
            {
                title: "Vue.js中的生命周期钩子有哪些？",
                content: "请选择Vue.js组件的主要生命周期钩子。",
                options: JSON.stringify(["A. created, mounted, updated, destroyed", "B. init, render, update, remove", "C. start, load, change, end", "D. begin, show, hide, finish"]),
                correct_answer: "A",
                explanation: "Vue.js的主要生命周期钩子包括created、mounted、updated、destroyed等，用于在组件不同阶段执行代码。",
                difficulty: "medium",
                subject: "Vue.js",
                type: "single_choice"
            },
            {
                title: "什么是HTTP状态码200？",
                content: "HTTP状态码200表示什么意思？",
                options: JSON.stringify(["A. 请求失败", "B. 服务器错误", "C. 请求成功", "D. 重定向"]),
                correct_answer: "C",
                explanation: "HTTP状态码200表示请求成功，服务器已成功处理了请求并返回了响应。",
                difficulty: "easy",
                subject: "HTTP",
                type: "single_choice"
            },
            {
                title: "React中的useState是什么？",
                content: "请解释React中useState Hook的作用。",
                options: JSON.stringify(["A. 管理组件状态", "B. 处理副作用", "C. 优化性能", "D. 路由导航"]),
                correct_answer: "A",
                explanation: "useState是React Hook，用于在函数组件中添加和管理状态。",
                difficulty: "medium",
                subject: "React",
                type: "single_choice"
            }
        ];

        let questionsAdded = 0;
        
        // Generate questions by repeating templates with variations
        for (let i = 0; i < questionsToAdd; i++) {
            const template = questionTemplates[i % questionTemplates.length];
            const category = categories[Math.floor(Math.random() * categories.length)];
            
            const question = {
                ...template,
                title: `${template.title} (变体 ${Math.floor(i / questionTemplates.length) + 1})`,
                category_id: category.id,
                tags: JSON.stringify([template.subject, "基础知识"]),
                knowledge_points: JSON.stringify([template.subject + "基础"]),
                score: Math.floor(Math.random() * 5) + 1,
                time_limit: 60,
                status: 1,
                created_by: 1
            };

            try {
                await connection.execute(`
                    INSERT INTO questions (
                        title, content, category_id, type, difficulty, subject,
                        options, correct_answer, explanation, tags, knowledge_points,
                        score, time_limit, status, created_by, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    question.title,
                    question.content,
                    question.category_id,
                    question.type,
                    question.difficulty,
                    question.subject,
                    question.options,
                    question.correct_answer,
                    question.explanation,
                    question.tags,
                    question.knowledge_points,
                    question.score,
                    question.time_limit,
                    question.status,
                    question.created_by
                ]);
                
                questionsAdded++;
                
                if (questionsAdded % 10 === 0) {
                    console.log(`✅ Added ${questionsAdded} questions...`);
                }
            } catch (error) {
                console.error(`❌ Failed to add question: ${error.message}`);
            }
        }

        // Check final count
        const [finalCountResult] = await connection.execute('SELECT COUNT(*) as count FROM questions');
        const finalCount = finalCountResult[0].count;
        
        console.log(`🎉 Successfully added ${questionsAdded} questions`);
        console.log(`📊 Total questions now: ${finalCount}`);

    } catch (error) {
        console.error('❌ Error generating questions:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the generator
if (require.main === module) {
    generateMoreQuestions().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = generateMoreQuestions;