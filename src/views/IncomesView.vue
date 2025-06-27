<template>
  <div class="dashboard">
    <h1>Incomes Dashboard</h1>
    <div class="dashboard__filters">
      <label>
        Date from:
        <input type="date" v-model="dateFrom" />
      </label>
      <label>
        Date to:
        <input type="date" v-model="dateTo" />
      </label>
      <button @click="fetchIncomes">Load</button>
    </div>
    <div v-if="error" class="dashboard__error">{{ error }}</div>
    <div v-if="loading">Loading...</div>
    <table v-if="!loading && incomes.length" class="dashboard__table">
      <thead>
        <tr>
          <th v-for="key in tableHeaders" :key="key">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in incomes" :key="row.barcode">
          <td v-for="key in tableHeaders" :key="key">{{ row[key] }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading">No data</div>
    <div class="dashboard__pagination">
      <button @click="prevPage" :disabled="page === 1">Prev</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="!hasMore">Next</button>
    </div>
    <div class="dashboard__chart">
      <h2>Simple Chart (by quantity)</h2>
      <div class="dashboard__chart-bars">
        <div
          v-for="row in incomes"
          :key="row.barcode"
          class="dashboard__bar"
          :title="row.quantity"
          :style="{ height: (Number(row.quantity) / maxQuantity * 100) + 'px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import '../scss/dashboard.scss'

// Format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().slice(0, 10)
}
const today = new Date()
const monthAgo = new Date()
monthAgo.setMonth(today.getMonth() - 1)
const dateTo = ref(formatDate(today))
const dateFrom = ref(formatDate(monthAgo))
const incomes = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const limit = 10
const tableHeaders = [
  'income_id',
  'date',
  'supplier_article',
  'quantity',
  'total_price',
  'warehouse_name'
]
const hasMore = ref(false)
const maxQuantity = computed(() =>
  incomes.value.length ? Math.max(...incomes.value.map(r => Number(r.quantity) || 0)) : 1
)
const fetchIncomes = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get('http://109.73.206.144:6969/api/incomes', {
      params: {
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        page: page.value,
        limit,
        key: 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie'
      }
    })
    incomes.value = response.data.data || response.data
    hasMore.value = (response.data.data?.length || response.data.length) === limit
  } catch (e) {
    error.value = 'Failed to load data'
    incomes.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}
const nextPage = () => {
  page.value++
  fetchIncomes()
}
const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchIncomes()
  }
}
onMounted(fetchIncomes)
</script>

<style scoped>
.incomes-page {
  padding: 20px;
}
</style> 