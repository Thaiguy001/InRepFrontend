import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/incidents',
      name: 'incidents',
      component: () => import('../pages/IncidentsPage.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../pages/TestPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../pages/Error/NotFound.vue'),
    },
  ],
})

export default router