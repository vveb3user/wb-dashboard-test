<template>
  <button class="base-button" :type="type" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  }
})
defineEmits(['click'])
</script>

<style src="../scss/base-button.scss" lang="scss" /> 