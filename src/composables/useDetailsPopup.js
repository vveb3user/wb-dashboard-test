import { ref } from 'vue'

export function useDetailsPopup() {
  const detailsPopupData = ref(null)

  const showDetailsPopup = (row) => {
    detailsPopupData.value = row
  }

  const closeDetailsPopup = () => {
    detailsPopupData.value = null
  }

  return {
    detailsPopupData,
    showDetailsPopup,
    closeDetailsPopup
  }
} 