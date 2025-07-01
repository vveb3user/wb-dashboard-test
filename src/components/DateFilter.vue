<template>
  <div class="date-filter">
    <label class="date-filter__label">
      Date from:
      <input
        class="date-filter__input"
        type="date"
        :value="dateFrom"
        @input="$emit('update:dateFrom', $event.target.value)"
      />
    </label>
    <label class="date-filter__label">
      Date to:
      <input
        class="date-filter__input"
        type="date"
        :value="dateTo"
        @input="$emit('update:dateTo', $event.target.value)"
      />
    </label>
    <button class="date-filter__button" @click="$emit('load')">Load</button>
  </div>
</template>

<script setup>
defineProps({
  dateFrom: String,
  dateTo: String
})
defineEmits(['update:dateFrom', 'update:dateTo', 'load'])
</script> 