<template>
  <div class="dashboard">
    <h1>Orders Dashboard</h1>
    <DateFilter
      :dateFrom="dateFrom"
      :dateTo="dateTo"
      @update:dateFrom="val => dateFrom = val"
      @update:dateTo="val => dateTo = val"
      @load="fetchAllOrders"
    />
    <div class="chart">
      <h2>Chart by Quantity (Top 10)</h2>
      <div class="chart__container">
        <div class="chart__bars">
          <div
            v-for="(row, index) in chartData"
            :key="'chart-' + row.order_id + '-' + index"
            class="chart__bar-wrapper"
          >
            <div
              class="chart__bar"
              :title="`${row.supplier_article}: ${row.quantity} шт.`"
              :style="{ height: (Number(row.quantity) / maxQuantity * 300) + 'px' }"
            ></div>
            <div class="chart__bar-label">
              <div class="chart__bar-title">{{ row.supplier_article }}</div>
              <div class="chart__bar-value">{{ row.quantity }}</div>
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
    <div class="search">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search in table..." 
        class="search__input"
      />
      <button @click="applySearch">Найти</button>
    </div>
    <div class="search__filters">
      <div v-for="header in tableHeaders" :key="header" class="search__filter-group">
        <label>{{ tableHeaderLabels[header] }}:</label>
        <input 
          type="text" 
          v-model="columnFilters[header]" 
          :placeholder="`Фильтр по ${tableHeaderLabels[header]}...`"
        />
      </div>
    </div>
    <div v-if="error" class="table__error">{{ error }}</div>
    <div v-if="progress">{{ progress }}</div>
    <div class="table__pagination">
      <button @click="prevPage" :disabled="page === 1">Prev</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="!hasMore">Next</button>
    </div>
    <table v-if="!loading && orders.length" class="table">
      <thead>
        <tr>
          <th v-for="key in tableHeaders" :key="key" :class="key">{{ tableHeaderLabels[key] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in orders" :key="row.order_id + '-' + index">
          <td v-for="key in tableHeaders" :key="key" :class="key" v-html="highlightMatch(row[key])"></td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading">No data</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import DateFilter from '../components/DateFilter.vue'
import '../scss/dashboard.scss'

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}
const today = new Date()
const twoWeeksAgo = new Date()
twoWeeksAgo.setDate(today.getDate() - 14)
const dateTo = ref(formatDate(today))
const dateFrom = ref(formatDate(twoWeeksAgo))
const orders = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const searchQuery = ref('')
const activeSearchQuery = ref('')
const columnFilters = ref({})
const tableHeaders = [
  'g_number',
  'date',
  'last_change_date',
  'supplier_article',
  'tech_size'
]

const tableHeaderLabels = {
  g_number: 'Номер заказа',
  date: 'Дата заказа',
  last_change_date: 'Дата изменения',
  supplier_article: 'Артикул поставщика',
  tech_size: 'Размер',
}

tableHeaders.forEach(header => {
  columnFilters.value[header] = ''
})

const hasMore = ref(false)
const allOrders = ref([])
const progress = ref('')

const filteredOrders = computed(() => {
  let filtered = allOrders.value
  if (activeSearchQuery.value) {
    const query = activeSearchQuery.value.toLowerCase()
    filtered = filtered.filter(row =>
      tableHeaders.some(key =>
        row[key] !== undefined && row[key] !== null && String(row[key]).toLowerCase().includes(query)
      )
    )
  }
  Object.keys(columnFilters.value).forEach(column => {
    if (columnFilters.value[column]) {
      const filterValue = columnFilters.value[column].toLowerCase()
      filtered = filtered.filter(row =>
        String(row[column]).toLowerCase().includes(filterValue)
      )
    }
  })
  return filtered
})

const maxQuantity = computed(() => {
  const chart = chartData.value
  return chart.length ? Math.max(...chart.map(r => Number(r.quantity) || 0)) : 1
})

const chartData = computed(() => {
  const counts = {};
  filteredOrders.value.forEach(row => {
    if (!row.supplier_article) return;
    counts[row.supplier_article] = (counts[row.supplier_article] || 0) + 1;
  });
  const chartArr = Object.entries(counts).map(([supplier_article, count]) => ({
    supplier_article,
    quantity: count
  }));
  return chartArr.sort((a, b) => b.quantity - a.quantity).slice(0, 10);
})

const limit = 50

const fetchAllOrders = async () => {
  loading.value = true
  error.value = ''
  allOrders.value = []
  progress.value = ''
  let currentPage = 1
  let fetched = []
  const maxPages = 50
  try {
    while (currentPage <= maxPages) {
      try {
        progress.value = `Загружается страница ${currentPage}...`
        const response = await axios.get('http://109.73.206.144:6969/api/orders', {
          params: {
            dateFrom: dateFrom.value,
            dateTo: dateTo.value,
            page: currentPage,
            limit: limit,
            key: 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie'
          }
        })
        const data = response.data.data || response.data
        if (!data.length) break
        fetched = fetched.concat(data)
        if (data.length < limit) break
        currentPage++
        await new Promise(res => setTimeout(res, 300))
      } catch (err) {
        if (err.response && err.response.status === 429) {
          error.value = 'Слишком много запросов к API. Попробуйте уменьшить диапазон дат или повторите попытку позже.'
          break
        } else {
          throw err
        }
      }
    }
    if (currentPage > maxPages) {
      error.value = 'Достигнут лимит по страницам (' + maxPages + '). Уточните период.'
    }
    allOrders.value = fetched
    page.value = 1
    progress.value = ''
    updatePageOrders()
    hasMore.value = allOrders.value.length > limit
  } catch (e) {
    error.value = 'Failed to load all data: ' + (e?.message || e)
    allOrders.value = []
    orders.value = []
    hasMore.value = false
    progress.value = ''
  } finally {
    loading.value = false
  }
}

function updatePageOrders() {
  const start = (page.value - 1) * limit
  const end = start + limit
  orders.value = filteredOrders.value.slice(start, end)
  hasMore.value = end < filteredOrders.value.length
}

const nextPage = () => {
  page.value++
  updatePageOrders()
}
const prevPage = () => {
  if (page.value > 1) {
    page.value--
    updatePageOrders()
  }
}

function applySearch() {
  activeSearchQuery.value = searchQuery.value
  page.value = 1
  updatePageOrders()
}

watch([activeSearchQuery, () => Object.values(columnFilters.value).join(), page], () => {
  updatePageOrders()
})

watch(
  () => Object.values(columnFilters.value).join(),
  () => {
    page.value = 1;
    updatePageOrders();
  }
);

function highlightMatch(value) {
  const query = activeSearchQuery.value
  if (!query) return String(value)
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return String(value).replace(re, '<span class="chart__highlight">$1</span>')
}

onMounted(fetchAllOrders)
</script>