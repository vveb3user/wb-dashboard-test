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
      @showDetails="showDetailsPopup"
    />

    <DetailsPopup
      :data="detailsPopupData"
      title="Детали заказа"
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
import { ordersTableHeaders, ordersTableLabels } from '../config/ordersTable.js'
import { formatDate } from '../utils/dateUtils.js'
import '../scss/dashboard.scss'

const today = new Date()
const oneWeekAgo = new Date()
oneWeekAgo.setDate(today.getDate() - 7)
const dateTo = ref(formatDate(today))
const dateFrom = ref(formatDate(oneWeekAgo))
const orders = ref([])
const tableHeaders = ordersTableHeaders
const tableHeaderLabels = ordersTableLabels
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
} = useTableFilters(tableHeaders, resetPage, updatePageOrders)

const { 
  loading, 
  error, 
  progress, 
  allData: allOrders, 
  fetchAllData 
} = useApiData('orders', dateFrom, dateTo, limit)

const { 
  detailsPopupData, 
  showDetailsPopup, 
  closeDetailsPopup 
} = useDetailsPopup()

const filteredOrders = computed(() => {
  return filterData(allOrders.value)
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

const fetchAllOrders = () => {
  fetchAllData(updatePageOrders, resetPage, hasMore)
}

function updatePageOrders() {
  updatePage(filteredOrders, orders, limit)
}

watch(page, () => {
  updatePageOrders()
})

onMounted(fetchAllOrders)
</script>