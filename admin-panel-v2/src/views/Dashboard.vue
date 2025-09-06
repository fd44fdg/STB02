<template>
  <div class="page-container dashboard">
    <div class="hero glass-panel">
      <div class="hero-inner">
        <h1 class="title">掌上刷题宝 · 管理控制台 V2</h1>
        <p class="subtitle">蓝宝石 · 液态玻璃体验，核心资源快速管理</p>
        <div style="margin:8px 0 14px; font-size:12px; display:flex; align-items:center; gap:8px;">
          <span style="opacity:.85">后端连接:</span>
          <n-tag v-if="connectionStatus==='checking'" size="small" type="default">检测中...</n-tag>
          <n-tag v-else-if="connectionStatus==='online'" size="small" type="success">在线</n-tag>
          <n-tag v-else size="small" type="error">离线(使用本地数据)</n-tag>
          <n-button text size="tiny" @click="pingBackend">刷新</n-button>
        </div>
        <n-space wrap>
          <n-button type="primary" ghost @click="go('banners')">轮播图</n-button>
          <n-button type="primary" ghost @click="go('questions')">题目库</n-button>
          <n-button type="primary" ghost @click="go('knowledge/categories')">知识点</n-button>
          <n-button type="primary" ghost @click="go('navigation/categories')">导航分类</n-button>
        </n-space>
        <div class="metrics-grid">
          <div v-for="m in metrics" :key="m.key" class="metric glass-sub" @click="go(m.path)">
            <div class="metric-val" :data-loading="loadingMetrics">{{ m.display }}</div>
            <div class="metric-label">{{ m.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade-slide">
      <div class="cards-grid">
        <div v-for="c in cards" :key="c.key" class="dash-card glass-panel" @click="go(c.path)">
          <div class="card-icon" :style="{ '--glow': c.color }">
            <component :is="c.icon" />
          </div>
          <div class="card-info">
            <h3>{{ c.title }}</h3>
            <p>{{ c.desc }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NSpace, NTag } from 'naive-ui'
import { Images, HelpCircle, Book, Apps } from '@vicons/ionicons5'
import { listBanners } from '../api/banners'
import { listQuestions } from '../api/questions'
import { listKnowledgeCategories } from '../api/knowledge'
import { listNavigationCategories } from '../api/navigation'

const router = useRouter()
function go(path: string){ router.push('/' + path.replace(/^\//,'')) }

const cards = [
  { key: 'banners', title: '轮播图管理', desc: '首页头部展示与广告位配置', path: 'banners', icon: Images, color: 'rgba(90,200,250,0.55)' },
  { key: 'questions', title: '题目管理', desc: '维护题库题目与状态', path: 'questions', icon: HelpCircle, color: 'rgba(58,134,255,0.55)' },
  { key: 'knowledge', title: '知识点分类', desc: '组织知识体系结构', path: 'knowledge/categories', icon: Book, color: 'rgba(15,94,199,0.55)' },
  { key: 'navigation', title: '导航分类', desc: '前端首页快捷入口结构', path: 'navigation/categories', icon: Apps, color: 'rgba(8,56,115,0.55)' }
]

// Metrics (动态统计)
const loadingMetrics = ref(true)
const metrics = ref([
  { key: 'm_banners', label: '轮播图', value: 0, path: 'banners', display: '—' },
  { key: 'm_questions', label: '题目', value: 0, path: 'questions', display: '—' },
  { key: 'm_knowledge', label: '知识点分类', value: 0, path: 'knowledge/categories', display: '—' },
  { key: 'm_navigation', label: '导航分类', value: 0, path: 'navigation/categories', display: '—' }
])

// 后端连接状态
const connectionStatus = ref<'checking'|'online'|'offline'>('checking')
const apiBase = (import.meta as any).env?.VITE_API_BASE || '/api/v1'
async function pingBackend(){
  connectionStatus.value = 'checking'
  try {
    const controller = new AbortController()
    const id = setTimeout(()=>controller.abort(), 4000)
    const res = await fetch(apiBase.replace(/\/$/,'') + '/system/health-check', { signal: controller.signal, headers:{ 'Cache-Control':'no-cache' } })
    clearTimeout(id)
    if(!res.ok) throw new Error('status '+res.status)
    connectionStatus.value = 'online'
  } catch(e){
    connectionStatus.value = 'offline'
  }
}

async function loadMetrics() {
  loadingMetrics.value = true
  try {
    const [b, qRes, k, n] = await Promise.all([
      listBanners().catch(()=>[] as any[]),
      listQuestions({ limit: 200 }).catch(()=>({ items: [] })),
      listKnowledgeCategories().catch(()=>[] as any[]),
      listNavigationCategories().catch(()=>[] as any[])
    ])
    const q = Array.isArray(qRes) ? qRes : (qRes?.items || [])
    const mapping: Record<string, number> = {
      m_banners: b.length,
      m_questions: q.length,
      m_knowledge: k.length,
      m_navigation: n.length
    }
    metrics.value.forEach(m => { m.value = mapping[m.key] || 0; m.display = String(m.value) })
  } finally {
    loadingMetrics.value = false
  }
}

onMounted(() => { loadMetrics(); pingBackend() })
</script>

<style scoped>
.dashboard { padding-top: 8px; }
.hero { padding: 40px 48px; position: relative; overflow: hidden; }
.hero::after { content:""; position:absolute; inset:0; background:
  radial-gradient(circle at 70% 30%, rgba(90,200,250,0.15), transparent 60%),
  radial-gradient(circle at 20% 80%, rgba(58,134,255,0.18), transparent 65%);
  mix-blend-mode: overlay; pointer-events:none; }
.hero-inner { max-width: 820px; }
.title { margin:0 0 8px 0; font-size:32px; font-weight:600; letter-spacing: .5px; background:linear-gradient(90deg,#5AC8FA,#3A86FF,#0F5EC7); background-clip:text; -webkit-background-clip:text; color:transparent; }
.subtitle { margin:0 0 20px 0; font-size:15px; color:#B5CAE6; }
.metrics-grid { margin-top:28px; display:grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap:14px; }
.metric { position:relative; padding:14px 16px 12px; cursor:pointer; border-radius:14px; backdrop-filter:blur(10px); transition:.25s; }
.glass-sub { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); }
.metric:hover { background:rgba(255,255,255,0.15); }
.metric-val { font-size:28px; font-weight:600; line-height:1; letter-spacing:.5px; min-height:34px; display:flex; align-items:center; }
.metric-val[data-loading=true] { position:relative; overflow:hidden; color:transparent; }
.metric-val[data-loading=true]::after { content:""; inset:0; position:absolute; background:linear-gradient(100deg,rgba(255,255,255,0.05) 20%,rgba(255,255,255,0.4) 40%,rgba(255,255,255,0.05) 60%); animation:shimmer 1s linear infinite; }
@keyframes shimmer { 0% { transform:translateX(-100%);} 100% { transform:translateX(100%);} }
.metric-label { margin-top:4px; font-size:12px; color:#9DB5CE; letter-spacing:.5px; }

.cards-grid { margin-top: 32px; display:grid; gap:24px; grid-template-columns: repeat(auto-fill,minmax(250px,1fr)); }
.dash-card { cursor:pointer; padding:18px 18px 20px; display:flex; gap:14px; position:relative; transition: transform .25s, box-shadow .25s, background .35s; }
/* 轻量高光，默认隐藏，hover 上浮显现 */
.dash-card::before { content:""; position:absolute; inset:0; background: linear-gradient(150deg,var(--glow,rgba(255,255,255,.18)) 0%, transparent 70%); opacity:0; transition:.45s; mix-blend-mode:overlay; }
.dash-card:hover { transform: translateY(-4px); box-shadow:0 10px 30px -6px rgba(0,0,0,0.48); }
.dash-card:hover::before { opacity:1; }
.card-icon { width:54px; height:54px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:28px; color:#fff; background: linear-gradient(135deg,var(--glow), rgba(255,255,255,0.10)); box-shadow:0 4px 14px -2px var(--glow); }
/* 文本改为深色系提高在浅玻璃背景下的清晰度 */
.card-info h3 { margin:4px 0 6px 0; font-size:16px; font-weight:600; letter-spacing:.25px; color:#103356; text-shadow:0 1px 2px rgba(255,255,255,0.65), 0 2px 4px rgba(0,0,0,0.18); }
.card-info p { margin:0; font-size:13px; line-height:1.55; color:#2A5C82; letter-spacing:.2px; font-weight:500; text-shadow:0 1px 2px rgba(255,255,255,0.6); }

@media (max-width: 700px) {
  .hero { padding:32px 24px; }
  .title { font-size:26px; }
  .cards-grid { gap:16px; }
}
</style>
