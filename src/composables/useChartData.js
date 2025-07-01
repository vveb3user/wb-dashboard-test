import { computed } from 'vue'

export function useChartData(filteredData, dataKey = 'supplier_article', valueKey = 'quantity', limit = 10) {
  const chartData = computed(() => {
    const counts = {}
    filteredData.value.forEach(row => {
      if (!row[dataKey]) return
      counts[row[dataKey]] = (counts[row[dataKey]] || 0) + Number(row[valueKey] || 0)
    })
    const chartArr = Object.entries(counts).map(([key, count]) => ({
      [dataKey]: key,
      [valueKey]: count
    }))
    return chartArr.sort((a, b) => b[valueKey] - a[valueKey]).slice(0, limit)
  })

  const maxQuantity = computed(() => {
    const chart = chartData.value
    return chart.length ? Math.max(...chart.map(r => Number(r[valueKey]) || 0)) : 1
  })

  return {
    chartData,
    maxQuantity
  }
} 