<template>
  <div class="chart">
    <h2 class="chart__title">{{ title }}</h2>
    <div class="chart__container">
      <div class="chart__bars">
        <div
          v-for="(row, index) in chartData"
          :key="`chart-${row[dataKey]}-${index}`"
          class="chart__bar-wrapper"
        >
          <div
            class="chart__bar"
            :title="`${row[dataKey]}: ${row[valueKey]} шт.`"
            :style="{ height: (Number(row[valueKey]) / maxQuantity * 300) + 'px' }"
          ></div>
          <div class="chart__bar-label">
            <div class="chart__bar-title">{{ row[dataKey] }}</div>
            <div class="chart__bar-value">{{ row[valueKey] }}</div>
          </div>
        </div>
      </div>
      <div class="chart__y-axis">
        <div class="chart__y-label">{{ maxQuantity }}</div>
        <div class="chart__y-label">{{ Math.round(maxQuantity * 0.75) }}</div>
        <div class="chart__y-label">{{ Math.round(maxQuantity * 0.5) }}</div>
        <div class="chart__y-label">{{ Math.round(maxQuantity * 0.25) }}</div>
        <div class="chart__y-label">0</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
</script> 