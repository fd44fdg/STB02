/**
 * 从CSV文件批量导入题目
 * 支持Excel导出的CSV格式，方便批量添加题目
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// CSV格式示例：
// content,type,options,correct_answer,explanation,difficulty,subject,category_id
// "JavaScript中var和let的区别？","single_choice","[{""key"":""A"",""value"":""没有区别""},{""key"":""B"",""value"":""作用域不同""}]","B","let有块级作用域","easy","javascript",1

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // 跳过下一个引号
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

async function importQuestionsFromCSV(csvFilePath) {
  try {
    console.log(`📁 正在读取CSV文件: ${csvFilePath}`);
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`文件不存在: ${csvFilePath}`);
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV文件格式错误，至少需要标题行和一行数据');
    }
    
    // 解析标题行
    const headers = parseCSVLine(lines[0]);
    console.log('📋 CSV列标题:', headers);
    
    const expectedHeaders = ['content', 'type', 'options', 'correct_answer', 'explanation', 'difficulty', 'subject', 'category_id'];
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`CSV文件缺少必要的列: ${missingHeaders.join(', ')}`);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // 处理数据行
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          console.warn(`⚠️  第${i + 1}行数据列数不匹配，跳过`);
          errorCount++;
          continue;
        }
        
        // 构建题目对象
        const question = {};
        headers.forEach((header, index) => {
          question[header] = values[index];
        });
        
        // 数据验证和转换
        if (!question.content || question.content.trim() === '') {
          console.warn(`⚠️  第${i + 1}行题目内容为空，跳过`);
          errorCount++;
          continue;
        }
        
        // 转换数据类型
        question.category_id = parseInt(question.category_id) || 1;
        question.status = 'active';
        question.created_at = new Date();
        question.updated_at = new Date();
        
        // 处理选项JSON
        if (question.options && question.options !== 'null' && question.options.trim() !== '') {
          try {
            JSON.parse(question.options); // 验证JSON格式
          } catch (e) {
            console.warn(`⚠️  第${i + 1}行选项JSON格式错误，跳过`);
            errorCount++;
            continue;
          }
        } else {
          question.options = null;
        }
        
        // 插入数据库
        await db('questions').insert(question);
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`📝 已导入 ${successCount} 道题目...`);
        }
        
      } catch (error) {
        console.error(`❌ 第${i + 1}行导入失败:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ 导入完成！`);
    console.log(`📊 成功导入: ${successCount} 道题目`);
    console.log(`❌ 失败: ${errorCount} 条记录`);
    
    return { successCount, errorCount };
    
  } catch (error) {
    console.error('❌ CSV导入失败:', error);
    throw error;
  }
}

// 创建CSV模板文件
function createCSVTemplate(outputPath = './question_template.csv') {
  const template = `content,type,options,correct_answer,explanation,difficulty,subject,category_id
"JavaScript中var和let的区别是什么？","single_choice","[{""key"":""A"",""value"":""没有区别""},{""key"":""B"",""value"":""作用域不同""},{""key"":""C"",""value"":""都有块级作用域""},{""key"":""D"",""value"":""都没有块级作用域""}]","B","let具有块级作用域，var只有函数作用域","easy","javascript",1
"CSS中哪些属性可以继承？","multiple_choice","[{""key"":""A"",""value"":""color""},{""key"":""B"",""value"":""font-size""},{""key"":""C"",""value"":""margin""},{""key"":""D"",""value"":""text-align""}]","A,B,D","color、font-size、text-align等文本相关属性可以继承","medium","css",2
"请解释什么是闭包？","essay","","","闭包是指函数能够访问其外部作用域中的变量，即使外部函数已经执行完毕","medium","javascript",1`;

  fs.writeFileSync(outputPath, template, 'utf-8');
  console.log(`📄 CSV模板文件已创建: ${outputPath}`);
}

// 命令行使用
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📚 题目批量导入工具

使用方法:
  node import-questions-from-csv.js <csv文件路径>     # 导入CSV文件
  node import-questions-from-csv.js --template       # 创建CSV模板

CSV格式要求:
  - 必须包含标题行
  - 必需列: content, type, options, correct_answer, explanation, difficulty, subject, category_id
  - 题目类型: single_choice, multiple_choice, essay, true_false
  - 难度: easy, medium, hard
    `);
    process.exit(0);
  }
  
  if (args[0] === '--template') {
    createCSVTemplate();
    process.exit(0);
  }
  
  const csvFile = args[0];
  importQuestionsFromCSV(csvFile)
    .then(result => {
      console.log('\n🎉 导入任务完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('导入失败:', error.message);
      process.exit(1);
    });
}

module.exports = { importQuestionsFromCSV, createCSVTemplate };
