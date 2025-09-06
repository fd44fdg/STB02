<template>
  <div class="table-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <slot name="title">列表</slot>
          </div>
          <div class="card-actions">
            <slot name="actions" />
          </div>
        </div>
      </template>

      <div class="filter-container">
        <slot name="filters" />
      </div>

      <div class="table-container">
        <el-skeleton v-if="loading && showSkeleton" :rows="4" animated />
        <template v-else>
          <el-empty v-if="!loading && (!data || data.length === 0)" :image-size="120" description="暂无数据">
            <slot name="empty-extra" />
          </el-empty>
          <el-table v-else :data="data" border fit highlight-current-row style="width: 100%;">
            <slot />
          </el-table>
        </template>
      </div>

      <div class="pagination-container" v-show="total > 0">
        <Pagination
          :total="total"
          v-model:page="localPage"
          v-model:limit="localLimit"
          @pagination="onPagination"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, toRefs, watch, ref } from 'vue'
import Pagination from '@/components/Pagination/index.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  limit: { type: Number, default: 10 },
  showSkeleton: { type: Boolean, default: true }
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])

const localPage = ref(props.page)
const localLimit = ref(props.limit)

watch(() => props.page, v => { localPage.value = v })
watch(() => props.limit, v => { localLimit.value = v })

function onPagination({ page, limit }) {
  emit('update:page', page)
  emit('update:limit', limit)
  emit('pagination', { page, limit })
}
</script>

<style scoped>
.table-page { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-weight: 600; }
.filter-container { padding-bottom: 10px; }
.pagination-container { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
