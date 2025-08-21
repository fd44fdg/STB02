# 掌上刷题宝服务启动脚本（调试版本）

Write-Host "🚀 正在启动掌上刷题宝服务（调试模式）..." -ForegroundColor Green

# 检查依赖是否安装
Write-Host "📦 检查依赖包..." -ForegroundColor Yellow

# 检查后端依赖
if (Test-Path "backend/node_modules") {
    Write-Host "✅ 后端依赖已安装" -ForegroundColor Green
} else {
    Write-Host "❌ 后端依赖未安装，正在安装..." -ForegroundColor Red
    Set-Location backend
    npm install
    Set-Location ..
}

# 检查后台管理依赖
if (Test-Path "admin-panel/node_modules") {
    Write-Host "✅ 后台管理依赖已安装" -ForegroundColor Green
} else {
    Write-Host "❌ 后台管理依赖未安装，正在安装..." -ForegroundColor Red
    Set-Location admin-panel
    npm install
    Set-Location ..
}

# 检查小程序依赖
if (Test-Path "zhangshang-shuati-app/node_modules") {
    Write-Host "✅ 小程序依赖已安装" -ForegroundColor Green
} else {
    Write-Host "❌ 小程序依赖未安装，正在安装..." -ForegroundColor Red
    Set-Location zhangshang-shuati-app
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🔧 启动服务..." -ForegroundColor Yellow

# 启动后端服务（显示详细输出）
Write-Host "📡 启动后端API服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '启动后端服务...'; npm run dev" -WindowStyle Normal

# 等待3秒
Start-Sleep 3

# 启动后台管理系统（显示详细输出）
Write-Host "🖥️ 启动后台管理系统..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-panel; Write-Host '启动后台管理系统...'; npm run dev" -WindowStyle Normal

# 等待3秒
Start-Sleep 3

# 启动微信小程序（显示详细输出）
Write-Host "📱 启动微信小程序..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd zhangshang-shuati-app; Write-Host '启动微信小程序...'; npm run dev:mp-weixin" -WindowStyle Normal

Write-Host ""
Write-Host "✅ 启动脚本执行完成！" -ForegroundColor Green
Write-Host "📋 服务访问地址：" -ForegroundColor Cyan
Write-Host "   - 后端API: http://localhost:3000" -ForegroundColor White
Write-Host "   - 后台管理: http://localhost:8080" -ForegroundColor White
Write-Host "   - 微信小程序: 编译输出到 dist/dev/mp-weixin" -ForegroundColor White
Write-Host ""
Write-Host "🔍 请查看新打开的PowerShell窗口中的详细输出信息" -ForegroundColor Magenta
Write-Host "💡 如果服务启动失败，请检查错误信息并确保数据库配置正确" -ForegroundColor Magenta
