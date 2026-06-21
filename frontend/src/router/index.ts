import { createRouter, createWebHistory } from 'vue-router'
import SimulatorView from '@/views/SimulatorView.vue'
import DatabaseView from '@/views/DatabaseView.vue'

const routes = [
  {
    path: '/',
    name: 'simulator',
    component: SimulatorView,
  },
  {
    path: '/database',
    name: 'database',
    component: DatabaseView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
