<template>
  <div class="dashboard wide-table">
    <h1>Sales Dashboard</h1>
    <div class="dashboard__filters">
      <label>
        Date from:
        <input type="date" v-model="dateFrom" />
      </label>
      <label>
        Date to:
        <input type="date" v-model="dateTo" />
      </label>
      <button @click="fetchAllSales">Load</button>
    </div>
    <div class="chart">
      <h2>Chart by Sales Count (Top 10)</h2>
      <div class="chart__container">
        <div class="chart__bars">
          <div
            v-for="(row, index) in chartData"
            :key="'chart-' + row.supplier_article + '-' + index"
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
        <label>{{ tableHeaderLabels[header] }}</label>
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
    <table v-if="!loading && sales.length" class="table">
      <thead>
        <tr>
          <th v-for="key in tableHeaders" :key="key" :class="key">{{ tableHeaderLabels[key] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in sales" :key="row.sale_id + '-' + index">
          <td v-for="key in tableHeaders" :key="key" :class="key">
            <span v-if="key === 'sale_id'">
              <a href="#" @click.prevent="showDetails(row)">{{ row[key] }}</a>
            </span>
            <span v-else v-html="highlightMatch(formatValue(row[key], key))"></span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading">No data</div>

    <div v-if="popupData" class="popup-overlay" @click.self="closePopup">
      <div class="popup popup--large">
        <h3 class="popup__title">Детали продажи</h3>
        <table class="popup__table">
          <tr v-for="(value, key) in popupData" :key="key">
            <td><b>{{ tableHeaderLabels[key] || key }}</b></td>
            <td>{{ formatValue(value, key) }}</td>
          </tr>
        </table>
        <button class="popup__button" @click="closePopup">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import '../scss/dashboard.scss'

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}
const today = new Date()
const monthAgo = new Date()
monthAgo.setMonth(today.getMonth() - 1)
const dateTo = ref(formatDate(today))
const dateFrom = ref(formatDate(monthAgo))
const sales = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const searchQuery = ref('')
const activeSearchQuery = ref('')
const columnFilters = ref({})
const tableHeaders = [
  'sale_id',
  'date',
  'supplier_article',
  'brand',
  'total_price',
  'discount_percent',
  'finished_price',
  'for_pay'
]
const tableHeaderLabels = {
  sale_id: 'ID продажи',
  date: 'Дата продажи',
  supplier_article: 'Артикул поставщика',
  brand: 'Бренд',
  total_price: 'Сумма продажи',
  discount_percent: 'Скидка, %',
  finished_price: 'Итоговая цена',
  for_pay: 'К выплате',
  warehouse_name: 'Склад',
  // остальные для попапа:
  g_number: 'Номер продажи',
  last_change_date: 'Дата изменения',
  tech_size: 'Размер',
  barcode: 'Штрихкод',
  category: 'Категория',
  country_name: 'Страна',
  income_id: 'ID прихода',
  is_realization: 'Реализация',
  is_storno: 'Сторно',
  is_supply: 'Поставка',
  nm_id: 'NM ID',
  oblast_okrug_name: 'Округ',
  odid: 'ODID',
  price_with_disc: 'Цена со скидкой',
  promo_code_discount: 'Скидка по промокоду',
  region_name: 'Регион',
  spp: 'СПП',
  subject: 'Предмет',
}
tableHeaders.forEach(header => {
  columnFilters.value[header] = ''
})
const hasMore = ref(false)
const allSales = ref([])
const progress = ref('')
const limit = 50
const maxPages = 50
const popupData = ref(null)

const filteredSales = computed(() => {
  let filtered = allSales.value
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
  const counts = {}
  filteredSales.value.forEach(row => {
    if (!row.supplier_article) return
    counts[row.supplier_article] = (counts[row.supplier_article] || 0) + 1
  })
  const chartArr = Object.entries(counts).map(([supplier_article, count]) => ({
    supplier_article,
    quantity: count
  }))
  return chartArr.sort((a, b) => b.quantity - a.quantity).slice(0, 10)
})

const fetchAllSales = async () => {
  loading.value = true
  error.value = ''
  allSales.value = []
  progress.value = ''
  let currentPage = 1
  let fetched = []
  try {
    while (currentPage <= maxPages) {
      try {
        progress.value = `Загружается страница ${currentPage}...`
        const response = await axios.get('http://109.73.206.144:6969/api/sales', {
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
    allSales.value = fetched
    page.value = 1
    progress.value = ''
    updatePageSales()
    hasMore.value = allSales.value.length > limit
  } catch (e) {
    error.value = 'Failed to load all data: ' + (e?.message || e)
    allSales.value = []
    sales.value = []
    hasMore.value = false
    progress.value = ''
  } finally {
    loading.value = false
  }
}

function updatePageSales() {
  const start = (page.value - 1) * limit
  const end = start + limit
  sales.value = filteredSales.value.slice(start, end)
  hasMore.value = end < filteredSales.value.length
}

const nextPage = () => {
  page.value++
  updatePageSales()
}
const prevPage = () => {
  if (page.value > 1) {
    page.value--
    updatePageSales()
  }
}

function applySearch() {
  activeSearchQuery.value = searchQuery.value
  page.value = 1
  updatePageSales()
}

watch([activeSearchQuery, () => Object.values(columnFilters.value).join(), page], () => {
  updatePageSales()
})

watch(
  () => Object.values(columnFilters.value).join(),
  () => {
    page.value = 1
    updatePageSales()
  }
)

function highlightMatch(value) {
  const query = activeSearchQuery.value
  if (!query) return String(value)
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return String(value).replace(re, '<span class=\"chart__highlight\">$1</span>')
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

function showDetails(row) {
  popupData.value = row
}
function closePopup() {
  popupData.value = null
}

onMounted(fetchAllSales)
</script>

<style>
.wide-table {
  max-width: 1200px;
}

</style>