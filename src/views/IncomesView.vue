<template>
  <div class="dashboard">
    <h1>Incomes Dashboard</h1>
    <DateFilter
      :dateFrom="dateFrom"
      :dateTo="dateTo"
      @update:dateFrom="val => dateFrom = val"
      @update:dateTo="val => dateTo = val"
      @load="fetchAllIncomes"
    />
    <div v-if="error" class="table__error">{{ error }}</div>
    <div v-if="progress" class="table__progress">{{ progress }}</div>
    <Chart 
      title="Топ-10 по количеству"
      :chartData="chartData"
      :maxQuantity="maxQuantity"
      dataKey="warehouse_name"
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
      @prev="() => prevPage(updatePageIncomes)"
      @next="() => nextPage(updatePageIncomes)"
    />
    <DataTable
      :data="incomes"
      :headers="tableHeaders"
      :labels="tableHeaderLabels"
      :loading="loading"
      popupKey="income_id"
      :searchQuery="activeSearchQuery"
      @showDetails="showDetailsPopup"
    />

    <DetailsPopup
      :data="detailsPopupData"
      title="Детали прихода"
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
import { incomesTableHeaders, incomesTableLabels } from '../config/incomesTable.js'
import { formatDate } from '../utils/dateUtils.js'
import { useChartData } from '../composables/useChartData.js'
import '../scss/dashboard.scss'

const today = new Date()
const oneWeekAgo = new Date()
oneWeekAgo.setDate(today.getDate() - 7)
const dateTo = ref(formatDate(today))
const dateFrom = ref(formatDate(oneWeekAgo))
const incomes = ref([])
const tableHeaders = incomesTableHeaders
const tableHeaderLabels = incomesTableLabels
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
} = useTableFilters(tableHeaders, resetPage, updatePageIncomes)

const { 
  loading, 
  error, 
  progress, 
  allData: allIncomes, 
  fetchAllData 
} = useApiData('incomes', dateFrom, dateTo, limit)

const { 
  detailsPopupData, 
  showDetailsPopup, 
  closeDetailsPopup 
} = useDetailsPopup()

const filteredIncomes = computed(() => {
  return filterData(allIncomes.value)
})

const { chartData, maxQuantity } = useChartData(filteredIncomes, 'warehouse_name', 'quantity')

const fetchAllIncomes = () => {
  fetchAllData(updatePageIncomes, resetPage, hasMore)
}

function updatePageIncomes() {
  updatePage(filteredIncomes, incomes, limit)
}

watch(page, () => {
  updatePageIncomes()
})

onMounted(fetchAllIncomes)
</script>
