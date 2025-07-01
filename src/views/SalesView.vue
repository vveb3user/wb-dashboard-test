<template>
  <div class="dashboard">
    <h1>Sales Dashboard</h1>
    <DateFilter
      :dateFrom="dateFrom"
      :dateTo="dateTo"
      @update:dateFrom="val => dateFrom = val"
      @update:dateTo="val => dateTo = val"
      @load="fetchAllSales"
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
      @prev="() => prevPage(updatePageSales)"
      @next="() => nextPage(updatePageSales)"
    />
    <DataTable
      :data="sales"
      :headers="tableHeaders"
      :labels="tableHeaderLabels"
      :loading="loading"
      popupKey="sale_id"
      :searchQuery="activeSearchQuery"
      @showDetails="showDetails"
    />

    <DetailsPopup
      :data="popupData"
      title="Детали продажи"
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
import { useTableFilters } from '../composables/useTableFilters.js'
import '../scss/dashboard.scss'

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}
const today = new Date()
const twoWeeksAgo = new Date()
twoWeeksAgo.setDate(today.getDate() - 14)
const dateTo = ref(formatDate(today))
const dateFrom = ref(formatDate(twoWeeksAgo))
const sales = ref([])
const loading = ref(false)
const error = ref('')
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
const allSales = ref([])
const progress = ref('')
const limit = 50
const maxPages = 50
const popupData = ref(null)

const { 
  page, 
  hasMore, 
  nextPage, 
  prevPage, 
  updatePage, 
  resetPage 
} = usePagination(limit)

const { 
  searchQuery, 
  activeSearchQuery, 
  columnFilters, 
  applySearch, 
  updateColumnFilter, 
  filterData 
} = useTableFilters(tableHeaders, resetPage, updatePageSales)

const filteredSales = computed(() => {
  return filterData(allSales.value)
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
    resetPage()
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
  updatePage(filteredSales, sales, limit)
}

watch(page, () => {
  updatePageSales()
})

function showDetails(row) {
  popupData.value = row
}
function closePopup() {
  popupData.value = null
}

onMounted(fetchAllSales)
</script> 