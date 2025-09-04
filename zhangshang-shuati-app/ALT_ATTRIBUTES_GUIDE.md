# 图片可访问性指南：添加alt属性

## 问题概述

项目中的图片缺少`alt`属性，这会导致以下问题：

1. 降低可访问性：屏幕阅读器无法为视障用户描述图片内容
2. 触发浏览器警告："Images must have alternate text: Element has no title attribute"
3. 不符合Web内容可访问性指南(WCAG)标准

## 修复方法

为所有`<image>`和`<img>`标签添加`alt`属性，提供简短、准确的描述。

### 示例修复

#### 1. 用户头像

```vue
<!-- 修复前 -->
<image class="avatar" :src="userInfo.avatar || '/static/images/avatar-placeholder.png'" mode="aspectFill"></image>

<!-- 修复后 -->
<image class="avatar" :src="userInfo.avatar || '/static/images/avatar-placeholder.png'" mode="aspectFill" :alt="userInfo.nickname + '的头像'"></image>
```

#### 2. 文章封面图

```vue
<!-- 修复前 -->
<image class="cover-image" :src="article.coverImage" mode="aspectFill"></image>

<!-- 修复后 -->
<image class="cover-image" :src="article.coverImage" mode="aspectFill" :alt="article.title + '的封面图'"></image>
```

#### 3. 装饰性图片

对于纯装饰性图片，使用空的alt属性：

```vue
<!-- 修复前 -->
<image class="decoration-icon" src="/static/images/decoration.png"></image>

<!-- 修复后 -->
<image class="decoration-icon" src="/static/images/decoration.png" alt=""></image>
```

#### 4. 功能性图标

```vue
<!-- 修复前 -->
<image class="search-icon" src="/static/icons/search.png"></image>

<!-- 修复后 -->
<image class="search-icon" src="/static/icons/search.png" alt="搜索"></image>
```

## 其他CSS兼容性问题修复

### 1. CSS前缀问题

为了解决浏览器兼容性警告，需要为以下CSS属性添加前缀：

- `-moz-appearance` → 添加 `-webkit-appearance`
- `mask-image` → 添加 `-webkit-mask-image`
- `mask-position` → 添加 `-webkit-mask-position`
- `mask-repeat` → 添加 `-webkit-mask-repeat`
- `mask-size` → 添加 `-webkit-mask-size`

### 2. Viewport设置

已修复：移除了`user-scalable=no`、`maximum-scale=1.0`和`minimum-scale=1.0`设置，允许用户缩放页面，提高可访问性。

### 3. 安全头部

已添加：`X-Content-Type-Options: nosniff`头部，防止MIME类型嗅探攻击。