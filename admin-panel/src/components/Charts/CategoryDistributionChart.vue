<template>
  <div ref="chartRef" style="height: 300px; width: 100%;"></div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'CategoryDistributionChart',
  props: {
    chartData: {
      type: Array,
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
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: props.chartData.map(item => item.name)
          },
          series: [{
            name: '分类分布',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: props.chartData
          }]
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
          legend: {
            data: newData.map(item => item.name)
          },
          series: [{
            data: newData
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
