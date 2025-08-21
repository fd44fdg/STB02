const request = require('supertest');
const mysql = require('mysql2/promise');
const app = require('../server');
const config = require('../config');

describe('System Integration Tests - Real Data Verification', () => {
    let connection;
    let server;
    let testUser;
    let authToken;

    beforeAll(async () => {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'zhangshang_shuati_test'
        });

        // Start server
        server = app.listen(0);
        
        // Create test user for authentication
        const testUserData = {
            username: 'system_test_user',
            email: 'system_test@example.com',
            password: 'test123456'
        };

        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(testUserData);

        if (registerResponse.status === 201) {
            testUser = registerResponse.body.user;
            authToken = registerResponse.body.token;
        }
    });

    afterAll(async () => {
        if (connection) {
            // Clean up test user
            if (testUser) {
                await connection.execute('DELETE FROM users WHERE id = ?', [testUser.id]);
            }
            await connection.end();
        }
        if (server) {
            server.close();
        }
    });

    describe('End-to-End Functional Tests', () => {
        test('User registration and login flow', async () => {
            const userData = {
                username: 'e2e_test_user',
                email: 'e2e_test@example.com',
                password: 'test123456'
            };

            // Register user
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body.user).toBeDefined();
            expect(registerResponse.body.token).toBeDefined();

            // Login user
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.token).toBeDefined();

            // Clean up
            await connection.execute('DELETE FROM users WHERE email = ?', [userData.email]);
        });

        test('Complete question answering flow', async () => {
            if (!authToken) {
                console.log('Skipping question flow test - no auth token');
                return;
            }

            // Get questions list
            const questionsResponse = await request(app)
                .get('/api/questions')
                .set('Authorization', `Bearer ${authToken}`);

            expect(questionsResponse.status).toBe(200);
            expect(Array.isArray(questionsResponse.body.data)).toBe(true);
            expect(questionsResponse.body.data.length).toBeGreaterThan(0);

            const question = questionsResponse.body.data[0];

            // Get question detail
            const questionDetailResponse = await request(app)
                .get(`/api/questions/${question.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(questionDetailResponse.status).toBe(200);
            expect(questionDetailResponse.body.id).toBe(question.id);

            // Submit answer
            const answerResponse = await request(app)
                .post(`/api/questions/${question.id}/answer`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    answer: question.correct_answer,
                    time_spent: 30
                });

            expect(answerResponse.status).toBe(200);
            expect(answerResponse.body.is_correct).toBeDefined();
        });

        test('Article reading flow', async () => {
            // Get articles list
            const articlesResponse = await request(app)
                .get('/api/articles');

            expect(articlesResponse.status).toBe(200);
            expect(Array.isArray(articlesResponse.body.data)).toBe(true);
            expect(articlesResponse.body.data.length).toBeGreaterThan(0);

            const article = articlesResponse.body.data[0];

            // Get article detail
            const articleDetailResponse = await request(app)
                .get(`/api/articles/${article.id}`);

            expect(articleDetailResponse.status).toBe(200);
            expect(articleDetailResponse.body.id).toBe(article.id);
            expect(articleDetailResponse.body.content).toBeDefined();
            expect(articleDetailResponse.body.content.length).toBeGreaterThan(100);
        });
    });

    describe('Real Data Verification Tests', () => {
        test('Users API returns real data', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            
            if (response.body.data && response.body.data.length > 0) {
                const user = response.body.data[0];
                
                // Verify user has real data structure
                expect(user.id).toBeDefined();
                expect(user.username).toBeDefined();
                expect(user.email).toBeDefined();
                expect(user.created_at).toBeDefined();
                
                // Verify no mock data patterns
                expect(user.username).not.toMatch(/^mock_/);
                expect(user.email).not.toMatch(/^mock_/);
            }
        });

        test('Questions API returns real data', async () => {
            const response = await request(app)
                .get('/api/questions');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);

            const question = response.body.data[0];
            
            // Verify question has real data structure
            expect(question.id).toBeDefined();
            expect(question.title).toBeDefined();
            expect(question.content).toBeDefined();
            expect(question.options).toBeDefined();
            expect(question.correct_answer).toBeDefined();
            expect(question.explanation).toBeDefined();
            
            // Verify content quality
            expect(question.title.length).toBeGreaterThan(10);
            expect(question.content.length).toBeGreaterThan(20);
            expect(question.explanation.length).toBeGreaterThan(20);
            
            // Verify no mock data patterns
            expect(question.title).not.toMatch(/^Mock/);
            expect(question.title).not.toMatch(/^Test/);
            expect(question.content).not.toMatch(/This is a mock/);
        });

        test('Articles API returns real data', async () => {
            const response = await request(app)
                .get('/api/articles');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);

            const article = response.body.data[0];
            
            // Verify article has real data structure
            expect(article.id).toBeDefined();
            expect(article.title).toBeDefined();
            expect(article.content).toBeDefined();
            expect(article.author_id).toBeDefined();
            
            // Verify content quality
            expect(article.title.length).toBeGreaterThan(10);
            expect(article.content.length).toBeGreaterThan(100);
            
            // Verify no mock data patterns
            expect(article.title).not.toMatch(/^Mock/);
            expect(article.title).not.toMatch(/^Test/);
            expect(article.content).not.toMatch(/This is a mock/);
        });

        test('Learning records API returns real data', async () => {
            if (!authToken) {
                console.log('Skipping learning records test - no auth token');
                return;
            }

            const response = await request(app)
                .get('/api/learning/records')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            
            if (response.body.data && response.body.data.length > 0) {
                const record = response.body.data[0];
                
                // Verify record has real data structure
                expect(record.id).toBeDefined();
                expect(record.user_id).toBeDefined();
                expect(record.question_id).toBeDefined();
                expect(record.answered_at).toBeDefined();
            }
        });
    });

    describe('Data Migration Integrity Tests', () => {
        test('Database tables exist and have correct structure', async () => {
            // Check users table
            const [usersColumns] = await connection.execute('DESCRIBE users');
            const userColumnNames = usersColumns.map(col => col.Field);
            
            expect(userColumnNames).toContain('id');
            expect(userColumnNames).toContain('username');
            expect(userColumnNames).toContain('email');
            expect(userColumnNames).toContain('password');
            expect(userColumnNames).toContain('nickname');
            expect(userColumnNames).toContain('level');
            expect(userColumnNames).toContain('points');

            // Check questions table
            const [questionsColumns] = await connection.execute('DESCRIBE questions');
            const questionColumnNames = questionsColumns.map(col => col.Field);
            
            expect(questionColumnNames).toContain('id');
            expect(questionColumnNames).toContain('title');
            expect(questionColumnNames).toContain('content');
            expect(questionColumnNames).toContain('options');
            expect(questionColumnNames).toContain('correct_answer');
            expect(questionColumnNames).toContain('explanation');
            expect(questionColumnNames).toContain('category_id');

            // Check articles table
            const [articlesColumns] = await connection.execute('DESCRIBE articles');
            const articleColumnNames = articlesColumns.map(col => col.Field);
            
            expect(articleColumnNames).toContain('id');
            expect(articleColumnNames).toContain('title');
            expect(articleColumnNames).toContain('content');
            expect(articleColumnNames).toContain('author_id');
            expect(articleColumnNames).toContain('category_id');
        });

        test('Foreign key relationships are intact', async () => {
            // Check question categories relationship
            const [questionCategoryCheck] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM questions q 
                LEFT JOIN question_categories qc ON q.category_id = qc.id 
                WHERE q.category_id IS NOT NULL AND qc.id IS NULL
            `);
            
            expect(questionCategoryCheck[0].count).toBe(0);

            // Check article categories relationship
            const [articleCategoryCheck] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM articles a 
                LEFT JOIN article_categories ac ON a.category_id = ac.id 
                WHERE a.category_id IS NOT NULL AND ac.id IS NULL
            `);
            
            expect(articleCategoryCheck[0].count).toBe(0);

            // Check user answers relationship
            const [userAnswersCheck] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM user_answers ua 
                LEFT JOIN users u ON ua.user_id = u.id 
                LEFT JOIN questions q ON ua.question_id = q.id 
                WHERE u.id IS NULL OR q.id IS NULL
            `);
            
            expect(userAnswersCheck[0].count).toBe(0);
        });

        test('Data quality and completeness', async () => {
            // Check minimum data requirements
            const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
            expect(userCount[0].count).toBeGreaterThan(0);

            const [questionCount] = await connection.execute('SELECT COUNT(*) as count FROM questions');
            expect(questionCount[0].count).toBeGreaterThan(50);

            const [articleCount] = await connection.execute('SELECT COUNT(*) as count FROM articles');
            expect(articleCount[0].count).toBeGreaterThan(10);

            const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM question_categories');
            expect(categoryCount[0].count).toBeGreaterThan(3);

            // Check data quality
            const [emptyTitles] = await connection.execute(`
                SELECT COUNT(*) as count FROM questions 
                WHERE title IS NULL OR title = '' OR LENGTH(TRIM(title)) < 5
            `);
            expect(emptyTitles[0].count).toBe(0);

            const [emptyContent] = await connection.execute(`
                SELECT COUNT(*) as count FROM questions 
                WHERE content IS NULL OR content = '' OR LENGTH(TRIM(content)) < 10
            `);
            expect(emptyContent[0].count).toBe(0);
        });
    });

    describe('System Performance and Stability Tests', () => {
        test('API response times are acceptable', async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get('/api/questions');
            
            const responseTime = Date.now() - startTime;
            
            expect(response.status).toBe(200);
            expect(responseTime).toBeLessThan(2000); // Less than 2 seconds
        });

        test('Database connection stability', async () => {
            // Test multiple concurrent connections
            const promises = [];
            
            for (let i = 0; i < 10; i++) {
                promises.push(
                    request(app)
                        .get('/api/questions')
                        .then(response => {
                            expect(response.status).toBe(200);
                            return response;
                        })
                );
            }
            
            const responses = await Promise.all(promises);
            expect(responses.length).toBe(10);
        });

        test('Memory usage stability', async () => {
            const initialMemory = process.memoryUsage();
            
            // Perform multiple operations
            for (let i = 0; i < 50; i++) {
                await request(app).get('/api/questions');
                await request(app).get('/api/articles');
            }
            
            const finalMemory = process.memoryUsage();
            
            // Memory increase should be reasonable (less than 50MB)
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });

        test('Error handling stability', async () => {
            // Test invalid endpoints
            const invalidResponse = await request(app)
                .get('/api/nonexistent');
            
            expect(invalidResponse.status).toBe(404);

            // Test invalid question ID
            const invalidQuestionResponse = await request(app)
                .get('/api/questions/99999');
            
            expect(invalidQuestionResponse.status).toBe(404);

            // Test invalid article ID
            const invalidArticleResponse = await request(app)
                .get('/api/articles/99999');
            
            expect(invalidArticleResponse.status).toBe(404);
        });
    });
});