<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav>
    <RouterLink to="/incomes">Incomes</RouterLink> |
    <RouterLink to="/orders">Orders</RouterLink> |
    <RouterLink to="/sales">Sales</RouterLink> |
    <RouterLink to="/stocks">Stocks</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
nav {
  margin: 20px 0;
  text-align: center;
}
nav a {
  margin: 0 10px;
  color: #42b983;
  text-decoration: none;
}
nav a.router-link-exact-active {
  font-weight: bold;
  text-decoration: underline;
}
</style>
