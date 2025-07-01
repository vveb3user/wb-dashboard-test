<template>
  <div class="column-filters">
    <BaseButton class="column-filters__toggle" @click="toggleDropdown">
      Фильтры
    </BaseButton>
    <div v-if="showDropdown" class="column-filters__select" ref="dropdown">
      <label v-for="header in headers" :key="header">
        <input
          type="checkbox"
          :value="header"
          v-model="selectedFilters"
        />
        {{ labels[header] }}
      </label>
    </div>
    <div class="column-filters__fields">
      <div
        v-for="header in selectedFilters"
        :key="header"
        class="column-filters__field"
      >
        <label>{{ labels[header] }}</label>
        <input
          type="text"
          :value="filters[header]"
          @input="emit('update:filter', header, $event.target.value)"
          :placeholder="`Фильтр по ${labels[header]}...`"
        />
        <button class="column-filters__remove" @click="removeFilter(header)">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import BaseButton from './BaseButton.vue'

defineProps({
  headers: {
    type: Array,
    required: true
  },
  labels: {
    type: Object,
    required: true
  },
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filter'])

const showDropdown = ref(false)
const selectedFilters = ref([])
const dropdown = ref(null)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleClickOutside(event) {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

function removeFilter(header) {
  selectedFilters.value = selectedFilters.value.filter(h => h !== header)
  emit('update:filter', header, '')
}

watch(selectedFilters, (newVal, oldVal) => {
  const removed = oldVal.filter(h => !newVal.includes(h))
  removed.forEach(header => emit('update:filter', header, ''))
})
</script> 