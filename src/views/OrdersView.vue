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
    <div v-if="error" class="table__error">{{ error }}</div>
    <div v-if="progress">{{ progress }}</div>
    <Chart 
      title="Chart by Quantity (Top 10)"
      :chartData="chartData"
      :maxQuantity="maxQuantity"
      dataKey="supplier_article"
      valueKey="quantity"
    />
    <SearchBar 
      v-model="searchQuery"
      @search="applySearch"
    />
    <ColumnFilters
      :headers="tableHeaders"
      :labels="tableHeaderLabels"
      :filters="columnFilters"
      @update:filter="updateColumnFilter"
    />
    <Pagination
      :currentPage="page"
      :hasMore="hasMore"
      @prev="() => prevPage(updatePageOrders)"
      @next="() => nextPage(updatePageOrders)"
    />
    <DataTable
      :data="orders"
      :headers="tableHeaders"
      :labels="tableHeaderLabels"
      :loading="loading"
      popupKey="g_number"
      :searchQuery="activeSearchQuery"
      @showDetails="showDetails"
    />

    <DetailsPopup
      :data="popupData"
      title="Детали заказа"
      :labels="tableHeaderLabels"
      @close="closePopup"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import DateFilter from '../components/DateFilter.vue'
import Chart from '../components/Chart.vue'
import SearchBar from '../components/SearchBar.vue'
import ColumnFilters from '../components/ColumnFilters.vue'
import Pagination from '../components/Pagination.vue'
import DetailsPopup from '../components/DetailsPopup.vue'
import DataTable from '../components/DataTable.vue'
import { usePagination } from '../composables/usePagination.js'
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

const allOrders = ref([])
const progress = ref('')
const limit = 50
const maxPages = 50
const popupData = ref(null)

const { page, hasMore, nextPage, prevPage, updatePage, resetPage } = usePagination(limit)

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
  const counts = {}
  filteredOrders.value.forEach(row => {
    if (!row.supplier_article) return
    counts[row.supplier_article] = (counts[row.supplier_article] || 0) + 1
  })
  const chartArr = Object.entries(counts).map(([supplier_article, count]) => ({
    supplier_article,
    quantity: count
  }))
  return chartArr.sort((a, b) => b.quantity - a.quantity).slice(0, 10)
})

const fetchAllOrders = async () => {
  loading.value = true
  error.value = ''
  allOrders.value = []
  progress.value = ''
  let currentPage = 1
  let fetched = []
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
    resetPage()
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
  updatePage(filteredOrders, orders, limit)
}

function applySearch() {
  activeSearchQuery.value = searchQuery.value
  resetPage()
  updatePageOrders()
}

function updateColumnFilter(header, value) {
  columnFilters.value[header] = value
}

watch([activeSearchQuery, () => Object.values(columnFilters.value).join(), page], () => {
  updatePageOrders()
})

watch(
  () => Object.values(columnFilters.value).join(),
  () => {
    resetPage()
    updatePageOrders()
  }
)

function showDetails(row) {
  popupData.value = row
}
function closePopup() {
  popupData.value = null
}

onMounted(fetchAllOrders)
</script>