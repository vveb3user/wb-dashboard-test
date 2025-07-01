import { ref } from 'vue'
import axios from 'axios'

export function useApiData(endpoint, dateFrom, dateTo, limit = 50, maxPages = 50) {
  const loading = ref(false)
  const error = ref('')
  const progress = ref('')
  const allData = ref([])

  const fetchAllData = async (updatePageCallback, resetPageCallback, hasMoreRef) => {
    loading.value = true
    error.value = ''
    allData.value = []
    progress.value = ''
    let currentPage = 1
    let fetched = []
    
    try {
      while (currentPage <= maxPages) {
        try {
          progress.value = `Загружается страница ${currentPage}...`
          const response = await axios.get(`http://109.73.206.144:6969/api/${endpoint}`, {
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
      
      allData.value = fetched
      resetPageCallback()
      progress.value = ''
      updatePageCallback()
      hasMoreRef.value = allData.value.length > limit
    } catch (e) {
      error.value = 'Failed to load all data: ' + (e?.message || e)
      allData.value = []
      hasMoreRef.value = false
      progress.value = ''
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    progress,
    allData,
    fetchAllData
  }
} 