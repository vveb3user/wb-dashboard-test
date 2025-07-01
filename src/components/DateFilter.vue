<template>
  <div class="date-filter">
    <div class="date-filter__inputs">
      <label class="date-filter__label">
        Дата с:
        <input
          class="date-filter__input"
          type="date"
          :value="dateFrom"
          @input="$emit('update:dateFrom', $event.target.value)"
        />
      </label>
      <label class="date-filter__label">
        Дата по:
        <input
          class="date-filter__input"
          type="date"
          :value="dateTo"
          @input="$emit('update:dateTo', $event.target.value)"
        />
      </label>
      <BaseButton @click="$emit('load')">Загрузить</BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue'

defineProps({
  dateFrom: String,
  dateTo: String
})
defineEmits(['update:dateFrom', 'update:dateTo', 'load'])
</script> 