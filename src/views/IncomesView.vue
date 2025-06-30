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
      <button @click="fetchAllIncomes">Load</button>
    </div>
    <div class="chart">
      <h2>Chart by Quantity (Top 10)</h2>
      <div class="chart__bars">
        <div
          v-for="(row, index) in chartData"
          :key="'chart-' + row.income_id + '-' + index"
          class="chart__bar"
          :title="`${row.supplier_article}: ${row.quantity}`"
          :style="{ height: (Number(row.quantity) / maxQuantity * 100) + 'px' }"
        ></div>
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
        <label>{{ header }}:</label>
        <input 
          type="text" 
          v-model="columnFilters[header]" 
          :placeholder="`Filter ${header}...`"
        />
      </div>
    </div>
    <div v-if="error" class="table__error">{{ error }}</div>
    <div v-if="loading">Loading...</div>
    <div v-if="progress">{{ progress }}</div>
    <div class="table__pagination">
      <button @click="prevPage" :disabled="page === 1">Prev</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage" :disabled="!hasMore">Next</button>
    </div>
    <table v-if="!loading && incomes.length" class="table">
      <thead>
        <tr>
          <th v-for="key in tableHeaders" :key="key" :class="key">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in incomes" :key="row.income_id + '-' + index">
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
const searchQuery = ref('')
const activeSearchQuery = ref('')
const columnFilters = ref({})
const tableHeaders = [
  'income_id',
  'date',
  'supplier_article',
  'quantity',
  'total_price',
  'warehouse_name'
]

// Инициализируем фильтры для всех колонок
tableHeaders.forEach(header => {
  columnFilters.value[header] = ''
})

const hasMore = ref(false)
const allIncomes = ref([])
const progress = ref('')

// Фильтрация данных
const filteredIncomes = computed(() => {
  let filtered = allIncomes.value
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

// Данные для графика - всегда топ 10 по количеству
const chartData = computed(() => {
  const filtered = filteredIncomes.value
  return filtered
    .sort((a, b) => Number(b.quantity) - Number(a.quantity))
    .slice(0, 10)
})

const limit = 50

const fetchAllIncomes = async () => {
  loading.value = true
  error.value = ''
  allIncomes.value = []
  progress.value = ''
  let currentPage = 1
  let fetched = []
  const maxPages = 50 // ограничение на 50 страниц
  try {
    while (currentPage <= maxPages) {
      try {
        progress.value = `Загружается страница ${currentPage}...`
        const response = await axios.get('http://109.73.206.144:6969/api/incomes', {
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
        await new Promise(res => setTimeout(res, 62)) // задержка между запросами 0.0625 сек
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
    allIncomes.value = fetched
    page.value = 1
    progress.value = ''
    updatePageIncomes()
    hasMore.value = allIncomes.value.length > limit
  } catch (e) {
    error.value = 'Failed to load all data: ' + (e?.message || e)
    allIncomes.value = []
    incomes.value = []
    hasMore.value = false
    progress.value = ''
  } finally {
    loading.value = false
  }
}

function updatePageIncomes() {
  const start = (page.value - 1) * limit
  const end = start + limit
  incomes.value = filteredIncomes.value.slice(start, end)
  hasMore.value = end < filteredIncomes.value.length
}

const nextPage = () => {
  page.value++
  updatePageIncomes()
}
const prevPage = () => {
  if (page.value > 1) {
    page.value--
    updatePageIncomes()
  }
}

function applySearch() {
  activeSearchQuery.value = searchQuery.value
  page.value = 1
  updatePageIncomes()
}

// Следим за изменением фильтров, поиска и страницы
watch([activeSearchQuery, () => Object.values(columnFilters.value).join(), page], () => {
  updatePageIncomes()
})

watch(
  () => Object.values(columnFilters.value).join(),
  () => {
    page.value = 1;
    updatePageIncomes();
  }
);

function highlightMatch(value) {
  const query = activeSearchQuery.value
  if (!query) return String(value)
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return String(value).replace(re, '<span class="chart__highlight">$1</span>')
}

onMounted(fetchAllIncomes)
</script>
