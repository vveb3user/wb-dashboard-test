<template>
  <div class="search__filters">
    <div v-for="header in headers" :key="header" class="search__filter-group">
      <label>{{ labels[header] }}</label>
      <input 
        type="text" 
        :value="filters[header]" 
        @input="$emit('update:filter', header, $event.target.value)"
        :placeholder="`Фильтр по ${labels[header]}...`"
      />
    </div>
  </div>
</template>

<script setup>
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

defineEmits(['update:filter'])
</script> 