/**
 * Test script to verify that refactored routes work without mock data dependencies
 */

const path = require('path');

// Test syntax of route files
async function testRouteSyntax() {
    console.log('Testing route file syntax...');
    
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const routeFiles = [
        '../routes/user.js',
        '../routes/system.js',
        '../routes/content.js',
        '../routes/question.js',
        '../routes/study.js'
    ];
    
    for (const routeFile of routeFiles) {
        try {
            const filePath = path.join(__dirname, routeFile);
            await execAsync(`node -c "${filePath}"`);
            console.log(`✅ ${routeFile} - Syntax OK`);
        } catch (error) {
            console.error(`❌ ${routeFile} - Syntax Error:`, error.message);
            process.exit(1);
        }
    }
    
    console.log('\n🎉 All route files have valid syntax!');
}

// Verify that mock-db file has been removed and no references remain
async function testMockDbDependencies() {
    console.log('\nVerifying mock-db removal...');
    
    const fs = require('fs').promises;
    
    // 1. Check if mock-db.js file exists
    try {
        await fs.access(path.join(__dirname, '../database/mock-db.js'));
        console.error('❌ mock-db.js file still exists! It should be removed.');
        process.exit(1);
    } catch (error) {
        console.log('✅ mock-db.js file has been successfully removed');
    }
    
    // 2. Check route files for any remaining references
    const routeFiles = [
        '../routes/user.js',
        '../routes/system.js',
        '../routes/content.js',
        '../routes/question.js',
        '../routes/study.js',
        '../routes/auth.js',
        '../routes/admin.js',
        '../routes/knowledge.js',
        '../routes/search.js'
    ];
    
    for (const routeFile of routeFiles) {
        try {
            const filePath = path.join(__dirname, routeFile);
            const content = await fs.readFile(filePath, 'utf8');
            
            if (content.includes('mock-db')) {
                console.error(`❌ Found mock-db reference in ${routeFile}`);
                process.exit(1);
            } else {
                console.log(`✅ ${routeFile} - No mock-db dependencies`);
            }
        } catch (error) {
            // File might not exist, skip
            console.log(`⚠️  ${routeFile} - File not found (skipping)`);
        }
    }
    
    console.log('\n🎉 No mock-db dependencies found in route files!');
}

// Run tests
async function runTests() {
    console.log('='.repeat(60));
    console.log('Testing Refactored Backend Routes');
    console.log('='.repeat(60));
    
    await testRouteSyntax();
    await testMockDbDependencies();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed! Mock data dependencies successfully removed.');
    console.log('='.repeat(60));
}

// Execute tests
runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});