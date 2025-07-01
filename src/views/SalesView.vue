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
import DateFilter from '../components/DateFilter.vue'
import Chart from '../components/Chart.vue'
import SearchBar from '../components/SearchBar.vue'
import ColumnFilters from '../components/ColumnFilters.vue'
import Pagination from '../components/Pagination.vue'
import DetailsPopup from '../components/DetailsPopup.vue'
import DataTable from '../components/DataTable.vue'
import { usePagination } from '../composables/usePagination.js'
import { useTableFilters } from '../composables/useTableFilters.js'
import { useApiData } from '../composables/useApiData.js'
import { salesTableHeaders, salesTableLabels } from '../config/salesTable.js'
import { formatDate } from '../utils/dateUtils.js'
import '../scss/dashboard.scss'
const today = new Date()
const oneWeekAgo = new Date()
oneWeekAgo.setDate(today.getDate() - 7)
const dateTo = ref(formatDate(today))
const dateFrom = ref(formatDate(oneWeekAgo))
const sales = ref([])
const tableHeaders = salesTableHeaders
const tableHeaderLabels = salesTableLabels
const limit = 50
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

const { 
  loading, 
  error, 
  progress, 
  allData: allSales, 
  fetchAllData 
} = useApiData('sales', dateFrom, dateTo, limit)

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

const fetchAllSales = () => {
  fetchAllData(updatePageSales, resetPage, hasMore)
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