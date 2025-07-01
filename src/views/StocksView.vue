<template>
  <div class="dashboard">
    <h1>Stocks Dashboard</h1>
    <div v-if="error" class="table__error">{{ error }}</div>
    <div v-if="progress">{{ progress }}</div>
    <Chart 
      title="Топ-10 по количеству"
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
      @prev="() => prevPage(updatePageStocks)"
      @next="() => nextPage(updatePageStocks)"
    />
    <DataTable
      :data="stocks"
      :headers="tableHeaders"
      :labels="tableHeaderLabels"
      :loading="loading"
      popupKey="nm_id"
      :searchQuery="activeSearchQuery"
      @showDetails="showDetailsPopup"
    />

    <DetailsPopup
      :data="detailsPopupData"
      title="Детали остатков"
      :labels="tableHeaderLabels"
      @close="closeDetailsPopup"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Chart from '../components/Chart.vue'
import SearchBar from '../components/SearchBar.vue'
import ColumnFilters from '../components/ColumnFilters.vue'
import Pagination from '../components/Pagination.vue'
import DetailsPopup from '../components/DetailsPopup.vue'
import DataTable from '../components/DataTable.vue'
import { usePagination } from '../composables/usePagination.js'
import { useTableFilters } from '../composables/useTableFilters.js'
import { useApiData } from '../composables/useApiData.js'
import { useDetailsPopup } from '../composables/useDetailsPopup.js'
import { useChartData } from '../composables/useChartData.js'
import { stocksTableHeaders, stocksTableLabels } from '../config/stocksTable.js'
import { formatDate } from '../utils/dateUtils.js'
import '../scss/dashboard.scss'

const today = new Date()
const todayStr = formatDate(today)
const dateTo = ref(todayStr)
const dateFrom = ref(todayStr)
const stocks = ref([])
const tableHeaders = stocksTableHeaders
const tableHeaderLabels = stocksTableLabels
const limit = 50

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
} = useTableFilters(tableHeaders, resetPage, updatePageStocks)

const { 
  loading, 
  error, 
  progress, 
  allData: allStocks, 
  fetchAllData 
} = useApiData('stocks', dateFrom, dateTo, limit)

const { 
  detailsPopupData, 
  showDetailsPopup, 
  closeDetailsPopup 
} = useDetailsPopup()

const filteredStocks = computed(() => {
  return filterData(allStocks.value)
})

const { chartData, maxQuantity } = useChartData(filteredStocks)

const fetchAllStocks = () => {
  fetchAllData(updatePageStocks, resetPage, hasMore)
}

function updatePageStocks() {
  updatePage(filteredStocks, stocks, limit)
}

watch(page, () => {
  updatePageStocks()
})

watch(allStocks, (newStocks) => {
  console.log('Stocks API Data:', newStocks)
  console.log('Stocks API Data Length:', newStocks.length)
  if (newStocks.length > 0) {
    console.log('First stock item:', newStocks[0])
    console.log('Available fields in first item:', Object.keys(newStocks[0]))
  }
}, { deep: true })

onMounted(fetchAllStocks)
</script>

<style scoped>
.stocks-page {
  padding: 20px;
}
</style> 