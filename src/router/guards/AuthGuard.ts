import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore()

  if (to.name === 'landing' && auth.isLoggedIn) {
    return next({ name: 'dashboard' })
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'landing' })
  }

  next()
}
