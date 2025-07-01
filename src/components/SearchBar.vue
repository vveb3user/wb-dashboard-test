<template>
  <div class="search">
    <input 
      type="text" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="Search in table..." 
      class="search__input"
    />
    <button @click="$emit('search')" class="search__button">Найти</button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String
})

defineEmits(['update:modelValue', 'search'])
</script> 