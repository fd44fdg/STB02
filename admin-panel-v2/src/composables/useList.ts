import { ref } from 'vue'

export interface ListQuery { keyword?: string; page?: number; limit?: number }

export function useList<T>(loader: (q?: any) => Promise<T[]>, initQuery: any = {}) {
  const items = ref<T[]>([])
  const loading = ref(false)
  const query = ref({ page: 1, limit: 20, keyword: '', ...initQuery })
  const total = ref(0)

  async function load() {
    loading.value = true
    try {
      const data = await loader(query.value)
      items.value = data
      total.value = data.length
    } finally {
      loading.value = false
    }
  }

  function search() {
    query.value.page = 1
    load()
  }

  load()

  return { items, loading, query, total, load, search }
}