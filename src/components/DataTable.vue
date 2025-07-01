<template>
  <table v-if="!loading && data.length" class="table">
    <thead>
      <tr>
        <th v-for="key in headers" :key="key" :class="key">{{ labels[key] }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in data" :key="getRowKey(row, index)">
        <td v-for="key in headers" :key="key" :class="key">
          <span v-if="key === popupKey">
            <a href="#" @click.prevent="$emit('showDetails', row)" v-html="highlightMatch(row[key])"></a>
          </span>
          <span v-else v-html="highlightMatch(formatValue(row[key], key))"></span>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-else-if="!loading">No data</div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  headers: {
    type: Array,
    required: true
  },
  labels: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  popupKey: {
    type: String,
    default: null
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

defineEmits(['showDetails'])

function getRowKey(row, index) {
  // Используем ID записи + индекс для уникальности
  const id = row.id || row.sale_id || row.order_id || row.income_id || row.g_number
  return id ? `${id}-${index}` : index
}

function formatValue(val, key) {
  // Округляем числа до сотых
  if (typeof val === 'number') {
    return val.toFixed(2)
  }
  if (!isNaN(val) && val !== '' && val !== null && val !== undefined && val !== false && val !== true) {
    const num = Number(val)
    if (!isNaN(num) && String(num) === String(val)) {
      return num.toFixed(2)
    }
  }
  return val
}

function highlightMatch(value) {
  const query = props.searchQuery
  if (!query) return String(value)
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return String(value).replace(re, '<span class="chart__highlight">$1</span>')
}
</script> 