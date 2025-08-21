/**
 * 真实题目数据生成器
 * 生成JavaScript基础、前端开发、算法和数据结构相关的真实题目数据
 */

const { pool, query } = require('../config/database');

class QuestionDataGenerator {
  constructor() {
    this.generatedQuestions = [];
  }

  /**
   * 生成JavaScript基础题目
   */
  generateJavaScriptQuestions() {
    const jsQuestions = [
      // 变量和数据类型
      {
        title: 'JavaScript中的数据类型有哪些？',
        content: '请选择JavaScript中的基本数据类型：',
        type: 'multiple',
        difficulty: 'easy',
        subject: 'JavaScript',
        options: JSON.stringify({
          A: 'Number',
          B: 'String',
          C: 'Boolean',
          D: 'Object',
          E: 'Undefined',
          F: 'Null',
          G: 'Symbol',
          H: 'BigInt'
        }),
        correct_answer: 'A,B,C,E,F,G,H',
        explanation: 'JavaScript有8种数据类型：7种基本类型（Number、String、Boolean、Undefined、Null、Symbol、BigInt）和1种引用类型（Object）。注意Object是引用类型，不是基本类型。基本类型存储在栈中，引用类型存储在堆中，变量存储的是对象的引用地址。',
        category_id: 1,
        tags: JSON.stringify(['数据类型', '基础语法', 'JavaScript']),
        knowledge_points: JSON.stringify(['基本数据类型', '引用数据类型']),
        score: 5,
        status: 1
      },
      {
        title: '== 和 === 的区别',
        content: '以下关于 == 和 === 的说法，哪个是正确的？',
        type: 'single',
        difficulty: 'medium',
        subject: 'JavaScript',
        options: JSON.stringify({
          A: '== 比较值，=== 比较值和类型',
          B: '== 和 === 没有区别',
          C: '=== 会进行类型转换，== 不会',
          D: '== 性能更好'
        }),
        correct_answer: 'A',
        explanation: '== 是相等运算符，会进行类型转换后比较值；=== 是严格相等运算符，不进行类型转换，同时比较值和类型。例如：1 == "1" 为true，但 1 === "1" 为false。',
        category_id: 1,
        tags: JSON.stringify(['比较运算符', '类型转换', 'JavaScript']),
        knowledge_points: JSON.stringify(['相等运算符', '严格相等运算符', '类型转换']),
        score: 6,
        status: 1
      },
      {
        title: 'JavaScript中的作用域',
        content: '请解释JavaScript中的作用域概念，并说明全局作用域、函数作用域和块级作用域的区别。',
        type: 'essay',
        difficulty: 'medium',
        subject: 'JavaScript',
        options: null,
        correct_answer: '作用域是指变量和函数的可访问范围。JavaScript中有三种作用域：\n\n1. **全局作用域**：在代码的任何地方都能访问到，通常是在最外层声明的变量。\n\n2. **函数作用域**：只在函数内部可以访问，使用var声明的变量具有函数作用域。\n\n3. **块级作用域**：只在代码块（{}）内部可以访问，使用let和const声明的变量具有块级作用域。\n\n示例：\n```javascript\nvar globalVar = "全局变量";\n\nfunction example() {\n  var functionVar = "函数作用域变量";\n  \n  if (true) {\n    let blockVar = "块级作用域变量";\n    const blockConst = "块级常量";\n  }\n  \n  // blockVar 和 blockConst 在这里无法访问\n}\n```',
        explanation: '作用域是JavaScript中的核心概念，理解不同作用域的特点对于避免变量污染和编写高质量代码非常重要。ES6引入的let和const提供了块级作用域，解决了var的一些问题。',
        category_id: 1,
        tags: JSON.stringify(['作用域', '变量声明', 'JavaScript']),
        knowledge_points: JSON.stringify(['全局作用域', '函数作用域', '块级作用域', 'var', 'let', 'const']),
        score: 10,
        status: 1
      },
      {
        title: 'JavaScript中的this指向',
        content: '以下代码的输出结果是什么？\n\n```javascript\nconst obj = {\n  name: "张三",\n  getName: function() {\n    return this.name;\n  },\n  getNameArrow: () => {\n    return this.name;\n  }\n};\n\nconsole.log(obj.getName());\nconsole.log(obj.getNameArrow());\n```',
        type: 'single',
        difficulty: 'hard',
        subject: 'JavaScript',
        options: JSON.stringify({
          A: '"张三" 和 "张三"',
          B: '"张三" 和 undefined',
          C: 'undefined 和 "张三"',
          D: 'undefined 和 undefined'
        }),
        correct_answer: 'B',
        explanation: '普通函数中的this指向调用它的对象，所以obj.getName()中的this指向obj，返回"张三"。箭头函数没有自己的this，它会继承外层作用域的this，在这里是全局作用域，全局作用域中没有name属性，所以返回undefined。',
        category_id: 2,
        tags: JSON.stringify(['this指向', '箭头函数', '普通函数']),
        knowledge_points: JSON.stringify(['this绑定', '箭头函数特性', '函数调用']),
        score: 8,
        status: 1
      },
      {
        title: 'JavaScript闭包的应用',
        content: '以下哪个是闭包的典型应用场景？',
        type: 'multiple',
        difficulty: 'medium',
        subject: 'JavaScript',
        options: JSON.stringify({
          A: '模块模式',
          B: '防抖和节流',
          C: '回调函数',
          D: '数据封装',
          E: '循环中的异步操作'
        }),
        correct_answer: 'A,B,C,D,E',
        explanation: '闭包在JavaScript中有广泛的应用：\n1. 模块模式：创建私有变量和方法\n2. 防抖和节流：保存定时器状态\n3. 回调函数：访问外部变量\n4. 数据封装：创建私有作用域\n5. 循环中的异步操作：保存循环变量的值',
        category_id: 2,
        tags: JSON.stringify(['闭包', '应用场景', 'JavaScript']),
        knowledge_points: JSON.stringify(['闭包应用', '模块模式', '数据封装']),
        score: 7,
        status: 1
      },
      {
        title: 'Promise的使用',
        content: '以下代码的执行顺序是什么？\n\n```javascript\nconsole.log("1");\n\nPromise.resolve().then(() => {\n  console.log("2");\n});\n\nconsole.log("3");\n\nsetTimeout(() => {\n  console.log("4");\n}, 0);\n\nconsole.log("5");\n```',
        type: 'single',
        difficulty: 'hard',
        subject: 'JavaScript',
        options: JSON.stringify({
          A: '1, 3, 5, 2, 4',
          B: '1, 2, 3, 4, 5',
          C: '1, 3, 5, 4, 2',
          D: '1, 2, 3, 5, 4'
        }),
        correct_answer: 'A',
        explanation: '这涉及到JavaScript的事件循环机制：\n1. 同步代码先执行：1, 3, 5\n2. 微任务（Promise.then）优先于宏任务（setTimeout）执行\n3. 所以顺序是：1, 3, 5, 2, 4\n\n微任务队列的优先级高于宏任务队列。',
        category_id: 2,
        tags: JSON.stringify(['Promise', '事件循环', '异步编程']),
        knowledge_points: JSON.stringify(['事件循环', '微任务', '宏任务', 'Promise']),
        score: 9,
        status: 1
      },
      {
        title: 'async/await的错误处理',
        content: '在async/await中，如何正确处理错误？',
        type: 'single',
        difficulty: 'medium',
        subject: 'JavaScript',
        options: JSON.stringify({
          A: '使用.catch()方法',
          B: '使用try-catch语句',
          C: '使用Promise.catch()',
          D: '不需要处理错误'
        }),
        correct_answer: 'B',
        explanation: '在async/await中，应该使用try-catch语句来处理错误：\n\n```javascript\nasync function example() {\n  try {\n    const result = await someAsyncOperation();\n    return result;\n  } catch (error) {\n    console.error("错误:", error);\n    throw error;\n  }\n}\n```\n\n这样可以捕获await表达式中的异步错误。',
        category_id: 2,
        tags: JSON.stringify(['async/await', '错误处理', '异步编程']),
        knowledge_points: JSON.stringify(['async函数', 'await表达式', 'try-catch', '异步错误处理']),
        score: 7,
        status: 1
      },
      {
        title: 'JavaScript原型链',
        content: '请解释JavaScript中的原型链概念，并说明它是如何工作的。',
        type: 'essay',
        difficulty: 'hard',
        subject: 'JavaScript',
        options: null,
        correct_answer: '原型链是JavaScript实现继承的机制。每个对象都有一个内部属性[[Prototype]]（可通过__proto__访问），指向它的原型对象。\n\n**工作原理：**\n1. 当访问对象的属性时，如果对象本身没有该属性，会沿着原型链向上查找\n2. 查找过程会一直持续到找到属性或到达原型链的顶端（null）\n3. 所有对象的原型链最终都指向Object.prototype，再指向null\n\n**示例：**\n```javascript\nfunction Person(name) {\n  this.name = name;\n}\n\nPerson.prototype.sayHello = function() {\n  return `Hello, I am ${this.name}`;\n};\n\nconst person = new Person("张三");\nconsole.log(person.sayHello()); // 通过原型链找到方法\n```\n\n**原型链的意义：**\n- 实现继承\n- 节省内存（方法共享）\n- 动态扩展对象功能',
        explanation: '原型链是JavaScript面向对象编程的核心机制，理解原型链对于掌握JavaScript的继承、this指向、以及各种设计模式都非常重要。',
        category_id: 2,
        tags: JSON.stringify(['原型链', '继承', '面向对象']),
        knowledge_points: JSON.stringify(['prototype', '__proto__', '原型继承', '属性查找']),
        score: 12,
        status: 1
      }
    ];

    return jsQuestions;
  }

  /**
   * 生成前端开发相关题目
   */
  generateFrontendQuestions() {
    const frontendQuestions = [
      // HTML相关
      {
        title: 'HTML5新增的语义化标签',
        content: '以下哪些是HTML5新增的语义化标签？',
        type: 'multiple',
        difficulty: 'easy',
        subject: 'HTML',
        options: JSON.stringify({
          A: 'header',
          B: 'nav',
          C: 'article',
          D: 'section',
          E: 'aside',
          F: 'footer',
          G: 'div',
          H: 'span'
        }),
        correct_answer: 'A,B,C,D,E,F',
        explanation: 'HTML5新增了许多语义化标签来更好地描述页面结构：header（页眉）、nav（导航）、article（文章）、section（章节）、aside（侧边栏）、footer（页脚）等。div和span是HTML早期就有的标签。',
        category_id: 1,
        tags: JSON.stringify(['HTML5', '语义化标签', '前端基础']),
        knowledge_points: JSON.stringify(['HTML5新特性', '语义化', '页面结构']),
        score: 5,
        status: 1
      },
      // CSS相关
      {
        title: 'CSS盒模型的组成',
        content: 'CSS标准盒模型由哪些部分组成？',
        type: 'single',
        difficulty: 'easy',
        subject: 'CSS',
        options: JSON.stringify({
          A: 'content + padding',
          B: 'content + padding + border',
          C: 'content + padding + border + margin',
          D: 'padding + border + margin'
        }),
        correct_answer: 'C',
        explanation: 'CSS盒模型由四个部分组成：\n1. content（内容区域）：实际内容显示的区域\n2. padding（内边距）：内容与边框之间的空间\n3. border（边框）：围绕内容和内边距的边界\n4. margin（外边距）：元素与其他元素之间的空间\n\n这四个部分从内到外依次包围，形成了完整的盒模型。理解盒模型对于CSS布局非常重要。',
        category_id: 1,
        tags: JSON.stringify(['CSS', '盒模型', '布局']),
        knowledge_points: JSON.stringify(['盒模型', '布局基础', 'CSS基础']),
        score: 4,
        status: 1
      },
      {
        title: 'Flexbox布局的主轴和交叉轴',
        content: '在Flexbox布局中，如果flex-direction设置为column，那么主轴和交叉轴分别是什么？',
        type: 'single',
        difficulty: 'medium',
        subject: 'CSS',
        options: JSON.stringify({
          A: '主轴是水平方向，交叉轴是垂直方向',
          B: '主轴是垂直方向，交叉轴是水平方向',
          C: '主轴和交叉轴都是水平方向',
          D: '主轴和交叉轴都是垂直方向'
        }),
        correct_answer: 'B',
        explanation: '在Flexbox布局中：\n- flex-direction: row（默认）时，主轴是水平方向，交叉轴是垂直方向\n- flex-direction: column时，主轴是垂直方向，交叉轴是水平方向\n\n主轴决定了flex项目的排列方向，交叉轴与主轴垂直。',
        category_id: 1,
        tags: JSON.stringify(['CSS', 'Flexbox', '布局']),
        knowledge_points: JSON.stringify(['Flexbox', '主轴', '交叉轴', 'flex-direction']),
        score: 6,
        status: 1
      },
      {
        title: 'CSS Grid布局的基本概念',
        content: '请解释CSS Grid布局中网格容器、网格项目、网格线、网格轨道的概念。',
        type: 'essay',
        difficulty: 'medium',
        subject: 'CSS',
        options: null,
        correct_answer: 'CSS Grid布局的基本概念：\n\n1. **网格容器（Grid Container）**：\n   - 设置了display: grid或display: inline-grid的元素\n   - 是所有网格项目的直接父元素\n\n2. **网格项目（Grid Item）**：\n   - 网格容器的直接子元素\n   - 会自动成为网格项目\n\n3. **网格线（Grid Line）**：\n   - 构成网格结构的分界线\n   - 可以是垂直的（列网格线）或水平的（行网格线）\n   - 可以通过数字或名称引用\n\n4. **网格轨道（Grid Track）**：\n   - 两条相邻网格线之间的空间\n   - 可以是行轨道或列轨道\n   - 通过grid-template-rows和grid-template-columns定义\n\n示例：\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  grid-template-rows: 100px 200px;\n  gap: 10px;\n}\n```',
        explanation: 'CSS Grid是二维布局系统，理解这些基本概念是掌握Grid布局的基础。Grid布局特别适合复杂的页面布局。',
        category_id: 1,
        tags: JSON.stringify(['CSS', 'Grid布局', '二维布局']),
        knowledge_points: JSON.stringify(['Grid容器', 'Grid项目', '网格线', '网格轨道']),
        score: 10,
        status: 1
      },
      // Vue.js相关
      {
        title: 'Vue.js的响应式原理',
        content: 'Vue 2.x中的响应式原理是基于什么实现的？',
        type: 'single',
        difficulty: 'medium',
        subject: 'Vue.js',
        options: JSON.stringify({
          A: 'Proxy',
          B: 'Object.defineProperty',
          C: 'MutationObserver',
          D: 'EventTarget'
        }),
        correct_answer: 'B',
        explanation: 'Vue 2.x的响应式原理是基于Object.defineProperty实现的：\n\n1. 通过Object.defineProperty劫持对象属性的getter和setter\n2. 在getter中收集依赖（Watcher）\n3. 在setter中触发更新\n4. 通过Dep类管理依赖关系\n\nVue 3.x改用Proxy实现，解决了Object.defineProperty的一些限制。',
        category_id: 1,
        tags: JSON.stringify(['Vue.js', '响应式原理', '数据绑定']),
        knowledge_points: JSON.stringify(['Object.defineProperty', '响应式系统', '依赖收集']),
        score: 8,
        status: 1
      },
      {
        title: 'Vue组件间通信方式',
        content: 'Vue组件间通信有哪些方式？',
        type: 'multiple',
        difficulty: 'medium',
        subject: 'Vue.js',
        options: JSON.stringify({
          A: 'props和$emit',
          B: '$parent和$children',
          C: 'provide和inject',
          D: 'Vuex状态管理',
          E: 'EventBus事件总线',
          F: '$refs引用'
        }),
        correct_answer: 'A,B,C,D,E,F',
        explanation: 'Vue组件间通信的主要方式：\n\n1. **props和$emit**：父子组件通信的标准方式\n2. **$parent和$children**：直接访问父子组件实例\n3. **provide和inject**：祖先组件向后代组件传递数据\n4. **Vuex**：全局状态管理，适合复杂应用\n5. **EventBus**：通过事件总线进行组件通信\n6. **$refs**：获取子组件或DOM元素的引用\n\n选择合适的通信方式取决于组件关系和应用复杂度。',
        category_id: 1,
        tags: JSON.stringify(['Vue.js', '组件通信', '数据传递']),
        knowledge_points: JSON.stringify(['props', '$emit', 'provide/inject', 'Vuex', 'EventBus']),
        score: 9,
        status: 1
      },
      // React相关
      {
        title: 'React Hooks的使用规则',
        content: '关于React Hooks的使用规则，以下哪些是正确的？',
        type: 'multiple',
        difficulty: 'medium',
        subject: 'React',
        options: JSON.stringify({
          A: '只能在函数组件中使用',
          B: '只能在组件的顶层调用',
          C: '不能在循环、条件或嵌套函数中调用',
          D: '可以在类组件中使用',
          E: 'Hook的调用顺序必须保持一致'
        }),
        correct_answer: 'A,B,C,E',
        explanation: 'React Hooks的使用规则：\n\n1. **只能在函数组件或自定义Hook中使用**，不能在类组件中使用\n2. **只能在组件的顶层调用**，不能在循环、条件判断或嵌套函数中调用\n3. **Hook的调用顺序必须保持一致**，React依赖调用顺序来正确关联Hook状态\n\n这些规则确保了Hook能够正确工作，违反规则可能导致bug。',
        category_id: 1,
        tags: JSON.stringify(['React', 'Hooks', '使用规则']),
        knowledge_points: JSON.stringify(['Hook规则', '函数组件', '调用顺序']),
        score: 7,
        status: 1
      },
      {
        title: 'useEffect的依赖数组',
        content: '以下关于useEffect依赖数组的说法，哪个是正确的？',
        type: 'single',
        difficulty: 'medium',
        subject: 'React',
        options: JSON.stringify({
          A: '依赖数组为空时，effect每次渲染都会执行',
          B: '依赖数组为空时，effect只在组件挂载时执行一次',
          C: '不传依赖数组和传空数组效果相同',
          D: '依赖数组中的值变化时，effect不会重新执行'
        }),
        correct_answer: 'B',
        explanation: 'useEffect依赖数组的行为：\n\n1. **不传依赖数组**：每次渲染后都执行\n2. **空依赖数组[]**：只在组件挂载时执行一次\n3. **有依赖项[dep1, dep2]**：依赖项变化时执行\n\n```javascript\n// 每次渲染都执行\nuseEffect(() => {\n  console.log("每次渲染");\n});\n\n// 只执行一次\nuseEffect(() => {\n  console.log("只执行一次");\n}, []);\n\n// count变化时执行\nuseEffect(() => {\n  console.log("count变化");\n}, [count]);\n```',
        category_id: 1,
        tags: JSON.stringify(['React', 'useEffect', '依赖数组']),
        knowledge_points: JSON.stringify(['useEffect', '副作用', '依赖管理']),
        score: 8,
        status: 1
      }
    ];

    return frontendQuestions;
  }

  /**
   * 生成算法和数据结构题目
   */
  generateAlgorithmQuestions() {
    const algorithmQuestions = [
      {
        title: '时间复杂度分析',
        content: '以下代码的时间复杂度是多少？\n\n```javascript\nfunction example(n) {\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n      console.log(i, j);\n    }\n  }\n}\n```',
        type: 'single',
        difficulty: 'easy',
        subject: '算法',
        options: JSON.stringify({
          A: 'O(n)',
          B: 'O(n²)',
          C: 'O(log n)',
          D: 'O(n log n)'
        }),
        correct_answer: 'B',
        explanation: '这是一个嵌套循环，外层循环执行n次，内层循环每次也执行n次，总共执行n×n=n²次操作，所以时间复杂度是O(n²)。',
        category_id: 3,
        tags: JSON.stringify(['时间复杂度', '算法分析', '循环']),
        knowledge_points: JSON.stringify(['时间复杂度', '大O表示法', '循环分析']),
        score: 6,
        status: 1
      },
      {
        title: '数组排序算法',
        content: '以下哪些是稳定的排序算法？',
        type: 'multiple',
        difficulty: 'medium',
        subject: '算法',
        options: JSON.stringify({
          A: '冒泡排序',
          B: '选择排序',
          C: '插入排序',
          D: '归并排序',
          E: '快速排序',
          F: '堆排序'
        }),
        correct_answer: 'A,C,D',
        explanation: '稳定排序算法是指相等元素的相对顺序在排序后保持不变：\n\n**稳定排序**：\n- 冒泡排序：相邻比较，相等时不交换\n- 插入排序：向前插入时遇到相等元素停止\n- 归并排序：合并时相等元素优先取左边\n\n**不稳定排序**：\n- 选择排序：可能将相等元素交换到不同位置\n- 快速排序：分区过程可能改变相等元素顺序\n- 堆排序：堆调整过程可能改变相等元素顺序',
        category_id: 3,
        tags: JSON.stringify(['排序算法', '稳定性', '算法特性']),
        knowledge_points: JSON.stringify(['排序稳定性', '冒泡排序', '插入排序', '归并排序']),
        score: 8,
        status: 1
      },
      {
        title: '二分查找的实现',
        content: '请实现一个二分查找算法，在有序数组中查找目标值。',
        type: 'essay',
        difficulty: 'medium',
        subject: '算法',
        options: null,
        correct_answer: '二分查找算法实现：\n\n```javascript\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    // 防止整数溢出\n    const mid = Math.floor(left + (right - left) / 2);\n    \n    if (arr[mid] === target) {\n      return mid; // 找到目标值，返回索引\n    } else if (arr[mid] < target) {\n      left = mid + 1; // 目标值在右半部分\n    } else {\n      right = mid - 1; // 目标值在左半部分\n    }\n  }\n  \n  return -1; // 未找到目标值\n}\n\n// 使用示例\nconst arr = [1, 3, 5, 7, 9, 11, 13];\nconsole.log(binarySearch(arr, 7)); // 输出: 3\nconsole.log(binarySearch(arr, 6)); // 输出: -1\n```\n\n**算法要点**：\n1. 数组必须是有序的\n2. 时间复杂度：O(log n)\n3. 空间复杂度：O(1)\n4. 每次比较后搜索范围减半',
        explanation: '二分查找是一种高效的查找算法，适用于有序数组。通过不断缩小搜索范围，能够快速定位目标值。该算法的时间复杂度为O(log n)，比线性查找的O(n)效率更高，是处理大量有序数据查找的理想选择。',
        category_id: 3,
        tags: JSON.stringify(['二分查找', '查找算法', '有序数组']),
        knowledge_points: JSON.stringify(['二分查找', '时间复杂度', '查找算法']),
        score: 10,
        status: 1
      },
      {
        title: '栈和队列的区别',
        content: '关于栈（Stack）和队列（Queue）的说法，哪些是正确的？',
        type: 'multiple',
        difficulty: 'easy',
        subject: '数据结构',
        options: JSON.stringify({
          A: '栈是后进先出（LIFO）的数据结构',
          B: '队列是先进先出（FIFO）的数据结构',
          C: '栈只能在一端进行插入和删除操作',
          D: '队列可以在两端进行插入和删除操作',
          E: '栈适合实现递归调用',
          F: '队列适合实现广度优先搜索'
        }),
        correct_answer: 'A,B,C,E,F',
        explanation: '栈和队列的特点：\n\n**栈（Stack）**：\n- 后进先出（LIFO）\n- 只能在栈顶进行插入和删除\n- 适合：递归调用、表达式求值、括号匹配\n\n**队列（Queue）**：\n- 先进先出（FIFO）\n- 在队尾插入，在队头删除\n- 适合：广度优先搜索、任务调度、缓冲区\n\n注意：普通队列不能在两端都进行插入和删除，那是双端队列（Deque）的特点。',
        category_id: 3,
        tags: JSON.stringify(['栈', '队列', '数据结构', 'LIFO', 'FIFO']),
        knowledge_points: JSON.stringify(['栈结构', '队列结构', '数据结构特性']),
        score: 7,
        status: 1
      },
      {
        title: '链表的优缺点',
        content: '相比数组，链表有哪些优缺点？',
        type: 'essay',
        difficulty: 'medium',
        subject: '数据结构',
        options: null,
        correct_answer: '链表相比数组的优缺点：\n\n**链表的优点**：\n1. **动态大小**：可以在运行时动态分配内存，大小可变\n2. **插入删除高效**：在已知节点位置时，插入和删除操作时间复杂度为O(1)\n3. **内存利用率高**：只分配需要的内存，没有预分配的浪费\n4. **适合频繁插入删除**：特别是在中间位置的操作\n\n**链表的缺点**：\n1. **随机访问慢**：不支持索引访问，查找元素需要O(n)时间\n2. **额外内存开销**：每个节点需要存储指针，占用额外内存\n3. **缓存局部性差**：节点在内存中不连续，缓存命中率低\n4. **不支持二分查找**：无法利用有序性进行快速查找\n\n**适用场景**：\n- 链表：频繁插入删除，大小不确定\n- 数组：频繁随机访问，大小相对固定',
        explanation: '选择链表还是数组取决于具体的使用场景和性能需求。理解它们的特点有助于做出正确的数据结构选择。在实际开发中，如果需要频繁插入删除操作，链表更合适；如果需要频繁随机访问，数组更合适。',
        category_id: 3,
        tags: JSON.stringify(['链表', '数组', '数据结构比较']),
        knowledge_points: JSON.stringify(['链表特性', '数组特性', '时间复杂度', '空间复杂度']),
        score: 9,
        status: 1
      },
      {
        title: '递归算法的特点',
        content: '关于递归算法，以下说法正确的是？',
        type: 'multiple',
        difficulty: 'medium',
        subject: '算法',
        options: JSON.stringify({
          A: '递归必须有基础情况（base case）',
          B: '递归调用必须向基础情况收敛',
          C: '递归算法都可以转换为迭代算法',
          D: '递归算法的空间复杂度通常较高',
          E: '递归算法总是比迭代算法慢'
        }),
        correct_answer: 'A,B,C,D',
        explanation: '递归算法的特点：\n\n**正确说法**：\n1. **必须有基础情况**：防止无限递归\n2. **必须收敛**：每次递归调用都要向基础情况靠近\n3. **可转换为迭代**：任何递归都可以用栈模拟实现\n4. **空间复杂度较高**：需要维护调用栈\n\n**错误说法**：\n- 递归不总是比迭代慢，有时递归更简洁高效\n\n**递归的优缺点**：\n- 优点：代码简洁，逻辑清晰\n- 缺点：可能栈溢出，性能开销大',
        category_id: 3,
        tags: JSON.stringify(['递归', '算法设计', '基础情况']),
        knowledge_points: JSON.stringify(['递归原理', '基础情况', '递归收敛', '调用栈']),
        score: 8,
        status: 1
      }
    ];

    return algorithmQuestions;
  }

  /**
   * 生成所有题目数据
   */
  async generateAllQuestions() {
    console.log('🔄 开始生成真实题目数据...');
    
    try {
      // 生成各类题目
      const jsQuestions = this.generateJavaScriptQuestions();
      const frontendQuestions = this.generateFrontendQuestions();
      const algorithmQuestions = this.generateAlgorithmQuestions();
      
      // 合并所有题目
      this.generatedQuestions = [
        ...jsQuestions,
        ...frontendQuestions,
        ...algorithmQuestions
      ];
      
      console.log(`✅ 成功生成 ${this.generatedQuestions.length} 道题目`);
      console.log(`   - JavaScript基础题目: ${jsQuestions.length} 道`);
      console.log(`   - 前端开发题目: ${frontendQuestions.length} 道`);
      console.log(`   - 算法数据结构题目: ${algorithmQuestions.length} 道`);
      
      return this.generatedQuestions;
      
    } catch (error) {
      console.error('❌ 生成题目数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 将生成的题目数据插入数据库
   */
  async insertQuestionsToDatabase() {
    if (this.generatedQuestions.length === 0) {
      throw new Error('没有可插入的题目数据，请先生成题目');
    }
    
    console.log('🔄 开始插入题目数据到数据库...');
    
    try {
      // 检查是否已有数据
      const [existingQuestions] = await pool.execute('SELECT COUNT(*) as count FROM questions');
      
      if (existingQuestions[0].count > 0) {
        console.log('⚠️  数据库中已有题目数据');
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise((resolve) => {
          rl.question('是否要清空现有数据并重新插入？(y/N): ', resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await pool.execute('DELETE FROM questions');
          console.log('🗑️  已清空现有题目数据');
        } else {
          console.log('❌ 取消插入操作');
          return;
        }
      }
      
      // 插入题目数据
      let insertedCount = 0;
      for (const question of this.generatedQuestions) {
        await pool.execute(
          `INSERT INTO questions (
            title, content, type, difficulty, subject, options, correct_answer, 
            explanation, category_id, tags, knowledge_points, score, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            question.title,
            question.content,
            question.type,
            question.difficulty,
            question.subject,
            question.options,
            question.correct_answer,
            question.explanation,
            question.category_id,
            question.tags,
            question.knowledge_points,
            question.score,
            question.status
          ]
        );
        insertedCount++;
      }
      
      console.log(`✅ 成功插入 ${insertedCount} 道题目到数据库`);
      
      // 验证插入结果
      const [finalCount] = await pool.execute('SELECT COUNT(*) as count FROM questions');
      console.log(`📊 数据库中现有题目总数: ${finalCount[0].count}`);
      
    } catch (error) {
      console.error('❌ 插入题目数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 验证生成的题目数据质量
   */
  validateQuestions() {
    console.log('🔍 验证题目数据质量...');
    
    const issues = [];
    
    this.generatedQuestions.forEach((question, index) => {
      // 检查必填字段
      const requiredFields = ['title', 'content', 'type', 'difficulty', 'subject', 'correct_answer', 'explanation'];
      requiredFields.forEach(field => {
        if (!question[field]) {
          issues.push(`题目 ${index + 1}: 缺少必填字段 ${field}`);
        }
      });
      
      // 检查选择题的选项格式
      if (['single', 'multiple'].includes(question.type)) {
        if (!question.options) {
          issues.push(`题目 ${index + 1}: 选择题缺少选项`);
        } else {
          try {
            const options = JSON.parse(question.options);
            if (Object.keys(options).length < 2) {
              issues.push(`题目 ${index + 1}: 选择题选项数量不足`);
            }
          } catch (e) {
            issues.push(`题目 ${index + 1}: 选项格式错误`);
          }
        }
      }
      
      // 检查难度级别
      if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
        issues.push(`题目 ${index + 1}: 难度级别无效`);
      }
      
      // 检查题目类型
      if (!['single', 'multiple', 'essay', 'judge'].includes(question.type)) {
        issues.push(`题目 ${index + 1}: 题目类型无效`);
      }
    });
    
    if (issues.length > 0) {
      console.log('❌ 发现数据质量问题:');
      issues.forEach(issue => console.log(`   ${issue}`));
      return false;
    } else {
      console.log('✅ 题目数据质量验证通过');
      return true;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const generator = new QuestionDataGenerator();
  
  generator.generateAllQuestions()
    .then(() => generator.validateQuestions())
    .then((isValid) => {
      if (isValid) {
        return generator.insertQuestionsToDatabase();
      } else {
        throw new Error('题目数据质量验证失败');
      }
    })
    .then(() => {
      console.log('🎉 真实题目数据生成完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 生成过程中发生错误:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = QuestionDataGenerator;