<template>
  <div v-if="data" class="details-popup-overlay" @click.self="$emit('close')">
    <div class="details-popup details-popup--large">
      <h3 class="details-popup__title">{{ title }}</h3>
      <table class="details-popup__table">
        <tr v-for="(value, key) in data" :key="key">
          <td><b>{{ labels[key] || key }}</b></td>
          <td>{{ formatValue(value, key) }}</td>
        </tr>
      </table>
      <button class="details-popup__button" @click="$emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  labels: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

function formatValue(val, key) {
  if (typeof val === 'boolean') {
    return val ? 'Да' : 'Нет'
  }
  if (val === true) return 'Да'
  if (val === false) return 'Нет'

  if (typeof val === 'number') {
    return val.toFixed(2)
  }
  if (!isNaN(val) && val !== '' && val !== null && val !== undefined && val !== false && val !== true) {
    const num = Number(val)
    if (!isNaN(num) && String(num) === String(val)) {
      return num.toFixed(2)
    }
  }
  return val
}
</script> 