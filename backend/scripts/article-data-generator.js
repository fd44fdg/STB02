/**
 * 真实文章数据生成器
 * 生成技术文章和教程类文章的真实数据
 */

const { pool } = require('../config/database');

class ArticleDataGenerator {
  constructor() {
    this.generatedArticles = [];
  }

  /**
   * 生成技术文章内容
   */
  generateTechArticles() {
    const techArticles = [
      // JavaScript技术文章
      {
        title: 'JavaScript ES2023 新特性详解',
        content: `# JavaScript ES2023 新特性详解

JavaScript 语言在不断发展，ES2023（ES14）带来了一些令人兴奋的新特性。本文将详细介绍这些新特性及其实际应用。

## 1. Array.prototype.findLast() 和 findLastIndex()

这两个新方法允许我们从数组的末尾开始查找元素：

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];

// 从末尾查找第一个大于3的元素
const lastGreaterThan3 = numbers.findLast(num => num > 3);
console.log(lastGreaterThan3); // 4

// 获取该元素的索引
const lastIndex = numbers.findLastIndex(num => num > 3);
console.log(lastIndex); // 5
\`\`\`

## 2. Array.prototype.toReversed()

创建数组的反转副本，不修改原数组：

\`\`\`javascript
const original = [1, 2, 3, 4, 5];
const reversed = original.toReversed();

console.log(original); // [1, 2, 3, 4, 5]
console.log(reversed); // [5, 4, 3, 2, 1]
\`\`\`

## 3. Array.prototype.toSorted()

创建排序后的数组副本：

\`\`\`javascript
const fruits = ['banana', 'apple', 'cherry'];
const sorted = fruits.toSorted();

console.log(fruits); // ['banana', 'apple', 'cherry']
console.log(sorted); // ['apple', 'banana', 'cherry']
\`\`\`

## 4. Array.prototype.toSpliced()

非破坏性的 splice 操作：

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];
const spliced = numbers.toSpliced(2, 1, 'a', 'b');

console.log(numbers); // [1, 2, 3, 4, 5]
console.log(spliced); // [1, 2, 'a', 'b', 4, 5]
\`\`\`

## 5. Array.prototype.with()

返回指定索引处元素被替换的新数组：

\`\`\`javascript
const colors = ['red', 'green', 'blue'];
const newColors = colors.with(1, 'yellow');

console.log(colors); // ['red', 'green', 'blue']
console.log(newColors); // ['red', 'yellow', 'blue']
\`\`\`

## 实际应用场景

这些新特性在实际开发中非常有用：

### 状态管理
在 React 或 Vue 等框架中，这些方法可以帮助我们更好地管理不可变状态：

\`\`\`javascript
// React 状态更新示例
const [items, setItems] = useState(['item1', 'item2', 'item3']);

// 更新特定索引的项目
const updateItem = (index, newValue) => {
  setItems(items.with(index, newValue));
};

// 添加新项目到开头
const addItemToStart = (newItem) => {
  setItems([newItem, ...items]);
};
\`\`\`

### 数据处理
在处理大量数据时，这些方法提供了更安全的操作方式：

\`\`\`javascript
// 处理用户列表
const users = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false },
  { id: 3, name: 'Charlie', active: true }
];

// 找到最后一个活跃用户
const lastActiveUser = users.findLast(user => user.active);

// 创建按名称排序的新列表
const sortedUsers = users.toSorted((a, b) => a.name.localeCompare(b.name));
\`\`\`

## 总结

ES2023 的这些新特性主要关注数组操作的不可变性，这与现代 JavaScript 开发的最佳实践完美契合。它们不仅提高了代码的安全性，还使得函数式编程变得更加容易。

在使用这些新特性时，请确保你的目标环境支持它们，或者使用适当的 polyfill。`,
        author: 'JavaScript专家',
        cover_image: '/images/articles/es2023-features.jpg',
        category: 'JavaScript',
        tags: JSON.stringify(['JavaScript', 'ES2023', '新特性', '数组方法']),
        view_count: 1250,
        like_count: 89,
        status: 'published'
      },      {
   
     title: 'Vue 3 Composition API 深度解析',
        content: `# Vue 3 Composition API 深度解析

Vue 3 引入的 Composition API 是一个重大的变革，它为 Vue 应用提供了更好的逻辑复用和代码组织方式。

## 为什么需要 Composition API？

### Options API 的局限性

在 Vue 2 中，我们使用 Options API 来组织组件：

\`\`\`javascript
export default {
  data() {
    return {
      count: 0,
      message: 'Hello'
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  }
}
\`\`\`

当组件变得复杂时，相关的逻辑会分散在不同的选项中，难以维护。

### Composition API 的优势

Composition API 允许我们按逻辑功能组织代码：

\`\`\`javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    // 计数器逻辑
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    const increment = () => count.value++

    // 消息逻辑
    const message = ref('Hello')
    const updateMessage = (newMessage) => {
      message.value = newMessage
    }

    return {
      count,
      doubleCount,
      increment,
      message,
      updateMessage
    }
  }
}
\`\`\`

## 核心 API 详解

### 1. ref() - 响应式引用

\`\`\`javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
\`\`\`

### 2. reactive() - 响应式对象

\`\`\`javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

state.count++
state.message = 'Hi'
\`\`\`

### 3. computed() - 计算属性

\`\`\`javascript
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 可写的计算属性
const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
\`\`\`

### 4. watch() 和 watchEffect()

\`\`\`javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)

// watch 特定的响应式引用
watch(count, (newValue, oldValue) => {
  console.log(\`count changed from \${oldValue} to \${newValue}\`)
})

// watchEffect 自动追踪依赖
watchEffect(() => {
  console.log(\`count is \${count.value}\`)
})
\`\`\`

## 实际应用示例

### 用户管理组件

\`\`\`javascript
import { ref, reactive, computed, onMounted } from 'vue'
import { fetchUsers, createUser, updateUser, deleteUser } from '@/api/users'

export default {
  setup() {
    // 状态管理
    const users = ref([])
    const loading = ref(false)
    const error = ref(null)
    
    // 表单状态
    const form = reactive({
      name: '',
      email: '',
      role: 'user'
    })
    
    // 计算属性
    const activeUsers = computed(() => 
      users.value.filter(user => user.status === 'active')
    )
    
    const userCount = computed(() => users.value.length)
    
    // 方法
    const loadUsers = async () => {
      loading.value = true
      error.value = null
      
      try {
        users.value = await fetchUsers()
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }
    
    const addUser = async () => {
      try {
        const newUser = await createUser(form)
        users.value.push(newUser)
        resetForm()
      } catch (err) {
        error.value = err.message
      }
    }
    
    const removeUser = async (userId) => {
      try {
        await deleteUser(userId)
        users.value = users.value.filter(user => user.id !== userId)
      } catch (err) {
        error.value = err.message
      }
    }
    
    const resetForm = () => {
      form.name = ''
      form.email = ''
      form.role = 'user'
    }
    
    // 生命周期
    onMounted(() => {
      loadUsers()
    })
    
    return {
      users,
      loading,
      error,
      form,
      activeUsers,
      userCount,
      loadUsers,
      addUser,
      removeUser,
      resetForm
    }
  }
}
\`\`\`

## 逻辑复用 - Composables

创建可复用的逻辑：

\`\`\`javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  const isEven = computed(() => count.value % 2 === 0)
  const isPositive = computed(() => count.value > 0)
  
  return {
    count,
    increment,
    decrement,
    reset,
    isEven,
    isPositive
  }
}

// 在组件中使用
import { useCounter } from '@/composables/useCounter'

export default {
  setup() {
    const { count, increment, decrement, isEven } = useCounter(10)
    
    return {
      count,
      increment,
      decrement,
      isEven
    }
  }
}
\`\`\`

## 最佳实践

### 1. 合理使用 ref 和 reactive

- 基本类型使用 \`ref()\`
- 对象类型可以使用 \`reactive()\` 或 \`ref()\`
- 保持一致性

### 2. 逻辑分组

将相关的状态和方法组织在一起：

\`\`\`javascript
export default {
  setup() {
    // 用户相关逻辑
    const {
      users,
      loadUsers,
      addUser,
      removeUser
    } = useUsers()
    
    // 搜索相关逻辑
    const {
      searchQuery,
      filteredUsers,
      clearSearch
    } = useSearch(users)
    
    // 分页相关逻辑
    const {
      currentPage,
      pageSize,
      paginatedUsers,
      totalPages
    } = usePagination(filteredUsers)
    
    return {
      users: paginatedUsers,
      searchQuery,
      currentPage,
      totalPages,
      loadUsers,
      addUser,
      removeUser,
      clearSearch
    }
  }
}
\`\`\`

### 3. 类型安全（TypeScript）

\`\`\`typescript
import { ref, Ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export function useUsers() {
  const users: Ref<User[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  
  const addUser = (user: Omit<User, 'id'>) => {
    // 实现逻辑
  }
  
  return {
    users,
    loading,
    addUser
  }
}
\`\`\`

## 总结

Composition API 为 Vue 3 带来了更好的代码组织方式和逻辑复用能力。它不是 Options API 的替代品，而是一个补充。在选择使用哪种 API 时，考虑以下因素：

- 组件复杂度
- 逻辑复用需求
- 团队熟悉程度
- TypeScript 支持需求

掌握 Composition API 将帮助你构建更加可维护和可扩展的 Vue 应用。`,
        author: 'Vue.js专家',
        cover_image: '/images/articles/vue3-composition-api.jpg',
        category: 'Vue.js',
        tags: JSON.stringify(['Vue.js', 'Composition API', 'Vue 3', '前端框架']),
        view_count: 2100,
        like_count: 156,
        status: 'published'
      }, 
     {
        title: 'React Hooks 最佳实践指南',
        content: `# React Hooks 最佳实践指南

React Hooks 自 React 16.8 引入以来，已经成为现代 React 开发的标准。本文将深入探讨 Hooks 的最佳实践。

## 基础 Hooks 回顾

### useState

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

### useEffect

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

## 自定义 Hooks

### 数据获取 Hook

\`\`\`javascript
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
}

// 使用示例
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

### 本地存储 Hook

\`\`\`javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(\`Error reading localStorage key "\${key}":, error\`);
      return initialValue;
    }
  });
  
  // 设置值的函数
  const setValue = (value) => {
    try {
      // 允许值是一个函数，用于与 useState 保持一致
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(\`Error setting localStorage key "\${key}":, error\`);
    }
  };
  
  return [storedValue, setValue];
}

// 使用示例
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'en');
  
  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
}
\`\`\`

## 性能优化

### useMemo 和 useCallback

\`\`\`javascript
import React, { useState, useMemo, useCallback } from 'react';

function ExpensiveComponent({ items, filter }) {
  // 缓存昂贵的计算
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);
  
  // 缓存事件处理函数
  const handleItemClick = useCallback((itemId) => {
    console.log('Item clicked:', itemId);
    // 处理点击逻辑
  }, []);
  
  return (
    <div>
      {filteredItems.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
}

const ItemComponent = React.memo(({ item, onClick }) => {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  );
});
\`\`\`

### 防抖 Hook

\`\`\`javascript
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用示例
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      console.log('Searching for:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
\`\`\`

## 状态管理

### useReducer 用于复杂状态

\`\`\`javascript
import React, { useReducer } from 'react';

const initialState = {
  items: [],
  loading: false,
  error: null
};

function itemsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    default:
      return state;
  }
}

function ItemManager() {
  const [state, dispatch] = useReducer(itemsReducer, initialState);
  
  const fetchItems = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await fetch('/api/items');
      const items = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: items });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };
  
  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };
  
  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };
  
  return (
    <div>
      {state.loading && <div>Loading...</div>}
      {state.error && <div>Error: {state.error}</div>}
      
      <button onClick={fetchItems}>Fetch Items</button>
      
      <ul>
        {state.items.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## 最佳实践总结

### 1. Hook 规则
- 只在函数组件或自定义 Hook 中调用 Hook
- 只在顶层调用 Hook，不要在循环、条件或嵌套函数中调用

### 2. 依赖数组
- 总是包含 effect 中使用的所有值
- 使用 ESLint 插件 \`eslint-plugin-react-hooks\` 来检查

### 3. 性能优化
- 合理使用 \`useMemo\` 和 \`useCallback\`
- 避免在每次渲染时创建新对象
- 使用 \`React.memo\` 包装组件

### 4. 自定义 Hook
- 提取可复用的逻辑到自定义 Hook
- 使用 \`use\` 前缀命名
- 返回对象而不是数组（除非顺序很重要）

### 5. 错误处理
- 在 Hook 中处理错误状态
- 使用 Error Boundaries 捕获组件错误

React Hooks 为函数组件提供了强大的状态管理和副作用处理能力。通过遵循这些最佳实践，你可以编写出更加清晰、可维护和高性能的 React 应用。`,
        author: 'React专家',
        cover_image: '/images/articles/react-hooks-guide.jpg',
        category: 'React',
        tags: JSON.stringify(['React', 'Hooks', '最佳实践', '性能优化']),
        view_count: 1800,
        like_count: 134,
        status: 'published'
      },     
 {
        title: 'CSS Grid 布局完全指南',
        content: `# CSS Grid 布局完全指南

CSS Grid 是一个强大的二维布局系统，它为网页布局提供了前所未有的灵活性和控制力。

## 基础概念

### Grid Container 和 Grid Items

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 100px 200px 100px;
  gap: 20px;
}

.item {
  background-color: #f0f0f0;
  padding: 20px;
  text-align: center;
}
\`\`\`

\`\`\`html
<div class="container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
  <div class="item">Item 4</div>
  <div class="item">Item 5</div>
  <div class="item">Item 6</div>
</div>
\`\`\`

## 定义网格

### 显式网格定义

\`\`\`css
.grid {
  display: grid;
  
  /* 定义列 */
  grid-template-columns: 200px 1fr 100px;
  /* 或使用 repeat() */
  grid-template-columns: repeat(3, 1fr);
  /* 或混合使用 */
  grid-template-columns: 200px repeat(2, 1fr) 100px;
  
  /* 定义行 */
  grid-template-rows: 100px 200px;
  /* 或自动调整 */
  grid-template-rows: auto 1fr auto;
}
\`\`\`

### 网格线命名

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 250px 
    [sidebar-end main-start] 1fr 
    [main-end];
  grid-template-rows: 
    [header-start] 80px 
    [header-end content-start] 1fr 
    [content-end footer-start] 60px 
    [footer-end];
}

.header {
  grid-column: sidebar-start / main-end;
  grid-row: header-start / header-end;
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
  grid-row: content-start / content-end;
}

.main {
  grid-column: main-start / main-end;
  grid-row: content-start / content-end;
}
\`\`\`

## 网格区域

### 使用 grid-template-areas

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 150px;
  grid-template-rows: 80px 1fr 60px;
  gap: 20px;
  height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

## 项目定位

### 基于线的定位

\`\`\`css
.item1 {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
  
  /* 简写形式 */
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  
  /* 或者更简写 */
  grid-area: 1 / 1 / 2 / 3;
}

.item2 {
  /* 跨越2列 */
  grid-column: span 2;
  /* 跨越3行 */
  grid-row: span 3;
}
\`\`\`

## 对齐和分布

### 容器级别的对齐

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  grid-template-rows: repeat(3, 100px);
  
  /* 整个网格在容器中的对齐 */
  justify-content: center; /* start | end | center | stretch | space-around | space-between | space-evenly */
  align-content: center;   /* start | end | center | stretch | space-around | space-between | space-evenly */
  
  /* 网格项目在其网格区域中的对齐 */
  justify-items: center;   /* start | end | center | stretch */
  align-items: center;     /* start | end | center | stretch */
}
\`\`\`

### 项目级别的对齐

\`\`\`css
.item {
  /* 覆盖容器的 justify-items 和 align-items */
  justify-self: end;
  align-self: start;
}
\`\`\`

## 响应式网格

### 使用 minmax()

\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
\`\`\`

### 媒体查询结合

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

## 实际应用示例

### 卡片布局

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}
\`\`\`

### 复杂页面布局

\`\`\`css
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.header {
  grid-area: header;
  background: #333;
  color: white;
  padding: 1rem;
}

.nav {
  grid-area: nav;
  background: #f5f5f5;
  padding: 1rem;
}

.main {
  grid-area: main;
  padding: 1rem;
}

.aside {
  grid-area: aside;
  background: #f5f5f5;
  padding: 1rem;
}

.footer {
  grid-area: footer;
  background: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-layout {
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
\`\`\`

### 图片画廊

\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: 1rem;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* 特殊尺寸的项目 */
.gallery-item.large {
  grid-column: span 2;
  grid-row: span 2;
}

.gallery-item.wide {
  grid-column: span 2;
}

.gallery-item.tall {
  grid-row: span 2;
}
\`\`\`

## 高级技巧

### 子网格 (Subgrid)

\`\`\`css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.child-grid {
  display: grid;
  grid-column: 2 / 4;
  grid-template-columns: subgrid;
  gap: inherit;
}
\`\`\`

### 网格动画

\`\`\`css
.animated-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  transition: grid-template-columns 0.3s ease;
}

.animated-grid:hover {
  grid-template-columns: 2fr 1fr 1fr;
}

.grid-item {
  background: #007bff;
  padding: 2rem;
  color: white;
  text-align: center;
  transition: all 0.3s ease;
}
\`\`\`

## 浏览器支持和回退

\`\`\`css
.grid-container {
  /* 回退方案 */
  display: flex;
  flex-wrap: wrap;
  
  /* 现代浏览器 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* 特性检测 */
@supports (display: grid) {
  .grid-container {
    display: grid;
  }
}
\`\`\`

## 总结

CSS Grid 提供了强大而灵活的布局能力：

1. **二维布局**：同时控制行和列
2. **灵活的尺寸单位**：fr、minmax()、auto 等
3. **简洁的语法**：grid-template-areas 让布局更直观
4. **强大的对齐控制**：多种对齐选项
5. **响应式友好**：auto-fit、auto-fill 等特性

掌握 CSS Grid 将大大提升你的布局能力，让复杂的页面布局变得简单而优雅。`,
        author: 'CSS专家',
        cover_image: '/images/articles/css-grid-guide.jpg',
        category: 'CSS',
        tags: JSON.stringify(['CSS', 'Grid布局', '响应式设计', '前端布局']),
        view_count: 1650,
        like_count: 98,
        status: 'published'
      },  
    {
        title: 'TypeScript 进阶技巧与最佳实践',
        content: `# TypeScript 进阶技巧与最佳实践

TypeScript 为 JavaScript 带来了静态类型检查，提高了代码质量和开发效率。本文将深入探讨 TypeScript 的进阶用法。

## 高级类型

### 联合类型和交叉类型

\`\`\`typescript
// 联合类型
type Status = 'loading' | 'success' | 'error';
type ID = string | number;

// 交叉类型
interface User {
  name: string;
  email: string;
}

interface Admin {
  permissions: string[];
}

type AdminUser = User & Admin;

const adminUser: AdminUser = {
  name: 'John',
  email: 'john@example.com',
  permissions: ['read', 'write', 'delete']
};
\`\`\`

### 条件类型

\`\`\`typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// 实用的条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type ApiResponse<T> = T extends string 
  ? { message: T } 
  : { data: T };

type StringResponse = ApiResponse<string>; // { message: string }
type DataResponse = ApiResponse<User>; // { data: User }
\`\`\`

### 映射类型

\`\`\`typescript
// 基础映射类型
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 自定义映射类型
type Stringify<T> = {
  [K in keyof T]: string;
};

interface User {
  id: number;
  name: string;
  age: number;
}

type StringifiedUser = Stringify<User>;
// { id: string; name: string; age: string; }
\`\`\`

## 实用工具类型

### Pick 和 Omit

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 选择特定属性
type PublicUser = Pick<User, 'id' | 'name' | 'email'>;

// 排除特定属性
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

// 组合使用
type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>;
\`\`\`

### Record 和 Extract

\`\`\`typescript
// Record 创建对象类型
type UserRoles = 'admin' | 'user' | 'guest';
type RolePermissions = Record<UserRoles, string[]>;

const permissions: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};

// Extract 提取类型
type StringOrNumber = string | number | boolean;
type OnlyStringOrNumber = Extract<StringOrNumber, string | number>; // string | number
\`\`\`

## 泛型进阶

### 泛型约束

\`\`\`typescript
// 基础约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello'); // OK
logLength([1, 2, 3]); // OK
// logLength(123); // Error

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30 };
const name = getProperty(user, 'name'); // string
const age = getProperty(user, 'age'); // number
\`\`\`

### 条件类型与泛型

\`\`\`typescript
// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type StringOrNumberArray = ToArray<string | number>; // string[] | number[]

// infer 关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function getString(): string {
  return 'hello';
}

type StringReturnType = ReturnType<typeof getString>; // string

// 递归条件类型
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
type NestedArray = number[][][];
type FlatType = Flatten<NestedArray>; // number
\`\`\`

## 装饰器

### 类装饰器

\`\`\`typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}
\`\`\`

### 方法装饰器

\`\`\`typescript
function log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(\`Calling \${propertyName} with args:, args\`);
    const result = method.apply(this, args);
    console.log(\`Result:, result\`);
    return result;
  };
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}
\`\`\`

### 属性装饰器

\`\`\`typescript
function validate(target: any, propertyName: string) {
  let value: any;
  
  const getter = () => value;
  const setter = (newVal: any) => {
    if (typeof newVal !== 'string' || newVal.length < 3) {
      throw new Error(\`\${propertyName} must be a string with at least 3 characters\`);
    }
    value = newVal;
  };
  
  Object.defineProperty(target, propertyName, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

class User {
  @validate
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}
\`\`\`

## 模块和命名空间

### 模块声明

\`\`\`typescript
// types/api.d.ts
declare module 'api' {
  export interface User {
    id: number;
    name: string;
  }
  
  export function getUser(id: number): Promise<User>;
}

// 使用
import { User, getUser } from 'api';
\`\`\`

### 全局声明

\`\`\`typescript
// types/global.d.ts
declare global {
  interface Window {
    myGlobalFunction: () => void;
  }
  
  var ENV: 'development' | 'production';
}

export {};

// 使用
window.myGlobalFunction();
console.log(ENV);
\`\`\`

## 实际应用示例

### API 客户端

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`);
    return response.json();
  }
  
  async post<T, U>(endpoint: string, data: T): Promise<ApiResponse<U>> {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  async getPaginated<T>(
    endpoint: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedResponse<T>> {
    return this.get(\`\${endpoint}?page=\${page}&limit=\${limit}\`);
  }
}

// 使用
const api = new ApiClient('https://api.example.com');

interface User {
  id: number;
  name: string;
  email: string;
}

const user = await api.get<User>('/users/1');
const users = await api.getPaginated<User>('/users');
\`\`\`

### 状态管理

\`\`\`typescript
type Action<T extends string, P = {}> = {
  type: T;
} & P;

type UserActions = 
  | Action<'LOAD_USER_START'>
  | Action<'LOAD_USER_SUCCESS', { user: User }>
  | Action<'LOAD_USER_ERROR', { error: string }>
  | Action<'UPDATE_USER', { updates: Partial<User> }>;

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

function userReducer(state: UserState, action: UserActions): UserState {
  switch (action.type) {
    case 'LOAD_USER_START':
      return { ...state, loading: true, error: null };
    
    case 'LOAD_USER_SUCCESS':
      return { ...state, loading: false, user: action.user };
    
    case 'LOAD_USER_ERROR':
      return { ...state, loading: false, error: action.error };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.updates } : null
      };
    
    default:
      return state;
  }
}
\`\`\`

## 配置和最佳实践

### tsconfig.json 配置

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

### 代码组织

\`\`\`typescript
// types/index.ts - 集中管理类型
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// utils/api.ts - 工具函数
import type { ApiResponse } from '@/types';

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(\`API Error: \${response.status}\`);
  }
  return response.json();
}

// services/userService.ts - 业务逻辑
import type { User } from '@/types';
import { apiRequest } from '@/utils/api';

export class UserService {
  static async getUser(id: number): Promise<User> {
    const response = await apiRequest<User>(\`/api/users/\${id}\`);
    return response.data;
  }
  
  static async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const response = await apiRequest<User>(\`/api/users/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.data;
  }
}
\`\`\`

## 总结

TypeScript 的强大之处在于：

1. **类型安全**：编译时错误检查
2. **智能提示**：更好的开发体验
3. **重构支持**：安全的代码重构
4. **文档作用**：类型即文档
5. **渐进式采用**：可以逐步迁移

掌握这些进阶技巧将帮助你编写更加健壮、可维护的 TypeScript 代码。`,
        author: 'TypeScript专家',
        cover_image: '/images/articles/typescript-advanced.jpg',
        category: 'TypeScript',
        tags: JSON.stringify(['TypeScript', '类型系统', '进阶技巧', '最佳实践']),
        view_count: 1420,
        like_count: 112,
        status: 'published'
      }
    ];

    return techArticles;
  }  /*
*
   * 生成教程类文章
   */
  generateTutorialArticles() {
    const tutorialArticles = [
      {
        title: '从零开始学习 Git 版本控制',
        content: `# 从零开始学习 Git 版本控制

Git 是现代软件开发中不可或缺的版本控制工具。本教程将带你从零开始掌握 Git 的核心概念和常用操作。

## 第一章：Git 基础概念

### 什么是版本控制？

版本控制是一种记录文件变化的系统，让你可以：
- 追踪文件的历史变化
- 回退到之前的版本
- 比较不同版本的差异
- 多人协作开发

### Git 的核心概念

#### 1. 仓库（Repository）
仓库是 Git 存储项目历史记录的地方，包含所有文件和变更历史。

#### 2. 工作区、暂存区、版本库
\`\`\`
工作区 (Working Directory)
    ↓ git add
暂存区 (Staging Area)
    ↓ git commit
版本库 (Repository)
\`\`\`

#### 3. 分支（Branch）
分支允许你在不影响主线开发的情况下进行并行开发。

## 第二章：Git 安装和配置

### 安装 Git

**Windows:**
1. 访问 https://git-scm.com/download/win
2. 下载并运行安装程序
3. 按照向导完成安装

**macOS:**
\`\`\`bash
# 使用 Homebrew
brew install git

# 或使用 Xcode Command Line Tools
xcode-select --install
\`\`\`

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt update
sudo apt install git
\`\`\`

### 初始配置

\`\`\`bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认编辑器
git config --global core.editor "code --wait"

# 查看配置
git config --list
\`\`\`

## 第三章：创建和管理仓库

### 初始化仓库

\`\`\`bash
# 在现有目录中初始化仓库
cd my-project
git init

# 克隆远程仓库
git clone https://github.com/username/repository.git
\`\`\`

### 基本操作流程

\`\`\`bash
# 1. 查看状态
git status

# 2. 添加文件到暂存区
git add filename.txt        # 添加单个文件
git add .                   # 添加所有文件
git add *.js               # 添加所有 .js 文件

# 3. 提交更改
git commit -m "Add new feature"

# 4. 查看提交历史
git log
git log --oneline          # 简洁格式
git log --graph           # 图形化显示
\`\`\`

### 文件状态生命周期

\`\`\`
Untracked → Staged → Committed
    ↑         ↓
    ←─ Modified ←─
\`\`\`

## 第四章：分支管理

### 分支基础操作

\`\`\`bash
# 查看分支
git branch                 # 查看本地分支
git branch -r             # 查看远程分支
git branch -a             # 查看所有分支

# 创建分支
git branch feature-login   # 创建分支
git checkout -b feature-login  # 创建并切换到分支

# 切换分支
git checkout main
git switch main           # Git 2.23+ 新命令

# 删除分支
git branch -d feature-login    # 删除已合并的分支
git branch -D feature-login    # 强制删除分支
\`\`\`

### 分支合并

\`\`\`bash
# 合并分支
git checkout main
git merge feature-login

# 变基合并（保持线性历史）
git checkout feature-login
git rebase main
git checkout main
git merge feature-login
\`\`\`

### 解决合并冲突

当合并时出现冲突：

\`\`\`bash
# 1. Git 会标记冲突文件
git status

# 2. 手动编辑冲突文件
# 冲突标记如下：
<<<<<<< HEAD
当前分支的内容
=======
要合并分支的内容
>>>>>>> feature-branch

# 3. 解决冲突后添加文件
git add conflicted-file.txt

# 4. 完成合并
git commit
\`\`\`

## 第五章：远程仓库操作

### 远程仓库管理

\`\`\`bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/username/repo.git

# 修改远程仓库 URL
git remote set-url origin https://github.com/username/new-repo.git

# 删除远程仓库
git remote remove origin
\`\`\`

### 推送和拉取

\`\`\`bash
# 推送到远程仓库
git push origin main
git push -u origin main    # 设置上游分支

# 从远程仓库拉取
git pull origin main       # 拉取并合并
git fetch origin          # 只拉取不合并

# 推送新分支
git push -u origin feature-branch
\`\`\`

## 第六章：实用技巧和工具

### 查看差异

\`\`\`bash
# 查看工作区和暂存区的差异
git diff

# 查看暂存区和最后一次提交的差异
git diff --cached

# 查看两个提交之间的差异
git diff commit1 commit2

# 查看特定文件的差异
git diff filename.txt
\`\`\`

### 撤销操作

\`\`\`bash
# 撤销工作区的修改
git checkout -- filename.txt
git restore filename.txt    # Git 2.23+

# 撤销暂存区的文件
git reset HEAD filename.txt
git restore --staged filename.txt  # Git 2.23+

# 撤销最后一次提交
git reset --soft HEAD~1    # 保留更改在暂存区
git reset --mixed HEAD~1   # 保留更改在工作区
git reset --hard HEAD~1    # 完全删除更改

# 修改最后一次提交
git commit --amend -m "New commit message"
\`\`\`

### 标签管理

\`\`\`bash
# 创建标签
git tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

# 查看标签
git tag
git show v1.0.0

# 推送标签
git push origin v1.0.0
git push origin --tags

# 删除标签
git tag -d v1.0.0
git push origin --delete v1.0.0
\`\`\`

## 第七章：Git 工作流

### Git Flow 工作流

\`\`\`
main (生产分支)
  ↑
develop (开发分支)
  ↑
feature/* (功能分支)
\`\`\`

### GitHub Flow 工作流

\`\`\`bash
# 1. 从 main 创建功能分支
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "Add new feature"

# 3. 推送分支
git push -u origin feature/new-feature

# 4. 创建 Pull Request
# 5. 代码审查和合并
# 6. 删除功能分支
\`\`\`

## 第八章：最佳实践

### 提交信息规范

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

**类型（type）：**
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

**示例：**
\`\`\`bash
git commit -m "feat(auth): add user login functionality

- Add login form component
- Implement authentication service
- Add login route and validation

Closes #123"
\`\`\`

### .gitignore 文件

\`\`\`gitignore
# 依赖目录
node_modules/
vendor/

# 构建输出
dist/
build/
*.min.js

# 环境配置
.env
.env.local

# IDE 文件
.vscode/
.idea/
*.swp

# 系统文件
.DS_Store
Thumbs.db

# 日志文件
*.log
logs/

# 临时文件
*.tmp
*.temp
\`\`\`

### 常用别名配置

\`\`\`bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
\`\`\`

## 第九章：问题排查和恢复

### 常见问题解决

**1. 找回删除的提交**
\`\`\`bash
# 查看引用日志
git reflog

# 恢复提交
git checkout <commit-hash>
git branch recovery-branch
\`\`\`

**2. 清理仓库**
\`\`\`bash
# 清理未跟踪的文件
git clean -f        # 删除文件
git clean -fd       # 删除文件和目录
git clean -n        # 预览要删除的内容

# 垃圾回收
git gc
\`\`\`

**3. 重写历史**
\`\`\`bash
# 交互式变基
git rebase -i HEAD~3

# 修改作者信息
git commit --amend --author="New Author <new@email.com>"
\`\`\`

## 第十章：进阶主题

### Git Hooks

\`\`\`bash
# 预提交钩子示例 (.git/hooks/pre-commit)
#!/bin/sh
npm run lint
npm run test
\`\`\`

### 子模块

\`\`\`bash
# 添加子模块
git submodule add https://github.com/user/repo.git path/to/submodule

# 克隆包含子模块的仓库
git clone --recursive https://github.com/user/main-repo.git

# 更新子模块
git submodule update --remote
\`\`\`

### 大文件处理 (Git LFS)

\`\`\`bash
# 安装 Git LFS
git lfs install

# 跟踪大文件
git lfs track "*.psd"
git lfs track "*.zip"

# 查看跟踪的文件
git lfs ls-files
\`\`\`

## 总结

通过本教程，你已经学会了：

1. **Git 基础概念**：仓库、分支、提交等
2. **基本操作**：add、commit、push、pull 等
3. **分支管理**：创建、合并、删除分支
4. **远程协作**：与 GitHub/GitLab 等平台协作
5. **问题解决**：冲突解决、历史修改等
6. **最佳实践**：工作流、提交规范等

Git 是一个强大的工具，需要在实践中不断学习和掌握。建议多动手练习，逐步提高版本控制的技能。

## 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git 书籍](https://git-scm.com/book)
- [GitHub 学习实验室](https://lab.github.com/)
- [Atlassian Git 教程](https://www.atlassian.com/git/tutorials)`,
        author: 'Git专家',
        cover_image: '/images/articles/git-tutorial.jpg',
        category: '工具教程',
        tags: JSON.stringify(['Git', '版本控制', '教程', '开发工具']),
        view_count: 3200,
        like_count: 245,
        status: 'published'
      },      {
 
       title: 'Node.js 全栈开发实战教程',
        content: `# Node.js 全栈开发实战教程

本教程将带你从零开始构建一个完整的 Node.js 全栈应用，包括后端 API、数据库设计和前端界面。

## 项目概述

我们将构建一个任务管理系统，包含以下功能：
- 用户注册和登录
- 任务的增删改查
- 任务分类和标签
- 用户权限管理

### 技术栈

**后端：**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT 身份验证
- bcrypt 密码加密

**前端：**
- HTML5 + CSS3 + JavaScript
- Bootstrap 5
- Axios HTTP 客户端

## 第一章：项目初始化

### 创建项目结构

\`\`\`bash
mkdir task-manager
cd task-manager

# 初始化项目
npm init -y

# 创建目录结构
mkdir src
mkdir src/controllers
mkdir src/models
mkdir src/routes
mkdir src/middleware
mkdir src/utils
mkdir public
mkdir public/css
mkdir public/js
mkdir views
\`\`\`

### 安装依赖

\`\`\`bash
# 生产依赖
npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan dotenv

# 开发依赖
npm install -D nodemon concurrently
\`\`\`

### 配置 package.json

\`\`\`json
{
  "name": "task-manager",
  "version": "1.0.0",
  "description": "A full-stack task management application",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "client": "live-server public",
    "dev:full": "concurrently \\"npm run dev\\" \\"npm run client\\""
  },
  "keywords": ["nodejs", "express", "mongodb", "fullstack"],
  "author": "Your Name",
  "license": "MIT"
}
\`\`\`

## 第二章：后端 API 开发

### 应用入口文件

\`\`\`javascript
// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
})
.catch((error) => {
  console.error('Database connection error:', error);
});
\`\`\`

### 用户模型

\`\`\`javascript
// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 转换为 JSON 时移除敏感信息
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
\`\`\`

### 任务模型

\`\`\`javascript
// src/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  dueDate: {
    type: Date
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 索引优化
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });

// 任务完成时自动设置完成时间
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
\`\`\`

### 身份验证中间件

\`\`\`javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }
  next();
};

module.exports = { auth, adminAuth };
\`\`\`

### 身份验证路由

\`\`\`javascript
// src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // 创建新用户
    const user = new User({ username, email, password });
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// 更新用户信息
router.put('/me', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'avatar'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json({ message: 'Profile updated successfully', user: req.user });
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

module.exports = router;
\`\`\`

### 任务路由

\`\`\`javascript
// src/routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取用户的所有任务
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const query = { owner: req.user._id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // 分页
    const skip = (page - 1) * limit;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 创建新任务
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });
    
    await task.save();
    await task.populate('assignedTo', 'username email');
    
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 获取单个任务
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate('assignedTo', 'username email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 更新任务
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// 删除任务
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 获取任务统计
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Task.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ statusStats: stats, categoryStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
\`\`\`

## 第三章：前端开发

### HTML 结构

\`\`\`html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>任务管理系统</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#"><i class="fas fa-tasks"></i> 任务管理</a>
            <div class="navbar-nav ms-auto" id="navbarNav">
                <div id="authButtons" class="d-flex">
                    <button class="btn btn-outline-light me-2" onclick="showLoginModal()">登录</button>
                    <button class="btn btn-light" onclick="showRegisterModal()">注册</button>
                </div>
                <div id="userMenu" class="dropdown d-none">
                    <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user"></i> <span id="username"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="showProfile()">个人资料</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="logout()">退出登录</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>

    <!-- 主要内容 -->
    <div class="container mt-4">
        <!-- 欢迎页面 -->
        <div id="welcomePage" class="text-center">
            <h1 class="display-4">欢迎使用任务管理系统</h1>
            <p class="lead">高效管理您的任务，提升工作效率</p>
            <button class="btn btn-primary btn-lg" onclick="showRegisterModal()">开始使用</button>
        </div>

        <!-- 任务管理界面 -->
        <div id="taskManager" class="d-none">
            <!-- 任务统计 -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="totalTasks">0</h4>
                                    <p>总任务</p>
                                </div>
                                <i class="fas fa-tasks fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="pendingTasks">0</h4>
                                    <p>待处理</p>
                                </div>
                                <i class="fas fa-clock fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="inProgressTasks">0</h4>
                                    <p>进行中</p>
                                </div>
                                <i class="fas fa-spinner fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="completedTasks">0</h4>
                                    <p>已完成</p>
                                </div>
                                <i class="fas fa-check fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 任务操作栏 -->
            <div class="row mb-3">
                <div class="col-md-6">
                    <button class="btn btn-primary" onclick="showTaskModal()">
                        <i class="fas fa-plus"></i> 新建任务
                    </button>
                </div>
                <div class="col-md-6">
                    <div class="d-flex">
                        <select class="form-select me-2" id="statusFilter" onchange="filterTasks()">
                            <option value="">所有状态</option>
                            <option value="pending">待处理</option>
                            <option value="in-progress">进行中</option>
                            <option value="completed">已完成</option>
                        </select>
                        <select class="form-select" id="categoryFilter" onchange="filterTasks()">
                            <option value="">所有分类</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- 任务列表 -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5>任务列表</h5>
                        </div>
                        <div class="card-body">
                            <div id="taskList">
                                <!-- 任务项将通过 JavaScript 动态生成 -->
                            </div>
                            <div id="pagination" class="mt-3">
                                <!-- 分页将通过 JavaScript 动态生成 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 模态框 -->
    <!-- 登录模态框 -->
    <div class="modal fade" id="loginModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">用户登录</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label">邮箱</label>
                            <input type="email" class="form-control" id="loginEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">密码</label>
                            <input type="password" class="form-control" id="loginPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">登录</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- 注册模态框 -->
    <div class="modal fade" id="registerModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">用户注册</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="mb-3">
                            <label for="registerUsername" class="form-label">用户名</label>
                            <input type="text" class="form-control" id="registerUsername" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerEmail" class="form-label">邮箱</label>
                            <input type="email" class="form-control" id="registerEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerPassword" class="form-label">密码</label>
                            <input type="password" class="form-control" id="registerPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">注册</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- 任务模态框 -->
    <div class="modal fade" id="taskModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="taskModalTitle">新建任务</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="taskForm">
                        <input type="hidden" id="taskId">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="taskTitle" class="form-label">任务标题</label>
                                    <input type="text" class="form-control" id="taskTitle" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="taskPriority" class="form-label">优先级</label>
                                    <select class="form-select" id="taskPriority">
                                        <option value="low">低</option>
                                        <option value="medium" selected>中</option>
                                        <option value="high">高</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="taskDescription" class="form-label">任务描述</label>
                            <textarea class="form-control" id="taskDescription" rows="3"></textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="taskCategory" class="form-label">分类</label>
                                    <input type="text" class="form-control" id="taskCategory" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="taskDueDate" class="form-label">截止日期</label>
                                    <input type="datetime-local" class="form-control" id="taskDueDate">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="taskTags" class="form-label">标签（用逗号分隔）</label>
                            <input type="text" class="form-control" id="taskTags" placeholder="例如：重要,紧急,工作">
                        </div>
                        <div class="mb-3">
                            <label for="taskStatus" class="form-label">状态</label>
                            <select class="form-select" id="taskStatus">
                                <option value="pending">待处理</option>
                                <option value="in-progress">进行中</option>
                                <option value="completed">已完成</option>
                            </select>
                        </div>
                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                            <button type="submit" class="btn btn-primary">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
\`\`\`

这个教程展示了如何构建一个完整的 Node.js 全栈应用，包括：

1. **项目结构设计**：合理的目录组织
2. **后端 API 开发**：Express.js + MongoDB
3. **身份验证系统**：JWT + bcrypt
4. **数据模型设计**：Mongoose schemas
5. **前端界面开发**：Bootstrap + JavaScript
6. **API 集成**：Axios HTTP 客户端

通过这个实战项目，你可以学习到全栈开发的完整流程和最佳实践。`,
        author: 'Node.js专家',
        cover_image: '/images/articles/nodejs-fullstack.jpg',
        category: '全栈开发',
        tags: JSON.stringify(['Node.js', '全栈开发', 'Express.js', 'MongoDB', '实战教程']),
        view_count: 2800,
        like_count: 198,
        status: 'published'
      }, 
     {
        title: 'Docker 容器化部署完整指南',
        content: `# Docker 容器化部署完整指南

Docker 是现代应用部署的标准工具，本教程将从基础概念到实际部署，全面介绍 Docker 的使用。

## 第一章：Docker 基础概念

### 什么是 Docker？

Docker 是一个开源的容器化平台，它允许开发者将应用程序及其依赖项打包到轻量级、可移植的容器中。

### 核心概念

#### 1. 镜像（Image）
镜像是容器的模板，包含了运行应用所需的所有内容：代码、运行时、库、环境变量和配置文件。

#### 2. 容器（Container）
容器是镜像的运行实例，是一个轻量级、独立的可执行包。

#### 3. Dockerfile
Dockerfile 是一个文本文件，包含了构建镜像的指令。

#### 4. 仓库（Repository）
仓库是存储镜像的地方，如 Docker Hub。

## 第二章：Docker 安装和配置

### Windows 安装

1. 下载 Docker Desktop for Windows
2. 运行安装程序
3. 启用 WSL 2 后端（推荐）
4. 重启系统

### macOS 安装

\`\`\`bash
# 使用 Homebrew
brew install --cask docker

# 或下载 Docker Desktop for Mac
\`\`\`

### Linux 安装（Ubuntu）

\`\`\`bash
# 更新包索引
sudo apt update

# 安装必要的包
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将用户添加到 docker 组
sudo usermod -aG docker $USER
\`\`\`

### 验证安装

\`\`\`bash
# 检查 Docker 版本
docker --version

# 运行测试容器
docker run hello-world
\`\`\`

## 第三章：Docker 基本命令

### 镜像管理

\`\`\`bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest
docker pull node:16-alpine

# 查看本地镜像
docker images
docker image ls

# 删除镜像
docker rmi nginx:latest
docker image rm nginx:latest

# 构建镜像
docker build -t myapp:1.0 .

# 给镜像打标签
docker tag myapp:1.0 myapp:latest
\`\`\`

### 容器管理

\`\`\`bash
# 运行容器
docker run nginx
docker run -d nginx                    # 后台运行
docker run -p 8080:80 nginx           # 端口映射
docker run --name mynginx nginx       # 指定容器名称
docker run -v /host/path:/container/path nginx  # 挂载卷

# 查看容器
docker ps                             # 运行中的容器
docker ps -a                          # 所有容器

# 停止容器
docker stop container_id
docker stop mynginx

# 启动已停止的容器
docker start mynginx

# 重启容器
docker restart mynginx

# 删除容器
docker rm container_id
docker rm mynginx

# 进入容器
docker exec -it mynginx bash
docker exec -it mynginx sh

# 查看容器日志
docker logs mynginx
docker logs -f mynginx                # 实时查看日志

# 查看容器详细信息
docker inspect mynginx
\`\`\`

## 第四章：编写 Dockerfile

### 基本语法

\`\`\`dockerfile
# 基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制文件
COPY package*.json ./

# 运行命令
RUN npm install

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["npm", "start"]
\`\`\`

### 常用指令详解

#### FROM
指定基础镜像
\`\`\`dockerfile
FROM node:16-alpine
FROM ubuntu:20.04
FROM scratch  # 空镜像
\`\`\`

#### WORKDIR
设置工作目录
\`\`\`dockerfile
WORKDIR /app
WORKDIR /usr/src/app
\`\`\`

#### COPY 和 ADD
复制文件到镜像
\`\`\`dockerfile
COPY src/ /app/src/
COPY package*.json ./
ADD https://example.com/file.tar.gz /app/  # ADD 支持 URL 和自动解压
\`\`\`

#### RUN
在构建时执行命令
\`\`\`dockerfile
RUN apt-get update && apt-get install -y curl
RUN npm install
RUN pip install -r requirements.txt
\`\`\`

#### CMD 和 ENTRYPOINT
设置容器启动命令
\`\`\`dockerfile
CMD ["npm", "start"]                    # 可被覆盖
ENTRYPOINT ["python", "app.py"]        # 不可被覆盖
ENTRYPOINT ["python"] CMD ["app.py"]   # 组合使用
\`\`\`

#### EXPOSE
声明端口
\`\`\`dockerfile
EXPOSE 3000
EXPOSE 80 443
\`\`\`

#### ENV
设置环境变量
\`\`\`dockerfile
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=mongodb://localhost:27017/myapp
\`\`\`

#### VOLUME
创建挂载点
\`\`\`dockerfile
VOLUME ["/data"]
VOLUME ["/var/log", "/var/db"]
\`\`\`

### 实际示例

#### Node.js 应用 Dockerfile

\`\`\`dockerfile
# 使用官方 Node.js 镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用源码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件所有者
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["npm", "start"]
\`\`\`

#### Python Flask 应用 Dockerfile

\`\`\`dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN useradd --create-home --shell /bin/bash app
USER app

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
\`\`\`

## 第五章：Docker Compose

### 什么是 Docker Compose？

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。

### docker-compose.yml 基本结构

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:

networks:
  default:
    driver: bridge
\`\`\`

### 常用命令

\`\`\`bash
# 启动服务
docker-compose up
docker-compose up -d          # 后台运行
docker-compose up --build     # 重新构建镜像

# 停止服务
docker-compose down
docker-compose down -v        # 同时删除卷

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
docker-compose logs web       # 查看特定服务日志

# 执行命令
docker-compose exec web bash
docker-compose exec db psql -U user myapp

# 扩展服务
docker-compose up --scale web=3

# 重启服务
docker-compose restart
docker-compose restart web
\`\`\`

## 第六章：实际部署案例

### 全栈应用部署

#### 项目结构
\`\`\`
my-fullstack-app/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── nginx/
│   └── nginx.conf
└── docker-compose.yml
\`\`\`

#### 前端 Dockerfile
\`\`\`dockerfile
# frontend/Dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

#### 后端 Dockerfile
\`\`\`dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

USER node
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

#### Nginx 配置
\`\`\`nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
\`\`\`

#### Docker Compose 配置
\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:4.4
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
\`\`\`

### 生产环境部署

#### 使用 Docker Swarm

\`\`\`bash
# 初始化 Swarm
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.yml myapp

# 查看服务
docker service ls

# 扩展服务
docker service scale myapp_backend=3

# 更新服务
docker service update --image myapp:v2 myapp_backend
\`\`\`

#### 使用 Kubernetes

\`\`\`yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp-backend
  template:
    metadata:
      labels:
        app: myapp-backend
    spec:
      containers:
      - name: backend
        image: myapp-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url

---
apiVersion: v1
kind: Service
metadata:
  name: myapp-backend-service
spec:
  selector:
    app: myapp-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\`

## 第七章：最佳实践

### 镜像优化

#### 1. 使用多阶段构建
\`\`\`dockerfile
# 构建阶段
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
\`\`\`

#### 2. 选择合适的基础镜像
\`\`\`dockerfile
# 优先选择 Alpine 版本
FROM node:16-alpine
FROM python:3.9-slim
FROM openjdk:11-jre-slim
\`\`\`

#### 3. 合并 RUN 指令
\`\`\`dockerfile
# 不好的做法
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y vim

# 好的做法
RUN apt-get update && \\
    apt-get install -y curl vim && \\
    rm -rf /var/lib/apt/lists/*
\`\`\`

#### 4. 使用 .dockerignore
\`\`\`dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
\`\`\`

### 安全最佳实践

#### 1. 使用非 root 用户
\`\`\`dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
\`\`\`

#### 2. 扫描镜像漏洞
\`\`\`bash
# 使用 Docker 内置扫描
docker scan myapp:latest

# 使用 Trivy
trivy image myapp:latest
\`\`\`

#### 3. 使用 secrets 管理敏感信息
\`\`\`yaml
# docker-compose.yml
services:
  app:
    image: myapp
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
\`\`\`

### 监控和日志

#### 1. 健康检查
\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

#### 2. 日志管理
\`\`\`yaml
services:
  app:
    image: myapp
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
\`\`\`

#### 3. 监控集成
\`\`\`yaml
services:
  app:
    image: myapp
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=3000"
      - "prometheus.io/path=/metrics"
\`\`\`

## 总结

Docker 容器化技术为现代应用部署提供了标准化、可移植的解决方案。通过本教程，你学会了：

1. **Docker 基础概念**：镜像、容器、Dockerfile
2. **基本操作**：构建、运行、管理容器
3. **Dockerfile 编写**：最佳实践和优化技巧
4. **Docker Compose**：多容器应用编排
5. **生产部署**：安全、监控、扩展
6. **最佳实践**：性能优化、安全加固

掌握这些技能将大大提升你的应用部署效率和可靠性。`,
        author: 'DevOps专家',
        cover_image: '/images/articles/docker-guide.jpg',
        category: 'DevOps',
        tags: JSON.stringify(['Docker', '容器化', '部署', 'DevOps', '教程']),
        view_count: 2400,
        like_count: 167,
        status: 'published'
      }
    ];

    return tutorialArticles;
  }  /**

   * 生成所有文章数据
   */
  async generateAllArticles() {
    console.log('🔄 开始生成真实文章数据...');
    
    try {
      // 生成各类文章
      const techArticles = this.generateTechArticles();
      const tutorialArticles = this.generateTutorialArticles();
      
      // 合并所有文章
      this.generatedArticles = [
        ...techArticles,
        ...tutorialArticles
      ];
      
      console.log(`✅ 成功生成 ${this.generatedArticles.length} 篇文章`);
      console.log(`   - 技术文章: ${techArticles.length} 篇`);
      console.log(`   - 教程文章: ${tutorialArticles.length} 篇`);
      
      return this.generatedArticles;
      
    } catch (error) {
      console.error('❌ 生成文章数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 将生成的文章数据插入数据库
   */
  async insertArticlesToDatabase() {
    if (this.generatedArticles.length === 0) {
      throw new Error('没有可插入的文章数据，请先生成文章');
    }
    
    console.log('🔄 开始插入文章数据到数据库...');
    
    try {
      // 检查是否已有数据
      const [existingArticles] = await pool.execute('SELECT COUNT(*) as count FROM articles');
      
      if (existingArticles[0].count > 0) {
        console.log('⚠️  数据库中已有文章数据');
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
          await pool.execute('DELETE FROM articles');
          console.log('🗑️  已清空现有文章数据');
        } else {
          console.log('❌ 取消插入操作');
          return;
        }
      }
      
      // 插入文章数据
      let insertedCount = 0;
      for (const article of this.generatedArticles) {
        await pool.execute(
          `INSERT INTO articles (
            title, content, author, cover_image, category, tags, 
            view_count, like_count, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            article.title,
            article.content,
            article.author,
            article.cover_image,
            article.category,
            article.tags,
            article.view_count,
            article.like_count,
            article.status
          ]
        );
        insertedCount++;
      }
      
      console.log(`✅ 成功插入 ${insertedCount} 篇文章到数据库`);
      
      // 验证插入结果
      const [finalCount] = await pool.execute('SELECT COUNT(*) as count FROM articles');
      console.log(`📊 数据库中现有文章总数: ${finalCount[0].count}`);
      
    } catch (error) {
      console.error('❌ 插入文章数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 验证生成的文章数据质量
   */
  validateArticles() {
    console.log('🔍 验证文章数据质量...');
    
    const issues = [];
    
    this.generatedArticles.forEach((article, index) => {
      // 检查必填字段
      const requiredFields = ['title', 'content', 'author', 'category', 'status'];
      requiredFields.forEach(field => {
        if (!article[field]) {
          issues.push(`文章 ${index + 1}: 缺少必填字段 ${field}`);
        }
      });
      
      // 检查标题长度
      if (article.title && article.title.length > 255) {
        issues.push(`文章 ${index + 1}: 标题长度超过255字符`);
      }
      
      // 检查内容长度
      if (article.content && article.content.length < 100) {
        issues.push(`文章 ${index + 1}: 内容过短，应至少100字符`);
      }
      
      // 检查状态值
      if (article.status && !['draft', 'published', 'archived'].includes(article.status)) {
        issues.push(`文章 ${index + 1}: 状态值无效`);
      }
      
      // 检查标签格式
      if (article.tags) {
        try {
          const tags = JSON.parse(article.tags);
          if (!Array.isArray(tags)) {
            issues.push(`文章 ${index + 1}: 标签格式错误，应为数组`);
          }
        } catch (e) {
          issues.push(`文章 ${index + 1}: 标签JSON格式错误`);
        }
      }
      
      // 检查数值字段
      if (article.view_count && (typeof article.view_count !== 'number' || article.view_count < 0)) {
        issues.push(`文章 ${index + 1}: 浏览量应为非负数`);
      }
      
      if (article.like_count && (typeof article.like_count !== 'number' || article.like_count < 0)) {
        issues.push(`文章 ${index + 1}: 点赞数应为非负数`);
      }
    });
    
    if (issues.length > 0) {
      console.log('❌ 发现数据质量问题:');
      issues.forEach(issue => console.log(`   ${issue}`));
      return false;
    } else {
      console.log('✅ 文章数据质量验证通过');
      return true;
    }
  }

  /**
   * 获取文章统计信息
   */
  getArticleStats() {
    if (this.generatedArticles.length === 0) {
      return null;
    }

    const stats = {
      total: this.generatedArticles.length,
      byCategory: {},
      byStatus: {},
      totalViews: 0,
      totalLikes: 0,
      avgContentLength: 0
    };

    let totalContentLength = 0;

    this.generatedArticles.forEach(article => {
      // 按分类统计
      stats.byCategory[article.category] = (stats.byCategory[article.category] || 0) + 1;
      
      // 按状态统计
      stats.byStatus[article.status] = (stats.byStatus[article.status] || 0) + 1;
      
      // 累计浏览量和点赞数
      stats.totalViews += article.view_count || 0;
      stats.totalLikes += article.like_count || 0;
      
      // 累计内容长度
      totalContentLength += article.content ? article.content.length : 0;
    });

    stats.avgContentLength = Math.round(totalContentLength / this.generatedArticles.length);

    return stats;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const generator = new ArticleDataGenerator();
  
  generator.generateAllArticles()
    .then(() => generator.validateArticles())
    .then((isValid) => {
      if (isValid) {
        // 显示统计信息
        const stats = generator.getArticleStats();
        console.log('\n📈 文章统计信息:');
        console.log(`   总文章数: ${stats.total}`);
        console.log(`   总浏览量: ${stats.totalViews.toLocaleString()}`);
        console.log(`   总点赞数: ${stats.totalLikes.toLocaleString()}`);
        console.log(`   平均内容长度: ${stats.avgContentLength.toLocaleString()} 字符`);
        console.log('\n   分类分布:');
        Object.entries(stats.byCategory).forEach(([category, count]) => {
          console.log(`     ${category}: ${count} 篇`);
        });
        console.log('\n   状态分布:');
        Object.entries(stats.byStatus).forEach(([status, count]) => {
          console.log(`     ${status}: ${count} 篇`);
        });
        
        return generator.insertArticlesToDatabase();
      } else {
        throw new Error('文章数据质量验证失败');
      }
    })
    .then(() => {
      console.log('🎉 真实文章数据生成完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 生成过程中发生错误:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = ArticleDataGenerator;