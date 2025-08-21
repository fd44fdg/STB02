# 掌上刷题宝服务启动脚本

Write-Host "🚀 正在启动掌上刷题宝服务..." -ForegroundColor Green

# 启动后端服务
Write-Host "📡 启动后端API服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# 等待2秒
Start-Sleep 2

# 启动后台管理系统
Write-Host "🖥️ 启动后台管理系统..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-panel; npm run dev" -WindowStyle Normal

# 等待2秒
Start-Sleep 2

# 启动微信小程序
Write-Host "📱 启动微信小程序..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd zhangshang-shuati-app; npm run dev:mp-weixin" -WindowStyle Normal

Write-Host "✅ 所有服务启动完成！" -ForegroundColor Green
Write-Host "📋 服务访问地址：" -ForegroundColor Cyan
Write-Host "   - 后端API: http://localhost:3000" -ForegroundColor White
Write-Host "   - 后台管理: http://localhost:8080" -ForegroundColor White
Write-Host "   - 微信小程序: 编译输出到 dist/dev/mp-weixin" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：请确保已安装所有依赖包 (npm install)" -ForegroundColor Magenta
