import { createRouter, createWebHistory } from 'vue-router'
import RoleGuard from './guards/RoleGuard'
import AuthGuard from './guards/AuthGuard'
import { Roles } from '@/enums/Roles.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../pages/LandingPage.vue'),
      meta: { hideNav: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/Dashboard.vue'),
      meta: {
        requiresAuth: true
      },
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
      path: '/services-page',
      name: 'services-page',
      component: () => import('../pages/ServicesPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/service/:id',
      name: 'service',
      component: () => import('../pages/SingleServicePage.vue'),
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
      path: '/profile',
      name: 'profile',
      component: () => import('../pages/UserProfilePage.vue'),
    },
    {
      path: '/admin/user-management',
      name: 'user-management',
      component: () => import('../pages/AdminUserManagementPage.vue'),
      meta: {
        requiresAuth: true,
        roles: [Roles.ADMINISTRATOR],
      },
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('../pages/TeamsPage.vue'),
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