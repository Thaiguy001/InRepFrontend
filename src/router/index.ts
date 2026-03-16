import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import RoleGuard from './guards/RoleGuard'
import AuthGuard from './guards/AuthGuard'
import { Roles } from '@/enums/Roles.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../pages/TestPage.vue'),
      meta: {
        requiresAuth: true,
        roles: [Roles.ADMINISTRATOR],
      },
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('../pages/CallbackPage.vue'),
    },
    {
      path: '/create-api-key',
      name: 'create-api-key',
      component: () => import('../pages/APIKeyCreationPage.vue'),
      meta: {
        requiresAuth: true,
        roles: [Roles.ADMINISTRATOR],
      },
      
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../pages/Error/NotFound.vue'),
    },
  ],
})

router.beforeEach(AuthGuard)
router.beforeEach(RoleGuard)

export default router