<template>
  <div class="search search--row">
    <input 
      type="text" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.enter="$emit('search')"
      placeholder="Поиск по таблице..." 
      class="search__input"
    />
    <BaseButton @click="$emit('search')">Найти</BaseButton>
  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
defineProps({
  modelValue: String
})

defineEmits(['update:modelValue', 'search'])
</script> 