// 将本地 mock 数据与系统设置导出为一个静态 JSON，供 H5 读取。
// 在无后端阶段可直接把生成的文件放入 public/config.generated.json。
import { writeFileSync } from 'fs'
import { join } from 'path'

// 运行该脚本需 node 环境（手动执行: node scripts/export-config.ts）

function readLocal(key: string){
  return [] // 脚本运行时无法直接访问浏览器 localStorage，后续可接入真实源或读取独立 JSON。
}

const output = {
  generatedAt: new Date().toISOString(),
  // 为后续接入：这里只占位结构
  banners: readLocal('repo_banners'),
  navigation: readLocal('repo_navigation'),
  knowledge: readLocal('repo_knowledge'),
  questions: readLocal('repo_questions'),
  settings: {
    siteName: '掌上刷题宝',
    primary: '#0F5EC7'
  }
}

const file = join(process.cwd(), 'public', 'config.generated.json')
writeFileSync(file, JSON.stringify(output,null,2), 'utf-8')
console.log('配置已导出 ->', file)
