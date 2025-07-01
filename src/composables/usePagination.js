import { ref } from 'vue'

export function usePagination(limit = 50) {
  const page = ref(1)
  const hasMore = ref(false)

  const nextPage = (updatePageFunction) => {
    page.value++
    updatePageFunction()
  }

  const prevPage = (updatePageFunction) => {
    if (page.value > 1) {
      page.value--
      updatePageFunction()
    }
  }

  const updatePage = (filteredData, dataRef, limit) => {
    const start = (page.value - 1) * limit
    const end = start + limit
    dataRef.value = filteredData.value.slice(start, end)
    hasMore.value = end < filteredData.value.length
  }

  const resetPage = () => {
    page.value = 1
  }

  return {
    page,
    hasMore,
    nextPage,
    prevPage,
    updatePage,
    resetPage
  }
} 