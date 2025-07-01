<template>
  <div class="table__pagination">
    <button @click="$emit('prev')" :disabled="currentPage === 1">Prev</button>
    <span>Page {{ currentPage }}</span>
    <button @click="$emit('next')" :disabled="!hasMore">Next</button>
  </div>
</template>

<script setup>
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