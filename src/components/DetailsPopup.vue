<template>
  <div v-if="data" class="popup-overlay" @click.self="$emit('close')">
    <div class="popup popup--large">
      <h3 class="popup__title">{{ title }}</h3>
      <table class="popup__table">
        <tr v-for="(value, key) in data" :key="key">
          <td><b>{{ labels[key] || key }}</b></td>
          <td>{{ formatValue(value, key) }}</td>
        </tr>
      </table>
      <button class="popup__button" @click="$emit('close')">Закрыть</button>
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
  // Округляем числа до сотых
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