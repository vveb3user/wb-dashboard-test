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
    <div v-if="progress" class="table__progress">{{ progress }}</div>
    <Chart 
      title="Топ-10 складов по сумме продаж"
      :chartData="chartData"
      :maxQuantity="maxQuantity"
      dataKey="warehouse_name"
      valueKey="total_price"
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
      @showDetails="showDetailsPopup"
    />

    <DetailsPopup
      :data="detailsPopupData"
      title="Детали продажи"
      :labels="tableHeaderLabels"
      @close="closeDetailsPopup"
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
import { useDetailsPopup } from '../composables/useDetailsPopup.js'
import { useChartData } from '../composables/useChartData.js'
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

const { 
  detailsPopupData, 
  showDetailsPopup, 
  closeDetailsPopup 
} = useDetailsPopup()

const filteredSales = computed(() => {
  return filterData(allSales.value)
})

const { chartData, maxQuantity } = useChartData(filteredSales, 'warehouse_name', 'total_price')

const fetchAllSales = () => {
  fetchAllData(updatePageSales, resetPage, hasMore)
}

function updatePageSales() {
  updatePage(filteredSales, sales, limit)
}

watch(page, () => {
  updatePageSales()
})

onMounted(fetchAllSales)
</script> 