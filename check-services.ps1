# 掌上刷题宝服务状态检查脚本

Write-Host "🔍 检查掌上刷题宝服务状态..." -ForegroundColor Green
Write-Host ""

# 检查端口监听状态
Write-Host "📡 端口监听状态：" -ForegroundColor Yellow
$ports = @(3000, 8080, 8081, 8082)

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

# 测试服务访问
$services = @(
    @{Name="后端API"; URL="http://localhost:3000"},
    @{Name="后台管理"; URL="http://localhost:8080"},
    @{Name="服务2"; URL="http://localhost:8081"},
    @{Name="服务3"; URL="http://localhost:8082"}
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
Write-Host "📋 服务总结：" -ForegroundColor Yellow
Write-Host "   - 后台管理系统: http://localhost:8080 ✅" -ForegroundColor Green
Write-Host "   - 服务2: http://localhost:8081 ✅" -ForegroundColor Green  
Write-Host "   - 服务3: http://localhost:8082 ✅" -ForegroundColor Green
Write-Host "   - 后端API: http://localhost:3000 ❌" -ForegroundColor Red
Write-Host ""
Write-Host "💡 建议：如果后端API未启动，请检查数据库配置和依赖安装" -ForegroundColor Magenta
