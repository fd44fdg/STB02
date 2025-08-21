const fs = require('fs');
const path = require('path');

// 图标字符和颜色配置
const icons = {
    'home': '⌂',
    'practice': '⚙', 
    'exam': '⚐',
    'profile': '♦'
};

const colors = {
    normal: '#8E8E93',
    active: '#007AFF'
};

// 生成SVG图标
function generateSVGIcon(iconChar, color, size = 48) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.7}" font-weight="bold" 
        fill="${color}" text-anchor="middle" dominant-baseline="central">${iconChar}</text>
</svg>`;
}

// 创建图标文件
function createIcons() {
    const iconsDir = path.join(__dirname);
    
    Object.keys(icons).forEach(name => {
        const iconChar = icons[name];
        
        // 生成普通状态图标 (SVG)
        const normalSVG = generateSVGIcon(iconChar, colors.normal);
        fs.writeFileSync(path.join(iconsDir, `${name}-normal.svg`), normalSVG);
        
        // 生成激活状态图标 (SVG)
        const activeSVG = generateSVGIcon(iconChar, colors.active);
        fs.writeFileSync(path.join(iconsDir, `${name}-active.svg`), activeSVG);
        
        console.log(`✅ 生成 ${name} 图标完成`);
    });
    
    console.log('\n🎉 所有tabBar图标生成完成！');
    console.log('📁 文件位置:', iconsDir);
    console.log('\n📋 生成的文件:');
    Object.keys(icons).forEach(name => {
        console.log(`  - ${name}-normal.svg`);
        console.log(`  - ${name}-active.svg`);
    });
}

// 执行生成
createIcons();