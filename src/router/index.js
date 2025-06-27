import { createRouter, createWebHistory } from 'vue-router'
import IncomesView from '../views/IncomesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/incomes'
    },
    {
      path: '/incomes',
      name: 'incomes',
      component: IncomesView,
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
    },
    {
      path: '/sales',
      name: 'sales',
      component: () => import('../views/SalesView.vue'),
    },
    {
      path: '/stocks',
      name: 'stocks',
      component: () => import('../views/StocksView.vue'),
    },
  ],
})

export default router
