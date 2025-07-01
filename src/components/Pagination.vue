<template>
  <div class="table__pagination pagination">
    <BaseButton @click="$emit('prev')" :disabled="currentPage === 1">Назад</BaseButton>
    <span class="pagination__label">Страница {{ currentPage }}</span>
    <BaseButton @click="$emit('next')" :disabled="!hasMore">Вперёд</BaseButton>
  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  hasMore: {
    type: Boolean,
    required: true
  }
})

defineEmits(['prev', 'next'])
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.pagination__label {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0.5rem;
}
</style> 