<template>
  <div ref="chartRef" style="height: 300px; width: 100%;"></div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'UserGrowthChart',
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const chartRef = ref(null)
    let chartInstance = null

    const initChart = () => {
      if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        const option = {
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: props.chartData.months || []
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: props.chartData.data || [],
            type: 'line',
            smooth: true,
            itemStyle: {
              color: '#409EFF'
            }
          }],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          }
        }
        chartInstance.setOption(option)
      }
    }

    onMounted(() => {
      initChart()
    })

    watch(() => props.chartData, (newData) => {
      if (chartInstance) {
        chartInstance.setOption({
          xAxis: {
            data: newData.months || []
          },
          series: [{
            data: newData.data || []
          }]
        })
      }
    }, { deep: true })

    return {
      chartRef
    }
  }
}
</script>
