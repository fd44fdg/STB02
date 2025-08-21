# 掌上刷题宝最终服务状态检查脚本

Write-Host "🔍 检查掌上刷题宝最终服务状态..." -ForegroundColor Green
Write-Host ""

# 检查所有相关端口监听状态
Write-Host "📡 端口监听状态：" -ForegroundColor Yellow
$ports = @(3000, 8080, 8081, 8082, 8083, 8084, 8085)

foreach ($port in $ports) {
    $listening = netstat -ano | findstr "LISTENING" | findstr ":$port"
    if ($listening) {
        Write-Host "✅ 端口 $port 正在监听" -ForegroundColor Green
    } else {
        Write-Host "❌ 端口 $port 未监听" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🌐 服务访问测试：" -ForegroundColor Yellow

# 测试所有服务访问
$services = @(
    @{Name="后端API"; URL="http://localhost:3000"},
    @{Name="后台管理系统"; URL="http://localhost:8080"},
    @{Name="微信小程序服务1"; URL="http://localhost:8081"},
    @{Name="微信小程序服务2"; URL="http://localhost:8082"},
    @{Name="H5前端服务1"; URL="http://localhost:8083"},
    @{Name="H5前端服务2"; URL="http://localhost:8084"},
    @{Name="H5前端用户界面"; URL="http://localhost:8085"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) ($($service.URL)) - 可访问" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($service.Name) ($($service.URL)) - 状态码: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name) ($($service.URL)) - 无法访问" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Node.js进程统计：" -ForegroundColor Yellow
$nodeProcesses = tasklist | findstr node
$nodeCount = ($nodeProcesses -split "`n").Count
Write-Host "当前运行中的Node.js进程数量: $nodeCount" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎯 服务功能说明：" -ForegroundColor Yellow
Write-Host "   - 后台管理系统: http://localhost:8080 (管理员界面) ✅" -ForegroundColor Green
Write-Host "   - H5前端用户界面: http://localhost:8085 (学生用户界面) ❓" -ForegroundColor Yellow
Write-Host "   - H5前端服务1: http://localhost:8083 (备用界面) ✅" -ForegroundColor Green
Write-Host "   - H5前端服务2: http://localhost:8084 (备用界面) ✅" -ForegroundColor Green
Write-Host "   - 微信小程序服务: http://localhost:8081,8082 (小程序开发) ✅" -ForegroundColor Green
Write-Host "   - 后端API: http://localhost:3000 (数据接口) ❌" -ForegroundColor Red
Write-Host ""
Write-Host "🚀 用户访问指南：" -ForegroundColor Cyan
Write-Host "   📱 学生用户: 访问 http://localhost:8085 (主要界面)" -ForegroundColor White
Write-Host "   📱 学生用户: 备用访问 http://localhost:8083 或 http://localhost:8084" -ForegroundColor White
Write-Host "   🖥️ 管理员: 访问 http://localhost:8080" -ForegroundColor White
Write-Host "   📱 小程序: 使用微信开发者工具导入 dist/dev/mp-weixin 目录" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：如果8085端口无法访问，请手动启动H5前端服务" -ForegroundColor Magenta
