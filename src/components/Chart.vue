<template>
  <div class="chart">
    <h2 class="chart__title">{{ title }}</h2>
    <div class="chart__container">
      <div class="chart__y-axis">
        <div class="chart__y-label" v-for="val in yLabels" :key="val">{{ formatYAxis(val) }}</div>
      </div>
      <div class="chart__bars">
        <div
          v-for="(row, index) in chartData"
          :key="`chart-${row[dataKey]}-${index}`"
          class="chart__bar-wrapper"
        >
          <div class="chart__bar-value-top">{{ formatFullNumber(row[valueKey]) }}</div>
          <div
            class="chart__bar"
            :title="`${row[dataKey]}: ${formatFullNumber(row[valueKey])} шт.`"
            :style="{ height: (Number(row[valueKey]) / roundedMaxQuantity * 220 * 0.9) + 'px' }"
          >
            <div class="chart__tooltip">
              <div class="chart__tooltip-title">{{ row[dataKey] }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Chart by Quantity (Top 10)'
  },
  chartData: {
    type: Array,
    required: true
  },
  maxQuantity: {
    type: Number,
    required: true
  },
  dataKey: {
    type: String,
    default: 'supplier_article'
  },
  valueKey: {
    type: String,
    default: 'quantity'
  }
})

const formatNumber = (num) => {
  num = Math.round(num)
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const formatFullNumber = (num) => {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const formatYAxis = (num) => {
  return formatNumber(num)
}

const roundedMaxQuantity = computed(() => {
  const max = Math.round(props.maxQuantity)
  if (max <= 10) return max
  if (max <= 100) return Math.ceil(max / 10) * 10
  if (max <= 1000) return Math.ceil(max / 100) * 100
  if (max <= 10000) return Math.ceil(max / 1000) * 1000
  if (max <= 100000) return Math.ceil(max / 10000) * 10000
  if (max <= 1000000) return Math.ceil(max / 100000) * 100000
  return Math.ceil(max / 1000000) * 1000000
})

const yLabels = computed(() => {
  const max = roundedMaxQuantity.value
  return [max, max * 0.75, max * 0.5, max * 0.25, 0]
})
</script> 