<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="main-container">
  <nav>
    <RouterLink to="/incomes">Incomes</RouterLink> |
    <RouterLink to="/orders">Orders</RouterLink> |
    <RouterLink to="/sales">Sales</RouterLink> |
    <RouterLink to="/stocks">Stocks</RouterLink>
  </nav>
  <RouterView />
  </div>
</template>
