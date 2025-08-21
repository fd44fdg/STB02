# 导航栏图标说明

## 图标设计规范

### 尺寸要求
- 推荐尺寸：40px × 40px (2x)，20px × 20px (1x) 
- 格式：PNG（支持透明背景）
- 颜色：单色设计，支持tintColor变色

### 命名规范
- 普通状态：icon_name.png
- 选中状态：icon_name_selected.png

### 当前图标列表
1. **首页图标** 🏠
   - 描述：房屋图标，代表主页
   - 文件：home.png / home_selected.png

2. **刷题图标** 📝  
   - 描述：文档笔记图标，代表练习
   - 文件：practice.png / practice_selected.png

3. **考试图标** 📋
   - 描述：剪贴板图标，代表考试
   - 文件：exam.png / exam_selected.png

4. **个人中心图标** 👤
   - 描述：用户头像图标，代表个人
   - 文件：profile.png / profile_selected.png

## 使用方法

在 pages.json 中配置：
```json
{
  "pagePath": "pages/home/home",
  "text": "首页",
  "iconPath": "static/images/tabbar/home.png",
  "selectedIconPath": "static/images/tabbar/home_selected.png"
}
```

## 备用方案
如果无法使用图片图标，已在 iconfont.css 中配置了 Unicode 字符图标：
- 🏠 首页
- 📝 刷题  
- 📋 考试
- 👤 我的