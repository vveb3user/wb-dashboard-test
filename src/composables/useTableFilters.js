import { ref, computed, watch } from 'vue'

export function useTableFilters(tableHeaders, resetPageCallback, updatePageCallback) {
  const searchQuery = ref('')
  const activeSearchQuery = ref('')
  const columnFilters = ref({})

  tableHeaders.forEach(header => {
    columnFilters.value[header] = ''
  })

  const applySearch = () => {
    activeSearchQuery.value = searchQuery.value
    resetPageCallback()
    updatePageCallback()
  }

  const updateColumnFilter = (header, value) => {
    columnFilters.value[header] = value
  }

  const filterData = (data) => {
    let filtered = data
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
  }

  watch([activeSearchQuery, () => Object.values(columnFilters.value).join()], () => {
    updatePageCallback()
  })

  watch(
    () => Object.values(columnFilters.value).join(),
    () => {
      resetPageCallback()
      updatePageCallback()
    }
  )

  return {
    searchQuery,
    activeSearchQuery,
    columnFilters,
    applySearch,
    updateColumnFilter,
    filterData
  }
} 