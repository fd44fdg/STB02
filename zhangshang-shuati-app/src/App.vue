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
	/* helpers used across components */
	--muted: #cccccc;
	--muted-border: #e9ecef;
	--success-bg: #e6f7e6;
	--warning-bg: #fff7e6;
	--danger-bg: #fff1f0;
	--accent-dark: #357ABD;
	--warning-dark: #FFA500;
	--card-bg-2: #f8fbff;
	--card-bg-3: #e8f4ff;
}

/* 深色主题覆盖 */
body.dark-mode, .dark-mode {
	--bg-color: #071022;
	--card-bg: #0b1320;
	--text-primary: #e6eef8;
	--text-secondary: #9fb0c9;
	--accent: #60a5fa;
	--border-color: #0b1320;
	--accent-active: #60a5fa;
	--icon-accent: var(--accent);
	--warning: #FFD86B;
	--danger: #FF6B6B;
	--success: #34C759;
	--shadow: none;
	/* dark-mode variants for helpers */
	--muted: #5b6b7a;
	--muted-border: #0b1320;
	--success-bg: rgba(36, 78, 45, 0.12);
	--warning-bg: rgba(255, 216, 107, 0.08);
	--danger-bg: rgba(255, 107, 107, 0.06);
	--card-bg-2: #071428;
	--card-bg-3: #08182b;
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
</style>
