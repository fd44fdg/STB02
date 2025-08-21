-- 掌上刷题宝数据库初始化脚本
-- 包含真实的题目数据和扩展结构

USE zhangshang_shuati;

-- 首先确保分类表有数据
INSERT IGNORE INTO question_categories (id, name, description, sort_order) VALUES
(1, 'JavaScript基础', 'JavaScript语言基础知识，包括语法、数据类型、函数等', 1),
(2, 'JavaScript高级', 'JavaScript高级特性，包括闭包、原型、异步编程等', 2),
(3, 'ES6+新特性', 'ECMAScript 6及以上版本的新特性', 3);

-- 插入真实的JavaScript题目数据（包含新字段）
INSERT INTO questions (title, content, type, difficulty, subject, options, correct_answer, explanation, category_id, tags, knowledge_points, score, status) VALUES
('JavaScript中的闭包是什么？', 
'请解释JavaScript中闭包的概念，并给出一个实际应用的例子。', 
'essay', 'medium', 'JavaScript', 
NULL,
'闭包是指有权访问另一个函数作用域中的变量的函数。闭包在JavaScript中非常重要，它允许函数访问并操作函数外部的变量。

例子：
```javascript
function outerFunction(x) {
  return function(y) {
    return x + y;
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 输出: 8
```

在这个例子中，内部函数可以访问外部函数的参数x，即使外部函数已经执行完毕。',
'闭包是JavaScript中的核心概念，它使得函数能够"记住"其词法作用域，即使函数在其词法作用域之外执行。闭包常用于数据封装、模块模式、回调函数等场景。',
2, '["闭包", "作用域", "函数"]', '["词法作用域", "函数嵌套", "变量访问"]', 10, 1),

('以下哪个方法可以用来遍历数组？', 
'选择所有可以用来遍历JavaScript数组的方法：', 
'multiple', 'easy', 'JavaScript', 
'["for循环", "forEach方法", "map方法", "while循环", "if语句"]',
'["for循环", "forEach方法", "map方法", "while循环"]',
'for循环、forEach方法、map方法和while循环都可以用来遍历数组。if语句是条件判断语句，不能用于遍历数组。',
1, '["数组", "遍历", "循环"]', '["数组方法", "循环结构"]', 5, 1),

('var、let、const的区别是什么？', 
'请详细说明JavaScript中var、let、const三种变量声明方式的区别。', 
'essay', 'medium', 'JavaScript', 
NULL,
'1. **作用域**：
   - var：函数作用域或全局作用域
   - let/const：块级作用域

2. **变量提升**：
   - var：存在变量提升，声明会被提升到作用域顶部
   - let/const：存在暂时性死区，不能在声明前使用

3. **重复声明**：
   - var：允许重复声明
   - let/const：不允许重复声明

4. **重新赋值**：
   - var/let：可以重新赋值
   - const：不能重新赋值（但对象内容可以修改）',
'这是JavaScript ES6引入的重要特性，理解它们的区别对于编写高质量的JavaScript代码非常重要。',
3, '["变量声明", "ES6", "作用域"]', '["块级作用域", "变量提升", "暂时性死区"]', 8, 1),

('以下代码的输出结果是什么？', 
'```javascript
console.log(typeof null);
console.log(typeof undefined);
console.log(typeof []);
console.log(typeof {});
```', 
'single', 'medium', 'JavaScript', 
'["object, undefined, array, object", "null, undefined, array, object", "object, undefined, object, object", "null, undefined, object, object"]',
'object, undefined, object, object',
'这是JavaScript中的一个经典问题：
- typeof null 返回 "object"（这是JavaScript的一个历史遗留bug）
- typeof undefined 返回 "undefined"
- typeof [] 返回 "object"（数组在JavaScript中是对象类型）
- typeof {} 返回 "object"',
1, '["typeof", "数据类型", "操作符"]', '["类型检测", "JavaScript特性"]', 6, 1),

('Promise的三种状态是什么？', 
'JavaScript中Promise对象有哪三种状态？', 
'single', 'easy', 'JavaScript', 
'["pending, resolved, rejected", "pending, fulfilled, rejected", "waiting, success, error", "loading, complete, failed"]',
'pending, fulfilled, rejected',
'Promise有三种状态：
1. pending（待定）：初始状态，既没有被兑现，也没有被拒绝
2. fulfilled（已兑现）：操作成功完成
3. rejected（已拒绝）：操作失败',
2, '["Promise", "异步编程", "状态"]', '["异步处理", "Promise状态管理"]', 5, 1);