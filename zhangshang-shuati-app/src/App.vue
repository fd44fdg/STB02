<script>
	import theme from './utils/theme'

	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 在应用启动时应用主题
			theme.applyThemeFromSettings()
		},
		onShow: function() {
			console.log('App Show')
			// 每次返回前台也确保主题同步
			theme.applyThemeFromSettings()
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import "@/styles/iconfont.css";
	/*每个页面公共css */
	/* 修复uni-app的image组件在H5平台上的样式问题 */
	uni-image {
		display: inline-block;
	}
	
	/* 确保图片正确显示，特别是头像图片 */
	uni-image[mode="aspectFill"] div,
	uni-image[mode="aspectFill"] img {
		object-fit: cover !important;
		background-size: cover !important;
		background-position: center center !important;
	}

/* 全局主题变量（浅色为默认） */
:root {
	--bg-color: #f5f5f5;
	--card-bg: #ffffff;
	--text-primary: #333333;
	--text-secondary: #999999;
	--accent: #4A90E2;
	--border-color: #f5f5f5;
	--accent-active: #007AFF;
	/* extra semantic variables for icons and states */
	--icon-accent: var(--accent);
	--warning: #FFD700;
	--danger: #FF6B6B;
	--success: #34C759;
	--shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	--active-opacity: .85;
	/* helpers used across components */
	--muted: #cccccc;
	--muted-border: #e9ecef;
	--success-bg: #e6f7e6;
	--warning-bg: #fff7e6;
	--danger-bg: #fff1f0;
	--selection-bg: rgba(74, 144, 226, 0.10);
	--accent-dark: #357ABD;
	--warning-dark: #FFA500;
	--card-bg-2: #f8fbff;
	--card-bg-3: #e8f4ff;
	--bg-color-soft: #f4f4f5;
	--shadow-soft: 0 2rpx 10rpx rgba(0,0,0,0.1);
	/* avatar defaults */
	--avatar-bg: #4A90E2;
	--avatar-fg: #FFFFFF;
}

/* 深色主题覆盖（更亮、更易读） */
body.dark-mode, .dark-mode {
	--bg-color: #1e293b; /* slate-800，比原来的#0f172a更亮 */
	--card-bg: #334155; /* slate-700，比原来的#111827更亮 */
	--text-primary: #f8fafc; /* slate-50，比原来的#e5e7eb更亮 */
	--text-secondary: #e2e8f0; /* slate-200，比原来的#cbd5e1更亮 */
	--accent: #60a5fa; /* 蓝色保持 */
	--border-color: #475569; /* slate-600，比原来的#1f2937更亮 */
	--accent-active: #60a5fa;
	--icon-accent: var(--accent);
	--warning: #FFD86B;
	--danger: #FF6B6B;
	--success: #34C759;
	--shadow: 0 1rpx 6rpx rgba(0,0,0,0.2);
	/* dark-mode variants for helpers */
	--muted: #cbd5e1; /* slate-300，比原来的#94a3b8更亮 */
	--muted-border: #475569; /* slate-600，比原来的#1f2937更亮 */
	--success-bg: rgba(36, 78, 45, 0.16);
	--warning-bg: rgba(255, 216, 107, 0.12);
	--danger-bg: rgba(255, 107, 107, 0.10);
	--card-bg-2: #334155; /* slate-700，比原来的#0f1e35更亮 */
	--card-bg-3: #475569; /* slate-600，比原来的#12203c更亮 */
	--bg-color-soft: #374151; /* slate-700 近似 */
	--shadow-soft: 0 1rpx 6rpx rgba(0,0,0,0.2);
	/* avatar overrides for dark mode */
	--avatar-bg: #3b82f6; /* blue-500，比原来的#1f3b5a更亮 */
	--avatar-fg: #ffffff; /* 纯白色，比原来的#e6eef8更亮 */
}

/* 应用变量到常用元素 */
body, .settings-container {
	background-color: var(--bg-color) !important;
	color: var(--text-primary) !important;
}

.section, .header {
	background-color: var(--card-bg) !important;
}

.item-text { color: var(--text-primary) !important; }
.item-value, .section-title, .item-arrow { color: var(--text-secondary) !important; }

/* 平滑过渡：切换主题时避免突兀闪烁 */
body.theme-transition, body.theme-transition * {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

/* 全局容器与基础元素使用主题变量，避免白边与错配 */
page, #app, .uni-app, .app-root {
  background-color: var(--bg-color) !important;
  color: var(--text-primary) !important;
}

/* 常见容器统一背景与边框（降低白边出现概率） */
.card, .section, .header, .list, .modal, .picker-content,
.question-card, .today-stats, .knowledge-progress, .recommendations,
.favorites-list .question-item, .menu-list, .data-item {
  background-color: var(--card-bg) !important;
  border-color: var(--muted-border) !important;
}

/* 分隔线与通用边框颜色在暗色中使用弱边框变量 */
hr, .divider, .border, .border-top, .border-bottom, .uni-list-item, .uni-card {
  border-color: var(--muted-border) !important;
}

/* uni 组件在暗色下的适配，尽可能消除白边 */
.dark-mode .uni-list, .dark-mode .uni-list-item, .dark-mode .uni-card,
.dark-mode .uni-popup, .dark-mode .uni-modal, .dark-mode .uni-navbar,
.dark-mode .uni-searchbar, .dark-mode .uni-easyinput, .dark-mode .uni-forms-item,
.dark-mode .uni-section, .dark-mode .uni-group {
  background-color: var(--card-bg) !important;
  color: var(--text-primary) !important;
  border-color: var(--muted-border) !important;
  box-shadow: var(--shadow) !important;
}

/* tabbar 与 fixed 底部栏 */
.dark-mode .uni-tabbar, .dark-mode .custom-tabbar, .dark-mode .custom-tab-bar {
  background-color: var(--card-bg) !important;
  border-top-color: var(--muted-border) !important;
}

/* 底部导航栏白边修复（统一边线与背景，去掉默认阴影） */
.uni-tabbar, .custom-tabbar, .custom-tab-bar {
  background-color: var(--card-bg) !important;
  border-top: 1rpx solid var(--muted-border) !important;
  box-shadow: none !important;
}
.uni-tabbar__bd, .uni-tabbar__bar, .uni-tabbar__content {
  background-color: var(--card-bg) !important;
}
.uni-tabbar::before, .uni-tabbar::after { display: none !important; }

/* 图标容器透明，避免出现图标白底块（若素材自带白底则需更换素材） */
.uni-tabbar .uni-tabbar__icon, .custom-tabbar .tabbar-icon {
  background-color: transparent !important;
}
</style>
